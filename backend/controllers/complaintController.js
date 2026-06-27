const Complaint = require('../models/Complaint');
const Department = require('../models/Department');
const Notification = require('../models/Notification');
const User = require('../models/User');
const sendEmail = require('../config/mailer');

// Helper to create & send notification
const createAndSendNotification = async (io, userId, message) => {
  try {
    const notification = await Notification.create({
      userId,
      message,
      status: 'unread'
    });

    if (io) {
      // Emit to the user's specific room
      io.to(userId.toString()).emit('notification', notification);
      // Also broadcast notification count update
      io.emit('globalUpdate');
    }

    return notification;
  } catch (error) {
    console.error('Notification creation failed:', error.message);
  }
};

// @desc    Submit a new complaint
// @route   POST /api/complaints
// @access  Private
exports.createComplaint = async (req, res) => {
  try {
    const { title, category, description, location, latitude, longitude, priority, isAnonymous, contactNumber, ward } = req.body;

    let image = '';
    if (req.file) {
      // Store relative path
      image = `/uploads/${req.file.filename}`;
    }

    const complaint = await Complaint.create({
      title,
      category,
      description,
      image,
      location,
      latitude: parseFloat(latitude),
      longitude: parseFloat(longitude),
      priority: priority || 'Medium',
      isAnonymous: isAnonymous === 'true' || isAnonymous === true,
      contactNumber: contactNumber || '',
      ward: ward || '',
      userId: req.user.id
    });

    // Create Notification for the citizen
    const io = req.io || req.app.get('socketio');
    await createAndSendNotification(
      io,
      req.user.id,
      `Your complaint "${title}" (Category: ${category}) has been submitted successfully.`
    );

    // Notify Admins in real-time
    if (io) {
      io.emit('newComplaint', {
        complaint,
        message: `New complaint reported: "${title}" in category "${category}"`
      });
    }

    // Send email to citizen
    try {
      await sendEmail({
        to: req.user.email,
        subject: `Complaint Registered: ${title}`,
        text: `Hello ${req.user.name},\n\nYour complaint titled "${title}" has been registered successfully.\n\nLocation: ${location}\nCategory: ${category}\n\nOur authorities will review this shortly.\n\nBest regards,\nCivicConnect Team`,
        html: `<p>Hello <strong>${req.user.name}</strong>,</p><p>Your complaint titled <strong>"${title}"</strong> has been registered successfully.</p><p><strong>Details:</strong></p><ul><li>Category: ${category}</li><li>Location: ${location}</li></ul><p>Our authorities will review this shortly.</p><br><p>Best regards,<br>CivicConnect Team</p>`
      });
    } catch (err) {
      console.error('Failed to send complaint submission email:', err.message);
    }

    res.status(201).json({ success: true, complaint });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get complaints (Citizen gets their own, Admin gets all with search/filter)
// @route   GET /api/complaints
// @access  Private
exports.getComplaints = async (req, res) => {
  try {
    let query = {};

    // Citizens only see their own complaints
    if (req.user.role !== 'admin') {
      query.userId = req.user.id;
    } else {
      // Admin query filters
      const { category, status, search, department, priority, ward } = req.query;

      if (category) {
        query.category = category;
      }
      if (status) {
        query.status = status;
      }
      if (department) {
        query.assignedDepartment = department;
      }
      if (priority) {
        query.priority = priority;
      }
      if (ward) {
        query.ward = ward;
      }
      if (search) {
        query.$or = [
          { title: { $regex: search, $options: 'i' } },
          { description: { $regex: search, $options: 'i' } },
          { location: { $regex: search, $options: 'i' } }
        ];
      }
    }

    const complaints = await Complaint.find(query)
      .populate('assignedDepartment')
      .populate('userId', 'name email phone')
      .sort({ createdAt: -1 });

    res.status(200).json({ success: true, count: complaints.length, complaints });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get single complaint
// @route   GET /api/complaints/:id
// @access  Private
exports.getComplaintById = async (req, res) => {
  try {
    const complaint = await Complaint.findById(req.params.id)
      .populate('assignedDepartment')
      .populate('userId', 'name email phone address');

    if (!complaint) {
      return res.status(404).json({ success: false, message: 'Complaint not found' });
    }

    // Citizen can only view their own
    if (req.user.role !== 'admin' && complaint.userId._id.toString() !== req.user.id) {
      return res.status(403).json({ success: false, message: 'Not authorized to view this complaint' });
    }

    res.status(200).json({ success: true, complaint });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Update complaint (Admin updates status, priority, department, adminRemarks, resolutionImage)
// @route   PUT /api/complaints/:id
// @access  Private/Admin
exports.updateComplaint = async (req, res) => {
  try {
    let complaint = await Complaint.findById(req.params.id);

    if (!complaint) {
      return res.status(404).json({ success: false, message: 'Complaint not found' });
    }

    const originalStatus = complaint.status;
    const originalDeptId = complaint.assignedDepartment;

    const { status, assignedDepartment, priority, adminRemarks, resolutionImage } = req.body;

    if (status) complaint.status = status;
    if (priority) complaint.priority = priority;
    if (adminRemarks !== undefined) complaint.adminRemarks = adminRemarks;
    if (resolutionImage !== undefined) complaint.resolutionImage = resolutionImage;
    if (assignedDepartment !== undefined) {
      complaint.assignedDepartment = assignedDepartment === '' ? null : assignedDepartment;
    }

    await complaint.save();

    // Fetch updated complaint with populate
    const updatedComplaint = await Complaint.findById(req.params.id)
      .populate('assignedDepartment')
      .populate('userId', 'name email phone');

    const io = req.io || req.app.get('socketio');

    // Trigger Notification for Status Update
    if (status && status !== originalStatus) {
      const msg = `The status of your complaint "${complaint.title}" has been updated to "${status}".`;
      await createAndSendNotification(io, complaint.userId, msg);

      // Send email to citizen
      try {
        await sendEmail({
          to: updatedComplaint.userId.email,
          subject: `Complaint Status Updated: ${complaint.title}`,
          text: `Hello ${updatedComplaint.userId.name},\n\nYour complaint titled "${complaint.title}" has been updated to "${status}".\n\nBest regards,\nCivicConnect Team`,
          html: `<p>Hello <strong>${updatedComplaint.userId.name}</strong>,</p><p>Your complaint titled <strong>"${complaint.title}"</strong> has been updated to status <strong>"${status}"</strong>.</p><br><p>Best regards,<br>CivicConnect Team</p>`
        });
      } catch (err) {
        console.error('Email status update failed:', err.message);
      }
    }

    // Trigger Notification for Department Assignment
    if (assignedDepartment !== undefined && String(assignedDepartment) !== String(originalDeptId)) {
      if (complaint.assignedDepartment) {
        const dept = await Department.findById(complaint.assignedDepartment);
        if (dept) {
          const msg = `Your complaint "${complaint.title}" has been assigned to the ${dept.departmentName}.`;
          await createAndSendNotification(io, complaint.userId, msg);

          // Send email to citizen
          try {
            await sendEmail({
              to: updatedComplaint.userId.email,
              subject: `Complaint Assigned: ${complaint.title}`,
              text: `Hello ${updatedComplaint.userId.name},\n\nYour complaint titled "${complaint.title}" has been assigned to the "${dept.departmentName}" for resolution.\n\nBest regards,\nCivicConnect Team`,
              html: `<p>Hello <strong>${updatedComplaint.userId.name}</strong>,</p><p>Your complaint titled <strong>"${complaint.title}"</strong> has been assigned to the <strong>"${dept.departmentName}"</strong> for resolution.</p><br><p>Best regards,<br>CivicConnect Team</p>`
            });
          } catch (err) {
            console.error('Email assignment update failed:', err.message);
          }
        }
      } else {
        const msg = `Your complaint "${complaint.title}" has been unassigned from the department.`;
        await createAndSendNotification(io, complaint.userId, msg);
      }
    }

    // Broadcast update globally to refresh admin dashboard in real-time
    if (io) {
      io.emit('complaintUpdated', updatedComplaint);
    }

    res.status(200).json({ success: true, complaint: updatedComplaint });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Upload Resolution Proof Image
// @route   POST /api/complaints/:id/resolution-image
// @access  Private/Admin
exports.uploadResolutionImage = async (req, res) => {
  try {
    const complaint = await Complaint.findById(req.params.id);
    if (!complaint) {
      return res.status(404).json({ success: false, message: 'Complaint not found' });
    }

    if (req.file) {
      complaint.resolutionImage = `/uploads/${req.file.filename}`;
      await complaint.save();
    }

    res.status(200).json({ success: true, resolutionImage: complaint.resolutionImage });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Export Complaints Summary to CSV
// @route   GET /api/complaints/export/csv
// @access  Private/Admin
exports.exportComplaintsCSV = async (req, res) => {
  try {
    const complaints = await Complaint.find()
      .populate('userId', 'name email')
      .populate('assignedDepartment', 'departmentName')
      .sort({ createdAt: -1 });

    let csv = 'ID,Title,Category,Priority,Status,Ward,Location,Reported By,Date\n';
    complaints.forEach(c => {
      const title = `"${(c.title || '').replace(/"/g, '""')}"`;
      const loc = `"${(c.location || '').replace(/"/g, '""')}"`;
      const reporter = c.isAnonymous ? 'Anonymous' : (c.userId?.name || 'User');
      const date = new Date(c.createdAt).toLocaleDateString();
      csv += `${c._id},${title},${c.category},${c.priority},${c.status},${c.ward || 'N/A'},${loc},"${reporter}",${date}\n`;
    });

    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', 'attachment; filename="complaints_report.csv"');
    res.status(200).send(csv);
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Export Complaints Summary for Printing / PDF
// @route   GET /api/complaints/export/pdf
// @access  Private/Admin
exports.exportComplaintsPDF = async (req, res) => {
  try {
    const complaints = await Complaint.find()
      .populate('userId', 'name email')
      .populate('assignedDepartment', 'departmentName')
      .sort({ createdAt: -1 });

    let html = `
      <!DOCTYPE html>
      <html>
      <head>
        <title>Civic Complaints Official Report</title>
        <style>
          body { font-family: Arial, sans-serif; padding: 20px; color: #333; }
          h1 { color: #1e3a8a; }
          table { width: 100%; border-collapse: collapse; margin-top: 20px; }
          th, td { border: 1px solid #ddd; padding: 8px; text-align: left; font-size: 12px; }
          th { background-color: #f1f5f9; }
          .status { font-weight: bold; }
        </style>
      </head>
      <body>
        <h1>Civic Issue Reporting System - Summary Report</h1>
        <p>Generated on: ${new Date().toLocaleString()}</p>
        <p>Total Registered Issues: <strong>${complaints.length}</strong></p>
        <table>
          <thead>
            <tr>
              <th>Title</th>
              <th>Category</th>
              <th>Priority</th>
              <th>Status</th>
              <th>Ward</th>
              <th>Location</th>
              <th>Reported By</th>
              <th>Date</th>
            </tr>
          </thead>
          <tbody>
            ${complaints.map(c => `
              <tr>
                <td><strong>${c.title}</strong></td>
                <td>${c.category}</td>
                <td>${c.priority}</td>
                <td><span class="status">${c.status}</span></td>
                <td>${c.ward || '-'}</td>
                <td>${c.location}</td>
                <td>${c.isAnonymous ? 'Anonymous' : (c.userId?.name || 'User')}</td>
                <td>${new Date(c.createdAt).toLocaleDateString()}</td>
              </tr>
            `).join('')}
          </tbody>
        </table>
        <script>window.onload = function() { window.print(); }</script>
      </body>
      </html>
    `;

    res.setHeader('Content-Type', 'text/html');
    res.status(200).send(html);
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Delete complaint
// @route   DELETE /api/complaints/:id
// @access  Private
exports.deleteComplaint = async (req, res) => {
  try {
    const complaint = await Complaint.findById(req.params.id);

    if (!complaint) {
      return res.status(404).json({ success: false, message: 'Complaint not found' });
    }

    // Citizens can only delete their own complaints, and only if status is Submitted or Pending
    if (req.user.role !== 'admin') {
      if (complaint.userId.toString() !== req.user.id) {
        return res.status(403).json({ success: false, message: 'Not authorized to delete this complaint' });
      }
      if (complaint.status !== 'Pending' && complaint.status !== 'Submitted') {
        return res.status(400).json({ success: false, message: 'Cannot delete complaint once review is started' });
      }
    }

    await complaint.deleteOne();

    const io = req.io || req.app.get('socketio');
    if (io) {
      io.emit('globalUpdate');
    }

    res.status(200).json({ success: true, message: 'Complaint deleted successfully' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};



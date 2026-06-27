const mongoose = require('mongoose');

const complaintSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, 'Please add a complaint title'],
    trim: true
  },
  category: {
    type: String,
    required: [true, 'Please select a category'],
    enum: [
      'Damaged Road',
      'Damaged Roads',
      'Potholes',
      'Water Leakage',
      'Broken Streetlight',
      'Broken Streetlights',
      'Garbage Overflow',
      'Garbage Issues',
      'Illegal Waste Disposal',
      'Drainage Issue',
      'Drainage Problems',
      'Tree Fall',
      'Traffic Signal Problem',
      'Public Toilet Issue',
      'Park Maintenance',
      'Public Property Damage',
      'Other',
      'Others'
    ]
  },
  description: {
    type: String,
    required: [true, 'Please add a description']
  },
  image: {
    type: String,
    default: ''
  },
  resolutionImage: {
    type: String,
    default: ''
  },
  location: {
    type: String,
    required: [true, 'Please add a location address']
  },
  ward: {
    type: String,
    default: ''
  },
  latitude: {
    type: Number,
    required: [true, 'Please select latitude on the map']
  },
  longitude: {
    type: Number,
    required: [true, 'Please select longitude on the map']
  },
  priority: {
    type: String,
    enum: ['Low', 'Medium', 'High', 'Emergency'],
    default: 'Medium'
  },
  status: {
    type: String,
    enum: ['Submitted', 'Pending', 'Under Review', 'Assigned', 'In Progress', 'Resolved', 'Rejected'],
    default: 'Submitted'
  },
  adminRemarks: {
    type: String,
    default: ''
  },
  isAnonymous: {
    type: Boolean,
    default: false
  },
  contactNumber: {
    type: String,
    default: ''
  },
  assignedDepartment: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Department',
    default: null
  },
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('Complaint', complaintSchema);

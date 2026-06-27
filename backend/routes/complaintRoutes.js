const express = require('express');
const router = express.Router();
const {
  createComplaint,
  getComplaints,
  getComplaintById,
  updateComplaint,
  deleteComplaint,
  uploadResolutionImage,
  exportComplaintsCSV,
  exportComplaintsPDF
} = require('../controllers/complaintController');
const { protect, admin } = require('../middleware/authMiddleware');
const upload = require('../middleware/uploadMiddleware');

router.route('/')
  .post(protect, upload.single('image'), createComplaint)
  .get(protect, getComplaints);

router.get('/export/csv', protect, admin, exportComplaintsCSV);
router.get('/export/pdf', protect, admin, exportComplaintsPDF);

router.route('/:id')
  .get(protect, getComplaintById)
  .put(protect, admin, updateComplaint)
  .delete(protect, deleteComplaint);

router.post('/:id/resolution-image', protect, admin, upload.single('image'), uploadResolutionImage);

module.exports = router;


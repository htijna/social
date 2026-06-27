const mongoose = require('mongoose');

const departmentSchema = new mongoose.Schema({
  departmentName: {
    type: String,
    required: [true, 'Please add a department name'],
    unique: true,
    trim: true
  },
  officerName: {
    type: String,
    required: [true, 'Please add a supervising officer name'],
    trim: true
  },
  contactInfo: {
    type: String,
    required: [true, 'Please add contact information'],
    trim: true
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('Department', departmentSchema);

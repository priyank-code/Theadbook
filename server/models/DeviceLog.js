const mongoose = require('mongoose');

const deviceLogSchema = new mongoose.Schema({
  deviceId: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'Device', 
    required: true 
  },
  logType: { 
    type: String, 
    enum: ['Info', 'Warning', 'Error', 'Playback'], 
    default: 'Info' 
  },
  message: { 
    type: String, 
    required: true, 
    trim: true 
  }
}, { 
  timestamps: true 
});

deviceLogSchema.index({ deviceId: 1, createdAt: -1 });

module.exports = mongoose.model('DeviceLog', deviceLogSchema);
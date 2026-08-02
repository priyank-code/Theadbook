const mongoose = require('mongoose');

const deviceSchema = new mongoose.Schema({
  deviceName: { 
    type: String, 
    required: [true, 'Device name is required'], 
    trim: true 
  },
  deviceCode: { 
    type: String, 
    required: [true, 'Unique device pairing code is required'], 
    unique: true, 
    uppercase: true,
    trim: true 
  },
  location: { 
    type: String, 
    required: [true, 'Location / Venue name is required'],
    trim: true 
  },
  city: { 
    type: String, 
    required: [true, 'City is required'],
    trim: true 
  },
  screenType: { 
    type: String, 
    enum: ['LED Billboard', 'LCD Display', 'Transit Display', 'Digital Kiosk'], 
    default: 'LED Billboard' 
  },
  resolution: { 
    type: String, 
    default: '1920x1080' 
  },
  status: { 
    type: String, 
    enum: ['Online', 'Offline', 'Maintenance'], 
    default: 'Offline' 
  },
  lastHeartbeat: { 
    type: Date, 
    default: null 
  },
  assignedPlaylist: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'Playlist', 
    default: null 
  }
}, { 
  timestamps: true 
});

module.exports = mongoose.model('Device', deviceSchema);
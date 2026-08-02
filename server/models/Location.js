const mongoose = require('mongoose');

const locationSchema = new mongoose.Schema({
  locationName: { type: String, required: true, trim: true },
  city: { type: String, required: true, trim: true },
  zone: { type: String, trim: true }, // e.g., "North Zone", "SG Highway"
  address: { type: String, required: true, trim: true },
  coordinates: {
    lat: { type: Number },
    lng: { type: Number }
  },
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true }
}, { timestamps: true });

locationSchema.index({ city: 1, zone: 1 });
module.exports = mongoose.model('Location', locationSchema);
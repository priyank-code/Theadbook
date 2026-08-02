const express = require('express');
const router = express.Router();
const DeviceLog = require('../models/DeviceLog');
const verifyToken = require('../middleware/authMiddleware');

// Get all logs with populated device info (Like SQL JOIN)
router.get('/', verifyToken, async (req, res) => {
  try {
    const logs = await DeviceLog.find()
      .populate('deviceId', 'deviceName location city status')
      .sort({ createdAt: -1 })
      .limit(100);

    res.status(200).json({ status: 'success', count: logs.length, logs });
  } catch (err) {
    res.status(500).json({ status: 'error', message: 'Server error while fetching logs.' });
  }
});

// Add a new log entry
router.post('/add', verifyToken, async (req, res) => {
  try {
    const { deviceId, logType, message } = req.body;
    if (!deviceId || !message) {
      return res.status(400).json({ status: 'error', message: 'Device ID and message are required.' });
    }

    const newLog = new DeviceLog({ deviceId, logType: logType || 'Info', message });
    await newLog.save();

    res.status(201).json({ status: 'success', message: 'Log recorded successfully.', log: newLog });
  } catch (err) {
    res.status(500).json({ status: 'error', message: 'Server error while recording log.' });
  }
});

module.exports = router;
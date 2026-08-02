const express = require('express');
const router = express.Router();
const Playlist = require('../models/Playlist');
const verifyToken = require('../middleware/authMiddleware');

// 1. Get All Playlists
router.get('/', verifyToken, async (req, res) => {
  try {
    const playlists = await Playlist.find()
      .populate('mediaItems.mediaId')
      .sort({ createdAt: -1 });

    res.status(200).json({
      status: 'success',
      count: playlists.length,
      playlists
    });
  } catch (err) {
    console.error('[Fetch Playlists Error]:', err.message);
    res.status(500).json({ status: 'error', message: 'Server error while fetching playlists.' });
  }
});

// 2. Create New Playlist
router.post('/create', verifyToken, async (req, res) => {
  try {
    const { playlistName, description, mediaItems } = req.body;

    if (!playlistName) {
      return res.status(400).json({ status: 'error', message: 'Playlist name is required.' });
    }

    const existingPlaylist = await Playlist.findOne({ playlistName });
    if (existingPlaylist) {
      return res.status(400).json({ status: 'error', message: 'Playlist with this name already exists.' });
    }

    const newPlaylist = new Playlist({
      playlistName,
      description: description || '',
      mediaItems: mediaItems || [], // Array of { mediaId, duration, order }
      createdBy: req.user.id
    });

    await newPlaylist.save();

    const populatedPlaylist = await Playlist.findById(newPlaylist._id).populate('mediaItems.mediaId');

    res.status(201).json({
      status: 'success',
      message: 'Playlist created successfully.',
      playlist: populatedPlaylist
    });
  } catch (err) {
    console.error('[Create Playlist Error]:', err.message);
    res.status(500).json({ status: 'error', message: 'Server error while creating playlist.' });
  }
});

// 3. Update Playlist (Add/Remove Media items or change name)
router.put('/:id', verifyToken, async (req, res) => {
  try {
    const { playlistName, description, mediaItems } = req.body;

    const updatedPlaylist = await Playlist.findByIdAndUpdate(
      req.params.id,
      {
        ...(playlistName && { playlistName }),
        ...(description !== undefined && { description }),
        ...(mediaItems && { mediaItems })
      },
      { new: true, runValidators: true }
    ).populate('mediaItems.mediaId');

    if (!updatedPlaylist) {
      return res.status(404).json({ status: 'error', message: 'Playlist not found.' });
    }

    res.status(200).json({
      status: 'success',
      message: 'Playlist updated successfully.',
      playlist: updatedPlaylist
    });
  } catch (err) {
    console.error('[Update Playlist Error]:', err.message);
    res.status(500).json({ status: 'error', message: 'Server error while updating playlist.' });
  }
});

// 4. Delete Playlist
router.delete('/:id', verifyToken, async (req, res) => {
  try {
    const deletedPlaylist = await Playlist.findByIdAndDelete(req.params.id);
    if (!deletedPlaylist) {
      return res.status(404).json({ status: 'error', message: 'Playlist not found.' });
    }

    res.status(200).json({
      status: 'success',
      message: 'Playlist deleted successfully.'
    });
  } catch (err) {
    console.error('[Delete Playlist Error]:', err.message);
    res.status(500).json({ status: 'error', message: 'Server error while deleting playlist.' });
  }
});

module.exports = router;
const mongoose = require("mongoose");

const playlistSchema = new mongoose.Schema(
  {
    playlistName: {
      type: String,
      required: [true, "Playlist name is required"],
      trim: true,
      unique: true,
    },
    description: {
      type: String,
      trim: true,
    },
    mediaItems: [
      {
        mediaId: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "Media",
          required: true,
        },
        duration: {
          type: Number, // Display duration in seconds for this specific item in loop
          default: 10,
        },
        order: {
          type: Number,
          default: 0,
        },
      },
    ],
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
  },
  {
    timestamps: true,
  },
);

module.exports = mongoose.model("Playlist", playlistSchema);

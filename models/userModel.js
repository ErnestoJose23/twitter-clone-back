const mongoose = require("mongoose");

const userSchema = new mongoose.Schema({
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true, minlength: 5 },
  username: { type: String },
  displayName: { type: String },
  avatar: { type: String },
  cover: { type: String },
  description: { type: String },
  timestamp: { type: String },
  verified: { type: Boolean },
  following: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "following",
    },
  ],
  followers: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "followers",
    },
  ],
  likes: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "likes",
    },
  ],
  retweets: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "retweets",
    },
  ],
});

module.exports = User = mongoose.model("user", userSchema);

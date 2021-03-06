const mongoose = require("mongoose");

const postSchema = new mongoose.Schema({
  user_id: { type: String, required: true,},
  tweet: { type: String, required: true, minlength: 2 },
  imagename: { type: String },
  timestamp: { type: String },
  replies: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "posts",
    },
  ]
});

module.exports = Post = mongoose.model("post", postSchema);

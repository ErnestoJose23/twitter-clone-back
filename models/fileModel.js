var mongoose = require("mongoose");

const fileSchema = new mongoose.Schema({
  contentType: {},
  path: String,
  image: {},
  imagename: String,
});

module.exports = File = mongoose.model("file", fileSchema);

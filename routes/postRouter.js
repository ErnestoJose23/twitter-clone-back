const router = require("express").Router();
const multer = require("multer");
const path = require("path");
const Feed = require("../models/postModel");
const File = require("../models/fileModel");
const fs = require("fs");

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "uploads");
  },
  filename: function (req, file, cb) {
    cb(null, req.headers.path + path.extname(file.originalname));
  },
});

const upload = multer({
  storage: storage,
  limits: { fileSize: 1000000 },
});

router.post("/uploadImg", upload.single("file"), (req, res) => {
  var img = fs.readFileSync(req.file.path);
  var encode_image = img.toString("base64");
  var finalImg = new File({
    contentType: req.file.mimetype,
    path: req.file.path,
    image: Buffer.from(encode_image, "base64"),
    imagename: req.headers.path,
  });

  const savedFile = finalImg.save();

  console.log(savedFile.image);
});

router.post("/upload", async (req, res) => {
  try {
    console.log(req.body);
    let { user_id, tweet,  imagename, timestamp } = req.body;
    const newFeed = new Feed({
      user_id,
      
      imagename,
      tweet,
      timestamp,
    });

    const savedFeed = await newFeed.save();
    res.json(savedFeed);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.get("/sync", (req, res) => {
  const sort = { _id: -1 };
  Feed.find((err, data) => {
    if (err) {
      res.status(500).send(err);
    } else {
      res.status(200).send(data);
    }
  })
    .sort(sort)
    .populate("comments");
});

router.get("/sync/:postId", (req, res) => {
  Feed.findById(req.params.postId)
    .populate("comments")
    .exec(function (err, user) {
      if (err) {
        console.log(err);
      } else {
        res.status(200).json(user);
        console.log("success");
      }
    });
});

router.get("/sync/:user_id", async (req,res) => {
  try {
    const tweets = await Feed.find({ user_id: req.params.user_id });
    if (!tweets) {
        return res.status(400).json({ msg: "No user found." });
    } else {
      res.status(200).send(img);
    }
  } catch {
    return res.status(400).json({ msg: "No user found." });
  }
});

router.get(`/getImg/:imagename`, async (req, res) => {
  try {
    const img = await File.findOne({ imagename: req.params.imagename });
    if (!img) {
      return res.status(400).json({ msg: "No user found." });
    } else {
      res.status(200).send(img);
    }
  } catch {
    return res.status(400).json({ msg: "No user found." });
  }
});

module.exports = router;

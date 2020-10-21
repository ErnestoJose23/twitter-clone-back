const router = require("express").Router();
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const auth = require("../middleware/auth");
const User = require("../models/userModel");
const multer = require("multer");
const path = require("path");

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


router.post("/register", async (req, res) => {
  try {
    let { email, password, passwordCheck, displayName, username } = req.body;

    console.log(req.body)

    if (!email || !password || !passwordCheck)
      return res.status(400).json({ msg: "Not all fields have been entered." });
    if (password.length < 5)
      return res
        .status(400)
        .json({ msg: "The password needs to be at least 5 characters long." });
    if (password !== passwordCheck)
      return res
        .status(400)
        .json({ msg: "Enter the same password twice for verification." });

    const existingUser = await User.findOne({ email: email });
    if (existingUser)
      return res
        .status(400)
        .json({ msg: "An account with this email already exists." });

    if (!displayName) displayName = email;

    const salt = await bcrypt.genSalt();
    const passwordHash = await bcrypt.hash(password, salt);

    const newUser = new User({
      email,
      password: passwordHash,
      displayName,
      username
    });
    const savedUser = await newUser.save();
    res.json(savedUser);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;

    // validate
    if (!email || !password)
      return res.status(400).json({ msg: "Not all fields have been entered." });

    const user = await User.findOne({ email: email });
    if (!user)
      return res
        .status(400)
        .json({ msg: "No account with this email has been registered." });

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(400).json({ msg: "Invalid credentials." });

    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET);
    res.json({
      token,
      user: {
        id: user._id,
        displayName: user.displayName,
        avatar: user.avatar,
      },
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.delete("/delete", auth, async (req, res) => {
  try {
    const deletedUser = await User.findByIdAndDelete(req.user);
    res.json(deletedUser);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.post("/tokenIsValid", async (req, res) => {
  try {
    const token = req.header("x-auth-token");
    if (!token) return res.json(false);

    const verified = jwt.verify(token, process.env.JWT_SECRET);
    if (!verified) return res.json(false);

    const user = await User.findById(verified.id);
    if (!user) return res.json(false);

    return res.json(true);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.get("/", auth, async (req, res) => {
  const user = await User.findById(req.user);
  res.json({
    displayName: user.displayName,
    id: user._id,
    avatar: user.avatar,
    username: user.username,
    cover: user.cover,
    description: user.description,
    followers: user.followers,
    following: user.following,
    followersCount: user.followers.length,
    followingCount: user.following.length
  });
});

router.get(`/sync`, (req, res) => {
  User.find((err, data) => {
    if (err) {
      res.status(500).send(err);
    } else {
      res.status(200).send(data);
    }
  });
});

router.get(`/getUser/:userid`, async (req, res) => {
  try {
    const user = await User.findById(req.params.userid);
    if (!user) {
      return res.status(400).json({ msg: "No user found." });
    } else {
      res.status(200).send(user);
    }
  } catch {
    return res.status(400).json({ msg: "No user found." });
  }
});

router.get(`/getUserName/:name`, async (req, res) => {
  try {
    const user = await User.find({
      displayName: { $regex: req.params.name, $options: "i" },
    });

    if (!user) {
      return res.status(400).json({ msg: "No user found." });
    } else {
      res.status(200).send(user);
    }
  } catch {
    return res
      .status(400)
      .json({ msg: "No user found.", name: req.params.name });
  }
});

router.get("/following/:user_id", async (req, res) => {
  try {
    User.findById(req.params.user_id)
      .exec(function (err, user) {
        if (err) {
          console.log(err);
        } else {
          res.status(200).json(user.following.length);
          console.log("success");
        }
      });
  } catch {
    return res.status(400).json({ msg: "Could find friends" });
  }
});

router.get("/followers/:user_id", async (req, res) => {
  try {
    User.findById(req.params.user_id)
      .exec(function (err, user) {
        if (err) {
          console.log(err);
        } else {
          res.status(200).json(user.followers.length);
          console.log("success");
        }
      });
  } catch {
    return res.status(400).json({ msg: "Could find friends" });
  }
});


router.post("/uploadCover", upload.single("file"), async (req, res) => {
  
  console.log(req.headers)
  var newvalues = { $set: {cover: req.headers.path } };
  const user = await User.updateOne({_id: req.headers.user_id}, newvalues, function(err, res) {
    if (err) throw err;
    console.log("1 document updated");
  });

  console.log(req.headers.path);
});

router.post("/uploadAvatar", upload.single("file"), async (req, res) => {
  
  console.log(req.headers)
  var newvalues = { $set: {avatar: req.headers.path } };
  const user = await User.updateOne({_id: req.headers.user_id}, newvalues, function(err, res) {
    if (err) throw err;
    console.log("1 document updated");
  });

  console.log(req.headers.path);
});


module.exports = router;

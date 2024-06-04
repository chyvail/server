const router = require("express").Router();
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const multer = require("multer");
const User = require("../models/User");

// Configration of multer for multer file upload
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "public/uploads/"); // store uploaded files in 'uploads' folder
  },
  filename: function (req, file, cb) {
    cb(null, file.originalname); // use original file names
  },
});

const upload = multer({ storage });

// User Registration

router.post("/register", upload.single("profileImage"), async (req, res) => {
  try {
    // Destructuring from req body
    const { firstName, lastName, email, password } = req.body;
    console.log(req.body);
    // uploaded File
    const profileImage = req.file;
    if (!profileImage) {
      return res.status(400).send("No file Uploaded");
    }
    // path to uploaded photo path
    const profileImagePath = profileImage.path;

    // Check existing user
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(409).json({ message: "User already exists" });
    }
    // Hash password
    const salt = await bcrypt.genSalt();
    const hashedPasssword = await bcrypt.hash(password, salt);

    const newUser = new User({
      firstName,
      lastName,
      email,
      password: hashedPasssword,
      profileImagePath,
    });

    // Save New User
    await newUser.save();
    res
      .status(200)
      .json({ message: "User registred successfully", user: newUser });
  } catch (error) {
    console.log(error);
    res
      .status(500)
      .json({ message: "Registration Failed", error: error.message });
  }
});

// User Login

router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(409).json({ message: "User doesn't exists" });
    }
    // password check
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ message: "Invalid Credentials" });
    }
    // Token Generation
    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET);
    const userObject = user.toObject();
    delete userObject.password;
    res.status(200).json({ token, userObject });
  } catch (error) {
    console.log(error);
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;

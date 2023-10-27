require("dotenv").config();
const express = require("express");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const connectDB = require("./config/db");
const UserModel = require("./userModel");

const app = express();
const port = process.env.PORT || 5000;

app.use(express.json());

app.get("/home", (req, res) => {
  res.status(200).json({ message: "You are welkome" });
});

app.post("/register", async (req, res) => {
  console.log("req.body", req.body);
  const { fullname, email, password } = req.body;

  if (!fullname || !email || !password) {
    return res.status(400).json({ msg: "all fields are required" });
  }
  const hashedpassword = await bcrypt.hash(password, 12);
  try {
    const newUser = await UserModel.create({
      fullname,
      email,
      password: hashedpassword,
    });

    // const userCreated = await newUser.save();
    if (!newUser) {
      console.log("new user cannot be creted");
      return res.status(500).json({ msg: "new user cannot be creted" });
    } else {
      console.log("new user creted to the DB");
      return res
        .status(201)
        .json({ msg: "new user creted to the DB", newUser });
    }
  } catch (error) {
    console.error(`Error register: ${error.message}`);
    return res
      .status(500)
      .json({ msg: "something went wrong please try again" });
  }
});

app.post("/login", async (req, res) => {
  const { email, password } = req.body;

  if (!password || !email) {
    return res.status(400).json({ msg: "all fields are required" });
  }
  try {
    let user = await UserModel.findOne({ email });
    // console.log("🚀 ~ file: index.js:58 ~ app.post ~  user:", user);
    if (!user) {
      return res.status(401).json({ msg: "user not found" });
    }
    const isPasswordCorrect = await bcrypt.compareSync(password, user.password);
    if (!isPasswordCorrect) {
      return res.status(401).json({ msg: "Invalid email or password" });
    }

    const token = jwt.sign({ id: user._id }, "supersecret", {
      expiresIn: "1d",
    });

    user.password = undefined;
    res
      .status(200)
      .json({ msg: "Login is successfully", token: token, user: user });
  } catch (error) {
    console.error(`Error login: ${error.message}`);
  }
});

app.get("/protected", async (req, res, next) => {
  const token = req.headers.authorization.split(" ")[1];

  const decoded = jwt.verify(token, "supersecret");

  const userId = decoded.id;
  try {
    const user = await UserModel.findById({ _id: userId }).select("-password");
    if (user) {
      res
        .status(200)
        .json({ msg: `Welcome ${user.fullname}! This is route protected` });
    } else {
      res.status(401).json({ error: "Invalid token" });
    }
    next();
  } catch (error) {
    console.error(`Error protect: ${error.message}`);
    res.status(401).json({ error: "Invalid token" });
  }
});

app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}`);
  connectDB();
});

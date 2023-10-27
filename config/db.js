require("dotenv").config();
const mongoose = require("mongoose");

const url = process.env.MONGODB_URI;

const connectDB = async () => {
  try {
    const conn = await mongoose.connect(url);
    if (conn) {
      console.log("DB is connected " + conn.connection.host);
    } else {
      console.log((error) => error);
    }
  } catch (error) {
    console.log(`Error: ${error.message}`);
  }
};

module.exports = connectDB;

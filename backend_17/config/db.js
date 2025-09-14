require("dotenv").config();
const mongoose = require("mongoose");

const connectDB = async () => {
  try {
    console.log("Loaded MONGO_URI:", process.env.MONGO_URI); // Debugging line

    if (!process.env.MONGO_URI) {
      throw new Error("MONGO_URI is not defined. Please check your .env file.");
    }

    await mongoose.connect(process.env.MONGO_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });

    console.log("MongoDB connected successfully ✅");
  } catch (err) {
    console.error("MongoDB connection error:", err.message);
    process.exit(1);
  }
};

module.exports = connectDB;

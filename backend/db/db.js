const mongoose = require("mongoose");

const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URL);
    console.log("DataBase is successfully connected");
  } catch (error) {
    console.log(error);
    console.log("database is not connected");
  }
};
module.exports = connectDB;

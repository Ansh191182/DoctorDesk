const express = require("express");
const app = express();
const dotenv = require("dotenv");
dotenv.config();
const cors = require("cors");
app.use(cors());

const bodyParser = require("body-parser");

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
const connectDB = require("./db/db");
connectDB();
const PORT = process.env.PORT || 5000;

app.get("/", async (req, res) => {
  res.send("<h1>jai shree krishn</h1>");
});

// all route fetch

const signUp = require("./routes/signUp");
const login = require("./routes/login");
const getUser = require("./routes/getUser");
// payment route
const order = require("./routes/paymetRoute");
const verifyPaymet = require("./routes/paymetVerify");
const wallet = require("./routes/walletRoute");
const getWallet = require("./routes/getWallet");
// call api
app.use("/", signUp);
app.use("/", login);
// payment api
app.use("/", order);
app.use("/", verifyPaymet);
app.use("/", wallet);
app.use("/", getUser);
app.use("/", getWallet);

app.listen(PORT, () => {
  console.log(`🚀 Docker running on port ${PORT}`);
});

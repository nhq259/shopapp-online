require("dotenv").config({
  path: "./.env",
});
require("rootpath")();
const express = require("express");
const bodyParser = require("body-parser");
const router = require("routes/api");
const { swaggerUIServe,swaggerUISetup } = require("kernels/api-docs");

express.urlencoded({extended: true})

// **Gọi connectDB ở đây**
const connectDB = require("./configs/connectDB");
connectDB();  // Giả sử connectDB export là hàm kết nối, gọi để kết nối DB

const app = express();
app.disable("x-powered-by");

app.use(bodyParser.json());
app.use("/api/", router);
app.use(express.json());

app.use("/api-docs", swaggerUIServe, swaggerUISetup);

module.exports = app

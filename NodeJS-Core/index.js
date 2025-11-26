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
// app.use(function (req, res, next) {


//     // Website you wish to allow to connect
//     res.setHeader('Access-Control-Allow-Origin', '*');

//     // Request methods you wish to allow
//     res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, PATCH, DELETE');

//     // Request headers you wish to allow
//     res.setHeader('Access-Control-Allow-Headers', 'X-Requested-With,content-type');

//     // Set to true if you need the website to include cookies in the requests sent
//     // to the API (e.g. in case you use sessions)
//     // res.setHeader('Access-Control-Allow-Credentials', true);

//     // Pass to next layer of middleware
//     next();
// });
app.use(function (req, res, next) {

  res.header("Access-Control-Allow-Origin", "http://localhost:4200");
  res.header("Access-Control-Allow-Methods", "GET,POST,PUT,PATCH,DELETE,OPTIONS");
  res.header("Access-Control-Allow-Headers", "Content-Type, Authorization, X-Requested-With, Accept");

  // Preflight request — Angular luôn gửi OPTIONS trước POST có Authorization
  if (req.method === "OPTIONS") {
    return res.sendStatus(200);
  }

  next();
});


app.disable("x-powered-by");


app.use(bodyParser.json());

app.use("/api/", router);
app.use(express.json());

app.use("/api-docs", swaggerUIServe, swaggerUISetup);

module.exports = app

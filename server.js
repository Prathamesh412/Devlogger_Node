const express = require("express");
const dotenv = require("dotenv");
// const logger = require("./middleware/logger")
const morgan = require("morgan");
const colors = require("colors");
const fileupload = require("express-fileupload")
const errorHandler = require("./middleware/error")
const bodyParser = require('body-parser');
const path = require("path")

//load environment file
dotenv.config({
  path: "./config/config.env",
});

const connectDB = require("./config/db");

//Connect to database
connectDB();

//Route files
const bootcamps = require("./router/bootcamps");
const courses = require("./router/courses");

const app = express();

app.use(bodyParser.urlencoded({
  extended: true
}));

app.use(express.json());

// app.use(logger);

//dev logging middleware
if (process.env.NODE_ENV === "development") {
  app.use(morgan("dev"));
}

// File uploading
app.use(fileupload());

// Set static folder
app.use(express.static(path.join(__dirname, "public")))

//mount router
app.use("/api/v1/bootcamps", bootcamps);
app.use("/api/v1/courses", courses);

app.use(errorHandler);

const Port = process.env.PORT || 5000;

const server = app.listen(
  Port,
  console.log(
    `Server running in ${process.env.NODE_ENV} mode on port ${Port}`.yellow.bold
  )
);

// Handle unhandled promise rejections
process.on("unhandledRejection", (err, promise) => {
  console.log(`Error: ${err.message}`.red);
  // Close server & exit process
  server.close(() => process.exit(1));
});
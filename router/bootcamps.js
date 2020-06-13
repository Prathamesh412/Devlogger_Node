const express = require("express");

const {
    getBootcamp,
    getBootcamps,
    updateBootcamp,
    createBootcamp,
    deleteBootcamp,
    getBootcampsInRadius,
    bootcampPhotoUpload
} = require("../controllers/bootcamps")

const bootcamp = require("../models/Bootcamp");
const advancedResults = require('../middleware/advancedResults');


// Include other resourse routers
const courseRouter = require('./courses')

const router = express.Router();

//Reroute into other resourse routes
router.use("/:bootcampId/courses", courseRouter);

router.route("/radius/:zipcode/:distance").get(getBootcampsInRadius);

router.route("/:id/photo").put(bootcampPhotoUpload)

router.route("/").get(advancedResults(bootcamp, 'courses'), getBootcamps).post(createBootcamp);

router.route("/:id").get(getBootcamp).put(updateBootcamp).delete(deleteBootcamp)

module.exports = router;
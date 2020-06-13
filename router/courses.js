const express = require("express");

const {
    getCourse,
    getCourses,
    updateCourse,
    createCourse,
    deleteCourse
} = require("../controllers/courses")

const Course = require("../models/Course")
const advancedResults = require("../middleware/advancedResults")

const router = express.Router({
    mergeParams: true
});
//You must pass {mergeParams: true} to the child router if you want to access the params from the parent router.

router.route('/').get(advancedResults(Course, {
    path: 'bootcamp',
    select: 'name description'
}), getCourses).post(createCourse);
router.route('/:id').get(getCourse).put(updateCourse).delete(deleteCourse);

module.exports = router;
const express = require("express");
const router = express.Router();
const { createCourse, updateCourse, deleteCourse, getCourses, getCoursebyFilter } = require('../controllers/coursecontroller');
const validateToken = require("../middleware/validateTokenHandler");

router.post("/create", validateToken, createCourse );
router.get("/getcourses", getCourses );
router.get("/filtercourses", getCoursebyFilter );
router.put("/update/:courseId", validateToken, updateCourse );
router.delete("/delete/:courseId", validateToken, deleteCourse );


module.exports = router;

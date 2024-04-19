const express = require("express");
const router = express.Router();
const validateToken = require("../middleware/validateTokenHandler");
const { enrollUser, getenrolledCourses } = require("../controllers/enrollmentcontroller");

router.post("/enroll/", validateToken, enrollUser);
router.get("/enrolledCourses/", validateToken, getenrolledCourses);


module.exports = router;
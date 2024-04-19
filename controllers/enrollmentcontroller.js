const bcrypt = require('bcrypt');
const asynchandler = require('express-async-handler');
const jwt = require('jsonwebtoken');
const { pool } = require("../config/dbconfig");
const sendEmail = require("../mailService");

const enrollUser = asynchandler(async(req,res)=> {
    // const userId = user.id;
    const user = req.user;
    const userId = user.id;
    const { courseId } = req.body;
    const client = await pool.connect();

    try{
        const existingEnrollment = await client.query(
            'SELECT * FROM enrollments WHERE user_id = $1 AND course_id = $2',
            [userId, courseId]
          );

          if (existingEnrollment.rows.length > 0) {
            return res.status(400).json({ error: 'User is already enrolled in this course' });
          }
          await client.query('INSERT INTO enrollments (user_id, course_id) VALUES ($1, $2)', [userId, courseId]);
          
          const getUserQuery = 'SELECT name, email FROM users WHERE user_id = $1';
          const userResult = await client.query(getUserQuery, [userId]);
          const { name, email } = userResult.rows[0];

          const subject = 'Course Enrollment';
          const text = `Dear ${name},\n\nWelcome, You have successfully enrolled in a course \n\nBest regards`;
          sendEmail(email, subject, text);
  
          res.status(200).json({ message: 'User enrolled successfully' });  
    }
    catch (error) {
        console.error('Error enrolling user:', error);
        res.status(500).json({ error: 'Internal server error' });
    } finally {
        client.release();
    }
});

const getenrolledCourses = asynchandler(async(req,res)=> {
    // 
    const user = req.user;
    const userId = user.id;
    const client = await pool.connect();
  
    try{
        //For pagination
        const pageSize = req.query.pageSize || 10;
        const pageNumber = req.query.page || 1;
        const offset = (pageNumber - 1)*pageSize;

        const enrolledCoursesQuery = `
            SELECT * FROM enrollments
            JOIN courses ON enrollments.course_id = courses.course_id
            WHERE user_id = $1
            ORDER BY courses.course_id
            LIMIT $2 OFFSET $3;
        `;
        const result = await client.query(enrolledCoursesQuery, [userId, pageSize, offset]);
        const enrolledCourses = result.rows;
        res.status(200).json(enrolledCourses);
    }
    catch(error){
        console.error('Error fetching enrolled courses:', error);
        res.status(500).json({ error: 'Internal server error' });  
    } finally{
        client.release();
    }

});

module.exports = { enrollUser, getenrolledCourses };
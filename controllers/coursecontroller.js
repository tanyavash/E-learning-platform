const bcrypt = require('bcrypt');
const asynchandler = require('express-async-handler');
const jwt = require('jsonwebtoken');
const { pool } = require("../config/dbconfig");

const createCourse = asynchandler(async(req,res)=>{
    const client = await pool.connect();
    const user = req.user;
    try{
       
        if (user.roles !== 'admin') {
            res.status(403).json({ error: 'Unauthorized: Only admin users can create courses.' });
            return;
        }
        
        const { title, category, level, description, popularity } = req.body;
        if( !title || !category || !level || !description || !popularity){
        res.status(400);
        throw new Error("All fields are mandatory");}

        const insertCourseQuery = `
                INSERT INTO courses (title, category, level, description, popularity)
                VALUES ($1, $2, $3, $4, $5)
                RETURNING *;
            `;
            const values = [title, category, level, description, popularity];
            const result = await client.query(insertCourseQuery, values);
            const newCourse = result.rows[0];
            res.status(201).json(newCourse);      
    }catch (error) {
        console.error('Error creating course:', error);
        res.status(500).json({ error: 'An error occurred while creating course' });
    }finally {
        client.release();
    }
});

const getCourses = asynchandler(async(req,res)=> {
    const client = await pool.connect();
    try{
        const pageSize = req.query.pageSize || 10;
        const pageNumber = req.query.page || 1;
        const offset = (pageNumber - 1)*pageSize;

        // const query = 'SELECT * FROM courses ';
        const query = `
            SELECT * FROM courses
            ORDER BY course_id
            LIMIT $1 OFFSET $2;
        `;
        const values = [pageSize, offset];
        const result = await client.query(query, values);
        const courses = result.rows;
    
        res.status(200).json(courses);
    }catch(error){
        console.error("Error getting course:", error);
        res.status(500).json({ error: "Internal server error" });
    }finally{
        client.release();
    }
});

const getCoursebyFilter = asynchandler(async(req,res)=>{
    const client = await pool.connect();     
    try{
        const { Column, Value } = req.body;
        if (!Column || !Value) {
            return res.status(400).json({ error: 'Both Column and Value are required' });
        }
        const pageSize = req.query.pageSize || 10;
        const pageNumber = req.query.page || 1;
        const offset = (pageNumber - 1)*pageSize;

        const filterCourseQuery = `
        SELECT * FROM courses
        WHERE ${Column} = $1
        ORDER BY course_id
        LIMIT $2 OFFSET $3;
        `;

        const result = await client.query(filterCourseQuery, [Value, pageSize, offset]);
        const Course = result.rows;
        res.status(200).json(Course);
    }catch(error){
        console.error("Error getting course:", error);
        res.status(500).json({ error: "Internal server error" });
    }finally{
        client.release();
    }

});

const updateCourse = asynchandler(async(req,res)=> {
    const client = await pool.connect();
    const user = req.user;
    try{

        if (user.roles !== 'admin') {
            res.status(403).json({ error: 'Unauthorized: Only admin users can update courses.' });
            return;
        }
        // const userId = user.id;
        const courseId = req.params.courseId;
        const courseData = req.body;

        const updateCourseQuery = `
            UPDATE courses 
            SET title = $1, category = $2, level = $3, description = $4, popularity = $5
            WHERE course_id = $6
            RETURNING *;
        `;
        const values = [courseData.title, courseData.category, courseData.level, courseData.description, courseData.popularity, courseId];
        const result = await client.query(updateCourseQuery, values);
        const updatedCourse = result.rows[0];

        if (!updatedCourse) {
            res.status(404).json({ error: "Course not found" });
            return;
        }

        res.json(updatedCourse);
    }catch (error) {
        console.error("Error updating course:", error);
        res.status(500).json({ error: "Internal server error" });
    } finally {
        client.release();
    }
});

const deleteCourse = asynchandler(async(req,res)=> {
    const client = await pool.connect();
    const user = req.user;
    const courseId = req.params.courseId;
    
    try{
        if (user.roles !== 'admin') {
            res.status(403).json({ error: 'Unauthorized: Only admin users can delete courses.' });
            return;
        }
        console.log(courseId);
        const deleteQuery = 'DELETE FROM courses WHERE course_id = $1';
            await client.query(deleteQuery, [courseId]);

            res.status(200).json({ message: 'Course deleted successfully.' });
        
    }catch(error) {
        console.error('Error detecting course: ', error);
        res.status(500).json({ error: 'An error occurred while deleting the course.' });
    }finally{
        client.release();
    }
});

module.exports = {createCourse, updateCourse, deleteCourse, getCourses, getCoursebyFilter };
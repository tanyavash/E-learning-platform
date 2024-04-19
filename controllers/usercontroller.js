const bcrypt = require('bcrypt');
const asynchandler = require('express-async-handler');
const jwt = require('jsonwebtoken');
const { pool } = require("../config/dbconfig");
const sendEmail = require("../mailService");

const registerUser = asynchandler(async (req, res) => {
    const { name, email, password, roles } = req.body;
    if (!name || !email || !password || !roles) {
      res.status(400);
      throw new Error("All fields are mandatory");
    }
    try {
      const client = await pool.connect(); 
      try {
        // Check if user already exists
        const checkUserQuery = 'SELECT * FROM users WHERE email = $1';
        const result = await client.query(checkUserQuery, [email]);
        const rowCount = result.rows.length;
        if (rowCount > 0) {
          return res.status(400).json({ error: 'User already exists with this email address.' });
        }
        
          if (password.length < 12) {
            return res.status(400).json({ error: "Password must be at least 5 characters" });
          }
        const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9]+).*$/;
        if (!passwordRegex.test(password)) {
            return res.status(400).json({ error: "Password must be alphanumeric" });
          }
        
        // Hash the password
        const hashedPassword = await bcrypt.hash(password, 10);

        const createUserQuery = 'INSERT INTO users (name, email, password, roles) VALUES ($1, $2, $3, $4) RETURNING *';
        const newUserResult = await client.query(createUserQuery, [name, email, hashedPassword, roles]);
        
        const subject = 'Welcome to Our Platform';
        const text = `Dear ${name},\n\nWelcome to our platform! \n\nBest regards`;
        sendEmail(email, subject, text);
       
       
        res.json(newUserResult.rows[0]);
      } finally {
        client.release();
      }
    } catch (error) {
      console.error('Error registering user:', error);
      res.status(500).json({ error: 'An error occurred while registering user.' });
    }
  });

const loginUser = asynchandler(async(req, res)=>{
    const { email, password } = req.body;
    if( !email || !password){
        res.status(400);
        throw new Error("All fields are mandatory");
    }

  try{
    const client = await pool.connect(); 
        try {
        const checkUserQuery = 'SELECT * FROM users WHERE email = $1';
        const result = await client.query(checkUserQuery, [email]);
        const user = result.rows[0];
       // console.log(user);

        if (user && (await bcrypt.compare(password, user.password))) {
            const accessToken = jwt.sign({
                
                    email: user.email,
                    id: user.user_id,
                    roles: user.roles,
                
            }, process.env.ACCESS_TOKEN_SECRET, { expiresIn: "1441m" });
            // res.status(200).json({ accessToken });
            const UserCredentials = {
              id: user.id,
              username: user.name,
              email: user.email
            }

            const subject = 'NEW LOGIN';
            const text = `Dear ${user.name},\n\nWelcome, \nSuccessfully logged in!\n\nBest regards`;
            sendEmail(user.email, subject, text);


            res.cookie("accesstoken", accessToken, {
              httpOnly: true,
              sameSite: "none"
            }).status(200).json(UserCredentials);

        } else {
            res.status(401);
            throw new Error("Email or password is not valid");
        }
    }
    finally {
      client.release();
    }
  }  
  catch (error) {
        console.error('Error logging in user:', error);
        res.status(500).json({ error: 'Error logging in user' });
    }
});

const viewUser = asynchandler(async (req, res) => {
  // let client;
  client = await pool.connect();
  try {
      const userId = req.params.userId;
      const query = 'SELECT * FROM users WHERE user_id = $1';
      const result = await client.query(query, [userId]);
      const user = result.rows[0];

      if (!user) {
          return res.status(404).json({ error: 'User not found' });
      }

      // Omit the password field from the response
      const { password, ...userData } = user;

      res.json(userData);
  } catch (error) {
      console.error('Error fetching user:', error);
      res.status(500).json({ error: 'Internal server error' });
  } finally {
      if (client) {
          client.release(); // Release the client back to the pool
      }
  }
});

const updateUser = asynchandler( async(req,res)=> {
    const client = await pool.connect();
    const user = req.user;
    try{
        const userId = user.id;
        //console.log(userId);
        const userData = req.body;
        try{
          const updateUserQuery = `
                UPDATE users 
                SET name = $1, email = $2, password = $3
                WHERE user_id = $4
                RETURNING *;
            `;
            const values = [userData.name, userData.email, userData.password, userId];
            const result = await client.query(updateUserQuery, values);
            const updatedUser = result.rows[0];

            if (!updatedUser) {
                res.status(404).json({ error: "User not found" });
                return;
            }

            const subject = 'PROFILE UPDATE';
            const text = `Dear ${updatedUser.name},\n\nYour profile was successfully updated \n\nBest regards`;
            sendEmail(updatedUser.email, subject, text);

            res.json(updatedUser);
        }
        finally {
          client.release();
        }
    }
    catch (error) {
      console.error("Error updating user:", error);
      res.status(500).json({ error: "Internal server error" });
  }
});

module.exports = { registerUser, loginUser, viewUser, updateUser };
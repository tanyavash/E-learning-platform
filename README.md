# E-learning Platform Backend API

## Project Overview
This project is a backend API for an e-learning platform, developed to facilitate user registration, user profile management, course management, and user enrollment functionalities. It also includes features such as course filtering, pagination, secure authentication, error handling, and logging. The API is designed to be scalable, secure, and efficient, catering to the needs of both users and administrators.

## Database and Email Integration

-Database: Used neon.tech database for storing user information, course details, and enrollment data.
-Email INtegration: Integrated Nodemailer for handling email communications, including user registration & logging confirmation, update confirmation and course enrollment notifications. 
(*It was mentioned to use resend.com's email service but despite trying it various ways it was not being integrated)

## Security and Authentication

- Implements secure authentication mechanisms using JWT (JSON Web Tokens) to authenticate users for accessing protected endpoints.
- Ensures sensitive data, such as passwords, is securely hashed before storage in the database.

## Error Handling and Logging

-Implements robust error handling mechanisms to provide meaningful error messages to clients.
-Utilizes logging to track API requests, responses, and any potential errors or exceptions for debugging purposes.

## Additional Note for .env File

- Please ensure to create a .env file in the project root directory and include the necessary environment variables:
   - PORT 
   - ACCESS_TOKEN_SECRET
   - PGHOST
   - PGDATABASE
   - PGUSER
   - PGPASSWORD
   - USER=your_email_address
   - PASS=your_email_password
- These environment variables are crucial for the proper functioning of the backend API, especially for database connection, JWT token generation, and email sending functionality.



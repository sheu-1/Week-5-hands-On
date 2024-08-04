const express = require('express');
const app = express();
const mysql = require('mysql2');
const cors = require('cors');
const bcrypt = require('bcrypt');
const dotenv = require('dotenv')

app.use(express.json())
app.use(cors())
dotenv.config()

const db = mysql.createConnection({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD
})

db.connect((err) => {
    if(err) return console.log("Error connecting to db")

    console.log("Connected to MySQL: ", db.threadId);

    db.query(`CREATE DATABASE IF NOT EXISTS expense_tracker`, (err, result) => {
        if(err) return console.log(err)

        console.log("Database expense_tracker created")

        //select db

        db.changeUser({ database: 'expense_tracker'}, (err) => {
            if (err) return console.log(err)

            console.log("Changed to expense_tracker")

            const createUserTable = `
            CREATE TABLE IF NOT EXISTS users (
                id INT AUTO_INCREMENT PRIMARY KEY,
                email VARCHAR(100) NOT NULL UNIQUE,
                username VARCHAR(50) NOT NULL,
                password VARCHAR(255) NOT NULL,
                created_at date NOT NULL,
                updated_at date NOT NULL
            )
            `;

            db.query(createUserTable, (err, result) => {
                if(err) return console.log(err)

                console.log("Users table created");
            })

            const createCategoriesTable = `
            CREATE TABLE IF NOT EXISTS categories (
                category_id INT(20) AUTO_INCREMENT PRIMARY KEY,
                user_id INT(20),
                category_name VARCHAR(50) NOT NULL,
                created_at DATE NOT NULL,
                updated_at DATE NOT NULL
            );
            `
            db.query(createCategoriesTable, (err, result) => {
                if(err) return console.log(err)
                
                console.log("Categories table created");
            })

            const createExpensesTable = `
            CREATE TABLE IF NOT EXISTS expenses (
                expense_id INT(20) AUTO_INCREMENT PRIMARY KEY,
                user_id INT(20),
                category_id INT(20),
                amount INT(20) NOT NULL,
                date DATE NOT NULL,
                description VARCHAR(255) NOT NULL,
                created_at DATE NOT NULL,
                updated_at DATE NOT NULL,
                FOREIGN KEY (user_id) REFERENCES users(id),
                FOREIGN KEY (category_id) REFERENCES categories(category_id)
            );
            `

            db.query(createExpensesTable, (err, result) => {
                if(err) return console.log(err)
                
                console.log("Expense table created");
            })
            
            const createPaymentsTable = `
            CREATE TABLE IF NOT EXISTS payments (
                payment_method_id INT(20) AUTO_INCREMENT PRIMARY KEY,
                user_id INT(20),
                payment_method_name VARCHAR(50) NOT NULL,
                created_at DATE NOT NULL,
                updated_at DATE NOT NULL,
                FOREIGN KEY (user_id) REFERENCES users(id)
            );
            `
            db.query(createCategoriesTable, (err, result) => {
                if(err) return console.log(err)
                
                console.log("Payments table created");
            })

            const createBudgetsTable = `
            CREATE TABLE IF NOT EXISTS budgets (
                budget_id INT(20) AUTO_INCREMENT PRIMARY KEY,
                user_id INT(20),
                category_id INT(20),
                start_date DATE NOT NULL,
                end_date DATE NOT NULL,
                created_at DATE NOT NULL,
                updated_at DATE NOT NULL,
                FOREIGN KEY (user_id) REFERENCES users(id),
                FOREIGN KEY (category_id) REFERENCES categories(category_id)
            );
            `
            db.query(createCategoriesTable, (err, result) => {
                if(err) return console.log(err)
                
                console.log("Budgets table created");
            })
            
        })        
    })
})

//user registration route
app.post('/api/register', async(req, res) => {
    try {
        const users = `SELECT * FROM users WHERE email = ?`

        db.query(users, [req.body.email], (err, data) => {
            if(data.length) return res.status(409).json("user already exists");

            const createUser = `INSERT INTO users(email, username, password) VALUES (?)`
            value = [
                req.body.email,
                req.body.username,
                req.body.password
            ]
             //insert new user in db
            db.query(createUser, [value], (err, data) =>{
                if(err) res.status(409).json("Something went wrong")
                
                return res.status(200).json("User created");
                
            })
        })
       
    } catch (err) {
        res.status(500).json("Internal Server Error")
    }
})

app.listen(3001, () => {
    console.log("Server is running on PORT 3001")
})
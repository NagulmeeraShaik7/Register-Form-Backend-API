const express = require("express");
const { open } = require("sqlite");
const sqlite3 = require("sqlite3");
const path = require("path");

const app = express();
app.use(express.json());

const databasePath = path.join(__dirname, "registration.db");

let database = null;

// Initialize the database and start the server
const initializeDbAndServer = async () => {
  try {
    // Open the SQLite database
    database = await open({
      filename: databasePath,
      driver: sqlite3.Database,
    });

    
    

    app.listen(3000, () => {
      console.log("Server is running on http://localhost:3000/");
    });
  } catch (error) {
    // Detailed error logging for troubleshooting
    console.error(`Database Initialization Error: ${error.message}`);
    process.exit(1);
  }
};

initializeDbAndServer();

// POST endpoint to register user and their address
app.post("/register", async (req, res) => {
  const { name, address } = req.body;

  try {
    // Check if required fields are present
    if (!name || !address) {
      return res.status(400).send("Name and address are required.");
    }

    // Insert the user into the User table
    const addUserQuery = `INSERT INTO User (name) VALUES (?);`;
    const userResult = await database.run(addUserQuery, [name]);
    const userId = userResult.lastID; // Get the inserted user's ID

    // Insert the address into the Address table, linking it to the user
    const addAddressQuery = `INSERT INTO Address (userId, address) VALUES (?, ?);`;
    await database.run(addAddressQuery, [userId, address]);

    res.status(201).send("User and Address Added Successfully");
  } catch (error) {
    // Log the error message for internal server errors
    console.error(`Error Handling Request: ${error.message}`);
    res.status(500).send("Internal Server Error");
  }
});

module.exports = app;

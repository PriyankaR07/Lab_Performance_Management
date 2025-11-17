const mysql = require("mysql2"); // NOT mysql2/promise

// Create basic connection (not a pool)
const db = mysql.createConnection({
  host: "localhost",
  user: "root",
  password: "priya@1234", 
  database: "LabPerformanceDB"
});

// Simple connection test
db.connect((err) => {
  if (err) {
    console.error("Error connecting to MySQL:", err);
    // Exit the process if connection fails
    process.exit(1); 
  } else {
    console.log("Successfully connected to MySQL database");
  }
});

// Export the connection object
module.exports = db;
// authController.js
const db = require("../db");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

const login = (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ message: "Email and password are required" });
  }

  const query = `SELECT * FROM users WHERE email = ?`;
  db.execute(query, [email], (err, results) => {
    if (err) {
      console.error("Database error:", err);
      return res.status(500).json({ message: "Database error", error: err });
    }
    
    if (results.length === 0) {
      return res.status(404).json({ message: "User not found" });
    }

    const user = results[0];
    if (user.role === "admin") {
      bcrypt.compare(password, user.password || "", (err, isMatch) => {
        if (err) {
          console.error("Error comparing passwords:", err);
          return res.status(500).json({ message: "Error comparing passwords", error: err });
        }
        if (!isMatch) {
          return res.status(401).json({ message: "Invalid credentials" });
        }

        const accessToken = jwt.sign({ id: user.id, role: user.role }, "secret_key", { expiresIn: "1m" });
        const refreshToken = jwt.sign({ id: user.id, role: user.role }, "refresh_secret_key", { expiresIn: "7d" });

        res.json({ message: "Login successful", accessToken, refreshToken, role: user.role });
      });
    } else {
      if (password === user.password) {
        const accessToken = jwt.sign({ id: user.id, role: user.role }, "secret_key", { expiresIn: "1m" });
        const refreshToken = jwt.sign({ id: user.id, role: user.role }, "refresh_secret_key", { expiresIn: "7d" });

        res.json({ message: "Login successful", accessToken, refreshToken, role: user.role });
      } else {
        return res.status(401).json({ message: "Invalid credentials" });
      }
    }
  });
};

module.exports = { login };
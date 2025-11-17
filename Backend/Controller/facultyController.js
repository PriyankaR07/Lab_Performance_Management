const db = require("../db"); // Ensure the database connection file is correct
const express = require("express");
const router = express.Router();

// Get all faculty records
router.get("/getAllFaculty", (req, res) => {
    db.query("SELECT * FROM faculty", (err, result) => {
        if (err) {
            console.error("Error fetching faculty:", err);
            return res.status(500).json({ error: "Error fetching faculty data" });
        }
        res.json(result);
    });
});

// Add a new faculty record
router.post("/addFaculty", (req, res) => {
    const { name, program, subjects, email, contact } = req.body;

    // Ensure subjects is a valid string
    const subjectString = Array.isArray(subjects) ? subjects.join(', ') : subjects;

    const sql = "INSERT INTO faculty (name, program, subjects, email, contact) VALUES (?, ?, ?, ?, ?)";
    db.query(sql, [name, program, subjectString, email, contact], (err, result) => {
        if (err) {
            console.error("Error adding faculty:", err);
            return res.status(500).json({ error: "Error adding faculty data" });
        }
        res.json({ message: "Faculty added successfully", id: result.insertId });
    });
});

// Update faculty details
router.put("/updateFaculty/:id", (req, res) => {
    const { name, program, subjects, email, contact } = req.body;
    const { id } = req.params;

    if (!id) {
        return res.status(400).json({ error: "Faculty ID is required" });
    }

    const subjectString = Array.isArray(subjects) ? subjects.join(', ') : subjects;

    const sql = "UPDATE faculty SET name=?, program=?, subjects=?, email=?, contact=? WHERE id=?";
    db.query(sql, [name, program, subjectString, email, contact, id], (err, result) => {
        if (err) {
            console.error("Error updating faculty:", err);
            return res.status(500).json({ error: "Error updating faculty data" });
        }
        if (result.affectedRows === 0) {
            return res.status(404).json({ error: "Faculty not found" });
        }
        res.json({ message: "Faculty updated successfully" });
    });
});

// Delete a faculty record
router.delete("/deleteFaculty/:id", (req, res) => {
    const { id } = req.params;

    if (!id) {
        return res.status(400).json({ error: "Faculty ID is required" });
    }

    db.query("DELETE FROM faculty WHERE id=?", [id], (err, result) => {
        if (err) {
            console.error("Error deleting faculty:", err);
            return res.status(500).json({ error: "Error deleting faculty data" });
        }
        if (result.affectedRows === 0) {
            return res.status(404).json({ error: "Faculty not found" });
        }
        res.json({ message: "Faculty deleted successfully" });
    });
});

module.exports = router;

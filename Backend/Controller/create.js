const db = require("../db");

const studentController = {
    // Get student details by register number (improved version)
    getStudentByRegNo: (req, res) => {
        const regNo = req.params.regNo.trim(); // Removed toLowerCase()
        
        console.log("Searching for student with regNo:", regNo);
        
        // More precise query with explicit column selection
        const query = `
            SELECT 
                reg_no,
                name,
                class,
                email,
                Joining_Year,
                Contact_No,
                DOB
            FROM Student_Details 
            WHERE reg_no = ?
        `;

        db.query(query, [regNo], (err, results) => {
            if (err) {
                console.error("Database error:", {
                    error: err,
                    query: query,
                    parameters: [regNo]
                });
                return res.status(500).json({ 
                    message: "Database error",
                    error: err.message 
                });
            }

            if (results.length === 0) {
                console.log(`No student found with reg_no: ${regNo}`);
                return res.status(404).json({ 
                    message: "Student not found",
                    suggestion: "Check the registration number and try again"
                });
            }

            const studentData = results[0];
            console.log("Student found:", studentData);
            
            // Ensure consistent field names in response
            res.json({
                reg_no: studentData.reg_no,
                name: studentData.name,
                class: studentData.class,
                email: studentData.email,
                Joining_Year: studentData.Joining_Year,
                Contact_No: studentData.Contact_No,
                DOB: studentData.DOB
            });
        });
    },

    // Add a new student (with improved validation)
    addStudent: (req, res) => {
        const { reg_no, name, class: student_class, email, Joining_Year, Contact_No, DOB } = req.body;

        // Validate required fields
        const requiredFields = { reg_no, name, student_class, email };
        const missingFields = Object.entries(requiredFields)
            .filter(([_, value]) => !value)
            .map(([key]) => key);

        if (missingFields.length > 0) {
            return res.status(400).json({ 
                message: "Missing required fields",
                missingFields,
                receivedData: req.body
            });
        }

        const query = `
            INSERT INTO Student_Details 
            (reg_no, name, class, email, Joining_Year, Contact_No, DOB) 
            VALUES (?, ?, ?, ?, ?, ?, ?)
        `;
        
        const params = [reg_no, name, student_class, email, Joining_Year || null, Contact_No || null, DOB || null];

        db.query(query, params, (err, results) => {
            if (err) {
                console.error("Database error:", {
                    error: err,
                    query: query,
                    parameters: params
                });
                
                if (err.code === 'ER_DUP_ENTRY') {
                    return res.status(409).json({ 
                        message: "Registration number already exists" 
                    });
                }
                
                return res.status(500).json({ 
                    message: "Failed to save student",
                    error: err.message 
                });
            }
            
            res.status(201).json({ 
                message: "Student added successfully!",
                reg_no,
                id: results.insertId 
            });
        });
    },

    // Update student details (with better validation)
    updateStudent: (req, res) => {
        const { reg_no } = req.params;
        const updateFields = req.body;
        
        if (!reg_no) {
            return res.status(400).json({ message: "Registration number is required" });
        }
        
        if (Object.keys(updateFields).length === 0) {
            return res.status(400).json({ message: "No fields to update" });
        }

        // Build dynamic update query
        const setClauses = [];
        const values = [];
        
        Object.entries(updateFields).forEach(([key, value]) => {
            if (value !== undefined) {
                setClauses.push(`${key} = ?`);
                values.push(value);
            }
        });
        
        values.push(reg_no); // Add reg_no for WHERE clause
        
        const query = `
            UPDATE Student_Details
            SET ${setClauses.join(', ')}
            WHERE reg_no = ?
        `;

        db.query(query, values, (err, results) => {
            if (err) {
                console.error("Update error:", {
                    error: err,
                    query: query,
                    parameters: values
                });
                return res.status(500).json({ 
                    message: "Failed to update student",
                    error: err.message 
                });
            }
            
            if (results.affectedRows === 0) {
                return res.status(404).json({ 
                    message: "No student found with this registration number" 
                });
            }
            
            res.json({ 
                message: "Student updated successfully",
                changes: results.changedRows
            });
        });
    },

    // Delete a student (with more detailed response)
    deleteStudent: (req, res) => {
        const { reg_no } = req.params;
        
        if (!reg_no) {
            return res.status(400).json({ message: "Registration number is required" });
        }

        console.log(`Attempting to delete student: ${reg_no}`);
        
        // First check if student exists
        const checkQuery = "SELECT reg_no FROM Student_Details WHERE reg_no = ?";
        
        db.query(checkQuery, [reg_no], (checkErr, checkResults) => {
            if (checkErr) {
                console.error("Check error:", checkErr);
                return res.status(500).json({ 
                    message: "Error verifying student",
                    error: checkErr.message 
                });
            }
            
            if (checkResults.length === 0) {
                return res.status(404).json({ 
                    message: "Student not found" 
                });
            }
            
            // Proceed with deletion
            const deleteQuery = "DELETE FROM Student_Details WHERE reg_no = ?";
            
            db.query(deleteQuery, [reg_no], (deleteErr, deleteResults) => {
                if (deleteErr) {
                    console.error("Delete error:", deleteErr);
                    return res.status(500).json({ 
                        message: "Failed to delete student",
                        error: deleteErr.message 
                    });
                }
                
                res.json({ 
                    message: "Student deleted successfully",
                    affectedRows: deleteResults.affectedRows 
                });
            });
        });
    }
};

module.exports = studentController;
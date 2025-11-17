const db = require('../db');
// Add these to your marksController.js

exports.getClasses = (req, res) => {
    console.log('GET /classes');
    res.json(['MCA', 'MSC']);
};

exports.getSubjects = (req, res) => {
    console.log('GET /subjects/:class', req.params.class);
    const { class: className } = req.params;
    const subjects = {
        MCA: [
            { name: 'Machine Learning', code: 'ML101' },
            { name: 'Mini Project', code: 'MP102' },
            { name: 'Research Methodology', code: 'RM103' },
        ],
        MSC: [
            { name: 'ADBMS', code: 'AD104' },
            { name: 'NLP', code: 'NL105' },
            { name: 'Research Methodology', code: 'RM103' },
        ],
    };
    res.json(subjects[className] || []);
};
// Fetch Students by Class
exports.getStudents = (req, res) => {
    const { class: className } = req.params;
    console.log('GET /students/:class/:subject', className, req.params.subject);

    db.query('SELECT reg_no, name FROM students WHERE class = ?', [className], (error, results) => {
        if (error) {
            console.error('Error fetching students:', error);
            return res.status(500).send('Error fetching students');
        }
        res.json(results);
    });
};

// Save Marks
exports.saveMarks = (req, res) => {
    const { className, subject, testDate, topic, totalMarks, marks, batch, feedbacks, sub_code,grade } = req.body;
    console.log('Received payload:', req.body);

    if (!className || !subject || !testDate || !topic || !totalMarks || !marks || !Array.isArray(marks)) {
        return res.status(400).send('Invalid data format');
    }

    db.query('SELECT reg_no, name FROM students WHERE class = ?', [className], (error, students) => {
        if (error) {
            console.error('Error fetching students:', error);
            return res.status(500).send('Error fetching students');
        }

        // Filter students by batch if batch is specified
        const filteredStudents = batch
            ? students.filter((_, index) => Math.floor(index / 10) + 1 === batch)
            : students;

        if (filteredStudents.length !== marks.length) {
            return res.status(400).send('Mismatch between students and marks');
        }

        const values = filteredStudents.map((student, index) => [
            student.reg_no,
            subject,
            marks[index] === '' ? 0 : marks[index],
            testDate,
            topic,
            totalMarks,
            feedbacks[student.reg_no] || '',
            batch,
            sub_code || '',
            grade,
        ]);

        const insertQuery = `
            INSERT INTO marks (reg_no, subject, marks, test_date, topic, total_marks, feedback, batch, sub_code,grade)
            VALUES ?
            ON DUPLICATE KEY UPDATE
              marks = VALUES(marks),
              test_date = VALUES(test_date),
              topic = VALUES(topic),
              total_marks = VALUES(total_marks),
              feedback = VALUES(feedback),
              batch = VALUES(batch),
              sub_code = VALUES(sub_code);
              grade = VALUES(grade);
        `;

        db.query(insertQuery, [values], (insertError) => {
            if (insertError) {
                console.error('Error saving marks:', insertError);
                return res.status(500).send('Error saving marks');
            }
            res.send('Marks successfully submitted');
        });
    });
};

// Fetch Marks Overview
exports.getMarkOverview = async (req, res) => {
    try {
        const { subject, class: selectedClass, batch, sort } = req.query;
        
        console.log('Received request with params:', {
            subject,
            selectedClass,
            batch,
            sort
        });

        let query = `
            SELECT 
                m.id,
                m.reg_no,
                s.name AS student_name,
                s.class AS student_class,
                m.subject,
                m.marks,
                DATE_FORMAT(m.test_date, '%Y-%m-%d') AS testDate,
                m.topic,
                m.total_marks AS totalMarks,
                m.feedback,
                m.batch,
                m.sub_code
            FROM marks m
            JOIN students s ON m.reg_no = s.reg_no
            WHERE 1=1
        `;

        const params = [];
        
        if (subject) {
            query += ' AND m.subject = ?';
            params.push(subject);
        }
        if (selectedClass) {
            query += ' AND s.class = ?';
            params.push(selectedClass);
        }
        if (batch) {
            query += ' AND m.batch = ?';
            params.push(batch);
        }

        query += ` ORDER BY m.test_date ${sort === 'asc' ? 'ASC' : 'DESC'}`;

        console.log('Executing query:', query);
        console.log('With params:', params);

        const [results] = await db.promise().query(query, params);
        
        if (!Array.isArray(results)) {
            throw new Error('Database did not return an array');
        }
        
        console.log(`Found ${results.length} records`);
        res.status(200).json(results);
        
    } catch (error) {
        console.error('Error in getMarkOverview:', error);
        res.status(500).json([]); // Always return an array
    }
};// ... keep all your other controller methods the same way, just replace createConnection() with db

// Update Marks
exports.updateMarks = async (req, res) => {
    const { id } = req.params;
    const { marks, feedback } = req.body; // Only update marks and feedback
  
    try {
      console.log('Updating record:', { id, marks, feedback }); // Debug log
  
      const [result] = await db.promise().query(
        `UPDATE marks 
         SET marks = ?, feedback = ?
         WHERE id = ?`,
        [marks, feedback, id]
      );
  
      if (result.affectedRows === 0) {
        return res.status(404).json({ 
          success: false,
          message: 'No record found to update' 
        });
      }
  
      // Return the updated record
      const [updated] = await db.promise().query(
        `SELECT m.*, s.name AS student_name 
         FROM marks m
         JOIN students s ON m.reg_no = s.reg_no
         WHERE m.id = ?`,
        [id]
      );
  
      res.json({
        success: true,
        data: updated[0],
        message: 'Marks updated successfully'
      });
    } catch (error) {
      console.error('Update error:', error);
      res.status(500).json({ 
        success: false,
        message: 'Error updating marks',
        error: error.message 
      });
    }
  };
// Delete Marks - Fixed version
exports.deleteMarks = async (req, res) => {
    const { id } = req.params;

    if (!id) {
        return res.status(400).json({
            success: false,
            message: 'ID parameter is required'
        });
    }

    try {
        // First check if record exists and is within deletion window
        const [checkResults] = await db.promise().query(
            'SELECT test_date FROM marks WHERE id = ?',
            [id]
        );

        if (checkResults.length === 0) {
            return res.status(404).json({
                success: false,
                message: 'Record not found'
            });
        }

        const testDate = new Date(checkResults[0].test_date);
        const currentDate = new Date();
        const dateDifference = Math.floor((currentDate - testDate) / (1000 * 60 * 60 * 24));

        if (dateDifference > 7) {
            return res.status(400).json({
                success: false,
                message: 'Marks can only be deleted within one week of the test date'
            });
        }

        // Proceed with deletion
        const [result] = await db.promise().query(
            'DELETE FROM marks WHERE id = ?',
            [id]
        );

        if (result.affectedRows === 0) {
            return res.status(404).json({
                success: false,
                message: 'No record found with that ID'
            });
        }

        res.json({
            success: true,
            message: 'Record deleted successfully',
            deletedCount: result.affectedRows
        });
    } catch (error) {
        console.error('Error deleting record:', error);
        res.status(500).json({
            success: false,
            message: 'Error deleting record',
            error: error.message
        });
    }
};

// Date Diagnostics - Fixed version
exports.dateDiagnostics = async (req, res) => {
    const { reg_no } = req.params;
    const { subject, testDate, topic } = req.query;

    if (!reg_no || !subject || !testDate || !topic) {
        return res.status(400).json({
            error: 'All parameters are required'
        });
    }

    try {
        const [records] = await db.promise().query(
            `SELECT * FROM marks 
             WHERE reg_no = ? AND subject = ? AND topic = ?`,
            [reg_no, subject, topic]
        );

        if (records.length === 0) {
            return res.status(404).json({
                error: 'No records found',
                search_params: { reg_no, subject, topic }
            });
        }

        const dateAnalysis = records.map(record => {
            const dbDate = record.test_date;
            const dbDateISO = new Date(dbDate).toISOString();
            const dbDateYMD = new Date(dbDate).toISOString().split('T')[0];
            const reqDateObj = new Date(testDate);
            const reqDateISO = reqDateObj.toISOString();
            const reqDateYMD = reqDateObj.toISOString().split('T')[0];

            return {
                record_id: record.id,
                db_date: {
                    original: dbDate,
                    as_iso: dbDateISO,
                    as_ymd: dbDateYMD,
                },
                requested_date: {
                    original: testDate,
                    as_iso: reqDateISO,
                    as_ymd: reqDateYMD,
                },
                comparison: {
                    ymd_match: dbDateYMD === reqDateYMD,
                }
            };
        });

        res.json({
            records_found: records.length,
            date_analysis: dateAnalysis,
        });
    } catch (error) {
        console.error('Error in date diagnostics:', error);
        res.status(500).json({
            error: error.message
        });
    }
};

// Get Subjects - Fixed version
exports.getApiSubjects = async (req, res) => {
    const { faculty } = req.query;
    
    try {
        const [results] = await db.promise().query(
            `SELECT DISTINCT subject FROM marks 
             WHERE reg_no IN (SELECT reg_no FROM students WHERE class = ?)`,
            [faculty]
        );
        
        res.json(results.map(row => row.subject));
    } catch (error) {
        console.error('Error fetching subjects:', error);
        res.status(500).json({
            error: 'Error fetching subjects'
        });
    }
};
//addes
// Get marks overview with student filter
exports.getMarkOverview = async (req, res) => {
    try {
      const { subject, class: selectedClass, batch, sort, reg_no } = req.query;
      
      let query = `
        SELECT 
          m.id,
          m.reg_no,
          s.name AS student_name,
          s.class AS student_class,
          m.subject,
          m.marks,
          DATE_FORMAT(m.test_date, '%Y-%m-%d') AS testDate,
          m.topic,
          m.total_marks AS totalMarks,
          m.feedback,
          m.batch,
          m.sub_code
        FROM marks m
        JOIN students s ON m.reg_no = s.reg_no
        WHERE 1=1
      `;
  
      const params = [];
      
      if (subject) {
        query += ' AND m.subject = ?';
        params.push(subject);
      }
      if (selectedClass) {
        query += ' AND s.class = ?';
        params.push(selectedClass);
      }
      if (batch) {
        query += ' AND m.batch = ?';
        params.push(batch);
      }
      if (reg_no) {
        query += ' AND m.reg_no = ?';
        params.push(reg_no);
      }
  
      query += ` ORDER BY m.test_date ${sort === 'asc' ? 'ASC' : 'DESC'}`;
  
      const [results] = await db.promise().query(query, params);
      res.status(200).json(results);
    } catch (error) {
      console.error('Error in getMarkOverview:', error);
      res.status(500).json([]);
    }
  };
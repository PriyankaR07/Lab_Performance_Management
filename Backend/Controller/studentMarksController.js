const db = require('../db');

// Get student by registration number
exports.getStudentByRegNo = async (req, res) => {
  const { regNo } = req.params;
  try {
    const [results] = await db.promise().query(
      'SELECT reg_no, name, class FROM students WHERE reg_no = ?',
      [regNo]
    );
    if (results.length > 0) {
      res.json(results[0]);
    } else {
      res.status(404).json({ message: 'Student not found' });
    }
  } catch (error) {
    console.error('Error fetching student:', error);
    res.status(500).json({ message: 'Error fetching student' });
  }
};

// Get subjects for a student's class
exports.getStudentSubjects = async (req, res) => {
  const { regNo } = req.params;
  try {
    // First get student's class
    const [student] = await db.promise().query(
      'SELECT class FROM students WHERE reg_no = ?',
      [regNo]
    );
    
    if (student.length === 0) {
      return res.status(404).json({ message: 'Student not found' });
    }

    // Then get distinct subjects for that class
    const [subjects] = await db.promise().query(
      `SELECT DISTINCT subject 
       FROM marks 
       WHERE reg_no IN (SELECT reg_no FROM students WHERE class = ?)`,
      [student[0].class]
    );

    res.json(subjects.map(s => s.subject));
  } catch (error) {
    console.error('Error fetching subjects:', error);
    res.status(500).json({ message: 'Error fetching subjects' });
  }
};

// Get marks for a specific subject
exports.getSubjectMarks = async (req, res) => {
  const { regNo, subject } = req.params;
  try {
    const [marks] = await db.promise().query(
      `SELECT 
        DATE_FORMAT(test_date, '%Y-%m-%d') AS testDate,
        topic,
        marks,
        total_marks AS totalMarks,
        feedback
       FROM marks
       WHERE reg_no = ? AND subject = ?
       ORDER BY test_date DESC`,
      [regNo, subject]
    );

    res.json(marks);
  } catch (error) {
    console.error('Error fetching subject marks:', error);
    res.status(500).json({ message: 'Error fetching subject marks' });
  }
};

// Get overall performance report
exports.getOverallReport = async (req, res) => {
  const { regNo } = req.params;
  try {
    // Get all marks for the student
    const [marks] = await db.promise().query(
      `SELECT 
        subject,
        marks,
        total_marks AS totalMarks
       FROM marks
       WHERE reg_no = ?`,
      [regNo]
    );

    if (marks.length === 0) {
      return res.json([]);
    }

    // Calculate subject-wise totals and averages
    const subjectData = {};
    marks.forEach(mark => {
      if (!subjectData[mark.subject]) {
        subjectData[mark.subject] = {
          totalMarks: 0,
          totalPossible: 0,
          count: 0
        };
      }
      subjectData[mark.subject].totalMarks += mark.marks;
      subjectData[mark.subject].totalPossible += mark.totalMarks;
      subjectData[mark.subject].count++;
    });

    // Format the response
    const report = Object.keys(subjectData).map(subject => ({
      subject,
      totalMarks: subjectData[subject].totalMarks,
      totalPossible: subjectData[subject].totalPossible,
      average: ((subjectData[subject].totalMarks / subjectData[subject].totalPossible) * 100).toFixed(2)
    }));

    // Calculate overall average
    const overallAverage = report.reduce((sum, subject) => sum + parseFloat(subject.average), 0) / report.length;

    res.json({
      subjects: report,
      overallAverage: overallAverage.toFixed(2)
    });
  } catch (error) {
    console.error('Error generating overall report:', error);
    res.status(500).json({ message: 'Error generating overall report' });
  }
};
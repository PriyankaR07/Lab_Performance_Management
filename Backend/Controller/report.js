const express = require('express');
const router = express.Router();
const db = require('../db');

// Fetch Classes
router.get('/classes', (req, res) => {
  console.log('GET /classes');
  res.json(['MCA', 'MSc']);
});

// Fetch Subjects by Class
router.get('/subjects/:class', (req, res) => {
  console.log('GET /subjects/:class', req.params.class);
  const { class: className } = req.params;
  const subjects = {
    MCA: ['Machine Learning', 'Mini Project', 'Research Methodology'],
    MSc: ['ADBMS', 'NLP', 'Research Methodology'],
  };
  res.json(subjects[className] || []);
});

// Fetch Students by Class
router.get('/students/:class/:subject', (req, res) => {
  console.log('GET /students/:class/:subject', req.params.class, req.params.subject);
  const { class: className } = req.params;
  
  db.query(
    'SELECT reg_no, name FROM students WHERE class = ?',
    [className],
    (err, results) => {
      if (err) {
        console.error('Error fetching students:', err);
        return res.status(500).json({ error: 'Error fetching students' });
      }
      res.json(results);
    }
  );
});

// Fetch Marks Overview
router.get('/marks-overview', (req, res) => {
  const { subject, class: selectedClass, batch } = req.query;
  let query = `
    SELECT 
      m.id,
      s.reg_no, 
      m.subject, 
      m.marks, 
      m.test_date AS testDate, 
      m.topic, 
      m.total_marks AS totalMarks,
      m.feedback,
      m.batch
    FROM marks m 
    JOIN students s ON m.reg_no = s.reg_no
  `;
  
  const queryParams = [];
  const conditions = [];

  if (subject) {
    conditions.push('m.subject = ?');
    queryParams.push(subject);
  }
  if (selectedClass) {
    conditions.push('s.class = ?');
    queryParams.push(selectedClass);
  }
  if (batch) {
    conditions.push('m.batch = ?');
    queryParams.push(parseInt(batch, 10));
  }

  if (conditions.length > 0) {
    query += ' WHERE ' + conditions.join(' AND ');
  }

  db.query(query, queryParams, (err, results) => {
    if (err) {
      console.error('Error fetching marks overview:', err);
      return res.status(500).json({ error: 'Error fetching marks overview' });
    }
    res.json(results);
  });
});

module.exports = router;
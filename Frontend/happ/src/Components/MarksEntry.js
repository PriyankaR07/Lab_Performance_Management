import React, { useState, useEffect, useCallback, useMemo } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import MarksOverview from './MarksOverview'
import '../Styles/marksentery.css';

const MarksEntry = () => {
  const navigate = useNavigate();
  const [classes, setClasses] = useState([]);
  const [subjects, setSubjects] = useState([]);
  const [students, setStudents] = useState([]);
  const [marks, setMarks] = useState([]);
  const [selectedClass, setSelectedClass] = useState('');
  const [selectedSubject, setSelectedSubject] = useState('');
  const [testDate, setTestDate] = useState('');
  const [topic, setTopic] = useState('');
  const [batch, setBatch] = useState('');
  const [showOverview, setShowOverview] = useState(false);
  const [totalMarks, setTotalMarks] = useState('');
  const [feedbacks, setFeedbacks] = useState({});
  const today = new Date().toISOString().split('T')[0];

  const handleOverview = () => setShowOverview(true);
  const handleBack = useCallback(() => {
    if (showOverview) {
      setShowOverview(false);
    } else if (selectedSubject) {
      setSelectedSubject('');
      setStudents([]);
      setMarks([]);
    } else if (selectedClass) {
      setSelectedClass('');
      setSubjects([]);
    } else {
      navigate('/');
    }
  }, [showOverview, selectedSubject, selectedClass, navigate]);

  useEffect(() => {
    axios.get('http://localhost:5000/classes')
      .then(res => setClasses(res.data))
      .catch(err => console.error('Error fetching classes:', err));
  }, []);

  const handleTestDateChange = (date) => {
    if (date > today) {
      alert('Future dates are not allowed. Please select a valid date.');
      return;
    }
    setTestDate(date);
  };

  const fetchSubjects = useCallback((className) => {
    setSelectedClass(className);
    axios.get(`http://localhost:5000/subjects/${className}`)
      .then(res => setSubjects(res.data))
      .catch(err => console.error('Error fetching subjects:', err));
  }, [setSelectedClass]);

  const fetchStudents = useCallback((subject) => {
    setSelectedSubject(subject.name);
    axios.get(`http://localhost:5000/students/${selectedClass}/${subject.name}`)
      .then(res => {
        setStudents(res.data);
        setMarks(res.data.map(student => ({ reg_no: student.reg_no, total: '', feedback: '' })));
      })
      .catch(err => console.error('Error fetching students:', err));
  }, [selectedClass, setSelectedSubject]);

  const handleMarkChange = useCallback((regNo, value) => {
    const numericValue = parseInt(value, 10);
    if (isNaN(numericValue) || numericValue < 0 || numericValue > parseInt(totalMarks, 10)) {
      alert(`Invalid marks: Enter a value between 0 and ${totalMarks}`);
      return;
    }
    setMarks(marks.map(mark => (mark.reg_no === regNo ? { ...mark, total: value } : mark)));
  }, [marks, totalMarks]);

  const handleFeedbackChange = useCallback((regNo, value) => {
    setFeedbacks(prev => ({ ...prev, [regNo]: value }));
  }, []);

  const clearForm = useCallback(() => {
    setTestDate('');
    setTopic('');
    setTotalMarks('');
    setFeedbacks({});
    setMarks(students.map(student => ({ reg_no: student.reg_no, total: '', feedback: '' })));
  }, [students]);

  const handleSubmit = useCallback(() => {
    if (!testDate || !topic || !totalMarks || parseInt(totalMarks, 10) <= 0) {
      alert('Please complete all fields, including total marks.');
      return;
    }

    const batchFilteredMarks = marks.filter((_, index) => {
      const studentIndex = students.findIndex(student => student.reg_no === _.reg_no);
      const studentBatch = Math.floor(studentIndex / 10) + 1;
      return batch ? studentBatch === parseInt(batch, 10) : true;
    });

    const subjectObj = subjects.find(sub => sub.name === selectedSubject);
    const subCode = subjectObj?.code || '';

    const payload = {
      className: selectedClass,
      subject: selectedSubject,
      testDate,
      topic,
      totalMarks: parseInt(totalMarks, 10),
      marks: batchFilteredMarks.map(mark => (mark.total === '' ? 0 : mark.total)),
      batch: batch ? parseInt(batch, 10) : null,
      feedbacks: Object.fromEntries(
        Object.entries(feedbacks)
          .filter(([reg_no]) => batchFilteredMarks.some(mark => mark.reg_no === reg_no))
          .map(([reg_no, feedback]) => [reg_no, feedback || ''])
      ),
      sub_code: subCode
    };

    axios.post('http://localhost:5000/marks', payload)
      .then(() => {
        alert('Marks successfully submitted');
        clearForm();
      })
      .catch(err => {
        console.error('Error submitting marks:', err);
        alert('An error occurred while submitting marks. Check the console for details.');
      });
  }, [
    testDate,
    topic,
    totalMarks,
    selectedClass,
    selectedSubject,
    marks,
    feedbacks,
    batch,
    students,
    subjects,
    clearForm
  ]);

  const filteredStudents = useMemo(() => {
    if (!batch) return students;
    const start = (batch - 1) * 10;
    const end = batch * 10;
    return students.slice(start, end);
  }, [students, batch]);

  return (
    <div className="app">
      {!showOverview && (
        <button className="back-button" onClick={handleBack}>
          Back
        </button>
      )}
      {showOverview ? (
        <div className="overview-container">
          <MarksOverview
            className={selectedClass}
            subject={selectedSubject}
            onBack={handleBack}
          />
        </div>
      ) : (
        <>
          <h1>Computer Lab Management System</h1>
          {!selectedClass ? (
            <div className="selection">
              <h2>Select a Class</h2>
              {classes.map(cls => (
                <button key={cls} onClick={() => fetchSubjects(cls)}>
                  {cls}
                </button>
              ))}
            </div>
          ) : !selectedSubject ? (
            <div className="selection">
              <h2>Select a Subject</h2>
              {subjects.map(sub => (
                <button key={sub.code} onClick={() => fetchStudents(sub)}>
                  {sub.name}
                </button>
              ))}
            </div>
          ) : (
            <div className="marks-entry">
              <h2>{selectedClass} - {selectedSubject}</h2>
              <div className="batch-selection">
                <label>
                  Select Batch:
                  <select value={batch} onChange={e => setBatch(e.target.value)}>
                    <option value="">All</option>
                    <option value="1">Batch 1</option>
                    <option value="2">Batch 2</option>
                  </select>
                </label>
              </div>
              <div className="test-info">
                <label>
                  Test Date:
                  <input
                    type="date"
                    value={testDate}
                    max={today}
                    onChange={e => handleTestDateChange(e.target.value)}
                  />
                </label>
                <label>
                  Topic:
                  <input
                    type="text"
                    value={topic}
                    onChange={e => setTopic(e.target.value)}
                    placeholder="Enter test topic"
                  />
                </label>
                <label>
                  Total Marks:
                  <input
                    type="number"
                    value={totalMarks}
                    onChange={e => setTotalMarks(e.target.value)}
                    placeholder="Enter total marks for the test"
                  />
                </label>
              </div>
              <table>
                <thead>
                  <tr>
                    <th>Reg No</th>
                    <th>Name</th>
                    <th>Marks</th>
                    <th>Feedback</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredStudents.map(student => (
                    <tr key={student.reg_no}>
                      <td>{student.reg_no}</td>
                      <td>{student.name}</td>
                      <td>
                        <input
                          type="number"
                          value={marks.find(mark => mark.reg_no === student.reg_no)?.total || ''}
                          onChange={e => handleMarkChange(student.reg_no, e.target.value)}
                        />
                      </td>
                      <td>
                        <input
                          type="text"
                          value={feedbacks[student.reg_no] || ''}
                          onChange={e => handleFeedbackChange(student.reg_no, e.target.value)}
                          placeholder="Enter feedback"
                        />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              <button onClick={handleSubmit}>Submit</button>
              <button onClick={handleOverview}>Overview</button>
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default MarksEntry;
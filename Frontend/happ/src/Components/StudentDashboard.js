import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import SubjectMarks from './SubjectMarks';
import OverallReport from './OverallReport';
import collegeLogo from '../assets/college-logo.png';
import '../Styles/StudentDashboard.css';

const StudentDashboard = () => {
  const [student, setStudent] = useState(null);
  const [subjects, setSubjects] = useState([]);
  const [selectedSubject, setSelectedSubject] = useState('');
  const [showOverall, setShowOverall] = useState(false);
  const [regNo, setRegNo] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.removeItem('token');
    navigate('/');
  };

  const fetchStudentDetails = async () => {
    try {
      const response = await axios.get(`http://localhost:5000/student-marks/student/${regNo}`);
      if (response.data) {
        setStudent(response.data);
        const subjectsRes = await axios.get(`http://localhost:5000/student-marks/subjects/${regNo}`);
        setSubjects(subjectsRes.data);
        setError('');
      } else {
        setError('Student not found!');
      }
    } catch (error) {
      console.error('Error fetching student:', error);
      setError('Error fetching student details');
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!regNo) {
      setError('Please enter registration number');
      return;
    }
    fetchStudentDetails();
  };

  return (
    <div className="student-container">
      {/* Header */}
      <header className="student-header">
        <div className="student-header-content">
          <img src={collegeLogo} alt="College Logo" className="student-logo" />
          <div className="student-header-text">
            <h1>Jyoti Nivas College Autonomous</h1>
            <p>A Premier Institute for Women | Estd. 1986 | Reaccredited by NAAC with 'A+' Grade in the 4th Cycle</p>
          </div>
        </div>
        <span className="system-title">LAB PERFORMANCE SYSTEM</span>
      </header>

      {/* Main Content */}
      <main className="student-main-content">
        <div className="student-dashboard">
          {!student ? (
            <div className="student-login-form">
              <h2>Student Profile</h2>
              <form onSubmit={handleSubmit}>
                <div className="form-group">
                  <label>Registration Number:</label>
                  <input
                    type="text"
                    value={regNo}
                    onChange={(e) => setRegNo(e.target.value)}
                    required
                  />
                </div>
                {error && <div className="error-message">{error}</div>}
                <button type="submit" className="student-submit-btn">
                  View Marks
                </button>
              </form>
            </div>
          ) : (
            <>
              <div className="student-info">
                <h2>Welcome, {student.name}</h2>
                <div className="student-details">
                  <p><strong>Registration No:</strong> {student.reg_no}</p>
                  <p><strong>Class:</strong> {student.class}</p>
                </div>
              </div>

              <div className="dashboard-options">
                <button 
                  className={`option-btn ${!showOverall ? 'active' : ''}`}
                  onClick={() => setShowOverall(false)}
                >
                  View Subject Marks
                </button>
                <button 
                  className={`option-btn ${showOverall ? 'active' : ''}`}
                  onClick={() => setShowOverall(true)}
                >
                  View Overall Report
                </button>
              </div>

              {!showOverall ? (
                <div className="subject-selection">
                  <h3>Select Subject</h3>
                  <select
                    value={selectedSubject}
                    onChange={(e) => setSelectedSubject(e.target.value)}
                  >
                    <option value="">Select a Subject</option>
                    {subjects.map((subject, index) => (
                      <option key={index} value={subject}>
                        {subject}
                      </option>
                    ))}
                  </select>
                  {selectedSubject && (
                    <SubjectMarks regNo={student.reg_no} subject={selectedSubject} />
                  )}
                </div>
              ) : (
                <OverallReport regNo={student.reg_no} />
              )}
            </>
          )}
        </div>
      </main>

      {/* Logout Button at the Bottom */}
      {student && (
        <div className="logout-wrapper">
          <button className="logout-button" onClick={handleLogout}>
            Logout
          </button>
        </div>
      )}

      {/* Footer */}
      <footer className="student-footer">
        &copy; {new Date().getFullYear()} Jyoti Nivas College Autonomous. All rights reserved.
      </footer>
    </div>
  );
};

export default StudentDashboard;

import React from 'react';
import { useNavigate } from 'react-router-dom';
import collegeLogo from '../assets/college-logo.png'; // Adjust the path as needed
import '../Styles/Facultydashboard.css';

const FacultyDashboard = () => {
  const navigate = useNavigate();

  return (
    <div className="faculty-dashboard">
      {/* Header with logo */}
      <header className="faculty-header">
        <div className="faculty-header-container">
          <div className="faculty-header-content">
            <img src={collegeLogo} alt="Jyoti Nivas College Logo" className="faculty-college-logo" />
            <div className="faculty-college-title-container">
              <h1>Jyoti Nivas College Autonomous</h1>
              <p>A Premier Institute for Women | Estd. 1986 | Reaccredited by NAAC with 'A+' Grade in the 4th Cycle</p>
            </div>
          </div>
          <div className="faculty-evaluation-text">Lab Performance System</div>
        </div>
      </header>

      {/* Main content */}
      <main className="faculty-main-content">
        <h1 className="faculty-title faculty-animate">Lab Performance System</h1>
        <div className="faculty-buttons-container">
          <button 
            className="faculty-btn faculty-btn-primary faculty-animate" 
            onClick={() => navigate('/marks-entry')}
            style={{ animationDelay: '0.2s' }}
          >
            Marks Entry
          </button>
          <button 
            className="faculty-btn faculty-btn-secondary faculty-animate"
            onClick={() => navigate('/generate-report')}
            style={{ animationDelay: '0.4s' }}
          >
            Generate Report
          </button>
        </div>
      </main>

      {/* Footer */}
      <footer className="faculty-footer">
        © 2024 Jyoti Nivas College Autonomous. All rights reserved.
      </footer>
    </div>
  );
};

export default FacultyDashboard;
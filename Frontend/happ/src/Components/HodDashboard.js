import React from 'react';
import { useNavigate } from 'react-router-dom';
import collegeLogo from '../assets/college-logo.png';
import '../Styles/hod.css';

const HodDashboard = () => {
  const navigate = useNavigate();

  const handleViewReport = () => {
    navigate('/classes');
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    navigate('/');
  };

  return (
    <div className="hod-container">
      {/* Header */}
      <header className="hod-header">
        <div className="hod-header-content">
          <img src={collegeLogo} alt="College Logo" className="hod-logo" />
          <div className="hod-header-text">
            <h1>Jyoti Nivas College Autonomous</h1>
            <p>A Premier Institute for Women | Estd. 1986 | Reaccredited by NAAC with 'A+' Grade in the 4th Cycle</p>
          </div>
        </div>
        <span className="system-title">LAB PERFORMANCE SYSTEM</span>
      </header>

      {/* Main Content */}
      <main className="hod-main-content">
        <div className="hod-dashboard">
          <h2>Welcome to HOD Dashboard</h2>
          <div className="hod-actions">
            <button 
              className="hod-button primary"
              onClick={handleViewReport}
            >
              View Class Reports
            </button>
            <button 
              className="hod-button secondary"
              onClick={handleLogout}
            >
              Log Out
            </button>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="hod-footer">
        &copy; {new Date().getFullYear()} Jyoti Nivas College Autonomous. All rights reserved.
      </footer>
    </div>
  );
};

export default HodDashboard;
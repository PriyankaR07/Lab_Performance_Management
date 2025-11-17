import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import '../Styles/GenerateReport.css';

const GenerateReport = () => {
  const navigate = useNavigate();
  const [classes, setClasses] = useState([]);
  const [subjects, setSubjects] = useState([]);
  const [selectedClass, setSelectedClass] = useState('');
  const [selectedSubject, setSelectedSubject] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [reportData, setReportData] = useState([]);
  const [isLoading, setIsLoading] = useState({
    classes: false,
    subjects: false,
    report: false,
    excel: false,
    pdf: false
  });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // Clear messages after 5 seconds
  useEffect(() => {
    const timer = setTimeout(() => {
      if (error) setError('');
      if (success) setSuccess('');
    }, 5000);
    return () => clearTimeout(timer);
  }, [error, success]);

  // Fetch classes when component mounts
  useEffect(() => {
    const fetchClasses = async () => {
      setIsLoading(prev => ({ ...prev, classes: true }));
      setError('');
      try {
        const response = await axios.get('http://localhost:5000/classes');
        setClasses(response.data);
      } catch (err) {
        setError('Failed to fetch classes. Please try again.');
        console.error('Error fetching classes:', err);
      } finally {
        setIsLoading(prev => ({ ...prev, classes: false }));
      }
    };
    fetchClasses();
  }, []);

  // Fetch subjects when class changes
  const handleClassChange = async (className) => {
    setSelectedClass(className);
    setSelectedSubject('');
    setReportData([]);
    setIsLoading(prev => ({ ...prev, subjects: true }));
    setError('');
    
    try {
      const response = await axios.get(`http://localhost:5000/subjects/${className}`);
      setSubjects(response.data);
    } catch (err) {
      setError('Failed to fetch subjects. Please try again.');
      console.error('Error fetching subjects:', err);
    } finally {
      setIsLoading(prev => ({ ...prev, subjects: false }));
    }
  };

  const handleSubjectChange = (subject) => {
    setSelectedSubject(subject);
    setReportData([]);
  };

  const handleDateFilter = (e) => {
    const { name, value } = e.target;
    if (name === 'startDate') {
      setStartDate(value);
    } else {
      setEndDate(value);
    }
  };

  const generateReport = async () => {
    if (!selectedClass || !selectedSubject) {
      setError('Please select both class and subject');
      return;
    }

    setIsLoading(prev => ({ ...prev, report: true }));
    setError('');
    setSuccess('');

    try {
      const response = await axios.get('http://localhost:5000/api/report/data', {
        params: {
          className: selectedClass,
          subject: selectedSubject,
          startDate,
          endDate
        }
      });
      setReportData(response.data.data);
      setSuccess('Report generated successfully');
    } catch (err) {
      const errorMsg = err.response?.data?.message || 'Failed to generate report';
      setError(errorMsg);
      console.error('Error generating report:', err);
    } finally {
      setIsLoading(prev => ({ ...prev, report: false }));
    }
  };

  const exportToExcel = async () => {
    if (!selectedClass || !selectedSubject) return;

    setIsLoading(prev => ({ ...prev, excel: true }));
    setError('');
    setSuccess('');

    try {
      const response = await axios.get('http://localhost:5000/api/report/excel', {
        params: {
          className: selectedClass,
          subject: selectedSubject,
          startDate,
          endDate
        },
        responseType: 'blob',
        timeout: 30000 // 30 second timeout
      });

      // Create download link
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `${selectedSubject.replace(/\s+/g, '_')}_Report.xlsx`);
      document.body.appendChild(link);
      link.click();
      link.parentNode.removeChild(link);
      
      setSuccess('Excel report downloaded successfully');
    } catch (err) {
      const errorMsg = err.response?.data?.message || 'Failed to export to Excel';
      setError(errorMsg);
      console.error('Error exporting to Excel:', {
        error: err.message,
        response: err.response,
        config: err.config
      });
    } finally {
      setIsLoading(prev => ({ ...prev, excel: false }));
    }
  };

  const exportToPDF = async () => {
    if (!selectedClass || !selectedSubject) return;

    setIsLoading(prev => ({ ...prev, pdf: true }));
    setError('');
    setSuccess('');

    try {
      const response = await axios.get('http://localhost:5000/api/report/pdf', {
        params: {
          className: selectedClass,
          subject: selectedSubject,
          startDate,
          endDate
        },
        responseType: 'blob',
        timeout: 30000 // 30 second timeout
      });

      // Create download link
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `${selectedSubject.replace(/\s+/g, '_')}_Report.pdf`);
      document.body.appendChild(link);
      link.click();
      link.parentNode.removeChild(link);
      
      setSuccess('PDF report downloaded successfully');
    } catch (err) {
      const errorMsg = err.response?.data?.message || 'Failed to export to PDF';
      setError(errorMsg);
      console.error('Error exporting to PDF:', {
        error: err.message,
        response: err.response,
        config: err.config
      });
    } finally {
      setIsLoading(prev => ({ ...prev, pdf: false }));
    }
  };

  const resetFilters = () => {
    setStartDate('');
    setEndDate('');
    if (selectedClass && selectedSubject) {
      generateReport();
    }
  };

  return (
    <div className="generate-report-container">
      <div className="header">
        <button 
          className="back-button" 
          onClick={() => navigate('/')}
          disabled={isLoading.report || isLoading.excel || isLoading.pdf}
        >
          Log Out
        </button>
        <h1>Generate Report</h1>
      </div>

      <div className="report-controls">
        <div className="selection-group">
          <div className="select-container">
            <label>Select Class:</label>
            <select
              value={selectedClass}
              onChange={(e) => handleClassChange(e.target.value)}
              disabled={isLoading.classes}
            >
              <option value="">Select Class</option>
              {classes.map((cls, idx) => (
                <option key={`class-${idx}`} value={cls}>
                  {cls}
                </option>
              ))}
            </select>
            {isLoading.classes && <span className="loading-indicator">Loading...</span>}
          </div>

          <div className="select-container">
            <label>Select Subject:</label>
            <select
              value={selectedSubject}
              onChange={(e) => handleSubjectChange(e.target.value)}
              disabled={!selectedClass || isLoading.subjects}
            >
              <option value="">Select Subject</option>
              {subjects.map((sub, idx) => (
                <option key={`sub-${idx}`} value={sub.name}>
                  {sub.name}
                </option>
              ))}
            </select>
            {isLoading.subjects && <span className="loading-indicator">Loading...</span>}
          </div>
        </div>

        <div className="date-filters">
          <div className="date-input">
            <label>From Date:</label>
            <input
              type="date"
              name="startDate"
              value={startDate}
              onChange={handleDateFilter}
              disabled={isLoading.report}
            />
          </div>
          <div className="date-input">
            <label>To Date:</label>
            <input
              type="date"
              name="endDate"
              value={endDate}
              onChange={handleDateFilter}
              disabled={isLoading.report}
            />
          </div>
          <button 
            className="reset-btn"
            onClick={resetFilters}
            disabled={(!startDate && !endDate) || isLoading.report}
          >
            Reset Dates
          </button>
        </div>

        <div className="action-buttons">
          <button
            className="generate-btn"
            onClick={generateReport}
            disabled={!selectedClass || !selectedSubject || isLoading.report}
          >
            {isLoading.report ? (
              <>
                <span className="spinner"></span>
                Generating...
              </>
            ) : (
              'Generate Report'
            )}
          </button>
        </div>
      </div>

      {error && (
        <div className="message error">
          <span className="icon">❌</span>
          {error}
        </div>
      )}

      {success && (
        <div className="message success">
          <span className="icon">✓</span>
          {success}
        </div>
      )}

      {reportData.length > 0 && (
        <div className="report-results">
          <div className="report-header">
            <h2>
              {selectedSubject} Report for {selectedClass}
            </h2>
            {(startDate || endDate) && (
              <p className="date-range">
                Date Range: {startDate || 'Start'} to {endDate || 'End'}
              </p>
            )}
            <div className="export-buttons">
              <button 
                onClick={exportToExcel}
                disabled={isLoading.excel}
              >
                {isLoading.excel ? (
                  <>
                    <span className="spinner"></span>
                    Exporting...
                  </>
                ) : (
                  'Export to Excel'
                )}
              </button>
              <button 
                onClick={exportToPDF}
                disabled={isLoading.pdf}
              >
                {isLoading.pdf ? (
                  <>
                    <span className="spinner"></span>
                    Exporting...
                  </>
                ) : (
                  'Export to PDF'
                )}
              </button>
            </div>
          </div>

          <div className="table-wrapper">
            <table className="report-table">
              <thead>
                <tr>
                  <th>Reg No</th>
                  <th>Student Name</th>
                  <th>Total Marks</th>
                  <th>Tests Count</th>
                </tr>
              </thead>
              <tbody>
                {reportData.map((student) => (
                  <tr key={`student-${student.reg_no}`}>
                    <td>{student.reg_no}</td>
                    <td>{student.student_name}</td>
                    <td>{student.total_marks}</td>
                    <td>{student.tests_count}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};

export default GenerateReport;
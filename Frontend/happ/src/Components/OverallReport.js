import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import '../Styles/OverallReport.css';

const OverallReport = ({ regNo }) => {
  const [reportData, setReportData] = useState({ subjects: [], overallAverage: '0.00' });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  const handleBack = () => {
    navigate(-1); // Go back to previous page
  };

  useEffect(() => {
    const fetchReportData = async () => {
      try {
        setLoading(true);
        const response = await axios.get(
          `http://localhost:5000/student-marks/report/${regNo}`
        );
        setReportData(response.data);
        setError(null);
      } catch (err) {
        console.error('Error fetching report data:', err);
        setError('Failed to fetch report data');
        setReportData({ subjects: [], overallAverage: '0.00' });
      } finally {
        setLoading(false);
      }
    };

    if (regNo) {
      fetchReportData();
    }
  }, [regNo]);

  if (loading) {
    return <div className="loading">Loading report data...</div>;
  }

  if (error) {
    return <div className="error">{error}</div>;
  }

  return (
    <div className="overall-report">
      <h3>Overall Performance Report</h3>
      {reportData.subjects.length === 0 ? (
        <p>No marks recorded for any subject</p>
      ) : (
        <>
          <table>
            <thead>
              <tr>
                <th>Subject</th>
                <th>Total Marks</th>
                <th>Max Possible</th>
                <th>Percentage</th>
              </tr>
            </thead>
            <tbody>
              {reportData.subjects.map((item, index) => (
                <tr key={index}>
                  <td>{item.subject}</td>
                  <td>{item.totalMarks}</td>
                  <td>{item.totalPossible}</td>
                  <td>{item.average}%</td>
                </tr>
              ))}
            </tbody>
          </table>
          <div className="summary">
            <h4>Overall Average: {reportData.overallAverage}%</h4>
          </div>
        </>
      )}
      
      {/* Added Back Button at the end */}
      <div className="student-report-buttons">
        
      </div>
    </div>
  );
};

export default OverallReport;
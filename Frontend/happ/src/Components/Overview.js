import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate, useLocation } from 'react-router-dom';
import '../Styles/Overview.css'

const Overview = () => {
  const [overviewData, setOverviewData] = useState([]);
  const [error, setError] = useState(null);
  const navigate = useNavigate();
  const location = useLocation();
  const searchParams = new URLSearchParams(location.search);
  const className = searchParams.get('class');
  const subject = searchParams.get('subject');

  // Utility function to format date as yyyy-mm-dd
  const formatDate = (dateString) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };

  // Fetch overview data
  useEffect(() => {
    const fetchOverviewData = async () => {
      try {
        const res = await axios.get('http://localhost:5000/api/marks-overview', {
          params: { 
            class: className, 
            subject: subject 
          },
        });
        setOverviewData(res.data);
        setError(null);
      } catch (err) {
        setError('Error fetching overview data');
        console.error(err);
      }
    };

    if (className && subject) {
      fetchOverviewData();
    }
  }, [className, subject]);

  const handleBack = () => {
    navigate('/classes');
  };

  return (
    <div className="hod-overview">
      <h2>Overview of Marks for {subject}</h2>
      {error && <p className="error">{error}</p>}
      <table className="hod-table">
        <thead>
          <tr>
            <th>ID</th>
            <th>Reg No</th>
            <th>Subject</th>
            <th>Marks</th>
            <th>Test Date</th>
            <th>Topic</th>
            <th>Total Marks</th>
            <th>Feedback</th>
          </tr>
        </thead>
        <tbody>
          {overviewData.map((data, index) => (
            <tr key={index}>
              <td>{data.id}</td>
              <td>{data.reg_no}</td>
              <td>{data.subject}</td>
              <td>{data.marks}</td>
              <td>{formatDate(data.testDate)}</td>
              <td>{data.topic}</td>
              <td>{data.totalMarks}</td>
              <td>{data.feedback}</td>
            </tr>
          ))}
        </tbody>
      </table>
      <button className="hod-button hod-back-button" onClick={handleBack}>
        Back
      </button>
    </div>
  );
};

export default Overview;
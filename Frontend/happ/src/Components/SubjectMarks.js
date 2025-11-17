import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import '../Styles/SubjectMarks.css';

const SubjectMarks = ({ regNo, subject }) => {
  const [marks, setMarks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  const handleBack = () => {
    navigate(-1); // Go back to previous page
  };

  useEffect(() => {
    const fetchMarks = async () => {
      try {
        setLoading(true);
        const response = await axios.get(
          `http://localhost:5000/student-marks/subject/${regNo}/${subject}`
        );
        setMarks(response.data);
        setError(null);
      } catch (err) {
        console.error('Error fetching marks:', err);
        setError('Failed to fetch marks data');
        setMarks([]);
      } finally {
        setLoading(false);
      }
    };

    if (regNo && subject) {
      fetchMarks();
    }
  }, [regNo, subject]);

  if (loading) {
    return <div className="loading">Loading marks data...</div>;
  }

  if (error) {
    return <div className="error">{error}</div>;
  }

  return (
    <div className="subject-marks">
      <h3>Marks for {subject}</h3>
      {marks.length === 0 ? (
        <p>No marks recorded for this subject</p>
      ) : (
        <>
          <table>
            <thead>
              <tr>
                <th>Date</th>
                <th>Topic</th>
                <th>Marks</th>
                <th>Total</th>
                <th>Feedback</th>
              </tr>
            </thead>
            <tbody>
              {marks.map((mark, index) => (
                <tr key={index}>
                  <td>{new Date(mark.testDate).toLocaleDateString()}</td>
                  <td>{mark.topic}</td>
                  <td>{mark.marks}</td>
                  <td>{mark.totalMarks}</td>
                  <td>{mark.feedback || '-'}</td>
                </tr>
              ))}
            </tbody>
          </table>
          <div className="subject-summary">
            <p>
              <strong>Total Marks:</strong> {marks.reduce((sum, m) => sum + m.marks, 0)} /{' '}
              {marks.reduce((sum, m) => sum + m.totalMarks, 0)}
            </p>
            <p>
              <strong>Percentage:</strong>{' '}
              {marks.reduce((sum, m) => sum + m.marks, 0) > 0
                ? (
                    (marks.reduce((sum, m) => sum + m.marks, 0) /
                      marks.reduce((sum, m) => sum + m.totalMarks, 0)) *
                    100
                  ).toFixed(2)
                : 0}
              %
            </p>
          </div>
        </>
      )}
      
      {/* Added Back Button at the end */}
      <div className="student-report-buttons">
  
      </div>
    </div>
  );
};

export default SubjectMarks;
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import '../Styles/Classes.css'

const Classes = () => {
  const [classes, setClasses] = useState([]);
  const [subjects, setSubjects] = useState([]);
  const [selectedClass, setSelectedClass] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    const fetchClasses = async () => {
      const res = await axios.get('http://localhost:5000/api/classes');
      setClasses(res.data);
    };
    fetchClasses();
  }, []);

  const handleClassChange = async (e) => {
    const className = e.target.value;
    setSelectedClass(className);
    const res = await axios.get(`http://localhost:5000/api/subjects/${className}`);
    setSubjects(res.data);
  };

  const handleSubjectSelect = (subject) => {
    if (subject) {
      navigate(`/overview?class=${selectedClass}&subject=${subject}`);
    }
  };

  return (
    <div className="classes">
      <h2>Select Class and Subject</h2>
      <select onChange={handleClassChange} value={selectedClass}>
        <option value="">Select Class</option>
        {classes.map((cls, idx) => (
          <option key={idx} value={cls}>{cls}</option>
        ))}
      </select>
      {selectedClass && (
        <select onChange={(e) => handleSubjectSelect(e.target.value)}>
          <option value="">Select Subject</option>
          {subjects.map((sub, idx) => (
            <option key={idx} value={sub}>{sub}</option>
          ))}
        </select>
      )}
    </div>
  );
};

export default Classes;
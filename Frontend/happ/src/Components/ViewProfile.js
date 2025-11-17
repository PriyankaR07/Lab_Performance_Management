import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import "../Styles/studentManagement.css";

export default function ViewProfile() {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState("");
  const [student, setStudent] = useState(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSearch = async () => {
    if (!searchTerm.trim()) {
      setError("Please enter a Register Number.");
      return;
    }

    setLoading(true);
    try {
      const response = await axios.get(
        `http://localhost:5000/students/${searchTerm.trim().toLowerCase()}`,
        {
          headers: {
            'Content-Type': 'application/json'
          }
        }
      );
      
      if (!response.data) {
        throw new Error("No student data received");
      }
      
      setStudent(response.data);
      setError("");
    } catch (err) {
      console.error("Full error details:", {
        message: err.message,
        response: err.response,
        stack: err.stack
      });
      
      setStudent(null);
      setError(err.response?.data?.message || "Student not found. Please check the register number.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="student-dashboard">
      <h1>View Profile</h1>
      <div className="form-group">
        <input
          type="text"
          placeholder="Enter Register Number (e.g. 23mca13)"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
        />
      </div>
      <div className="form-actions">
        <button 
          className="btn-primary" 
          onClick={handleSearch}
          disabled={loading}
        >
          {loading ? "Searching..." : "Search"}
        </button>
        <button className="btn-secondary" onClick={() => navigate(-1)}>
          Back
        </button>
      </div>

      {error && (
        <div className="error-message">
          {error}
          <div style={{ fontSize: '0.8rem', marginTop: '5px' }}>
            Debug: Searching for '{searchTerm.trim().toLowerCase()}'
          </div>
        </div>
      )}

      {student && (
        <div className="student-details">
          <h3>Student Details:</h3>
          <p><strong>Registration No:</strong> {student.reg_no}</p>
          <p><strong>Name:</strong> {student.name}</p>
          <p><strong>Class:</strong> {student.class}</p>
          <p><strong>Email:</strong> {student.email}</p>
          <p><strong>Joining Year:</strong> {student.Joining_Year}</p>
          <p><strong>Contact No:</strong> {student.Contact_No}</p>
          <p><strong>DOB:</strong> {student.DOB ? new Date(student.DOB).toLocaleDateString() : 'N/A'}</p>
        </div>
      )}
    </div>
  );
}
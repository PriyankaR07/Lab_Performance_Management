import React, { useState } from "react";
import StudentDetails from "./StudentDetails";
import axios from "axios";
import '../Styles/studentManagement.css';

const ManageStudents = ({ setView }) => {
  const [view, setLocalView] = useState("menu"); // "menu", "add", or "view"
  const [regNo, setRegNo] = useState("");
  const [student, setStudent] = useState(null);
  const [error, setError] = useState("");

  const handleFetchStudent = async () => {
    if (!regNo.trim()) {
      setError("Please enter a Register Number.");
      return;
    }

    try {
      const response = await axios.get(`http://localhost:5000/students/${regNo}`);
      setStudent(response.data);
      setError("");
    } catch (err) {
      setError("Student not found or an error occurred.");
      setStudent(null);
    }
  };

  // Handle back navigation based on current view
  const handleBack = () => {
    if (view === "menu") {
      // If in main menu, go back to admin dashboard
      setView("adminDashboard");
    } else {
      // If in add/view submenu, go back to main menu
      setLocalView("menu");
    }
  };

  return (
    <div className="manage-students">
      {/* Main Menu */}
      {view === "menu" && (
        <div className="menu">
          <h2>Manage Students</h2>
          <button 
            onClick={() => setLocalView("add")} 
            className="btn-primary"
          >
            Add Student
          </button>
          <button 
            onClick={() => setLocalView("view")} 
            className="btn-primary"
          >
            View Student
          </button>
          <button 
            onClick={handleBack} 
            className="btn-secondary"
          >
            Back
          </button>
        </div>
      )}

      {/* Add Student Section */}
      {view === "add" && (
        <div className="add-student">
          <h2>Add New Student</h2>
          <StudentDetails 
            setView={setLocalView} 
            mode="add" 
          />
          <button 
            onClick={handleBack} 
            className="btn-secondary"
          >
             ←
          </button>
        </div>
      )}

      {/* View Student Section */}
      {view === "view" && (
        <div className="view-student">
          <h2>View Student</h2>
          <div className="search-container">
            <input
              type="text"
              placeholder="Enter Register Number"
              value={regNo}
              onChange={(e) => setRegNo(e.target.value)}
            />
            <button 
              onClick={handleFetchStudent} 
              className="btn-primary"
            >
              Search
            </button>
          </div>
          
          <button 
            onClick={handleBack} 
            className="btn-secondary"
          >
            Back
          </button>

          {error && <p className="error">{error}</p>}

          {student && (
            <div className="student-details">
              <h3>Student Details</h3>
              <p><strong>Register Number:</strong> {student.reg_no}</p>
              <p><strong>Name:</strong> {student.name}</p>
              <p><strong>Class:</strong> {student.class}</p>
              <p><strong>Email:</strong> {student.email}</p>
              <p><strong>Joining Year:</strong> {student.Joining_Year}</p>
              <p><strong>Contact Number:</strong> {student.Contact_No}</p>
              <p><strong>Date of Birth:</strong> {student.DOB}</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default ManageStudents;
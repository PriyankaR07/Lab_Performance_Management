import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import "../Styles/studentManagement.css";

const StudentDetails = () => {
  const navigate = useNavigate();
  const [details, setDetails] = useState({
    reg_no: "",
    name: "",
    class: "",
    email: "",
    Joining_Year: "",
    Contact_No: "",
    DOB: "",
  });
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setDetails((prev) => ({ ...prev, [name]: value }));
    setError("");
  };

  const validateForm = () => {
    if (!details.reg_no || !details.name || !details.email) {
      setError("Register Number, Name, and Email are required fields.");
      return false;
    }
    if (!/^\S+@\S+\.\S+$/.test(details.email)) {
      setError("Please enter a valid email address.");
      return false;
    }
    return true;
  };

  const handleSave = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    setIsSubmitting(true);
    try {
      const response = await axios.post("http://localhost:5000/students", details);
      if (response.status === 201) {
        alert("Student saved successfully!");
        resetForm();
      }
    } catch (error) {
      console.error("Save error:", error.response?.data || error.message);
      alert(`Failed to save: ${error.response?.data?.message || error.message}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleUpdate = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    setIsSubmitting(true);
    try {
      const response = await axios.put(`http://localhost:5000/students/${details.reg_no}`, details);
      if (response.status === 200) {
        alert("Student updated successfully!");
        resetForm();
      }
    } catch (error) {
      console.error("Update error:", error.response?.data || error.message);
      alert(`Failed to update: ${error.response?.data?.message || error.message}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async () => {
    if (!details.reg_no) {
      setError("Register Number is required to delete a student.");
      return;
    }
    if (!window.confirm("Are you sure you want to delete this student?")) return;

    setIsSubmitting(true);
    try {
      const response = await axios.delete(`http://localhost:5000/students/${details.reg_no}`);
      if (response.status === 200) {
        alert("Student deleted successfully!");
        resetForm();
      }
    } catch (error) {
      console.error("Delete error:", error.response?.data || error.message);
      alert(`Failed to delete: ${error.response?.data?.message || error.message}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  const resetForm = () => {
    setDetails({
      reg_no: "",
      name: "",
      class: "",
      email: "",
      Joining_Year: "",
      Contact_No: "",
      DOB: "",
    });
    setError("");
  };

  return (
    <div className="student-dashboard">
      <h2>Student Management</h2>
      {error && <div className="error-message">{error}</div>}

      <form onSubmit={handleSave}>
        <div className="form-grid">
          <div className="form-group required">
            <label>Register Number *</label>
            <input type="text" name="reg_no" value={details.reg_no} onChange={handleChange} required />
          </div>

          <div className="form-group required">
            <label>Name *</label>
            <input type="text" name="name" value={details.name} onChange={handleChange} required />
          </div>

          <div className="form-group">
            <label>Class</label>
            <input type="text" name="class" value={details.class} onChange={handleChange} />
          </div>

          <div className="form-group required">
            <label>Email *</label>
            <input type="email" name="email" value={details.email} onChange={handleChange} required />
          </div>

          <div className="form-group">
            <label>Joining Year</label>
            <input type="number" name="Joining_Year" value={details.Joining_Year} onChange={handleChange} min="2000" max={new Date().getFullYear()} />
          </div>

          <div className="form-group">
            <label>Contact Number</label>
            <input type="tel" name="Contact_No" value={details.Contact_No} onChange={handleChange} pattern="[0-9]{10}" title="10-digit phone number" />
          </div>

          <div className="form-group">
            <label>Date of Birth</label>
            <input type="date" name="DOB" value={details.DOB} onChange={handleChange} max={new Date().toISOString().split('T')[0]} />
          </div>
        </div>

        <div className="form-actions">
          <button type="submit" className="btn-primary" disabled={isSubmitting}>
            {isSubmitting ? "Saving..." : "Save"}
          </button>

          <button type="button" className="btn-primary" onClick={handleUpdate} disabled={isSubmitting}>
            {isSubmitting ? "Updating..." : "Update"}
          </button>

          <button type="button" className="btn-secondary" onClick={handleDelete} disabled={isSubmitting}>
            {isSubmitting ? "Deleting..." : "Delete"}
          </button>

          <button type="button" className="btn-secondary" onClick={resetForm} disabled={isSubmitting}>
            Clear
          </button>

          <button type="button" className="btn-secondary" onClick={() => navigate(-1)} disabled={isSubmitting}>
            Back
          </button>
        </div>
      </form>
    </div>
  );
};

export default StudentDetails;

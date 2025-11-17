import React, { useState, useEffect } from "react";
import "../Styles/studentManagement.css";

const StudentForm = ({ mode = "add", initialData = {}, onSave, onUpdate, onDelete, onBack }) => {
  const [formData, setFormData] = useState({
    reg_no: "",
    name: "",
    class: "",
    email: "",
    Joining_Year: "",
    Contact_No: "",
    DOB: ""
  });

  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (mode === "edit" && initialData) {
      setFormData(initialData);
    }
  }, [mode, initialData]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    setError("");
  };

  const validateForm = () => {
    if (!formData.reg_no || !formData.name || !formData.email) {
      setError("Register Number, Name, and Email are required fields.");
      return false;
    }
    
    if (!/^\S+@\S+\.\S+$/.test(formData.email)) {
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
      await onSave(formData);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleUpdate = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;
    
    setIsSubmitting(true);
    try {
      await onUpdate(formData);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async () => {
    if (!window.confirm("Are you sure you want to delete this student?")) return;
    setIsSubmitting(true);
    try {
      await onDelete(formData.reg_no);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleReset = () => {
    if (mode === "edit") {
      setFormData(initialData);
    } else {
      setFormData({
        reg_no: "",
        name: "",
        class: "",
        email: "",
        Joining_Year: "",
        Contact_No: "",
        DOB: ""
      });
    }
    setError("");
  };

  return (
    <div className="student-form-container">
      <h2>{mode === "add" ? "Add Student" : "Edit Student"}</h2>
      {error && <div className="error-message">{error}</div>}
      
      <form onSubmit={mode === "add" ? handleSave : handleUpdate}>
        <div className="form-grid">
          <div className="form-group required">
            <label>Register Number</label>
            <input
              type="text"
              name="reg_no"
              value={formData.reg_no}
              onChange={handleChange}
              required
              disabled={mode === "edit"}
            />
          </div>
          
          <div className="form-group required">
            <label>Name</label>
            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleChange}
              required
            />
          </div>
          
          <div className="form-group required">
            <label>Email</label>
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              required
            />
          </div>
          
          <div className="form-group">
            <label>Class</label>
            <input
              type="text"
              name="class"
              value={formData.class}
              onChange={handleChange}
            />
          </div>
          
          <div className="form-group">
            <label>Joining Year</label>
            <input
              type="number"
              name="Joining_Year"
              value={formData.Joining_Year}
              onChange={handleChange}
              min="2000"
              max={new Date().getFullYear()}
            />
          </div>
          
          <div className="form-group">
            <label>Contact Number</label>
            <input
              type="tel"
              name="Contact_No"
              value={formData.Contact_No}
              onChange={handleChange}
              pattern="[0-9]{10}"
              title="10 digit phone number"
            />
          </div>
          
          <div className="form-group">
            <label>Date of Birth</label>
            <input
              type="date"
              name="DOB"
              value={formData.DOB}
              onChange={handleChange}
              max={new Date().toISOString().split('T')[0]}
            />
          </div>
        </div>
        
        <div className="form-actions">
          <div className="action-group primary-actions">
            {mode === "add" ? (
              <button 
                type="submit" 
                className="student-btn save"
                disabled={isSubmitting}
              >
                {isSubmitting ? (
                  <>
                    <span className="loading-spinner"></span>
                    Saving...
                  </>
                ) : 'Save'}
              </button>
            ) : (
              <>
                <button 
                  type="submit" 
                  className="student-btn update"
                  disabled={isSubmitting}
                >
                  {isSubmitting ? (
                    <>
                      <span className="loading-spinner"></span>
                      Updating...
                    </>
                  ) : 'Update'}
                </button>
                <button 
                  type="button" 
                  className="student-btn delete"
                  onClick={handleDelete}
                  disabled={isSubmitting}
                >
                  Delete
                </button>
              </>
            )}
          </div>
          
          <div className="action-group secondary-actions">
            <button 
              type="button" 
              className="student-btn reset"
              onClick={handleReset}
              disabled={isSubmitting}
            >
              Reset
            </button>
            <button 
              type="button" 
              className="student-btn back"
              onClick={onBack}
              disabled={isSubmitting}
            >
              Back
            </button>
          </div>
        </div>
      </form>
    </div>
  );
};

export default StudentForm;
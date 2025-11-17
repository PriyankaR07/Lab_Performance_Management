import React, { useState, useEffect } from "react";
import axios from "axios";
import '../Styles/admin.css';


const FacultyDetailsForm = ({ onBack, editData }) => {
    const [details, setDetails] = useState({
        name: "",
        program: "",
        subjects: [],
        email: "",
        contact: "",
    });

    const [error, setError] = useState("");

    useEffect(() => {
        if (editData) {
            setDetails(editData);
        }
    }, [editData]);

    const handleChange = (e) => {
        const { name, value, type, checked } = e.target;
        if (type === "checkbox") {
            setDetails((prevDetails) => {
                const newSubjects = checked
                    ? [...prevDetails.subjects, value]
                    : prevDetails.subjects.filter((subject) => subject !== value);
                return { ...prevDetails, subjects: newSubjects };
            });
        } else {
            setDetails({ ...details, [name]: value });
        }
        setError("");
    };

    const validateForm = () => {
        if (!details.name || !details.email) {
            setError("Name and Email are required fields.");
            return false;
        }
        return true;
    };

    const handleSave = async () => {
        if (!validateForm()) return;
        try {
            await axios.post("http://localhost:5000/addFaculty", details);
            alert("Faculty details saved successfully!");
            resetForm();
        } catch (error) {
            console.error("Error saving faculty details:", error);
            alert("Failed to save faculty details. Please try again.");
        }
    };

    const handleUpdate = async () => {
        if (!validateForm()) return;
        try {
            await axios.put(`http://localhost:5000/updateFaculty/${details.id}`, details);
            alert("Faculty details updated successfully!");
            resetForm();
        } catch (error) {
            console.error("Error updating faculty details:", error);
            alert("Failed to update faculty details. Please try again.");
        }
    };

    const handleDelete = async () => {
        if (!details.id) {
            setError("ID is required to delete a faculty.");
            return;
        }
        try {
            await axios.delete(`http://localhost:5000/deleteFaculty/${details.id}`);
            alert("Faculty details deleted successfully!");
            resetForm();
        } catch (error) {
            console.error("Error deleting faculty details:", error);
            alert("Failed to delete faculty details. Please try again.");
        }
    };

    const resetForm = () => {
        setDetails({
            name: "",
            program: "",
            subjects: [],
            email: "",
            contact: "",
        });
        setError("");
    };

    return (
        <div className="admin-full-screen-form1">
            <div className="admin-form-content1">
                <h2>Faculty Details</h2>
                {error && <p style={{ color: "red" }}>{error}</p>}
                <form>
                    <div>
                        <label>Name:</label>
                        <input
                            type="text"
                            name="name"
                            value={details.name}
                            onChange={handleChange}
                            required
                            readOnly={!!editData}
                        />
                    </div>
                    <div>
                        <label>Program:</label>
                        <select
                            name="program"
                            value={details.program}
                            onChange={handleChange}
                            required
                        >
                            <option value="">Select Program</option>
                            <option value="MCA">MCA</option>
                            <option value="MSc">MSc</option>
                            <option value="MCA & MSc">MCA & MSc</option>
                        </select>
                    </div>
                    <div>
                        <label>Subjects:</label>
                        {["Machine Learning", "Mini Project", "Research Methodology", "NLP", "ADBMS", ].map((subject) => (
                            <div key={subject}>
                                <input
                                    type="checkbox"
                                    name="subjects"
                                    value={subject}
                                    checked={details.subjects.includes(subject)}
                                    onChange={handleChange}
                                />
                                <label>{subject}</label>
                            </div>
                        ))}
                    </div>
                    <div>
                        <label>Email:</label>
                        <input
                            type="email"
                            name="email"
                            value={details.email}
                            onChange={handleChange}
                            required
                        />
                    </div>
                    <div>
                        <label>Contact:</label>
                        <input
                            type="text"
                            name="contact"
                            value={details.contact}
                            onChange={handleChange}
                        />
                    </div>
                    <div style={{ marginTop: "20px" }}>
                        {!editData && <button className="admin-button1" type="button" onClick={handleSave}>Save</button>}
                        {editData && <button className="admin-button1" type="button" onClick={handleUpdate}>Update</button>}
                        {editData && <button className="admin-button1" type="button" onClick={handleDelete}>Delete</button>}
                        <button className="admin-button1" type="button" onClick={resetForm}>Clear</button>
                        <button className="admin-button1" type="button" onClick={onBack}>Back</button>
                    </div>
                </form>
            </div>
        </div>
    );
};


export default FacultyDetailsForm;
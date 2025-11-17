import React, { useState, useEffect } from "react";
import axios from "axios";
import "../Styles/admin.css";


const ViewFacultyProfile = ({ onBack, onEdit }) => {
    const [facultyList, setFacultyList] = useState([]);
    const [searchQuery, setSearchQuery] = useState("");

    useEffect(() => {
        fetchFaculty();
    }, []);

    const fetchFaculty = async () => {
        try {
            const response = await axios.get("http://localhost:5000/getAllFaculty");
            setFacultyList(response.data);
        } catch (err) {
            console.error("Error fetching faculty:", err);
        }
    };

    const handleDelete = async (id) => {
        try {
            await axios.delete(`http://localhost:5000/deleteFaculty/${id}`);
            alert("Faculty details deleted successfully!");
            fetchFaculty();
        } catch (error) {
            console.error("Error deleting faculty details:", error);
            alert("Failed to delete faculty details. Please try again.");
        }
    };

    const filteredFaculty = facultyList.filter(faculty =>
        faculty.name.toLowerCase().includes(searchQuery.toLowerCase())
    );

    return (
        <div className="admin-profile-container1">
            <h1>View Faculty</h1>
            <input
                type="text"
                placeholder="Search by Faculty Name..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
            />
            <table className="admin-faculty-table1">
                <thead>
                    <tr>
                        <th>Name</th>
                        <th>Program</th>
                        <th>Subjects</th>
                        <th>Email</th>
                        <th>Contact</th>
                        <th>Actions</th>
                    </tr>
                </thead>
                <tbody>
                    {filteredFaculty.map((faculty) => (
                        <tr key={faculty.id}>
                            <td>{faculty.name}</td>
                            <td>{faculty.program}</td>
                            <td>
                                {Array.isArray(faculty.subjects) ? faculty.subjects.join(', ') : faculty.subjects}
                            </td>
                            <td>{faculty.email}</td>
                            <td>{faculty.contact}</td>
                            <td>
                                <button className="admin-button2" onClick={() => onEdit(faculty)}>Edit</button>
                                <button className="admin-button2" onClick={() => handleDelete(faculty.id)}>Delete</button>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
            <button className="admin-button1" onClick={onBack}>Back</button>
        </div>
    );
};

export default ViewFacultyProfile;
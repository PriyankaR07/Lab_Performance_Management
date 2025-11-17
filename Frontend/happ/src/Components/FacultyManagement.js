import React, { useState } from "react";
import FacultyDetailsForm from './FacultyDetailsForm';
import ViewFacultyProfile from './ViewFacultyProfile';

import '../Styles/admin.css';

const FacultyManagement = ({ setView }) => {
    const [currentView, setCurrentView] = useState("facultyDashboard");
    const [editData, setEditData] = useState(null);

    const handleBack = () => setCurrentView("facultyDashboard");

    return (
        <div className="admin-container2">
            {currentView === "facultyDashboard" && (
                <div>
                    <h2>Manage Faculty</h2>
                    <button className="admin-button1" onClick={() => setCurrentView("addFaculty")}>Add Faculty</button>
                    <button className="admin-button1" onClick={() => setCurrentView("viewFaculty")}>View Faculty</button>
                    <button className="admin-button1" onClick={() => setView("adminDashboard")}>Back to Dashboard</button>
                </div>
            )}
            {currentView === "addFaculty" && <FacultyDetailsForm onBack={handleBack} />}
            {currentView === "viewFaculty" && (
                <ViewFacultyProfile
                    onBack={handleBack}
                    onEdit={(data) => {
                        setEditData(data);
                        setCurrentView("editFaculty");
                    }}
                />
            )}
            {currentView === "editFaculty" && (
                <FacultyDetailsForm onBack={handleBack} editData={editData} />
            )}
        </div>
    );
};

export default FacultyManagement;
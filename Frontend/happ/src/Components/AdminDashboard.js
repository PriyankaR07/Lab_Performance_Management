import React, { useState } from "react";
import FacultyManagement from "./FacultyManagement";
import ManageStudents from "./ManageStudents";  // Use ManageStudents instead of StudentDashboard
import Sidebar from "./Sidebar";
import '../Styles/studentManagement.css';

const AdminDashboard = () => {
    const [view, setView] = useState("adminDashboard");

    return (
        <div className="admin-app">
            <Sidebar setView={setView} />
            <div className="admin-main-content">
                {view === "adminDashboard" && (
                    <div>
                        <h1>Admin Dashboard</h1>
                        <p>Welcome to the Admin Dashboard!</p>
                    </div>
                )}
                {view === "facultyManagement" && <FacultyManagement setView={setView} />}
                {view === "studentManagement" && <ManageStudents setView={setView} />}  {/* Updated */}
            </div>
        </div>
    );
};

export default AdminDashboard;

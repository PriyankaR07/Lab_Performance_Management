import React from "react";
import { useNavigate } from "react-router-dom";

const Sidebar = ({ setView }) => {
    const navigate = useNavigate();

    const handleLogout = () => {
        localStorage.removeItem("token"); // Clear token
        navigate("/"); // Redirect to login page

        // Alternative: Use window.location.href if navigate isn't working
        // window.location.href = "/login";
    };

    return (
        <div className="admin-sidebar">
            <h2>Admin Panel</h2>
            <ul>
                <li onClick={() => setView("adminDashboard")}>Dashboard</li>
                <li onClick={() => setView("facultyManagement")}>Manage Faculty</li>
                <li onClick={() => setView("studentManagement")}>Manage Students</li>
            </ul>
            <button 
              type="button" 
              className="logout-button"
              onClick={handleLogout}
            >
              Logout
            </button>
        </div>
    );
};

export default Sidebar;

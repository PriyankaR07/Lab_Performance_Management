const express = require("express");
const cors = require("cors");
const mysql = require("mysql2");
const { login } = require("./Controller/login");
const reportRouter = require("./Controller/report");
const facultyRoutes = require("./Controller/facultyController");
const marksController = require("./Controller/marksController");
const studentRoutes = require("./Controller/create");
const reportController = require("./Controller/reportController");
const studentMarksController = require("./Controller/studentMarksController");

const app = express();
const port = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());

// Debugging
console.log('Marks Controller Methods:', Object.keys(marksController));

// Routes
app.use("/api", reportRouter);
app.post("/login", login);
app.use("/", facultyRoutes); // Faculty Routes

//tas
// Routes
// server.js

const studentController = require("./Controller/create");

// Routes
app.get("/students/:regNo", studentController.getStudentByRegNo);
app.post("/students", studentController.addStudent);
app.put("/students/:reg_no", studentController.updateStudent);
app.delete("/students/:reg_no", studentController.deleteStudent);


// Marks Entry Routes
app.get('/classes', marksController.getClasses);
app.get('/subjects/:class', marksController.getSubjects);
app.get('/students/:class/:subject', marksController.getStudents);
app.post('/marks', marksController.saveMarks);
app.get('/markOverview', marksController.getMarkOverview);
app.put('/marks/:id', marksController.updateMarks);
app.delete('/marks/:id', marksController.deleteMarks);
app.get('/date-diagnostics/:reg_no', marksController.dateDiagnostics);
app.get('/api/subjects', marksController.getApiSubjects);

// Report Generation Routes
// Report Routes
app.get('/api/report/data', reportController.getReportData);
app.get('/api/report/excel', (req, res) => {
    console.log('Generating Excel report with params:', req.query);
    reportController.generateExcelReport(req, res);
});
app.get('/api/report/pdf', (req, res) => {
    console.log('Generating PDF report with params:', req.query);
    reportController.generatePDFReport(req, res);
});

//haz
// Student Marks Routes
app.get("/student-marks/student/:regNo", studentMarksController.getStudentByRegNo);
app.get("/student-marks/subjects/:regNo", studentMarksController.getStudentSubjects);
app.get("/student-marks/subject/:regNo/:subject", studentMarksController.getSubjectMarks);
app.get("/student-marks/report/:regNo", studentMarksController.getOverallReport);
// Error handling for undefined routes
app.use((req, res) => {
  res.status(404).send("Route not found");
});

// Start the Server
app.listen(port, () => {
    console.log(`Server is running on http://localhost:${port}`);
});

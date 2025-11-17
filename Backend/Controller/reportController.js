const db = require('../db');
const excel = require('exceljs');
const PDFDocument = require('pdfkit');

// Helper function to fetch report data
const fetchReportData = async (className, subject, startDate, endDate) => {
    let query = `
        SELECT 
            s.reg_no,
            s.name AS student_name,
            m.subject,
            SUM(m.marks) AS total_marks,
            COUNT(m.id) AS tests_count
        FROM marks m
        JOIN students s ON m.reg_no = s.reg_no
        WHERE s.class = ? AND m.subject = ?
    `;

    const params = [className, subject];

    if (startDate && endDate) {
        query += ' AND m.test_date BETWEEN ? AND ?';
        params.push(startDate, endDate);
    } else if (startDate) {
        query += ' AND m.test_date >= ?';
        params.push(startDate);
    } else if (endDate) {
        query += ' AND m.test_date <= ?';
        params.push(endDate);
    }

    query += ' GROUP BY s.reg_no, s.name, m.subject ORDER BY s.reg_no';

    const [results] = await db.promise().query(query, params);
    return results;
};

// Get report data
exports.getReportData = async (req, res) => {
    try {
        const { className, subject, startDate, endDate } = req.query;
        
        if (!className || !subject) {
            return res.status(400).json({
                success: false,
                message: 'Class and subject are required parameters'
            });
        }

        const results = await fetchReportData(className, subject, startDate, endDate);
        
        res.json({
            success: true,
            data: results,
            className,
            subject,
            dateRange: { startDate, endDate }
        });
    } catch (error) {
        console.error('Error generating report:', error);
        res.status(500).json({
            success: false,
            message: 'Error generating report',
            error: error.message
        });
    }
};

// Generate Excel report
exports.generateExcelReport = async (req, res) => {
    try {
        const { className, subject, startDate, endDate } = req.query;
        
        if (!className || !subject) {
            return res.status(400).send('Class and subject are required parameters');
        }

        // Get the data directly from database
        const data = await fetchReportData(className, subject, startDate, endDate);

        // Create workbook
        const workbook = new excel.Workbook();
        const worksheet = workbook.addWorksheet('Student Report');
        
        // Add headers with styling
        worksheet.columns = [
            { header: 'Reg No', key: 'reg_no', width: 15, style: { font: { bold: true } } },
            { header: 'Student Name', key: 'student_name', width: 30 },
            { header: 'Subject', key: 'subject', width: 20 },
            { header: 'Total Marks', key: 'total_marks', width: 15 },
            { header: 'Tests Count', key: 'tests_count', width: 15 }
        ];

        // Add data
        worksheet.addRows(data);

        // Style the header row
        worksheet.getRow(1).eachCell((cell) => {
            cell.font = { bold: true };
            cell.fill = {
                type: 'pattern',
                pattern: 'solid',
                fgColor: { argb: 'FFD3D3D3' }
            };
        });

        // Set response headers
        res.setHeader('Access-Control-Allow-Origin', '*');
        res.setHeader(
            'Content-Type',
            'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
        );
        res.setHeader(
            'Content-Disposition',
            `attachment; filename=${subject.replace(/\s+/g, '_')}_Report.xlsx`
        );

        // Write to response
        await workbook.xlsx.write(res);
        res.end();
    } catch (error) {
        console.error('Error generating Excel report:', {
            error: error.message,
            stack: error.stack,
            query: req.query
        });
        res.status(500).json({
            success: false,
            message: 'Error generating Excel report',
            error: error.message
        });
    }
};

// Generate PDF report
exports.generatePDFReport = async (req, res) => {
    try {
        const { className, subject, startDate, endDate } = req.query;
        
        if (!className || !subject) {
            return res.status(400).send('Class and subject are required parameters');
        }

        // Get the data directly from database
        const data = await fetchReportData(className, subject, startDate, endDate);

        // Create PDF document
        const doc = new PDFDocument({ margin: 50 });
        
        // Set response headers
        res.setHeader('Access-Control-Allow-Origin', '*');
        res.setHeader('Content-Type', 'application/pdf');
        res.setHeader(
            'Content-Disposition',
            `attachment; filename=${subject.replace(/\s+/g, '_')}_Report.pdf`
        );

        // Pipe PDF to response
        doc.pipe(res);

        // Add title
        doc.fontSize(20).text(`${subject} Report`, { align: 'center' });
        doc.moveDown(0.5);
        
        // Add date range if specified
        if (startDate || endDate) {
            doc.fontSize(12)
               .text(`Date Range: ${startDate || 'Start'} to ${endDate || 'End'}`, 
                     { align: 'left' });
            doc.moveDown(1);
        }

        // Set table parameters
        const table = {
            headers: ['Reg No', 'Student Name', 'Total Marks', 'Tests Count'],
            rows: data.map(item => [
                item.reg_no,
                item.student_name,
                item.total_marks,
                item.tests_count
            ])
        };

        // Draw table
        const initialY = doc.y;
        const margin = 50;
        const rowHeight = 25;
        const colWidths = [80, 180, 80, 80]; // Custom column widths

        // Draw headers
        doc.font('Helvetica-Bold');
        let x = margin;
        table.headers.forEach((header, i) => {
            doc.text(header, x, initialY, {
                width: colWidths[i],
                align: 'left'
            });
            x += colWidths[i];
        });
        doc.font('Helvetica');

        // Draw rows
        let y = initialY + rowHeight;
        table.rows.forEach((row) => {
            x = margin;
            row.forEach((cell, i) => {
                doc.text(cell.toString(), x, y, {
                    width: colWidths[i],
                    align: 'left'
                });
                x += colWidths[i];
            });
            y += rowHeight;
        });

        // Finalize PDF
        doc.end();
    } catch (error) {
        console.error('Error generating PDF report:', {
            error: error.message,
            stack: error.stack,
            query: req.query
        });
        res.status(500).json({
            success: false,
            message: 'Error generating PDF report',
            error: error.message
        });
    }
};
import React, { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import '../Styles/marksoverview.css';

const MarksOverview = ({ className, subject, onBack }) => {
  const navigate = useNavigate();
  const [overviewData, setOverviewData] = useState([]);
  const [filteredData, setFilteredData] = useState([]);
  const [selectedRecord, setSelectedRecord] = useState(null);
  const [marks, setMarks] = useState('');
  const [feedback, setFeedback] = useState('');
  const [batch, setBatch] = useState('');
  const [sortOrder, setSortOrder] = useState('asc');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');

  const formatDate = (dateString) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const fetchOverviewData = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      console.log('Fetching data with params:', {
        class: className, 
        subject, 
        batch: batch || 'all', 
        sort: sortOrder 
      });
      
      const res = await axios.get('http://localhost:5000/markOverview', {
        params: { 
          class: className, 
          subject, 
          batch: batch || undefined,
          sort: sortOrder 
        },
      });
      
      const data = Array.isArray(res.data) ? res.data : [];
      setOverviewData(data);
      setFilteredData(data);
      
      if (data.length === 0) {
        setError('No records found matching your criteria');
      }
    } catch (err) {
      console.error('Fetch error:', {
        message: err.message,
        response: err.response?.data,
        config: err.config
      });
      setError('Failed to fetch data. Please try again.');
      setOverviewData([]);
      setFilteredData([]);
    } finally {
      setIsLoading(false);
    }
  }, [className, subject, batch, sortOrder]);

  useEffect(() => {
    fetchOverviewData();
  }, [fetchOverviewData]);

  useEffect(() => {
    if (searchTerm.trim() === '') {
      setFilteredData(overviewData);
    } else {
      const filtered = overviewData.filter(item => 
        item.student_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.reg_no?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.topic?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (item.feedback && item.feedback.toLowerCase().includes(searchTerm.toLowerCase()))
      );
      setFilteredData(filtered);
    }
  }, [searchTerm, overviewData]);

  const handleEdit = (record) => {
    setSelectedRecord(record);
    setMarks(record.marks);
    setFeedback(record.feedback || '');
  };

  const handleDelete = async (record) => {
    if (!window.confirm('Are you sure you want to delete this record?')) return;

    try {
      await axios.delete(`http://localhost:5000/marks/${record.id}`);
      fetchOverviewData();
      alert('Record deleted successfully');
    } catch (err) {
      console.error('Delete error:', err);
      alert(err.response?.data?.message || 'Failed to delete record');
    }
  };

  const handleUpdate = async () => {
    if (!selectedRecord) return;
  
    try {
      const response = await axios.put(
        `http://localhost:5000/marks/${selectedRecord.id}`,
        {
          marks: parseFloat(marks),
          feedback: feedback || '',
          testDate: selectedRecord.testDate,
          topic: selectedRecord.topic,
          totalMarks: selectedRecord.totalMarks,
          subject: selectedRecord.subject,
          batch: selectedRecord.batch,
          sub_code: selectedRecord.sub_code,
        }
      );
  
      console.log('Update response:', response.data);
      await fetchOverviewData();
      setSelectedRecord(null);
      alert('Record updated successfully');
    } catch (err) {
      console.error('Update error:', err.response?.data || err.message);
      alert('Error updating record. See console for details.');
    }
  };

  const handleRefresh = () => {
    fetchOverviewData();
  };

  const handleResetFilters = () => {
    setBatch('');
    setSortOrder('asc');
    setSearchTerm('');
  };

  if (isLoading) {
    return (
      <div className="loading-container">
        <div className="spinner"></div>
        <p>Loading marks data...</p>
      </div>
    );
  }

  return (
    <div className="overview-container">
      <div className="header">
        <button className="back-button" onClick={onBack || (() => navigate(-1))}>
          Back
        </button>
        <h2>Overview of Marks for {subject}</h2>
      </div>

      <div className="controls">
        <div className="search-group">
          <input
            type="text"
            placeholder="Search by name, reg no, topic or feedback..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            disabled={isLoading}
          />
        </div>

        <div className="filter-group">
          <label>
            Select Batch:
            <select 
              value={batch} 
              onChange={(e) => setBatch(e.target.value)}
              disabled={isLoading}
            >
              <option value="">All Batches</option>
              <option value="1">Batch 1</option>
              <option value="2">Batch 2</option>
            </select>
          </label>
        </div>

        <div className="sort-group">
          <button
            onClick={() => setSortOrder(prev => (prev === 'asc' ? 'desc' : 'asc'))}
            disabled={isLoading}
          >
            {sortOrder === 'asc' ? '↑ Oldest First' : '↓ Newest First'}
          </button>
        </div>

        <button className="refresh-btn" onClick={handleRefresh} disabled={isLoading}>
          Refresh
        </button>

        {(batch || searchTerm) && (
          <button className="reset-btn" onClick={handleResetFilters} disabled={isLoading}>
            Reset Filters
          </button>
        )}
      </div>

      {error && (
        <div className="message-container error">
          <p>{error}</p>
          <div className="action-buttons">
            <button onClick={handleRefresh}>Retry</button>
            {error.includes('No records') && (
              <button onClick={handleResetFilters}>Reset Filters</button>
            )}
          </div>
        </div>
      )}

      {filteredData.length > 0 ? (
        <div className="table-wrapper">
          <table>
            <thead>
              <tr>
                <th>ID</th>
                <th>Reg No</th>
                <th>Name</th>
                <th>Marks</th>
                <th>Date</th>
                <th>Topic</th>
                <th>Total</th>
                <th>Batch</th>
                <th>Feedback</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredData.map((data) => (
                <tr key={data.id}>
                  <td>{data.id}</td>
                  <td>{data.reg_no}</td>
                  <td>{data.student_name}</td>
                  <td>{data.marks}</td>
                  <td>{formatDate(data.testDate)}</td>
                  <td>{data.topic}</td>
                  <td>{data.totalMarks}</td>
                  <td>{data.batch || '-'}</td>
                  <td>{data.feedback || '-'}</td>
                  <td className="actions">
                    <button 
                      className="edit-btn"
                      onClick={() => handleEdit(data)}
                    >
                      Edit
                    </button>
                    <button
                      className="delete-btn"
                      onClick={() => handleDelete(data)}
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          <div className="summary">
            Showing {filteredData.length} of {overviewData.length} records
            {searchTerm && ` matching "${searchTerm}"`}
          </div>
        </div>
      ) : !error && (
        <div className="message-container info">
          <p>
            {searchTerm 
              ? `No records found matching "${searchTerm}"`
              : `No records available for ${subject}`}
          </p>
          <div className="action-buttons">
            {searchTerm && (
              <button onClick={() => setSearchTerm('')}>Clear Search</button>
            )}
            <button onClick={handleRefresh}>Try Again</button>
          </div>
        </div>
      )}

      {selectedRecord && (
        <div className="modal-overlay">
          <div className="edit-modal">
            <h3>Edit Record</h3>
            <div className="form-group">
              <label>
                Marks:
                <input
                  type="number"
                  value={marks}
                  onChange={(e) => setMarks(e.target.value)}
                  min="0"
                  max={selectedRecord.totalMarks}
                />
              </label>
            </div>
            <div className="form-group">
              <label>
                Feedback:
                <textarea
                  value={feedback}
                  onChange={(e) => setFeedback(e.target.value)}
                  rows="3"
                />
              </label>
            </div>
            <div className="modal-actions">
              <button className="save-btn" onClick={handleUpdate}>
                Save Changes
              </button>
              <button className="cancel-btn" onClick={() => setSelectedRecord(null)}>
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default MarksOverview;

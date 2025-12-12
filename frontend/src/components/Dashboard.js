import React, { useState, useEffect } from 'react';
import { predictionAPI, authAPI } from '../services/api';
import './Dashboard.css';

function Dashboard({ onLogout }) {
  const [selectedFile, setSelectedFile] = useState(null);
  const [preview, setPreview] = useState(null);
  const [prediction, setPrediction] = useState(null);
  const [loading, setLoading] = useState(false);
  const [history, setHistory] = useState([]);
  const [user, setUser] = useState(null);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchUserProfile();
    fetchHistory();
  }, []);

  const fetchUserProfile = async () => {
    try {
      const response = await authAPI.getProfile();
      setUser(response.data);
    } catch (err) {
      console.error('Failed to fetch profile:', err);
    }
  };

  const fetchHistory = async () => {
    try {
      const response = await predictionAPI.getHistory();
      setHistory(response.data);
    } catch (err) {
      console.error('Failed to fetch history:', err);
    }
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setSelectedFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreview(reader.result);
      };
      reader.readAsDataURL(file);
      setPrediction(null);
      setError('');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!selectedFile) {
      setError('Please select an image');
      return;
    }

    setLoading(true);
    setError('');

    const formData = new FormData();
    formData.append('image', selectedFile);

    try {
      const response = await predictionAPI.predict(formData);
      setPrediction(response.data);
      fetchHistory();
    } catch (err) {
      setError(err.response?.data?.error || 'Prediction failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleClear = () => {
    setSelectedFile(null);
    setPreview(null);
    setPrediction(null);
    setError('');
  };

  return (
    <div className="dashboard-container">
      <header className="dashboard-header">
        <div className="header-content">
          <h1>Object Detection System</h1>
          <div className="user-info">
            <span>Welcome, {user?.username || 'User'}</span>
            <button onClick={onLogout} className="btn-logout">
              Logout
            </button>
          </div>
        </div>
      </header>

      <div className="dashboard-content">
        <div className="main-section">
          <div className="upload-section">
            <h2>Upload Image</h2>
            <form onSubmit={handleSubmit}>
              <div className="file-input-wrapper">
                <input
                  type="file"
                  id="file-input"
                  accept="image/*"
                  onChange={handleFileChange}
                  className="file-input"
                />
                <label htmlFor="file-input" className="file-input-label">
                  {selectedFile ? selectedFile.name : 'Choose an image'}
                </label>
              </div>

              {preview && (
                <div className="preview-container">
                  <img src={preview} alt="Preview" className="preview-image" />
                </div>
              )}

              {error && <div className="error-message">{error}</div>}

              {prediction && (
                <div className="prediction-result">
                  <h3>Prediction Result</h3>
                  <div className="result-content">
                    <p className="predicted-class">{prediction.predicted_class}</p>
                    <p className="confidence">
                      Confidence: {(prediction.confidence * 100).toFixed(2)}%
                    </p>
                  </div>
                </div>
              )}

              <div className="button-group">
                <button
                  type="submit"
                  disabled={!selectedFile || loading}
                  className="btn-primary"
                >
                  {loading ? 'Analyzing...' : 'Detect Object'}
                </button>
                {(selectedFile || prediction) && (
                  <button
                    type="button"
                    onClick={handleClear}
                    className="btn-secondary"
                  >
                    Clear
                  </button>
                )}
              </div>
            </form>
          </div>
        </div>

        <div className="history-section">
          <h2>Prediction History</h2>
          <div className="history-list">
            {history.length === 0 ? (
              <p className="no-history">No predictions yet. Upload an image to get started!</p>
            ) : (
              history.map((item) => (
                <div key={item.id} className="history-item">
                  <img
                    src={item.image_url}
                    alt={item.predicted_class}
                    className="history-image"
                  />
                  <div className="history-info">
                    <h4>{item.predicted_class}</h4>
                    <p>{(item.confidence * 100).toFixed(2)}% confidence</p>
                    <p className="history-date">
                      {new Date(item.created_at).toLocaleString()}
                    </p>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default Dashboard;

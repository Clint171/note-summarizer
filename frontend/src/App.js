import React, { useState } from 'react';
import axios from 'axios';
import ReactMarkdown from 'react-markdown';

function App() {
  const [selectedFile, setSelectedFile] = useState(null);
  const [markdownSummary, setMarkdownSummary] = useState('');
  const [error, setError] = useState('');

  const handleFileChange = (event) => {
    setSelectedFile(event.target.files[0]);
    setError('');
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    if (!selectedFile) {
      setError('Please select a file first.');
      return;
    }

    const formData = new FormData();
    formData.append('file', selectedFile);

    try {
      const response = await axios.post('http://localhost:3500/file', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      setMarkdownSummary(response.data);
    } catch (err) {
      setError('Failed to upload and retrieve summary. Please try again.');
    }
  };

  return (
    <div className="App">
      <h1>PDF Upload and Summary</h1>
      <form onSubmit={handleSubmit}>
        <input type="file" accept="application/pdf" onChange={handleFileChange} />
        <button type="submit">Upload PDF</button>
      </form>
      {error && <p style={{ color: 'red' }}>{error}</p>}
      <div className="summary">
        {markdownSummary && (
          <>
            <h2>Summary:</h2>
            <ReactMarkdown>{markdownSummary}</ReactMarkdown>
          </>
        )}
      </div>
    </div>
  );
}

export default App;
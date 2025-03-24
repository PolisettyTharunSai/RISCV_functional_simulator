import { useState, useEffect } from "react";
import axios from "axios";
import { ChevronLeft, ChevronRight, Play } from "lucide-react";
import "./Dataflow.css";

function DataFlow() {
  const [cppFile, setCppFile] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [data, setData] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setIsLoading(true);
      setError(null);
      const response = await axios.get("http://localhost:5001/get-output");
      setData(response.data);
      setIsLoading(false);
    } catch (error) {
      setError("Error fetching output.json.");
      setIsLoading(false);
    }
  };

  const handleRun = async () => {
    if (!cppFile) {
      alert("Please upload a C++ file.");
      return;
    }

    setIsLoading(true);
    setError(null);
    const formData = new FormData();
    formData.append("dataflowCode", cppFile);

    try {
      await axios.post("http://localhost:5001/run-dataflow", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      setTimeout(fetchData, 500);
    } catch (error) {
      setError("Error executing dataflow analysis.");
      setIsLoading(false);
    }
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setCppFile(file);
      setError(null);
    }
  };

  return (
    <div className="dataflow-container">
      <h2>Data Flow Execution</h2>
      <div className="file-upload-section">
        <input type="file" accept=".cpp" onChange={handleFileChange} />
        <button onClick={handleRun} disabled={isLoading || !cppFile}>
          {isLoading ? "Processing..." : "Run Dataflow"}
        </button>
      </div>
      <div className="output-section">
        {error && <div className="error-message">{error}</div>}
        {isLoading ? (
          <div className="loading">Loading output...</div>
        ) : (
          <div className="output-display">
            <h1>Cycle {currentIndex + 1} of {data.length}</h1>
            <div className="cycle-nav">
              <button 
                onClick={() => setCurrentIndex((prev) => Math.max(prev - 1, 0))}
                disabled={currentIndex === 0}
              >
                <ChevronLeft size={24} /> PREV
              </button>
              <button 
                onClick={() => setCurrentIndex(data.length - 1)} 
                disabled={data.length === 0 || currentIndex === data.length - 1}
              >
                <Play size={24} /> RUN
              </button>
              <button 
                onClick={() => setCurrentIndex((prev) => Math.min(prev + 1, data.length - 1))}
                disabled={currentIndex === data.length - 1}
              >
                NEXT <ChevronRight size={24} />
              </button>
            </div>
            <div className="data-stage">
              {data.length > 0 && Object.entries(data[currentIndex]).map(([key, value]) => (
                <div key={key} className="stage-box">
                  <h2>{key}</h2>
                  <div className="stage-content">
                    {Object.entries(value).map(([subKey, subValue]) => (
                      <div key={subKey} className="data-item box">
                        <span>{subKey}: </span>
                        <span>{subValue.toString()}</span>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default DataFlow;
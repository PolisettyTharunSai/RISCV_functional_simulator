import { BrowserRouter as Router, Route, Routes, Link } from "react-router-dom";
import FileUpload from "./components/FileUpload.jsx";
import DataFlow from "./components/DataFlow";
import "./styles.css";
import { useState } from "react";
import "./App.css";

const initialRegisters = {
  x0: "0x00000000", x1: "0x00000000", x2: "0x7FFFFFDC", x3: "0x10000000",
  x4: "0x00000000", x5: "0x00000000", x6: "0x00000000", x7: "0x00000000",
  x8: "0x00000000", x9: "0x00000000", x10: "0x00000001", x11: "0x7FFFFFDC",
  x12: "0x00000000", x13: "0x00000000", x14: "0x00000000", x15: "0x00000000",
  x16: "0x00000000", x17: "0x00000000", x18: "0x00000000", x19: "0x00000000",
  x20: "0x00000000", x21: "0x00000000", x22: "0x00000000", x23: "0x00000000",
  x24: "0x00000000", x25: "0x00000000", x26: "0x00000000", x27: "0x00000000",
  x28: "0x00000000", x29: "0x00000000", x30: "0x00000000", x31: "0x00000000"
};  

function App() {
  const [outputVisible, setOutputVisible] = useState(false);
  const [output, setOutput] = useState("");
  const [tab, setTab] = useState("memory");

  const handleRun = () => {
    setOutput("Execution Output: \n0x00000000 0x00000001 0x00000002");
    setOutputVisible(true);
  };

  return (
    <Router>
      <div className="app">

        {/* Centered Simulator UI */}
        <div className="container">
        <h1 style={{ paddingTop: "20px", fontSize: "28px", color: "#61dafb" }}>
  RISCV Simulator
</h1>
          {/* Navigation Bar */}
          <nav style={{ display: "flex", justifyContent: "center", gap: "15px", marginBottom: "15px" }}>
  <Link 
    to="/" 
    style={{ 
      textDecoration: "none", 
      color: "#fff", 
      background: "#007bff", 
      padding: "10px 15px", 
      borderRadius: "5px", 
      transition: "0.3s",
      fontWeight: "bold"
    }}
    onMouseOver={(e) => e.target.style.background = "#0056b3"}
    onMouseOut={(e) => e.target.style.background = "#007bff"}
  >
    Assembler
  </Link>
  
  <Link 
    to="/dataflow" 
    style={{ 
      textDecoration: "none", 
      color: "#fff", 
      background: "#007bff", 
      padding: "10px 15px", 
      borderRadius: "5px", 
      transition: "0.3s",
      fontWeight: "bold"
    }}
    onMouseOver={(e) => e.target.style.background = "#0056b3"}
    onMouseOut={(e) => e.target.style.background = "#007bff"}
  >
    Simulator
  </Link>
</nav>

          {/* Page Routes */}
          <Routes>
            <Route path="/" element={<FileUpload handleRun={handleRun} />} />
            <Route path="/dataflow" element={<DataFlow />} />
          </Routes>

          {/* Output Box */}
          {outputVisible && (
            <div className="output-box">
              <pre>{output}</pre>
            </div>
          )}
        </div>

      </div>
    </Router>
  );
}

export default App;
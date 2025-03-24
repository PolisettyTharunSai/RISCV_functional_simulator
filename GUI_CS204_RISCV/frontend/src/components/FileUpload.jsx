
import React, { useState } from "react";
import axios from "axios";

function FileUpload() {
    const [cppFile, setCppFile] = useState(null);
    const [asmFile, setAsmFile] = useState(null);
    const [output, setOutput] = useState("");
    const [showOutput, setShowOutput] = useState(false); // Control output visibility

    // File handlers
    const handleCppChange = (event) => setCppFile(event.target.files[0]);
    const handleAsmChange = (event) => setAsmFile(event.target.files[0]);

    // Handle form submission
    const handleSubmit = async (event) => {
        event.preventDefault();

        if (!cppFile || !asmFile) {
            alert("⚠️ Please upload both C++ and ASM files.");
            return;
        }

        const formData = new FormData();
        formData.append("code", cppFile);
        formData.append("inputFile", asmFile);

        try {
            const response = await axios.post("http://localhost:5001/run", formData, {
                headers: { "Content-Type": "multipart/form-data" },
            });

            console.log("✅ Server Response:", response.data);
            setOutput(response.data.output || "⚠️ No output received.");
            setShowOutput(true); // Show output only after running
        } catch (error) {
            console.error("❌ Error:", error.response?.data || error.message);
            setOutput("⚠️ Error occurred while processing.");
            setShowOutput(true);
        }
    };

    return (
        <div className="file-upload-container">
            <h2>Upload Files</h2>
            <form onSubmit={handleSubmit}>
                <label>C++ File:</label>
                <input type="file" onChange={handleCppChange} accept=".cpp" required />
                {cppFile && <p className="file-name">📄 {cppFile.name}</p>}

                <label>Input ASM File:</label>
                <input type="file" onChange={handleAsmChange} accept=".asm" required />
                {asmFile && <p className="file-name">📄 {asmFile.name}</p>}

                <button type="submit">Run</button>
            </form>

            {/* Conditional Rendering of Output */}
            {showOutput && (
                <div className="output-box">
                    <h3>Output:</h3>
                    <pre>{output}</pre>
                </div>
            )}
        </div>
    );
}

export default FileUpload;
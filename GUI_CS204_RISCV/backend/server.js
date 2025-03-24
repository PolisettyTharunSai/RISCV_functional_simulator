const express = require("express");
const multer = require("multer");
const cors = require("cors");
const { exec } = require("child_process");
const fs = require("fs");

const app = express();
const upload = multer({ dest: "uploads/" });

app.use(cors());
app.use(express.json());

/**
 * Endpoint to compile and execute assembler C++ code with input.asm.
 * It generates the file "output.mc".
 */
app.post("/run", upload.fields([{ name: "code", maxCount: 1 }, { name: "inputFile", maxCount: 1 }]), (req, res) => {
    console.log("📩 Received a request at /run");
    console.log("📝 Uploaded Files:", req.files);

    if (!req.files || !req.files["code"] || !req.files["inputFile"]) {
        return res.status(400).json({ error: "Both C++ code and input.asm file are required." });
    }

    let cppFilePath = req.files["code"][0].path;
    let inputAsmPath = req.files["inputFile"][0].path;
    let renamedCppFile = `${cppFilePath}.cpp`;
    let renamedAsmFile = "input.asm";
    let execFile = "output";
    let outputFile = "output.mc";

    try {
        fs.renameSync(cppFilePath, renamedCppFile);
        fs.renameSync(inputAsmPath, renamedAsmFile);
    } catch (error) {
        console.error("❌ File renaming failed:", error);
        return res.status(500).json({ error: "File renaming failed." });
    }

    if (fs.existsSync(execFile)) fs.unlinkSync(execFile);

    exec(`clang++ -std=c++20 "${renamedCppFile}" -o "${execFile}"`, (err, stdout, stderr) => {
        if (err) {
            console.error("❌ Compilation Error:", stderr);
            return res.status(500).json({ error: stderr || "Compilation error" });
        }

        console.log("🚀 Compilation successful!");

        exec(`./${execFile}`, (runErr, runStdout, runStderr) => {
            if (runErr) {
                console.error("❌ Runtime Error:", runStderr);
                return res.status(500).json({ error: runStderr || "Runtime error" });
            }

            console.log("📤 Assembler program executed successfully!");

            if (!fs.existsSync(outputFile)) {
                console.error("❌ Error: output.mc not generated.");
                return res.status(500).json({ error: "Assembler did not generate output.mc" });
            }

            fs.readFile(outputFile, "utf8", (fileErr, fileData) => {
                if (fileErr) {
                    console.error("❌ Error reading output file:", fileErr);
                    return res.status(500).json({ error: "Error reading output file." });
                }

                console.log("📄 Assembler Output:", fileData.trim());
                res.json({ output: fileData.trim() });
            });
        });
    });
});

/**
 * Endpoint to run the data flow analysis.
 * It accepts a C++ file (uploaded as "dataflowCode") and automatically uses "output.mc" as input.
 * The dataflow program generates "output.json", which is then returned.
 */
app.post("/run-dataflow", upload.single("dataflowCode"), (req, res) => {
    console.log("📩 Received a request at /run-dataflow");
    console.log("📝 Uploaded Dataflow C++ File:", req.file);

    if (!req.file) {
        return res.status(400).json({ error: "C++ file for data flow analysis is required." });
    }

    let cppFilePath = req.file.path;
    let renamedCppFile = `${cppFilePath}.cpp`;
    let execFile = "dataflow";
    let inputFile = "output.mc";
    let outputFile = "output.json";

    try {
        fs.renameSync(cppFilePath, renamedCppFile);
    } catch (error) {
        console.error("❌ File renaming failed:", error);
        return res.status(500).json({ error: "File renaming failed." });
    }

    if (!fs.existsSync(inputFile)) {
        console.error("❌ Error: Assembler output file", inputFile, "not found.");
        return res.status(500).json({ error: "Assembler output file output.mc not found." });
    }

    if (fs.existsSync(execFile)) fs.unlinkSync(execFile);

    exec(`clang++ -std=c++20 "${renamedCppFile}" -o "${execFile}"`, (err, stdout, stderr) => {
        if (err) {
            console.error("❌ Compilation Error in dataflow step:", stderr);
            return res.status(500).json({ error: stderr || "Compilation error in dataflow step" });
        }

        console.log("🚀 Dataflow Compilation successful!");

        exec(`./${execFile}`, (runErr, runStdout, runStderr) => {
            if (runErr) {
                console.error("❌ Runtime Error in dataflow step:", runStderr);
                return res.status(500).json({ error: runStderr || "Runtime error in dataflow step" });
            }

            console.log("📤 Dataflow analysis executed successfully!");

            if (!fs.existsSync(outputFile)) {
                console.error("❌ Error: output.json not generated.");
                return res.status(500).json({ error: "Dataflow analysis did not generate output.json" });
            }

            fs.readFile(outputFile, "utf8", (fileErr, fileData) => {
                if (fileErr) {
                    console.error("❌ Error reading dataflow output file:", fileErr);
                    return res.status(500).json({ error: "Error reading dataflow output file." });
                }

                try {
                    const jsonData = JSON.parse(fileData.trim());
                    console.log("📄 Dataflow Output:", jsonData);
                    res.json(jsonData);
                } catch (parseError) {
                    console.error("❌ Error parsing JSON:", parseError);
                    return res.status(500).json({ error: "Invalid JSON format in output.json" });
                }
            });
        });
    });
});

/**
 * Endpoint to fetch the output.json file.
 */
app.get("/get-output", (req, res) => {
    const outputFile = "output.json";

    console.log("📥 Received request to fetch output.json");

    if (!fs.existsSync(outputFile)) {
        console.error("❌ Error: output.json not found.");
        return res.status(404).json({ error: "output.json not found." });
    }

    fs.readFile(outputFile, "utf8", (err, data) => {
        if (err) {
            console.error("❌ Error reading output.json:", err);
            return res.status(500).json({ error: "Error reading output.json." });
        }

        try {
            const jsonData = JSON.parse(data.trim());
            console.log("📄 Sending output.json content.");
            res.json(jsonData);
        } catch (parseError) {
            console.error("❌ Error parsing JSON:", parseError);
            return res.status(500).json({ error: "Invalid JSON format in output.json" });
        }
    });
});

// ✅ Start the server
const PORT = 5001;
app.listen(PORT, () => console.log(`✅ Server running on port ${PORT}`));


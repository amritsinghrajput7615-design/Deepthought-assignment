// backend/server.js
const express = require("express");
const cors = require("cors");
const fs = require("fs");
const path = require("path");

const app = express();
const PORT = 3000;

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

const rubricPath = path.join(__dirname, "data", "rubric.json");
const contextPath = path.join(__dirname, "data", "context.md");

let rubricData = "";
let contextData = "";
try {
  rubricData = fs.readFileSync(rubricPath, "utf-8");
  contextData = fs.readFileSync(contextPath, "utf-8");
} catch (error) {
  console.error("Error reading files:", error.message);
}

app.get("/", (req, res) => {
  res.send("DeepThought backend running");
});

app.post("/api/analyze", async (req, res) => {
  try {
    const { transcript } = req.body;

    if (!transcript) {
      return res.status(400).json({ error: "Transcript is required" });
    }

    const prompt = `
You are an AI evaluator for DeepThought Fellow performance.
Analyze the transcript and return a JSON object.

Transcript:
${transcript}

Return ONLY valid JSON:
{
  "score": { "value": 0, "label": "", "band": "", "justification": "", "confidence": "" },
  "evidence": [],
  "kpiMapping": [],
  "gaps": [],
  "followUpQuestions": []
}
`;

    const response = await fetch("http://localhost:11434/api/generate", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        model: "llama3.2:1b",
        prompt,
        stream: false
      })
    });

    const data = await response.json();
    console.log("=== FULL OLLAMA RESPONSE ===", JSON.stringify(data, null, 2));

    const rawText = data.response;
    const parsed = JSON.parse(rawText);

    res.json(parsed);

  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Server error", message: error.message });
  }
});

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
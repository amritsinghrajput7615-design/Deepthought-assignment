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
You are an expert evaluator for DeepThought Fellow performance assessments.
Your job is to analyze a supervisor transcript and return a structured JSON evaluation.

CONTEXT AND RUBRIC:
${contextData}

RUBRIC DATA:
${rubricData}

TRANSCRIPT TO ANALYZE:
${transcript}

INSTRUCTIONS — follow every rule exactly:

1. SCORE OBJECT — fill all 5 fields:
   - value: integer from 1 to 10 based on rubric
   - label: short phrase describing performance level (e.g. "Reliable and Productive")
   - band: exactly one of these four words — Foundational, Productivity, Systems, Leadership
   - justification: write 2 to 3 sentences that name specific moments from the transcript
   - confidence: exactly one of these three words — low, medium, high

2. EVIDENCE ARRAY — minimum 3 items, maximum 6:
   - quote: copy a short phrase from the transcript OR paraphrase a specific moment
   - interpretation: one sentence explaining what this reveals about the Fellow's behavior
   - sentiment: exactly one of — positive, negative, neutral
   DO NOT leave this array empty. If the transcript has any content, extract evidence.

3. KPI MAPPING ARRAY — minimum 2 items:
   - kpi: name of the business KPI this behavior connects to
   - evidence: describe exactly what the Fellow did that maps to this KPI
   - systemOrPersonal: write either "system" (runs without Fellow) or "personal" (depends on Fellow)
   Map every distinct behavior mentioned in the transcript to a KPI.

4. GAPS ARRAY — minimum 2 items if score is below 9:
   - dimension: name the rubric dimension that is missing or weak
   - detail: explain what the transcript did NOT mention and why that gap matters
   Think about what a higher-scoring Fellow would do that this transcript does not show.

5. FOLLOW UP QUESTIONS ARRAY — exactly 3 to 5 questions:
   - Each question must target a specific gap identified above
   - Questions must be concrete and answerable by the supervisor
   - Start each question with "Can you", "Has the Fellow", "How does", or "What happens"
   DO NOT leave this array empty under any circumstances.

CRITICAL OUTPUT RULES:
- Return ONLY the JSON object below. No intro text, no explanation, no markdown fences.
- Every array must have at least the minimum number of items stated above.
- Do not copy these instructions into your output.
- Do not add any fields not shown below.

{
  "score": {
    "value": 0,
    "label": "",
    "band": "",
    "justification": "",
    "confidence": ""
  },
  "evidence": [
    { "quote": "", "interpretation": "", "sentiment": "" },
    { "quote": "", "interpretation": "", "sentiment": "" },
    { "quote": "", "interpretation": "", "sentiment": "" }
  ],
  "kpiMapping": [
    { "kpi": "", "evidence": "", "systemOrPersonal": "" },
    { "kpi": "", "evidence": "", "systemOrPersonal": "" }
  ],
  "gaps": [
    { "dimension": "", "detail": "" },
    { "dimension": "", "detail": "" }
  ],
  "followUpQuestions": [
    "",
    "",
    ""
  ]
}
`;

    const response = await fetch("http://localhost:11434/api/generate", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        model: "llama3.2",
        prompt,
        stream: false,
        options: {
          temperature: 0.1,
          num_predict: 2048
        }
      })
    });

    const data = await response.json();
    const rawText = data.response;

    console.log("=== RAW MODEL OUTPUT ===\n", rawText, "\n========================");

    let parsed;
    try {
      // Attempt 1: direct parse
      parsed = JSON.parse(rawText);
    } catch (err) {
      try {
        // Attempt 2: strip markdown fences then parse
        const stripped = rawText
          .replace(/```json/g, "")
          .replace(/```/g, "")
          .trim();
        parsed = JSON.parse(stripped);
      } catch (err2) {
        try {
          // Attempt 3: extract first { ... } block
          const match = rawText.match(/\{[\s\S]*\}/);
          if (!match) throw new Error("No JSON block found");
          parsed = JSON.parse(match[0]);
        } catch (err3) {
          console.error("Raw model output:\n", rawText);
          return res.status(500).json({
            error: "Failed to parse model output",
            raw: rawText
          });
        }
      }
    }

    res.json(parsed);  // ← this was missing

  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Server error", message: error.message });
  }
});

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
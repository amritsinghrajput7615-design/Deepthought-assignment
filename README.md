# Supervisor Feedback Analyzer — DeepThought Trinethra Module

AI-assisted tool for analyzing supervisor transcripts and generating structured Fellow performance assessments.

## Setup Instructions

### 1. Install Ollama
Download from https://ollama.com and install.
Then pull the model:
```bash
ollama pull llama3.2:1b
ollama serve
```

### 2. Start the Backend
```bash
cd backend
npm install
node server.js
# Server runs on http://localhost:3000
```

### 3. Start the Frontend
```bash
cd frontend
npm install
npm run dev
# Frontend runs on http://localhost:5173
```
Open http://localhost:5173 in your browser.

## Model Choice
Using `llama3.2:1b` — chosen because it runs on most laptops with 8GB RAM.
Tradeoff: smaller model means occasional incomplete fields; the parsing pipeline handles this with 3-stage JSON recovery.


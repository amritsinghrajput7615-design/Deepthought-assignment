// backend/server.js
const express = require("express");
const cors = require("cors");

const app = express();
const PORT = 3000;

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.get("/", (req, res) => {
  res.send("DeepThought backend running");
});

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
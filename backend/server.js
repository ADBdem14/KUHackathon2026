const express = require("express");
const cors = require("cors");

const app = express();
app.use(cors());
app.use(express.json());

app.get("/", (req, res) => {
  res.send("Backend running");
});

app.post("/match", async (req, res) => {
  const { skills, needs } = req.body;

  // fake response for now
  res.json({
    suggestion: "Match with someone who knows React and Node.js"
  });
});

app.listen(3000, () => {
  console.log("Server running on port 3000");
});
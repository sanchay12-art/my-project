const express = require("express");
const fs = require("fs/promises");
const path = require("path");

const app = express();
const PORT = process.env.PORT || 3000;
const DB_PATH = path.join(__dirname, "db.json");

app.use(express.json());
app.use(express.static(__dirname));

async function readDb() {
  const raw = await fs.readFile(DB_PATH, "utf8");
  return JSON.parse(raw);
}

async function writeDb(data) {
  await fs.writeFile(DB_PATH, JSON.stringify(data, null, 2));
}

app.get("/api/health", (_req, res) => {
  res.json({ ok: true });
});

app.get("/api/complaints", async (_req, res) => {
  try {
    const db = await readDb();
    res.json(db.complaints || []);
  } catch (error) {
    res.status(500).json({ message: "Failed to load complaints." });
  }
});

app.get("/api/complaints/:id", async (req, res) => {
  try {
    const db = await readDb();
    const complaint = (db.complaints || []).find((item) => item.id === req.params.id);

    if (!complaint) {
      return res.status(404).json({ message: "Complaint not found." });
    }

    res.json(complaint);
  } catch (error) {
    res.status(500).json({ message: "Failed to load complaint." });
  }
});

app.post("/api/complaints", async (req, res) => {
  try {
    const db = await readDb();
    const complaints = db.complaints || [];
    complaints.unshift(req.body);
    db.complaints = complaints;
    await writeDb(db);
    res.status(201).json(req.body);
  } catch (error) {
    res.status(500).json({ message: "Failed to save complaint." });
  }
});

app.patch("/api/complaints/:id", async (req, res) => {
  try {
    const db = await readDb();
    const complaints = db.complaints || [];
    const complaintIndex = complaints.findIndex((item) => item.id === req.params.id);

    if (complaintIndex === -1) {
      return res.status(404).json({ message: "Complaint not found." });
    }

    complaints[complaintIndex] = {
      ...complaints[complaintIndex],
      ...req.body
    };

    db.complaints = complaints;
    await writeDb(db);
    res.json(complaints[complaintIndex]);
  } catch (error) {
    res.status(500).json({ message: "Failed to update complaint." });
  }
});

app.delete("/api/complaints/:id", async (req, res) => {
  try {
    const db = await readDb();
    const complaints = db.complaints || [];
    const filtered = complaints.filter((item) => item.id !== req.params.id);

    if (filtered.length === complaints.length) {
      return res.status(404).json({ message: "Complaint not found." });
    }

    db.complaints = filtered;
    await writeDb(db);
    res.status(204).send();
  } catch (error) {
    res.status(500).json({ message: "Failed to delete complaint." });
  }
});

app.get("*", async (req, res) => {
  try {
    const requestedPath = path.join(__dirname, req.path === "/" ? "index.html" : req.path);
    await fs.access(requestedPath);
    res.sendFile(requestedPath);
  } catch (error) {
    res.sendFile(path.join(__dirname, "index.html"));
  }
});

app.listen(PORT, () => {
  console.log(`Society Care server running on port ${PORT}`);
});

import express from "express";
import cors from "cors";
import { spawn } from "child_process";
import process from "node:process";
import dotenv from "dotenv";
import path from "path";
dotenv.config({ path: path.resolve("../.env") });
dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

const ROOT_DIR = path.resolve(process.cwd(), "..");
const PY_PATH = process.env.RAG_PY_PATH || path.join(ROOT_DIR, "run_rag.py");
const PYTHON_BIN = process.env.PYTHON_BIN || "python"; 

function callPythonRag(question, timeoutMs = 30000) {
  return new Promise((resolve, reject) => {
    console.log(`🚀 Spawning Python: ${PYTHON_BIN}`);
    const child = spawn(PYTHON_BIN, [PY_PATH, "--question", question], {
      cwd: ROOT_DIR,
      env: { ...process.env },
    });

    let out = "";
    let err = "";

    const timer = setTimeout(() => {
      child.kill("SIGKILL");
      reject(new Error("RAG timed out"));
    }, timeoutMs);

    child.stdout.on("data", (d) => {
      const msg = d.toString();
      out += msg;
      console.log("🐍 Python says:", msg);
    });

    child.stderr.on("data", (d) => {
      const msg = d.toString();
      err += msg;
      console.error("Python error:", msg);
    });

    child.on("close", (code) => {
      clearTimeout(timer);
      console.log(`Python process exited with code ${code}`);
      if (code !== 0 && !out) return reject(new Error(err || `Exited ${code}`));

      try {
        const json = JSON.parse(out);
        resolve(json.reply ?? "Sorry — no reply from RAG.");
      } catch (e) {
        console.error("JSON parse failed:", out);
        resolve(out.trim() || err.trim() || "Error parsing RAG output.");
      }
    });
  });
}

app.post("/api/chat", async (req, res) => {
  try {
    const { messages = [] } = req.body;
    const lastUser = [...messages].reverse().find((m) => m.role === "user");
    const question = lastUser?.content?.trim() || "Hello!";

    console.log(`Received question: ${question}`);

    const reply = await callPythonRag(question);
    res.json({ reply });
  } catch (err) {
    console.error("Server error:", err);
    res.status(500).json({ error: err.message || "Server error" });
  }
});

const PORT = process.env.PORT || 8787;
app.listen(PORT, () => console.log(`Server running at http://localhost:${PORT}`));

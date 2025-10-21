import express from "express";
import cors from "cors";
import { spawn } from "child_process";
import path from "node:path";
import process from "node:process";

const app = express();
app.use(cors());
app.use(express.json());

const ROOT_DIR = path.resolve(process.cwd(), "..");
const PY_PATH = process.env.RAG_PY_PATH || path.join(ROOT_DIR, "run_rag.py");
const PYTHON_BIN = process.env.PYTHON_BIN || "python3";

function callPythonRag(question, timeoutMs = 30000) {
  return new Promise((resolve, reject) => {
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

    child.stdout.on("data", (d) => (out += d.toString()));
    child.stderr.on("data", (d) => (err += d.toString()));

    child.on("close", (code) => {
      clearTimeout(timer);
      if (code !== 0 && !out) {
        return reject(new Error(err || `RAG exited with code ${code}`));
      }
      try {
        const json = JSON.parse(out);
        resolve(json.reply ?? "Sorry — no reply from RAG.");
      } catch (e) {
        const text = out?.trim() || err?.trim() || "";
        if (text) return resolve(text);
        reject(new Error("Invalid RAG output"));
      }
    });
  });
}

app.post("/api/chat", async (req, res) => {
  try {
    const { messages = [] } = req.body;
    const lastUser = [...messages].reverse().find((m) => m.role === "user");
    const question = lastUser?.content?.trim() || "Hello!";

    const reply = await callPythonRag(question);
    res.json({ reply });
  } catch (err) {
    console.error("Server error:", err);
    res.status(500).json({ error: err.message || "Server error" });
  }
});

const PORT = process.env.PORT || 8787;
app.listen(PORT, () => console.log(`Server listening on http://localhost:${PORT}`));
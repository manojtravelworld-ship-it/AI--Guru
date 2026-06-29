import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI } from "@google/genai";
import Database from 'better-sqlite3';

const db = new Database('materials.db');
db.exec(`
  CREATE TABLE IF NOT EXISTS generatedMaterials (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    textbookTitle TEXT,
    grade TEXT,
    syllabus TEXT,
    lessonMd TEXT,
    teacherNotesMd TEXT,
    studentNotesMd TEXT,
    quizJson TEXT,
    flashcardsJson TEXT,
    slidesJson TEXT,
    voiceScriptMd TEXT,
    metadataJson TEXT,
    createdAt TEXT
  )
`);

async function startServer() {
  const app = express();
  const PORT = 3000;

  // API routes
  app.use(express.json());

  app.get("/api/health", (req, res) => {
    res.json({ status: "ok" });
  });

  app.post("/api/save-to-drive", async (req, res) => {
    const { token, fileName, content } = req.body;
    if (!token || !fileName || !content) {
      return res.status(400).json({ error: "Missing required fields" });
    }

    try {
      const { google } = await import('googleapis');
      const drive = google.drive({ version: 'v3', auth: token });

      const fileMetadata = {
        name: fileName,
      };
      const media = {
        mimeType: 'text/plain',
        body: content,
      };

      const file = await drive.files.create({
        requestBody: fileMetadata,
        media: media,
        fields: 'id',
      });

      res.json({ fileId: file.data.id });
    } catch (error) {
      console.error('Error saving to Drive:', error);
      res.status(500).json({ error: 'Failed to save to Drive' });
    }
  });

  app.post("/api/materials/generate", async (req, res) => {
    const { textbookContent, textbookTitle, grade, syllabus } = req.body;
    if (!textbookContent || !textbookTitle || !grade || !syllabus) {
      return res.status(400).json({ error: "Missing required fields" });
    }

    try {
      // 1. Generate materials using Gemini
      const ai = new GoogleGenAI({
        apiKey: process.env.GEMINI_API_KEY!,
        httpOptions: { headers: { 'User-Agent': 'aistudio-build' } }
      });

      const prompt = `
        You are a One-Click Lesson Studio. Given the textbook content below, generate the following items in JSON format:
        {
          "lessonMd": "string",
          "teacherNotesMd": "string",
          "studentNotesMd": "string",
          "quizJson": "object",
          "flashcardsJson": "object",
          "slidesJson": "object",
          "voiceScriptMd": "string",
          "metadataJson": "object"
        }
        
        Textbook Title: ${textbookTitle}
        Textbook Content: ${textbookContent}
      `;

      const response = await ai.models.generateContent({
        model: "gemini-3.5-flash",
        contents: prompt,
        config: {
          responseMimeType: "application/json",
        },
      });

      const generatedMaterials = JSON.parse(response.text || "{}");

      // 2. Save to SQLite
      const stmt = db.prepare(`
        INSERT INTO generatedMaterials (
          textbookTitle, grade, syllabus, lessonMd, teacherNotesMd, studentNotesMd, 
          quizJson, flashcardsJson, slidesJson, voiceScriptMd, metadataJson, createdAt
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `);
      
      const info = stmt.run(
        textbookTitle, grade, syllabus, 
        generatedMaterials.lessonMd, generatedMaterials.teacherNotesMd, generatedMaterials.studentNotesMd,
        JSON.stringify(generatedMaterials.quizJson), JSON.stringify(generatedMaterials.flashcardsJson), 
        JSON.stringify(generatedMaterials.slidesJson), generatedMaterials.voiceScriptMd, 
        JSON.stringify(generatedMaterials.metadataJson), new Date().toISOString()
      );

      res.json({ status: "Materials generated and saved", id: info.lastInsertRowid });
    } catch (error) {
      console.error('Error generating/saving materials:', error);
      res.status(500).json({ error: 'Failed to generate/save materials' });
    }
  });

  app.get("/api/materials/list", async (req, res) => {
    const { grade, syllabus } = req.query;

    try {
      let query = 'SELECT * FROM generatedMaterials WHERE 1=1';
      const params = [];
      
      if (grade) {
        query += ' AND grade = ?';
        params.push(grade);
      }
      if (syllabus) {
        query += ' AND syllabus = ?';
        params.push(syllabus);
      }

      const stmt = db.prepare(query);
      const materials = stmt.all(...params);

      res.json(materials.map(m => ({
        ...m,
        quizJson: JSON.parse(m.quizJson),
        flashcardsJson: JSON.parse(m.flashcardsJson),
        slidesJson: JSON.parse(m.slidesJson),
        metadataJson: JSON.parse(m.metadataJson),
      })));
    } catch (error) {
      console.error('Error fetching materials:', error);
      res.status(500).json({ error: 'Failed to fetch materials' });
    }
  });
  
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();

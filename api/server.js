import "dotenv/config";
import express from "express";
import multer from "multer";
import { GoogleGenAI } from "@google/genai";

const app = express();
const upload = multer({ storage: multer.memoryStorage() });

const PORT = Number(process.env.PORT || 3000);
const GEMINI_MODEL =
  process.env.GEMINI_MODEL || "gemini-2.5-flash-lite";
const GEMINI_API_KEY = process.env.GEMINI_API_KEY;

const prompt = `Identify the aquatic pet in this image.

Return ONLY valid JSON in this exact format:
{
  "scientific_name": "",
  "common_name": "",
  "confidence": "",
  "notes": ""
}

Use the most likely scientific name.
If the animal is not a fish or turtle, write "Unknown".
If unsure, write "Unknown" and explain briefly in notes.`;

app.post("/api/identify-pet", upload.single("image"), async (req, res) => {
  try {
    const file = req.file;

    if (!file) {
      return res.status(400).json({ error: "Please upload an image file." });
    }

    if (!file.mimetype?.startsWith("image/")) {
      return res
        .status(400)
        .json({ error: "The uploaded file must be an image." });
    }

    if (!GEMINI_API_KEY) {
      return res.status(500).json({
        error: "Missing GEMINI_API_KEY. Add it to your .env file.",
      });
    }

    const ai = new GoogleGenAI({ apiKey: GEMINI_API_KEY });
    const response = await ai.models.generateContent({
      model: GEMINI_MODEL,
      contents: [
        {
          inlineData: {
            mimeType: file.mimetype,
            data: file.buffer.toString("base64"),
          },
        },
        { text: prompt },
      ],
      config: {
        responseMimeType: "application/json",
      },
    });

    return res.json({
      result: response.text,
      usage: response.usageMetadata ?? null,
    });
  } catch (error) {
    console.error("Gemini identify-pet failed:", error);
    return res.status(500).json({
      error: "Failed to identify the pet image.",
      details: error instanceof Error ? error.message : "Unknown error",
    });
  }
});

app.listen(PORT, () => {
  console.log(`Identify backend listening on http://localhost:${PORT}`);
});

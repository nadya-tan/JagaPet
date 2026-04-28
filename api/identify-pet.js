import multer from "multer";
import { GoogleGenAI } from "@google/genai";

const upload = multer({ storage: multer.memoryStorage() });

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

function runMiddleware(req, res, fn) {
  return new Promise((resolve, reject) => {
    fn(req, res, (result) => {
      if (result instanceof Error) {
        reject(result);
        return;
      }

      resolve(result);
    });
  });
}

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    await runMiddleware(req, res, upload.single("image"));

    const file = req.file;
    if (!file) {
      return res.status(400).json({ error: "Please upload an image file." });
    }

    if (!file.mimetype?.startsWith("image/")) {
      return res
        .status(400)
        .json({ error: "The uploaded file must be an image." });
    }

    const geminiApiKey = process.env.GEMINI_API_KEY;
    if (!geminiApiKey) {
      return res.status(500).json({
        error: "Missing GEMINI_API_KEY. Add it to your environment variables.",
      });
    }

    const geminiModel = process.env.GEMINI_MODEL || "gemini-2.5-flash-lite";
    const ai = new GoogleGenAI({ apiKey: geminiApiKey });

    const response = await ai.models.generateContent({
      model: geminiModel,
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

    return res.status(200).json({
      result: response.text,
      usage: response.usageMetadata ?? null,
    });
  } catch (error) {
    console.error("Vercel identify-pet failed:", error);

    return res.status(500).json({
      error: "Failed to identify the pet image.",
      details: error instanceof Error ? error.message : "Unknown error",
    });
  }
}

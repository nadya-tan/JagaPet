import "dotenv/config";
import { IncomingForm, type File } from "formidable";
import fs from "fs/promises";
import { GoogleGenAI } from "@google/genai";

export const config = {
  api: {
    bodyParser: false,
  },
};

const GEMINI_MODEL = process.env.GEMINI_MODEL || "gemini-2.5-flash-lite";
const GEMINI_API_KEY = process.env.GEMINI_API_KEY;

const identifyPrompt = `Identify the aquatic pet in this image.

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

const allowedPredictions = new Set([
  "Bacterial red disease",
  "Aeromonas infection",
  "Bacterial gill disease",
  "Winter fungus/Cotton wool disease",
  "Healthy",
  "Parasitesic diseases",
  "Fin rot",
]);

const getSingleFile = (file: File | File[] | undefined) => {
  if (!file) return null;
  return Array.isArray(file) ? file[0] : file;
};

const parseForm = (req: any) => {
  return new Promise<{ files: Record<string, File | File[] | undefined> }>(
    (resolve, reject) => {
      const form = new IncomingForm({
        multiples: false,
        maxFileSize: 10 * 1024 * 1024,
      });

      form.parse(req, (error, _fields, files) => {
        if (error) {
          reject(error);
          return;
        }

        resolve({ files });
      });
    },
  );
};

const getAction = (req: any) => {
  const queryAction = req.query?.action;

  if (Array.isArray(queryAction)) {
    return queryAction[0];
  }

  if (queryAction) {
    return queryAction;
  }

  const url = new URL(req.url || "", "http://localhost");
  return url.searchParams.get("action");
};

const getUploadedImage = async (req: any) => {
  const { files } = await parseForm(req);

  const uploadedFile =
    getSingleFile(files.image) ||
    getSingleFile(files.img) ||
    getSingleFile(files.file);

  if (!uploadedFile) {
    return null;
  }

  const buffer = await fs.readFile(uploadedFile.filepath);

  return {
    file: uploadedFile,
    buffer,
  };
};

const handleIdentifyPet = async (req: any, res: any) => {
  const uploaded = await getUploadedImage(req);

  if (!uploaded) {
    return res.status(400).json({ error: "Please upload an image file." });
  }

  const { file, buffer } = uploaded;

  if (!file.mimetype?.startsWith("image/")) {
    return res.status(400).json({
      error: "The uploaded file must be an image.",
    });
  }

  if (!GEMINI_API_KEY) {
    return res.status(500).json({
      error: "Missing GEMINI_API_KEY. Add it to your environment variables.",
    });
  }

  const ai = new GoogleGenAI({ apiKey: GEMINI_API_KEY });

  const response = await ai.models.generateContent({
    model: GEMINI_MODEL,
    contents: [
      {
        inlineData: {
          mimeType: file.mimetype,
          data: buffer.toString("base64"),
        },
      },
      { text: identifyPrompt },
    ],
    config: {
      responseMimeType: "application/json",
    },
  });

  return res.status(200).json({
    result: response.text,
    usage: response.usageMetadata ?? null,
  });
};

const handleScreenHealth = async (req: any, res: any) => {
  const modelUrl = process.env.FISH_DISEASE_MODEL_URL;

  if (!modelUrl) {
    return res.status(500).json({
      error: "Fish disease model URL is not configured.",
    });
  }

  const uploaded = await getUploadedImage(req);

  if (!uploaded) {
    return res.status(400).json({ error: "No image uploaded." });
  }

  const { file, buffer } = uploaded;

  if (!file.mimetype?.startsWith("image/")) {
    return res.status(400).json({
      error: "The uploaded file must be an image.",
    });
  }

  const formData = new FormData();

  const blob = new Blob([new Uint8Array(buffer)], {
    type: file.mimetype || "application/octet-stream",
  });

  formData.append("file", blob, file.originalFilename || "pet.jpg");

  const modelResponse = await fetch(modelUrl, {
    method: "POST",
    body: formData,
  });

  const responseText = await modelResponse.text();

  if (!modelResponse.ok) {
    console.error("Health screening model failed:", {
      status: modelResponse.status,
      responseText,
    });

    return res.status(502).json({
      error: "Failed to screen the pet health image.",
    });
  }

  let prediction = responseText.trim().replace(/^"|"$/g, "");

  try {
    const parsed = JSON.parse(responseText);

    if (typeof parsed === "string") {
      prediction = parsed;
    } else {
      prediction =
        parsed.result ||
        parsed.prediction ||
        parsed.class ||
        parsed.label ||
        prediction;
    }
  } catch {
    // Model returned plain string, so keep prediction as responseText.
  }

  if (!allowedPredictions.has(prediction)) {
    console.error("Unexpected health model prediction:", prediction);

    return res.status(502).json({
      error: "The health screening model returned an unknown result.",
    });
  }

  return res.status(200).json({
    result: prediction,
  });
};

export default async function handler(req: any, res: any) {
  try {
    if (req.method !== "POST") {
      return res.status(405).json({ error: "Method not allowed" });
    }

    const action = getAction(req);

    if (action === "identify-pet") {
      return await handleIdentifyPet(req, res);
    }

    if (action === "screen-health") {
      return await handleScreenHealth(req, res);
    }

    return res.status(400).json({
      error:
        "Invalid action. Use ?action=identify-pet or ?action=screen-health.",
    });
  } catch (error) {
    console.error("Pet analysis API failed:", error);

    return res.status(500).json({
      error: "Internal server error.",
      details: error instanceof Error ? error.message : "Unknown error",
    });
  }
}

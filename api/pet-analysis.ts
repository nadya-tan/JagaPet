import "dotenv/config";
import { IncomingForm, type File } from "formidable";
import fs from "fs/promises";
import { GoogleGenAI } from "@google/genai";

/* ===================== API configuration ===================== */
// Disable default body parser because we handle file upload manually
export const config = {
  api: {
    bodyParser: false,
  },
};

/* ===================== Environment variables ===================== */
// Gemini model selection (default fallback model if not provided)
const GEMINI_MODEL = process.env.GEMINI_MODEL || "gemini-2.5-flash-lite";

// Gemini API key for AI image analysis
const GEMINI_API_KEY = process.env.GEMINI_API_KEY;

/* ===================== Prompt for AI image identification ===================== */
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

/* ===================== Allowed health prediction labels ===================== */
// Strict whitelist to ensure model output is controlled and safe
const allowedPredictions = new Set([
  "Bacterial red disease",
  "Aeromonas infection",
  "Bacterial gill disease",
  "Winter fungus/Cotton wool disease",
  "Healthy",
  "Parasitic diseases",
  "Fin rot",
]);

/* ===================== Helper function: Get single uploaded file ===================== */
const getSingleFile = (file: File | File[] | undefined) => {
  /*
    Normalize file input (formidable may return single file or array).

    input:
      file - uploaded file or array of files

    output:
      single file or null
  */

  if (!file) return null;

  // If multiple files, take first one
  return Array.isArray(file) ? file[0] : file;
};

/* ===================== Helper function: Parse multipart form ===================== */
const parseForm = (req: any) => {
  /*
    Parse incoming multipart/form-data request.

    output:
      files object containing uploaded files
  */

  return new Promise<{ files: Record<string, File | File[] | undefined> }>(
    (resolve, reject) => {
      // Create form parser
      const form = new IncomingForm({
        multiples: false,
        maxFileSize: 10 * 1024 * 1024, // 10MB limit
      });

      // Parse request
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

/* ===================== Helper function: Extract action parameter ===================== */
const getAction = (req: any) => {
  /*
    Extract API action type from query string.

    supported actions:
      - identify-pet
      - screen-health
  */

  const queryAction = req.query?.action;

  // If array, take first element
  if (Array.isArray(queryAction)) {
    return queryAction[0];
  }

  // If single value exists
  if (queryAction) {
    return queryAction;
  }

  // Fallback: parse from URL manually
  const url = new URL(req.url || "", "http://localhost");
  return url.searchParams.get("action");
};

/* ===================== Helper function: Get uploaded image ===================== */
const getUploadedImage = async (req: any) => {
  /*
    Extract uploaded image file from request.

    output:
      {
        file - file metadata
        buffer - image binary buffer
      }
  */

  // Parse form data
  const { files } = await parseForm(req);

  // Try different field names for uploaded file
  const uploadedFile =
    getSingleFile(files.image) ||
    getSingleFile(files.img) ||
    getSingleFile(files.file);

  // If no file uploaded
  if (!uploadedFile) {
    return null;
  }

  // Read file into memory buffer
  const buffer = await fs.readFile(uploadedFile.filepath);

  return {
    file: uploadedFile,
    buffer,
  };
};

/* ===================== Feature: AI pet identification ===================== */
const handleIdentifyPet = async (req: any, res: any) => {
  /*
    Use Google Gemini AI to identify aquatic pet species from image.

    input:
      image file upload

    output:
      AI generated JSON result
  */

  // Get uploaded image
  const uploaded = await getUploadedImage(req);

  // Validate image exists
  if (!uploaded) {
    return res.status(400).json({ error: "Please upload an image file." });
  }

  const { file, buffer } = uploaded;

  // Validate file type is image
  if (!file.mimetype?.startsWith("image/")) {
    return res.status(400).json({
      error: "The uploaded file must be an image.",
    });
  }

  // Check API key availability
  if (!GEMINI_API_KEY) {
    return res.status(500).json({
      error: "Missing GEMINI_API_KEY. Add it to your environment variables.",
    });
  }

  // Initialize Gemini AI client
  const ai = new GoogleGenAI({ apiKey: GEMINI_API_KEY });

  // Send image + prompt to AI model
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

  // Return AI result
  return res.status(200).json({
    result: response.text,
    usage: response.usageMetadata ?? null,
  });
};

/* ===================== Feature: Fish health screening ===================== */
const handleScreenHealth = async (req: any, res: any) => {
  /*
    Send image to external ML model for fish disease detection.

    output:
      predicted disease label
  */

  // Get model endpoint from environment
  const modelUrl = process.env.FISH_DISEASE_MODEL_URL;

  // Validate model URL exists
  if (!modelUrl) {
    return res.status(500).json({
      error: "Fish disease model URL is not configured.",
    });
  }

  // Get uploaded image
  const uploaded = await getUploadedImage(req);

  // Validate upload exists
  if (!uploaded) {
    return res.status(400).json({ error: "No image uploaded." });
  }

  const { file, buffer } = uploaded;

  // Validate image type
  if (!file.mimetype?.startsWith("image/")) {
    return res.status(400).json({
      error: "The uploaded file must be an image.",
    });
  }

  // Prepare form data for external model
  const formData = new FormData();

  // Convert buffer into blob for upload
  const blob = new Blob([new Uint8Array(buffer)], {
    type: file.mimetype || "application/octet-stream",
  });

  // Attach file
  formData.append("file", blob, file.originalFilename || "pet.jpg");

  // Call external ML model API
  const modelResponse = await fetch(modelUrl, {
    method: "POST",
    body: formData,
  });

  // Read response text
  const responseText = await modelResponse.text();

  // Handle API failure
  if (!modelResponse.ok) {
    console.error("Health screening model failed:", {
      status: modelResponse.status,
      responseText,
    });

    return res.status(502).json({
      error: "Failed to screen the pet health image.",
    });
  }

  let parsed: any;

  try {
    parsed = JSON.parse(responseText);
  } catch {
    console.error("Invalid JSON from health model:", responseText);

    return res.status(502).json({
      error: "The health screening model returned an invalid response.",
    });
  }

  const status = parsed.status;
  const results = parsed.result;

  if (!Array.isArray(results) || results.length === 0) {
    console.error("Invalid health model result format:", parsed);

    return res.status(502).json({
      error: "The health screening model returned an invalid result format.",
    });
  }

  for (const item of results) {
    if (
      !item ||
      typeof item.disease !== "string" ||
      typeof item.confidence !== "number"
    ) {
      console.error("Invalid prediction item:", item);

      return res.status(502).json({
        error: "The health screening model returned malformed predictions.",
      });
    }

    if (!allowedPredictions.has(item.disease)) {
      console.error("Unexpected health model prediction:", item.disease);

      return res.status(502).json({
        error: "The health screening model returned an unknown result.",
      });
    }
  }

  return res.status(200).json({
    status,
    result: results,
  });
};

/* ===================== Main API router ===================== */
export default async function handler(req: any, res: any) {
  /*
    Main API entry point for pet image analysis.

    supported actions:
      - identify-pet   (AI species identification)
      - screen-health  (disease detection model)
  */

  try {
    // Only allow POST requests
    if (req.method !== "POST") {
      return res.status(405).json({ error: "Method not allowed" });
    }

    // Extract action type
    const action = getAction(req);

    // Route to AI identification feature
    if (action === "identify-pet") {
      return await handleIdentifyPet(req, res);
    }

    // Route to health screening feature
    if (action === "screen-health") {
      return await handleScreenHealth(req, res);
    }

    // Invalid action fallback
    return res.status(400).json({
      error:
        "Invalid action. Use ?action=identify-pet or ?action=screen-health.",
    });
  } catch (error) {
    // Log unexpected server error
    console.error("Pet analysis API failed:", error);

    // Return generic server error
    return res.status(500).json({
      error: "Internal server error.",
      details: error instanceof Error ? error.message : "Unknown error",
    });
  }
}

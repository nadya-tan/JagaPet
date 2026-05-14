import React, { useRef, useState } from "react";
import { Link } from "react-router";
import {
  Camera,
  CheckCircle,
  AlertTriangle,
  Image as ImageIcon,
  Loader2,
  HeartPulse,
  BookOpen,
  ArrowRight,
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { useHealthScreening } from "../context/HealthScreeningContext";
import { useLanguage } from "../context/LanguageContext";
import { TranslatedText } from "../components/TranslatedText";

/* ===================== Type Definitions ===================== */

// Response format from health screening API
type HealthScreenResponse = {
  result?: string;
  error?: string;
};

// Structured result for pet identification
type PetIdentificationResult = {
  scientific_name?: string;
  common_name?: string;
  confidence?: string;
  notes?: string;
};

// Response format from pet identification API
type PetIdentificationResponse = {
  result?: string | PetIdentificationResult;
  error?: string;
};

// Species data structure used for matching
type SpeciesOption = {
  petId?: string;
  pet_id?: string;
  name?: string | null;
  pet_vernacular_name?: string | null;
  scientificName?: string | null;
  pet_scientific_name?: string | null;
};

/* ===================== Utility Functions ===================== */

// Normalize text for consistent comparison (case/spacing insensitive)
function normalizeText(value: string | null | undefined) {
  return String(value || "")
    .trim()
    .toLowerCase()
    .replace(/\s+/g, " ");
}

// Get species ID with fallback field names
function getSpeciesPetId(species: SpeciesOption) {
  return species.petId || species.pet_id || null;
}

// Get scientific name with fallback fields
function getSpeciesScientificName(species: SpeciesOption) {
  return species.scientificName || species.pet_scientific_name || null;
}

// Get common name with fallback fields
function getSpeciesCommonName(species: SpeciesOption) {
  return species.name || species.pet_vernacular_name || null;
}

// Convert uploaded file into base64 data URL for preview
function fileToDataUrl(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();

    reader.onload = () => {
      resolve(String(reader.result));
    };

    reader.onerror = () => {
      reject(new Error("Could not read image file."));
    };

    reader.readAsDataURL(file);
  });
}

// Parse API result safely into structured object
function parseIdentificationResult(
  rawResult: PetIdentificationResponse["result"],
): PetIdentificationResult | null {
  if (!rawResult) return null;

  // If already object, return directly
  if (typeof rawResult === "object") {
    return rawResult;
  }

  // Attempt JSON parsing if string
  try {
    const cleanedResult = rawResult
      .trim()
      .replace(/^```json\s*|```$/gim, "")
      .trim();

    return JSON.parse(cleanedResult) as PetIdentificationResult;
  } catch {
    return null;
  }
}

// Match identified pet against known species list
function findMatchingSpeciesId(
  identifiedPet: PetIdentificationResult,
  speciesOptions: SpeciesOption[],
) {
  const identifiedScientificName = normalizeText(identifiedPet.scientific_name);
  const identifiedCommonName = normalizeText(identifiedPet.common_name);

  // Reject invalid unknown values
  if (
    !identifiedScientificName ||
    identifiedScientificName === "unknown" ||
    identifiedCommonName === "unknown"
  ) {
    return null;
  }

  // Try matching by scientific name first (more reliable)
  const scientificMatch = speciesOptions.find((species) => {
    return (
      normalizeText(getSpeciesScientificName(species)) ===
      identifiedScientificName
    );
  });

  if (scientificMatch) {
    return getSpeciesPetId(scientificMatch);
  }

  // Fallback: match by common name
  const commonNameMatch = speciesOptions.find((species) => {
    return (
      normalizeText(getSpeciesCommonName(species)) === identifiedCommonName
    );
  });

  if (commonNameMatch) {
    return getSpeciesPetId(commonNameMatch);
  }

  return null;
}

// Generic fetch wrapper with JSON parsing and error handling
async function fetchJson<T>(
  url: string,
  fallbackErrorMessage: string,
  options?: RequestInit,
): Promise<T> {
  const response = await fetch(url, options);
  const data = (await response.json().catch(() => null)) as
    | T
    | {
        error?: string;
      }
    | null;

  if (!response.ok) {
    throw new Error(
      data && typeof data === "object" && "error" in data && data.error
        ? data.error
        : fallbackErrorMessage,
    );
  }

  return data as T;
}

/* ===================== Main Component ===================== */

export function HealthScreening() {
  // Language context for localization
  const { t, language } = useLanguage();

  // Drag state for upload UI
  const [dragActive, setDragActive] = useState(false);

  // Screening loading state
  const [isScreening, setIsScreening] = useState(false);

  // Global screening state from context
  const { screening, setScreening, resetScreening } = useHealthScreening();

  // Destructure screening state
  const {
    selectedImage,
    selectedFileName,
    result,
    matchedCareGuidePetId,
    careGuideLookupDone,
    error,
  } = screening;

  // File input reference
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  /* ===================== Reset Form ===================== */

  const resetForm = () => {
    resetScreening();
    setIsScreening(false);

    // Clear file input value
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  /* ===================== API Calls ===================== */

  // Run health screening model on uploaded image
  const runHealthScreening = async (file: File) => {
    const formData = new FormData();
    formData.append("image", file);

    const response = await fetch("/api/pet-analysis?action=screen-health", {
      method: "POST",
      body: formData,
    });

    const data = (await response.json()) as HealthScreenResponse;

    if (!response.ok) {
      throw new Error(
        data.error || t("healthScreening.errors.screeningRequestFailed"),
      );
    }

    if (!data.result) {
      throw new Error(t("healthScreening.errors.emptyScreeningResult"));
    }

    return data.result;
  };

  // Identify pet species from image and match with database
  const findCareGuidePetIdFromImage = async (file: File) => {
    try {
      const identifyFormData = new FormData();
      identifyFormData.append("image", file);

      // Call identification API
      const identificationResponse = await fetch(
        "/api/pet-analysis?action=identify-pet",
        {
          method: "POST",
          body: identifyFormData,
        },
      );

      const identificationData =
        (await identificationResponse.json()) as PetIdentificationResponse;

      if (!identificationResponse.ok) {
        console.warn("Pet identification failed:", identificationData.error);
        return null;
      }

      // Parse structured result
      const identifiedPet = parseIdentificationResult(
        identificationData.result,
      );

      if (!identifiedPet) {
        return null;
      }

      // Fetch species database
      const speciesOptions = await fetchJson<SpeciesOption[]>(
        "/api/species",
        t("healthScreening.errors.loadSpeciesFailed"),
      );

      // Match result to internal database
      return findMatchingSpeciesId(identifiedPet, speciesOptions);
    } catch (lookupError) {
      console.warn(
        "Could not match identified pet to local database:",
        lookupError,
      );
      return null;
    }
  };

  /* ===================== Core Screening Flow ===================== */

  const handleImageAnalysis = async (file: File) => {
    // Reset previous result state
    setScreening((previous) => ({
      ...previous,
      result: null,
      matchedCareGuidePetId: null,
      careGuideLookupDone: false,
      error: null,
    }));

    setIsScreening(true);

    try {
      // Run health screening and identification in parallel
      const [healthResult, careGuidePetId] = await Promise.all([
        runHealthScreening(file),
        findCareGuidePetIdFromImage(file),
      ]);

      // Save results
      setScreening((previous) => ({
        ...previous,
        result: healthResult,
        matchedCareGuidePetId: careGuidePetId,
        careGuideLookupDone: true,
        error: null,
      }));
    } catch (screeningError) {
      const message =
        screeningError instanceof Error
          ? screeningError.message
          : t("healthScreening.errors.screeningFailed");

      setScreening((previous) => ({
        ...previous,
        result: null,
        matchedCareGuidePetId: null,
        careGuideLookupDone: true,
        error: message,
      }));
    } finally {
      setIsScreening(false);
    }
  };

  /* ===================== File Handling ===================== */

  const handleFile = async (file: File | null | undefined) => {
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith("image/")) {
      setScreening((previous) => ({
        ...previous,
        error: t("healthScreening.errors.invalidFileType"),
      }));
      return;
    }

    try {
      // Convert image for preview
      const imageDataUrl = await fileToDataUrl(file);

      // Store initial state
      setScreening({
        selectedImage: imageDataUrl,
        selectedFileName: file.name,
        result: null,
        matchedCareGuidePetId: null,
        careGuideLookupDone: false,
        error: null,
      });

      // Run analysis
      await handleImageAnalysis(file);
    } catch {
      setScreening((previous) => ({
        ...previous,
        error: t("healthScreening.errors.readFileFailed"),
      }));
    }
  };

  /* ===================== Drag & Drop ===================== */

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();

    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = async (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    await handleFile(e.dataTransfer.files?.[0]);
  };

  const handleInputChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    await handleFile(e.target.files?.[0]);
  };

  /* ===================== Derived State ===================== */

  const isHealthy = normalizeText(result) === "healthy";
  const displayResult = isHealthy
    ? t("healthScreening.results.healthy")
    : result;

  /* ===================== UI ===================== */

  return (
    <div className="bg-stone-50 min-h-screen py-12 px-4 sm:px-6 lg:px-8 font-sans">
      <div className="max-w-3xl mx-auto">
        {/* Page Header */}
        <div className="text-center mb-10">
          <h1 className="text-4xl font-extrabold text-stone-900 mb-4 tracking-tight">
            {t("healthScreening.title")}
          </h1>

          <p className="text-lg text-stone-600 max-w-2xl mx-auto leading-relaxed">
            {t("healthScreening.description")}
          </p>
        </div>

        {/* Upload / Result Container */}
        <div className="bg-white rounded-3xl shadow-xl border border-stone-100 overflow-hidden">
          {/* Hidden file input */}
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            className="hidden"
            onChange={handleInputChange}
          />

          <AnimatePresence mode="wait">
            {/* ===================== Upload State ===================== */}
            {!selectedImage && !result && (
              <motion.div
                key="upload"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className={`p-12 text-center border-4 border-dashed m-6 rounded-2xl transition-colors ${
                  dragActive
                    ? "border-amber-500 bg-amber-50"
                    : "border-stone-200 hover:bg-stone-50"
                }`}
                onDragEnter={handleDrag}
                onDragLeave={handleDrag}
                onDragOver={handleDrag}
                onDrop={handleDrop}
              >
                {/* Upload icon */}
                <div className="mx-auto w-24 h-24 mb-6 bg-amber-100 rounded-full flex items-center justify-center">
                  <HeartPulse className="w-12 h-12 text-amber-600" />
                </div>

                {/* Upload text */}
                <h3 className="text-2xl font-bold text-stone-800 mb-2">
                  {t("healthScreening.uploadTitle")}
                </h3>

                <p className="text-stone-500 mb-8">
                  {t("healthScreening.uploadDescription")}
                </p>

                {/* File select button */}
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="bg-amber-600 hover:bg-amber-700 text-white px-8 py-4 rounded-full font-bold shadow-lg transition-all transform hover:-translate-y-1 inline-flex items-center gap-2"
                >
                  <Camera className="w-5 h-5" />{" "}
                  {t("healthScreening.selectPhoto")}
                </button>

                {/* Supported formats */}
                <p className="text-xs text-stone-400 mt-4 uppercase tracking-widest font-semibold">
                  {t("healthScreening.supportedFormats")}
                </p>

                {/* Upload error */}
                {error && (
                  <p className="mt-4 text-sm text-rose-600 font-medium">
                    <TranslatedText text={error} language={language} />
                  </p>
                )}
              </motion.div>
            )}

            {/* ===================== Loading State ===================== */}
            {selectedImage && isScreening && (
              <motion.div
                key="screening"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0 }}
                className="p-12 flex flex-col items-center justify-center min-h-[400px]"
              >
                {/* Preview image */}
                <div className="relative w-64 h-64 mb-8 rounded-2xl overflow-hidden shadow-2xl">
                  <img
                    src={selectedImage}
                    alt={t("healthScreening.screeningAlt")}
                    className="w-full h-full object-fit"
                  />
                  <div className="absolute inset-0 bg-amber-500/20 scan-line"></div>
                </div>

                {/* Loading spinner */}
                <Loader2 className="w-10 h-10 text-amber-600 animate-spin mb-4" />

                <h3 className="text-2xl font-bold text-stone-800">
                  {t("healthScreening.screeningPhoto")}
                </h3>

                <p className="text-stone-500">
                  {t("healthScreening.screeningDescription")}
                </p>
              </motion.div>
            )}

            {/* ===================== Result State ===================== */}
            {selectedImage && !isScreening && (result || error) && (
              <motion.div
                key="result"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="p-8"
              >
                <div className="flex flex-col md:flex-row gap-8 items-start">
                  {/* Left: Image preview */}
                  <div className="w-full md:w-1/3">
                    {selectedImage ? (
                      <img
                        src={selectedImage}
                        alt={
                          selectedFileName || t("healthScreening.uploadedAlt")
                        }
                        className="w-full aspect-square object-fit rounded-2xl shadow-md border-4 border-white mb-4"
                      />
                    ) : (
                      <div className="w-full aspect-square rounded-2xl border-2 border-dashed border-stone-200 bg-stone-50 flex items-center justify-center text-center px-4 mb-4">
                        <p className="text-sm text-stone-500">
                          {t("healthScreening.restoredResultNoPreview")}
                        </p>
                      </div>
                    )}

                    {/* File name */}
                    {selectedFileName && (
                      <p className="text-sm text-stone-500 mb-4 truncate">
                        {selectedFileName}
                      </p>
                    )}

                    {/* Reset button */}
                    <button
                      type="button"
                      onClick={resetForm}
                      className="w-full py-3 text-stone-500 hover:text-stone-800 font-medium flex items-center justify-center gap-2 transition-colors border border-stone-200 rounded-xl hover:bg-stone-50"
                    >
                      <ImageIcon className="w-4 h-4" />{" "}
                      {t("healthScreening.tryAnother")}
                    </button>
                  </div>

                  {/* Right: Result content */}
                  <div className="w-full md:w-2/3 space-y-6">
                    {/* Error box */}
                    {error && (
                      <div className="p-4 rounded-xl border-l-4 bg-rose-50 border-rose-500 text-rose-800">
                        <div className="flex gap-3">
                          <AlertTriangle className="w-6 h-6 shrink-0 mt-0.5" />
                          <div>
                            <h4 className="font-bold mb-1">
                              {t("healthScreening.healthScreeningUnavailable")}
                            </h4>
                            <p className="text-sm opacity-90">
                              <TranslatedText
                                text={error}
                                language={language}
                              />
                            </p>
                          </div>
                        </div>
                      </div>
                    )}

                    {/* Result display */}
                    {result && (
                      <>
                        {/* Result header */}
                        <div>
                          <div className="flex items-center gap-3 mb-2">
                            <CheckCircle className="text-amber-500 w-6 h-6" />
                            <span className="text-amber-700 font-bold uppercase tracking-wider text-sm">
                              {t("healthScreening.resultTitle")}
                            </span>
                          </div>

                          <h2 className="text-3xl font-extrabold text-stone-900">
                            <TranslatedText
                              text={displayResult}
                              language={language}
                            />
                          </h2>
                        </div>

                        {/* Interpretation box */}
                        <div
                          className={`p-4 rounded-xl border-l-4 ${
                            isHealthy
                              ? "bg-emerald-50 border-emerald-500 text-emerald-800"
                              : "bg-amber-50 border-amber-500 text-amber-800"
                          }`}
                        >
                          <div className="flex gap-3">
                            <AlertTriangle className="w-6 h-6 shrink-0 mt-0.5" />
                            <div>
                              <h4 className="font-bold mb-1">
                                {isHealthy
                                  ? t("healthScreening.noDiseaseClassDetected")
                                  : t(
                                      "healthScreening.possibleDiseaseClassDetected",
                                    )}
                              </h4>
                              <p className="text-sm opacity-90">
                                {t("healthScreening.aiScreeningDisclaimer")}
                              </p>
                            </div>
                          </div>
                        </div>

                        {/* Care guide link or fallback message */}
                        <div className="pt-2">
                          {matchedCareGuidePetId ? (
                            <Link
                              to={`/care-guide/${encodeURIComponent(
                                matchedCareGuidePetId,
                              )}`}
                              className="w-full bg-emerald-600 hover:bg-emerald-700 text-white py-3 px-4 rounded-xl font-bold text-center transition-colors inline-flex items-center justify-center gap-2 shadow-md"
                            >
                              <BookOpen className="w-5 h-5" />
                              {t("healthScreening.viewCareGuide")}
                              <ArrowRight className="w-5 h-5" />
                            </Link>
                          ) : careGuideLookupDone ? (
                            <p className="text-sm text-stone-500 bg-stone-50 border border-stone-200 rounded-xl p-3">
                              {t("healthScreening.noMatchingCareGuide")}
                            </p>
                          ) : null}
                        </div>
                      </>
                    )}
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* Scan animation styling */}
      <style>{`
        @keyframes scan {
          0% { transform: translateY(-100%); }
          100% { transform: translateY(100%); }
        }

        .scan-line {
          animation: scan 2s linear infinite;
          background: linear-gradient(to bottom, transparent, rgba(236, 72, 153, 0.5), transparent);
        }
      `}</style>
    </div>
  );
}

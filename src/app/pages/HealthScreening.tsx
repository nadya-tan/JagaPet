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

type HealthScreenResponse = {
  result?: string;
  error?: string;
};

type PetIdentificationResult = {
  scientific_name?: string;
  common_name?: string;
  confidence?: string;
  notes?: string;
};

type PetIdentificationResponse = {
  result?: string | PetIdentificationResult;
  error?: string;
};

type SpeciesOption = {
  petId?: string;
  pet_id?: string;
  name?: string | null;
  pet_vernacular_name?: string | null;
  scientificName?: string | null;
  pet_scientific_name?: string | null;
};

function normalizeText(value: string | null | undefined) {
  return String(value || "")
    .trim()
    .toLowerCase()
    .replace(/\s+/g, " ");
}

function getSpeciesPetId(species: SpeciesOption) {
  return species.petId || species.pet_id || null;
}

function getSpeciesScientificName(species: SpeciesOption) {
  return species.scientificName || species.pet_scientific_name || null;
}

function getSpeciesCommonName(species: SpeciesOption) {
  return species.name || species.pet_vernacular_name || null;
}

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

function parseIdentificationResult(
  rawResult: PetIdentificationResponse["result"],
): PetIdentificationResult | null {
  if (!rawResult) return null;

  if (typeof rawResult === "object") {
    return rawResult;
  }

  try {
    return JSON.parse(rawResult) as PetIdentificationResult;
  } catch {
    return null;
  }
}

function findMatchingSpeciesId(
  identifiedPet: PetIdentificationResult,
  speciesOptions: SpeciesOption[],
) {
  const identifiedScientificName = normalizeText(identifiedPet.scientific_name);
  const identifiedCommonName = normalizeText(identifiedPet.common_name);

  if (
    !identifiedScientificName ||
    identifiedScientificName === "unknown" ||
    identifiedCommonName === "unknown"
  ) {
    return null;
  }

  const scientificMatch = speciesOptions.find((species) => {
    return (
      normalizeText(getSpeciesScientificName(species)) ===
      identifiedScientificName
    );
  });

  if (scientificMatch) {
    return getSpeciesPetId(scientificMatch);
  }

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

async function fetchJson<T>(url: string, options?: RequestInit): Promise<T> {
  const response = await fetch(url, options);
  const data = await response.json().catch(() => null);

  if (!response.ok) {
    throw new Error(data?.error || "Request failed");
  }

  return data as T;
}

export function HealthScreening() {
  const [dragActive, setDragActive] = useState(false);
  const [isScreening, setIsScreening] = useState(false);

  const { screening, setScreening, resetScreening } = useHealthScreening();

  const {
    selectedImage,
    selectedFileName,
    result,
    matchedCareGuidePetId,
    careGuideLookupDone,
    error,
  } = screening;

  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const resetForm = () => {
    resetScreening();
    setIsScreening(false);

    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const runHealthScreening = async (file: File) => {
    const formData = new FormData();
    formData.append("image", file);

    const response = await fetch("/api/pet-analysis?action=screen-health", {
      method: "POST",
      body: formData,
    });

    const data = (await response.json()) as HealthScreenResponse;

    if (!response.ok) {
      throw new Error(data.error || "Failed to screen the pet health image.");
    }

    if (!data.result) {
      throw new Error("The server returned an empty screening result.");
    }

    return data.result;
  };

  const findCareGuidePetIdFromImage = async (file: File) => {
    try {
      const identifyFormData = new FormData();
      identifyFormData.append("image", file);

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

      const identifiedPet = parseIdentificationResult(
        identificationData.result,
      );

      if (!identifiedPet) {
        return null;
      }

      const speciesOptions = await fetchJson<SpeciesOption[]>("/api/species");

      return findMatchingSpeciesId(identifiedPet, speciesOptions);
    } catch (lookupError) {
      console.warn(
        "Could not match identified pet to local database:",
        lookupError,
      );
      return null;
    }
  };

  const handleImageAnalysis = async (file: File) => {
    setScreening((previous) => ({
      ...previous,
      result: null,
      matchedCareGuidePetId: null,
      careGuideLookupDone: false,
      error: null,
    }));

    setIsScreening(true);

    try {
      const [healthResult, careGuidePetId] = await Promise.all([
        runHealthScreening(file),
        findCareGuidePetIdFromImage(file),
      ]);

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
          : "We couldn't screen this image right now. Please try again.";

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

  const handleFile = async (file: File | null | undefined) => {
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      setScreening((previous) => ({
        ...previous,
        error: "Please choose an image file such as JPG, PNG, or HEIC.",
      }));
      return;
    }

    const imageDataUrl = await fileToDataUrl(file);

    setScreening({
      selectedImage: imageDataUrl,
      selectedFileName: file.name,
      result: null,
      matchedCareGuidePetId: null,
      careGuideLookupDone: false,
      error: null,
    });

    await handleImageAnalysis(file);
  };

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

  const isHealthy = result === "Healthy";

  return (
    <div className="bg-stone-50 min-h-screen py-12 px-4 sm:px-6 lg:px-8 font-sans">
      <div className="max-w-3xl mx-auto">
        <div className="text-center mb-10">
          <h1 className="text-4xl font-extrabold text-stone-900 mb-4 tracking-tight">
            Pet Health Screening
          </h1>
          <p className="text-lg text-stone-600 max-w-2xl mx-auto leading-relaxed">
            Upload a fish photo to screen for visible disease signs using the
            Shell &amp; Fin health screening model.
          </p>
        </div>

        <div className="bg-white rounded-3xl shadow-xl border border-stone-100 overflow-hidden">
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            className="hidden"
            onChange={handleInputChange}
          />

          <AnimatePresence mode="wait">
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
                <div className="mx-auto w-24 h-24 mb-6 bg-amber-100 rounded-full flex items-center justify-center">
                  <HeartPulse className="w-12 h-12 text-amber-600" />
                </div>

                <h3 className="text-2xl font-bold text-stone-800 mb-2">
                  Upload a pet health photo
                </h3>

                <p className="text-stone-500 mb-8">
                  Choose a clear fish photo for health screening.
                </p>

                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="bg-amber-600 hover:bg-amber-700 text-white px-8 py-4 rounded-full font-bold shadow-lg transition-all transform hover:-translate-y-1 inline-flex items-center gap-2"
                >
                  <Camera className="w-5 h-5" /> Select Photo
                </button>

                <p className="text-xs text-stone-400 mt-4 uppercase tracking-widest font-semibold">
                  Supported: JPG, PNG, HEIC
                </p>

                {error && (
                  <p className="mt-4 text-sm text-rose-600 font-medium">
                    {error}
                  </p>
                )}
              </motion.div>
            )}

            {selectedImage && isScreening && (
              <motion.div
                key="screening"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0 }}
                className="p-12 flex flex-col items-center justify-center min-h-[400px]"
              >
                <div className="relative w-64 h-64 mb-8 rounded-2xl overflow-hidden shadow-2xl">
                  <img
                    src={selectedImage}
                    alt="Screening"
                    className="w-full h-full object-fit"
                  />
                  <div className="absolute inset-0 bg-amber-500/20 scan-line"></div>
                </div>

                <Loader2 className="w-10 h-10 text-amber-600 animate-spin mb-4" />

                <h3 className="text-2xl font-bold text-stone-800">
                  Screening Photo...
                </h3>

                <p className="text-stone-500">
                  Sending your image to the health screening model.
                </p>
              </motion.div>
            )}

            {selectedImage && !isScreening && (result || error) && (
              <motion.div
                key="result"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="p-8"
              >
                <div className="flex flex-col md:flex-row gap-8 items-start">
                  <div className="w-full md:w-1/3">
                    {selectedImage ? (
                      <img
                        src={selectedImage}
                        alt={selectedFileName || "Uploaded"}
                        className="w-full aspect-square object-fit rounded-2xl shadow-md border-4 border-white mb-4"
                      />
                    ) : (
                      <div className="w-full aspect-square rounded-2xl border-2 border-dashed border-stone-200 bg-stone-50 flex items-center justify-center text-center px-4 mb-4">
                        <p className="text-sm text-stone-500">
                          Previous screening result restored. Image preview is
                          not saved.
                        </p>
                      </div>
                    )}

                    {selectedFileName && (
                      <p className="text-sm text-stone-500 mb-4 truncate">
                        {selectedFileName}
                      </p>
                    )}

                    <button
                      type="button"
                      onClick={resetForm}
                      className="w-full py-3 text-stone-500 hover:text-stone-800 font-medium flex items-center justify-center gap-2 transition-colors border border-stone-200 rounded-xl hover:bg-stone-50"
                    >
                      <ImageIcon className="w-4 h-4" /> Try another photo
                    </button>
                  </div>

                  <div className="w-full md:w-2/3 space-y-6">
                    {error && (
                      <div className="p-4 rounded-xl border-l-4 bg-rose-50 border-rose-500 text-rose-800">
                        <div className="flex gap-3">
                          <AlertTriangle className="w-6 h-6 shrink-0 mt-0.5" />
                          <div>
                            <h4 className="font-bold mb-1">
                              Health screening unavailable
                            </h4>
                            <p className="text-sm opacity-90">{error}</p>
                          </div>
                        </div>
                      </div>
                    )}

                    {result && (
                      <>
                        <div>
                          <div className="flex items-center gap-3 mb-2">
                            <CheckCircle className="text-amber-500 w-6 h-6" />
                            <span className="text-amber-700 font-bold uppercase tracking-wider text-sm">
                              Health Screening Result
                            </span>
                          </div>

                          <h2 className="text-3xl font-extrabold text-stone-900">
                            {result}
                          </h2>
                        </div>

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
                                  ? "No disease class detected"
                                  : "Possible disease class detected"}
                              </h4>
                              <p className="text-sm opacity-90">
                                This is an AI screening result only. Use it as
                                an early warning, not as a final diagnosis.
                              </p>
                            </div>
                          </div>
                        </div>

                        <div className="pt-2">
                          {matchedCareGuidePetId ? (
                            <Link
                              to={`/care-guide/${encodeURIComponent(
                                matchedCareGuidePetId,
                              )}`}
                              className="w-full bg-emerald-600 hover:bg-emerald-700 text-white py-3 px-4 rounded-xl font-bold text-center transition-colors inline-flex items-center justify-center gap-2 shadow-md"
                            >
                              <BookOpen className="w-5 h-5" />
                              View Care Guide
                              <ArrowRight className="w-5 h-5" />
                            </Link>
                          ) : careGuideLookupDone ? (
                            <p className="text-sm text-stone-500 bg-stone-50 border border-stone-200 rounded-xl p-3">
                              No matching care guide was found in Shell & Fin MY
                              database for this photo. We will continue
                              improving and expanding care guide coverage for
                              health screening results.
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

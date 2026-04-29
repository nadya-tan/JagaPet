import React, { useEffect, useRef, useState } from "react";
import {
  Camera,
  UploadCloud,
  CheckCircle,
  AlertTriangle,
  Image as ImageIcon,
  Loader2,
} from "lucide-react";
import { Link, useLocation } from "react-router";
import { motion, AnimatePresence } from "motion/react";

type IdentificationResult = {
  scientific_name: string;
  common_name: string;
  confidence: string;
  notes: string;
};

type IdentifyApiResponse = {
  result: string;
  usage: unknown;
};

type LocalSpecies = {
  petId: string;
  name: string;
  scientificName: string | null;
  imageUrl: string | null;
  biodiversityRisk: string | null;
};

const normalizeName = (value: string | null | undefined) =>
  (value ?? "")
    .toLowerCase()
    .replace(/\(.*?\)/g, " ")
    .replace(/[^a-z0-9]+/g, " ")
    .trim();

const parseModelResult = (resultText: string): IdentificationResult => {
  const trimmed = resultText.trim();
  const withoutCodeFence = trimmed.replace(/^```json\s*|```$/gim, "").trim();
  const parsed = JSON.parse(withoutCodeFence) as Partial<IdentificationResult>;

  return {
    scientific_name: parsed.scientific_name?.trim() || "Unknown",
    common_name: parsed.common_name?.trim() || "Unknown",
    confidence: parsed.confidence?.trim() || "Unknown",
    notes: parsed.notes?.trim() || "No notes provided.",
  };
};

const findLocalSpecies = (
  analysis: IdentificationResult,
  speciesList: LocalSpecies[],
) => {
  const scientificName = normalizeName(analysis.scientific_name);
  const commonName = normalizeName(analysis.common_name);

  return (
    speciesList.find((species) => {
      const localScientific = normalizeName(species.scientificName);
      const localCommon = normalizeName(species.name);

      return (
        scientificName === localScientific ||
        commonName === localCommon ||
        Boolean(commonName && localCommon.includes(commonName)) ||
        Boolean(commonName && commonName.includes(localCommon)) ||
        Boolean(scientificName && localScientific.includes(scientificName)) ||
        Boolean(scientificName && scientificName.includes(localScientific))
      );
    }) ?? null
  );
};

export function IdentifyPet() {
  const [dragActive, setDragActive] = useState(false);
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [selectedFileName, setSelectedFileName] = useState<string | null>(null);
  const [isScanning, setIsScanning] = useState(false);
  const [result, setResult] = useState<IdentificationResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const autoIdentifyStartedRef = useRef(false);
  const [speciesList, setSpeciesList] = useState<LocalSpecies[]>([]);
  const [speciesError, setSpeciesError] = useState<string | null>(null);
  const location = useLocation();
  const initialImageFile = location.state?.imageFile as File | undefined;

  useEffect(() => {
    const fetchSpecies = async () => {
      try {
        const response = await fetch("/api/species");

        const data = (await response.json()) as
          | LocalSpecies[]
          | {
              error?: string;
            };

        if (!response.ok) {
          throw new Error(
            "error" in data && data.error
              ? data.error
              : "Failed to load species database.",
          );
        }

        if (!Array.isArray(data)) {
          throw new Error("Species database returned an invalid format.");
        }

        setSpeciesList(data);
        setSpeciesError(null);
      } catch (speciesLoadError) {
        setSpeciesError(
          speciesLoadError instanceof Error
            ? speciesLoadError.message
            : "Failed to load species database.",
        );
      }
    };

    fetchSpecies();
  }, []);

  useEffect(() => {
    return () => {
      if (selectedImage) {
        URL.revokeObjectURL(selectedImage);
      }
    };
  }, [selectedImage]);

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();

    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const resetForm = () => {
    if (selectedImage) {
      URL.revokeObjectURL(selectedImage);
    }

    setSelectedImage(null);
    setSelectedFileName(null);
    setResult(null);
    setError(null);
    setIsScanning(false);

    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const handleBackendIdentify = async (file: File) => {
    setError(null);
    setResult(null);
    setIsScanning(true);

    try {
      const formData = new FormData();
      formData.append("image", file);

      const response = await fetch("/api/pet-analysis?action=identify-pet", {
        method: "POST",
        body: formData,
      });

      const data = (await response.json()) as IdentifyApiResponse & {
        error?: string;
      };

      if (!response.ok) {
        throw new Error(data.error || "The identification request failed.");
      }

      if (!data.result) {
        throw new Error("The server returned an empty identification result.");
      }

      setResult(parseModelResult(data.result));
    } catch (uploadError) {
      setError(
        uploadError instanceof Error
          ? uploadError.message
          : "We couldn't identify this image right now. Please try again.",
      );
    } finally {
      setIsScanning(false);
    }
  };

  const handleFile = async (file: File | null | undefined) => {
    if (!file) {
      return;
    }

    if (!file.type.startsWith("image/")) {
      setError("Please choose an image file such as JPG, PNG, or HEIC.");
      return;
    }

    if (selectedImage) {
      URL.revokeObjectURL(selectedImage);
    }

    const objectUrl = URL.createObjectURL(file);
    setSelectedImage(objectUrl);
    setSelectedFileName(file.name);
    await handleBackendIdentify(file);
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

  useEffect(() => {
    if (!initialImageFile || autoIdentifyStartedRef.current) {
      return;
    }

    autoIdentifyStartedRef.current = true;

    handleFile(initialImageFile);

    window.history.replaceState({}, document.title, window.location.pathname);
  }, [initialImageFile]);

  const matchedSpecies = result ? findLocalSpecies(result, speciesList) : null;

  return (
    <div className="bg-stone-50 min-h-screen py-12 px-4 sm:px-6 lg:px-8 font-sans">
      <div className="max-w-3xl mx-auto">
        <div className="text-center mb-10">
          <h1 className="text-4xl font-extrabold text-stone-900 mb-4 tracking-tight">
            Identify a Species
          </h1>
          <p className="text-lg text-stone-600 max-w-2xl mx-auto leading-relaxed">
            Upload a real fish or turtle photo. We&apos;ll send it to the local
            identification service, surface the AI guess, and connect it to
            Shell &amp; Fin MY guidance when we have a local match.
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
            {!selectedImage && (
              <motion.div
                key="upload"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className={`p-12 text-center border-4 border-dashed m-6 rounded-2xl transition-colors ${
                  dragActive
                    ? "border-emerald-500 bg-emerald-50"
                    : "border-stone-200 hover:bg-stone-50"
                }`}
                onDragEnter={handleDrag}
                onDragLeave={handleDrag}
                onDragOver={handleDrag}
                onDrop={handleDrop}
              >
                <div className="mx-auto w-24 h-24 mb-6 bg-emerald-100 rounded-full flex items-center justify-center">
                  <UploadCloud className="w-12 h-12 text-emerald-600" />
                </div>
                <h3 className="text-2xl font-bold text-stone-800 mb-2">
                  Drag &amp; Drop your photo here
                </h3>
                <p className="text-stone-500 mb-8">
                  or click the button below to browse
                </p>

                <button
                  onClick={() => fileInputRef.current?.click()}
                  className="bg-emerald-600 hover:bg-emerald-700 text-white px-8 py-4 rounded-full font-bold shadow-lg transition-all transform hover:-translate-y-1 inline-flex items-center gap-2"
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

            {selectedImage && isScanning && (
              <motion.div
                key="scanning"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0 }}
                className="p-12 flex flex-col items-center justify-center min-h-[400px]"
              >
                <div className="relative w-64 h-64 mb-8 rounded-2xl overflow-hidden shadow-2xl">
                  <img
                    src={selectedImage}
                    alt="Scanning"
                    className="w-full h-full object-fit"
                  />
                  <div className="absolute inset-0 bg-emerald-500/20 scan-line"></div>
                </div>
                <Loader2 className="w-10 h-10 text-emerald-600 animate-spin mb-4" />
                <h3 className="text-2xl font-bold text-stone-800">
                  Analyzing Photo...
                </h3>
                <p className="text-stone-500">
                  Sending your image to the local Gemini-powered backend.
                </p>
              </motion.div>
            )}

            {selectedImage && !isScanning && (result || error) && (
              <motion.div
                key="result"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="p-8"
              >
                <div className="flex flex-col md:flex-row gap-8 items-start">
                  <div className="w-full md:w-1/3">
                    <img
                      src={selectedImage}
                      alt={selectedFileName || "Uploaded"}
                      className="w-full aspect-square object-fit rounded-2xl shadow-md border-4 border-white mb-4"
                    />
                    {selectedFileName && (
                      <p className="text-sm text-stone-500 mb-4 truncate">
                        {selectedFileName}
                      </p>
                    )}
                    <button
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
                              Identification unavailable
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
                            <CheckCircle className="text-emerald-500 w-6 h-6" />
                            <span className="text-emerald-700 font-bold uppercase tracking-wider text-sm">
                              AI Identification Result
                            </span>
                          </div>
                          <h2 className="text-3xl font-extrabold text-stone-900">
                            {result.common_name || "Unknown"}
                          </h2>
                          <p className="text-stone-500 italic font-serif">
                            {result.scientific_name || "Unknown"}
                          </p>
                        </div>

                        <div className="rounded-2xl border border-stone-200 bg-stone-50 p-5">
                          <h3 className="text-lg font-bold text-stone-900 mb-2">
                            Notes
                          </h3>
                          <p className="text-stone-700 text-sm leading-relaxed">
                            {result.notes || "No notes provided."}
                          </p>
                        </div>

                        {matchedSpecies ? (
                          <>
                            <div
                              className={`p-4 rounded-xl border-l-4 ${
                                matchedSpecies.biodiversityRisk === "High"
                                  ? "bg-rose-50 border-rose-500 text-rose-800"
                                  : matchedSpecies.biodiversityRisk === "Medium"
                                    ? "bg-amber-50 border-amber-500 text-amber-800"
                                    : "bg-emerald-50 border-emerald-500 text-emerald-800"
                              }`}
                            >
                              <div className="flex gap-3">
                                <AlertTriangle className="w-6 h-6 shrink-0 mt-0.5" />
                                <div>
                                  <h4 className="font-bold mb-1">
                                    {matchedSpecies.biodiversityRisk ||
                                      "Unknown"}{" "}
                                    Biodiversity Risk
                                  </h4>
                                  <p className="text-sm opacity-90">
                                    This risk level is based on the invasive
                                    risk information in Shell & Fin pet
                                    database.
                                  </p>
                                </div>
                              </div>
                            </div>

                            <Link
                              to={`/species/${matchedSpecies.petId}`}
                              className="block text-center w-full bg-emerald-600 hover:bg-emerald-700 text-white py-4 rounded-xl font-bold transition shadow-lg"
                            >
                              View Species Profile
                            </Link>
                          </>
                        ) : (
                          <div className="p-4 rounded-xl border border-dashed border-amber-300 bg-amber-50 text-amber-900">
                            <h4 className="font-bold mb-1">
                              Needs human review
                            </h4>
                            <p className="text-sm opacity-90">
                              We couldn&apos;t confidently map this AI result to
                              a local Shell &amp; Fin MY species profile yet, so
                              the care and biodiversity cards are intentionally
                              hidden for manual review.
                            </p>
                          </div>
                        )}
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
          background: linear-gradient(to bottom, transparent, rgba(16, 185, 129, 0.5), transparent);
        }
      `}</style>
    </div>
  );
}

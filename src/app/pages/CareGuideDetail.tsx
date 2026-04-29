import React, { useEffect, useState } from "react";
import { useParams, Link, Navigate, useNavigate } from "react-router";
import {
  ArrowLeft,
  Utensils,
  Droplets,
  Thermometer,
  ChevronDown,
  ChevronUp,
  Fish,
  Scale,
  Ruler,
  Calendar,
  Beaker,
  Activity,
  AlertCircle,
  CheckCircle2,
  XCircle,
  Users,
  Home,
  Clock,
  Heart,
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { getPetCommonNames } from "../utils/petDisplay";

type CommonIllness = {
  name: string;
  symptoms: string;
  treatment: string;
};

type CareGuide = {
  petId: string;
  name: string;
  scientificName: string | null;
  vernacularName: string | null;

  maxLength: string | null;
  maxWeight: string | null;
  longevity: string | null;
  careLevel: string | null;

  temperature: string | null;
  baskingTemp: string | null;
  phRange: string | null;
  waterHardness: string | null;
  waterDepth: string | null;
  tankSize: string | null;

  feedingFreq: string | null;
  waterChangeFreq: string | null;
  dietDetails: string | null;

  tankRequirements: string | null;
  tankMates: string | null;

  healthSigns: string[];
  sicknessSigns: string[];
  commonIllness: CommonIllness[];
};

async function fetchJson<T>(url: string): Promise<T> {
  const response = await fetch(url);
  const data = await response.json().catch(() => null);

  if (!response.ok) {
    throw new Error(data?.error || "Request failed");
  }

  return data as T;
}

export function CareGuideDetail() {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();

  const [careGuide, setCareGuide] = useState<CareGuide | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const petId = id;

    if (!petId) {
      setError("Missing pet id.");
      setLoading(false);
      return;
    }

    async function loadCareGuide(currentPetId: string) {
      try {
        setLoading(true);
        setError("");

        const data = await fetchJson<CareGuide>(
          `/api/care-guide?petId=${encodeURIComponent(currentPetId)}`,
        );

        setCareGuide(data);
      } catch (error) {
        console.error(error);
        setError("Could not load care guide.");
      } finally {
        setLoading(false);
      }
    }

    loadCareGuide(petId);
  }, [id]);

  if (loading) {
    return <div className="p-8">Loading care guide...</div>;
  }

  if (error || !careGuide) {
    return <Navigate to="/profile" replace />;
  }

  const commonNames = getPetCommonNames({
    pet_vernacular_name: careGuide.vernacularName,
    pet_scientific_name: careGuide.scientificName,
  } as any);

  interface AccordionSectionProps {
    title: string;
    icon: React.ReactNode;
    color: string;
    children: React.ReactNode;
    defaultOpen?: boolean;
  }

  function AccordionSection({
    title,
    icon,
    color,
    children,
    defaultOpen = false,
  }: AccordionSectionProps) {
    const [isOpen, setIsOpen] = useState(defaultOpen);

    const colorClasses: Record<string, string> = {
      emerald: "bg-emerald-500 border-emerald-200",
      blue: "bg-blue-500 border-blue-200",
      purple: "bg-purple-500 border-purple-200",
      amber: "bg-amber-500 border-amber-200",
      rose: "bg-rose-500 border-rose-200",
      teal: "bg-teal-500 border-teal-200",
    };

    return (
      <div className="bg-white rounded-2xl shadow-lg overflow-hidden border border-stone-200">
        <button
          onClick={() => setIsOpen(!isOpen)}
          className={`w-full ${colorClasses[color]} text-white p-5 flex items-center justify-between hover:opacity-90 transition-opacity`}
        >
          <div className="flex items-center gap-3">
            {icon}
            <h2 className="text-2xl font-bold">{title}</h2>
          </div>
          {isOpen ? (
            <ChevronUp className="w-6 h-6" />
          ) : (
            <ChevronDown className="w-6 h-6" />
          )}
        </button>

        <AnimatePresence>
          {isOpen && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.3 }}
              className="overflow-hidden"
            >
              <div className="p-6">{children}</div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    );
  }

  return (
    <div className="bg-gradient-to-br from-stone-100 to-stone-50 min-h-screen py-8 px-4 font-sans">
      <div className="max-w-6xl mx-auto space-y-6">
        {/* Header */}
        <div className="bg-white rounded-2xl shadow-lg p-6 flex items-center justify-between">
          <button
            onClick={() => {
              if (window.history.length > 1) {
                navigate(-1);
              } else {
                navigate("/");
              }
            }}
            className="inline-flex items-center gap-2 text-emerald-600 hover:text-emerald-700 font-bold transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
            Back
          </button>
          <div className="text-right">
            <h1 className="text-3xl md:text-4xl font-extrabold text-stone-900">
              {commonNames.primaryCommonName}
            </h1>
            <p className="text-stone-600 italic text-sm">
              {careGuide.scientificName}
            </p>
            {careGuide.vernacularName && (
              <p className="text-emerald-700 font-semibold text-sm">
                {commonNames.otherCommonNames.join(", ")}
              </p>
            )}
          </div>
        </div>

        {/* Basic Information */}
        <AccordionSection
          title="Basic Information"
          icon={<Fish className="w-7 h-7" />}
          color="emerald"
          defaultOpen={true}
        >
          <div className="overflow-x-auto">
            <table className="w-full">
              <tbody className="divide-y divide-stone-200">
                <tr className="hover:bg-emerald-50 transition-colors">
                  <td className="py-3 px-4 font-bold text-stone-700 flex items-center gap-2">
                    <Fish className="w-5 h-5 text-emerald-600" />
                    Scientific Name
                  </td>
                  <td className="py-3 px-4 text-stone-900 font-medium">
                    {careGuide.scientificName}
                  </td>
                </tr>
                {careGuide.vernacularName && (
                  <tr className="hover:bg-emerald-50 transition-colors">
                    <td className="py-3 px-4 font-bold text-stone-700 flex items-center gap-2">
                      <Users className="w-5 h-5 text-emerald-600" />
                      Common Name
                    </td>
                    <td className="py-3 px-4 text-stone-900 font-medium">
                      {commonNames.primaryCommonName}

                      {commonNames.otherCommonNames.length > 0 && (
                        <span className="block text-sm text-stone-500 mt-1">
                          Other names: {commonNames.otherCommonNames.join(", ")}
                        </span>
                      )}
                    </td>
                  </tr>
                )}
                {careGuide.maxLength && (
                  <tr className="hover:bg-emerald-50 transition-colors">
                    <td className="py-3 px-4 font-bold text-stone-700 flex items-center gap-2">
                      <Ruler className="w-5 h-5 text-emerald-600" />
                      Maximum Length
                    </td>
                    <td className="py-3 px-4 text-stone-900 font-medium">
                      {careGuide.maxLength}
                    </td>
                  </tr>
                )}
                {careGuide.maxWeight && (
                  <tr className="hover:bg-emerald-50 transition-colors">
                    <td className="py-3 px-4 font-bold text-stone-700 flex items-center gap-2">
                      <Scale className="w-5 h-5 text-emerald-600" />
                      Maximum Weight
                    </td>
                    <td className="py-3 px-4 text-stone-900 font-medium">
                      {careGuide.maxWeight}
                    </td>
                  </tr>
                )}
                {careGuide.longevity && (
                  <tr className="hover:bg-emerald-50 transition-colors">
                    <td className="py-3 px-4 font-bold text-stone-700 flex items-center gap-2">
                      <Calendar className="w-5 h-5 text-emerald-600" />
                      Lifespan
                    </td>
                    <td className="py-3 px-4 text-stone-900 font-medium">
                      {careGuide.longevity}
                    </td>
                  </tr>
                )}
                <tr className="hover:bg-emerald-50 transition-colors">
                  <td className="py-3 px-4 font-bold text-stone-700 flex items-center gap-2">
                    <Activity className="w-5 h-5 text-emerald-600" />
                    Care Difficulty
                  </td>
                  <td className="py-3 px-4">
                    <span
                      className={`px-3 py-1 rounded-full text-sm font-bold ${
                        careGuide.careLevel === "Beginner"
                          ? "bg-green-100 text-green-800"
                          : careGuide.careLevel === "Intermediate"
                            ? "bg-amber-100 text-amber-800"
                            : "bg-rose-100 text-rose-800"
                      }`}
                    >
                      {careGuide.careLevel}
                    </span>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </AccordionSection>

        {/* Water Parameters */}
        <AccordionSection
          title="Water Parameters"
          icon={<Droplets className="w-7 h-7" />}
          color="blue"
          defaultOpen={true}
        >
          <div className="overflow-x-auto">
            <table className="w-full">
              <tbody className="divide-y divide-stone-200">
                {careGuide.temperature && (
                  <tr className="hover:bg-blue-50 transition-colors">
                    <td className="py-3 px-4 font-bold text-stone-700 flex items-center gap-2">
                      <Thermometer className="w-5 h-5 text-blue-600" />
                      Water Temperature
                    </td>
                    <td className="py-3 px-4 text-stone-900 font-medium">
                      {careGuide.temperature}
                    </td>
                  </tr>
                )}
                {careGuide.baskingTemp && (
                  <tr className="hover:bg-blue-50 transition-colors">
                    <td className="py-3 px-4 font-bold text-stone-700 flex items-center gap-2">
                      <Thermometer className="w-5 h-5 text-orange-600" />
                      Basking Temperature
                    </td>
                    <td className="py-3 px-4 text-stone-900 font-medium">
                      {careGuide.baskingTemp}
                    </td>
                  </tr>
                )}
                {careGuide.phRange && (
                  <tr className="hover:bg-blue-50 transition-colors">
                    <td className="py-3 px-4 font-bold text-stone-700 flex items-center gap-2">
                      <Beaker className="w-5 h-5 text-blue-600" />
                      pH Range
                    </td>
                    <td className="py-3 px-4 text-stone-900 font-medium">
                      {careGuide.phRange}
                    </td>
                  </tr>
                )}
                {careGuide.waterDepth && (
                  <tr className="hover:bg-blue-50 transition-colors">
                    <td className="py-3 px-4 font-bold text-stone-700 flex items-center gap-2">
                      <Droplets className="w-5 h-5 text-blue-600" />
                      Water Depth
                    </td>
                    <td className="py-3 px-4 text-stone-900">
                      {careGuide.waterDepth}
                    </td>
                  </tr>
                )}
                {careGuide.tankSize && (
                  <tr className="hover:bg-blue-50 transition-colors">
                    <td className="py-3 px-4 font-bold text-stone-700 flex items-center gap-2">
                      <Home className="w-5 h-5 text-blue-600" />
                      Minimum Tank Size
                    </td>
                    <td className="py-3 px-4 text-stone-900 font-medium">
                      {careGuide.tankSize}
                    </td>
                  </tr>
                )}
                {careGuide.waterHardness && (
                  <tr className="hover:bg-blue-50 transition-colors">
                    <td className="py-3 px-4 font-bold text-stone-700 flex items-center gap-2">
                      <Beaker className="w-5 h-5 text-blue-600" />
                      Water Hardness
                    </td>
                    <td className="py-3 px-4 text-stone-900 font-medium">
                      {careGuide.waterHardness}
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </AccordionSection>

        {/* Feeding & Maintenance */}
        <AccordionSection
          title="Feeding & Maintenance"
          icon={<Utensils className="w-7 h-7" />}
          color="amber"
          defaultOpen={true}
        >
          <div className="space-y-6">
            <div className="overflow-x-auto">
              <table className="w-full">
                <tbody className="divide-y divide-stone-200">
                  <tr className="hover:bg-amber-50 transition-colors">
                    <td className="py-3 px-4 font-bold text-stone-700 flex items-center gap-2">
                      <Utensils className="w-5 h-5 text-amber-600" />
                      Feeding Frequency
                    </td>
                    <td className="py-3 px-4 text-stone-900">
                      {careGuide.feedingFreq}
                    </td>
                  </tr>
                  <tr className="hover:bg-amber-50 transition-colors">
                    <td className="py-3 px-4 font-bold text-stone-700 flex items-center gap-2">
                      <Droplets className="w-5 h-5 text-amber-600" />
                      Water Change Schedule
                    </td>
                    <td className="py-3 px-4 text-stone-900">
                      {careGuide.waterChangeFreq}
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>

            {careGuide.dietDetails && (
              <div>
                <h4 className="font-bold text-stone-900 mb-3 flex items-center gap-2">
                  <Heart className="w-5 h-5 text-amber-600" />
                  Diet Details
                </h4>

                <div className="bg-amber-50 rounded-xl p-4 border border-amber-200">
                  <p className="text-stone-700 leading-relaxed">
                    {careGuide.dietDetails}
                  </p>
                </div>
              </div>
            )}
          </div>
        </AccordionSection>

        {/* Tank Setup */}
        <AccordionSection
          title="Tank Setup & Requirements"
          icon={<Home className="w-7 h-7" />}
          color="purple"
        >
          <div className="space-y-6">
            <div>
              <h4 className="font-bold text-stone-900 mb-3 flex items-center gap-2">
                <Home className="w-5 h-5 text-purple-600" />
                Essential Equipment
              </h4>
              <div className="bg-purple-50 rounded-xl p-4 border border-purple-200">
                <p className="text-stone-700 leading-relaxed">
                  {careGuide.tankRequirements}
                </p>
              </div>
            </div>

            <div>
              <h4 className="font-bold text-stone-900 mb-3 flex items-center gap-2">
                <Users className="w-5 h-5 text-purple-600" />
                Compatible Tank Mates
              </h4>
              <div className="bg-purple-50 rounded-xl p-4 border border-purple-200">
                <p className="text-stone-700 leading-relaxed">
                  {careGuide.tankMates}
                </p>
              </div>
            </div>
          </div>
        </AccordionSection>

        {/* Health Monitoring */}
        <AccordionSection
          title="Health Monitoring"
          icon={<Activity className="w-7 h-7" />}
          color="teal"
        >
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Healthy Signs */}
            <div>
              <div className="flex items-center gap-2 mb-4">
                <CheckCircle2 className="w-6 h-6 text-emerald-600" />
                <h4 className="font-bold text-emerald-900 text-lg">
                  Signs of Good Health
                </h4>
              </div>
              <ul className="space-y-2">
                {careGuide.healthSigns.map((sign, index) => (
                  <li
                    key={index}
                    className="flex gap-2 items-start bg-emerald-50 p-3 rounded-lg border border-emerald-200"
                  >
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                    <span className="text-stone-700 text-sm">{sign}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Warning Signs */}
            <div>
              <div className="flex items-center gap-2 mb-4">
                <XCircle className="w-6 h-6 text-rose-600" />
                <h4 className="font-bold text-rose-900 text-lg">
                  Warning Signs of Illness
                </h4>
              </div>
              <ul className="space-y-2">
                {careGuide.sicknessSigns.map((sign, index) => (
                  <li
                    key={index}
                    className="flex gap-2 items-start bg-rose-50 p-3 rounded-lg border border-rose-200"
                  >
                    <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
                    <span className="text-stone-700 text-sm">{sign}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </AccordionSection>

        {/* Common Illnesses */}
        <AccordionSection
          title="Common Illnesses"
          icon={<AlertCircle className="w-7 h-7" />}
          color="rose"
        >
          <div className="space-y-4">
            {careGuide.commonIllness.map((illness, index) => (
              <div
                key={index}
                className="bg-rose-50 rounded-lg px-3 py-2 border-l-2 border-rose-500"
              >
                <h4 className="text-sm font-bold text-rose-900 flex items-center gap-2">
                  <span className="bg-rose-600 text-white w-5 h-5 rounded-full flex items-center justify-center text-xs shrink-0">
                    {index + 1}
                  </span>
                  {illness.name}
                </h4>
              </div>
            ))}

            {/* Emergency Notice */}
            <div className="bg-gradient-to-r from-rose-600 to-red-700 rounded-xl p-5 text-white">
              <div className="flex gap-3 items-start">
                <AlertCircle className="w-6 h-6 shrink-0 mt-0.5" />
                <div>
                  <h4 className="font-bold text-lg mb-2">
                    Emergency Care Notice
                  </h4>
                  <p className="text-rose-100 leading-relaxed text-sm">
                    If your pet shows severe symptoms (not eating 3+ days,
                    difficulty breathing, severe bloating, or inability to
                    swim), please seek veterinary care immediately. Many
                    conditions are fatal if untreated.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </AccordionSection>
      </div>
    </div>
  );
}

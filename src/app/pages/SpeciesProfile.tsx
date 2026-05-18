import React, { useEffect, useMemo, useState } from "react";
import { Link, useNavigate, useParams } from "react-router";
import {
  ArrowLeft,
  AlertTriangle,
  Fish,
  Info,
  Ruler,
  Scale,
  Clock,
  Thermometer,
  ShieldAlert,
  Leaf,
  MessageSquareText,
  CheckCircle2,
  XCircle,
  TestTubeDiagonal,
  Expand,
  Droplet,
  HandHeart,
  Skull,
  Ban,
  Heart,
  Dna,
} from "lucide-react";
import { motion } from "motion/react";
import { usePetDetail } from "../hooks/usePetDetails";
import {
  displayText,
  normalizeDangerBadge,
  getPetCommonNames,
  isInvasiveSpecies,
  getSpeciesCareBadgeClasses,
  getSpeciesDangerBadgeClasses,
  getDangerBadgeClasses,
  getCareBadgeClasses,
  formatPetBodyShape,
  formatPetTraits,
  formatCurrencyMYR,
  getLocalizedPetLabel,
  careLevelLabels,
  invasiveRiskLabels,
  budgetLabels,
  nativeStatusLabels,
  dangerLabels,
} from "../utils/petDisplay";
import { useCompare } from "../context/CompareContext";
import { useUser } from "../context/UserContext";
import { useLanguage } from "../context/LanguageContext";
import { TranslatedText } from "../components/TranslatedText";

/**
 * =========================
 * Type Definitions
 * =========================
 * These types define user experience level and ecological risk level
 * used for recommendation and suitability scoring logic.
 */
type ExperienceLevel = "beginner" | "intermediate" | "advanced";
type RiskLevel = "low" | "medium" | "high";

/**
 * Mapping experience levels into numeric ranking
 * Used to compare user skill vs pet difficulty.
 */
const experienceRank: Record<ExperienceLevel, number> = {
  beginner: 1,
  intermediate: 2,
  advanced: 3,
};

/**
 * Mapping risk levels into numeric ranking
 * Used for sorting ecological risk comparisons.
 */
const riskRank: Record<RiskLevel, number> = {
  low: 1,
  medium: 2,
  high: 3,
};

/**
 * =========================
 * Care Level Normalization
 * =========================
 * Converts raw string values from backend into standardized enum-like values
 * so they can be compared consistently in logic.
 */
function normalizeCareLevel(
  value: string | null | undefined,
): ExperienceLevel | null {
  const text = (value ?? "").toLowerCase();

  if (text.includes("begin")) return "beginner";
  if (text.includes("intermediate")) return "intermediate";
  if (text.includes("advanced")) return "advanced";

  return null;
}

/**
 * =========================
 * Risk Level Normalization
 * =========================
 * Converts raw risk strings into standardized categories.
 */
function normalizeRiskLevel(
  value: string | null | undefined,
): RiskLevel | null {
  const text = (value ?? "").toLowerCase();

  if (text.includes("low")) return "low";
  if (text.includes("medium")) return "medium";
  if (text.includes("high")) return "high";

  return null;
}

/**
 * ======================================================
 * SpeciesProfile Component (Main Detail Page)
 * ======================================================
 * This component renders:
 * 1. Full species profile page
 * 2. Suitability analysis for current user
 * 3. Alternatives recommendation system
 * 4. Safety + ecological warnings
 * 5. Comparison feature integration
 */
export function SpeciesProfile() {
  /**
   * =========================
   * Navigation & Routing
   * =========================
   */
  const navigate = useNavigate();

  /**
   * Compare system (global state)
   * Used to add/remove species for comparison
   */
  const { toggleCompare, isInCompare, isCompareFull } = useCompare();

  /**
   * URL parameter (species ID)
   */
  const { id } = useParams<{ id: string }>();

  /**
   * Fetch pet detail data + related species
   */
  const { pet, relatedPets, loading, error } = usePetDetail(id);

  /**
   * User profile data (used for personalization logic)
   */
  const { answers } = useUser();

  /**
   * Language context for localization
   */
  const { t, language } = useLanguage();

  /**
   * =========================
   * Suitability Calculation
   * =========================
   * Determines whether a species is suitable for the user
   * based on:
   * - care difficulty
   * - ecological risk
   * - legal restrictions
   */
  const suitability = useMemo(() => {
    if (!answers || !pet) return null;

    const fits: string[] = [];
    const reasons: string[] = [];

    // Normalize pet attributes into comparable values
    const petCareLevel = normalizeCareLevel(pet.pet_care_level);
    const petRiskLevel = normalizeRiskLevel(pet.pet_invasive_risk);

    // Hard stop: illegal species
    if (pet.pet_banned) {
      reasons.push("speciesProfile.bannedReason");
    }

    // Risk evaluation
    if (petRiskLevel === "high") {
      reasons.push("speciesProfile.higherEcologicalRisk");
    } else if (petRiskLevel === "low") {
      fits.push("speciesProfile.lowEcologicalRisk");
    }

    // Experience vs care difficulty comparison
    if (petCareLevel) {
      if (experienceRank[answers.experience] >= experienceRank[petCareLevel]) {
        fits.push("speciesProfile.manageableCareLevel");
      } else {
        reasons.push("speciesProfile.highCareDifficulty");
      }
    }

    return {
      isSuitable: reasons.length === 0,
      fits,
      reasons,
    };
  }, [answers, pet]);

  /**
   * =========================
   * Alternative Recommendations
   * =========================
   * Suggests similar species with:
   * - lower ecological risk OR
   * - easier care requirements
   */
  const recommendedAlternatives = useMemo(() => {
    if (!pet) return [];

    const currentRisk = normalizeRiskLevel(pet.pet_invasive_risk);
    const currentCare = normalizeCareLevel(pet.pet_care_level);

    return relatedPets
      .map((item) => {
        const itemRisk = normalizeRiskLevel(item.pet_invasive_risk);
        const itemCare = normalizeCareLevel(item.pet_care_level);

        const hasLowerRisk =
          !!currentRisk &&
          !!itemRisk &&
          riskRank[itemRisk] < riskRank[currentRisk];

        const hasLowerCare =
          !!currentCare &&
          !!itemCare &&
          experienceRank[itemCare] < experienceRank[currentCare];

        return {
          ...item,
          hasLowerRisk,
          hasLowerCare,
        };
      })
      .filter((item) => item.hasLowerRisk || item.hasLowerCare)
      .sort((a, b) => {
        const aScore = (a.hasLowerRisk ? 1 : 0) + (a.hasLowerCare ? 1 : 0);
        const bScore = (b.hasLowerRisk ? 1 : 0) + (b.hasLowerCare ? 1 : 0);
        return bScore - aScore;
      });
  }, [pet, relatedPets]);

  /**
   * Scroll to top when switching species
   */
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [id]);

  /**
   * Normalize danger level for consistent UI display
   */
  const dangerLevel = useMemo(
    () => normalizeDangerBadge(pet?.pet_danger),
    [pet?.pet_danger],
  );

  /**
   * Check if species is invasive
   */
  const isInvasive = useMemo(
    () => isInvasiveSpecies(pet?.pet_is_native),
    [pet?.pet_is_native],
  );

  /**
   * Extract readable names for UI display
   */
  const { primaryCommonName, otherCommonNames } = pet
    ? getPetCommonNames(pet)
    : { primaryCommonName: "Unknown Pet", otherCommonNames: [] };

  /**
   * =========================
   * Loading State UI
   * =========================
   */
  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-emerald-50 via-white to-stone-50 px-4 py-10">
        <div className="mx-auto max-w-6xl">
          <p className="text-stone-600">{t("speciesProfile.loading")}</p>
        </div>
      </div>
    );
  }

  /**
   * =========================
   * Error / Not Found State
   * =========================
   */
  if (error || !pet) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-emerald-50 via-white to-stone-50 px-4 py-10">
        <div className="mx-auto max-w-3xl rounded-3xl border border-stone-200 bg-white p-8 shadow-sm">
          <div className="mb-4 flex items-center gap-3 text-amber-700">
            <AlertTriangle className="h-6 w-6" />
            <h1 className="text-2xl font-bold">
              {t("speciesProfile.notFoundTitle")}
            </h1>
          </div>

          <p className="mb-6 text-stone-600">
            {t("speciesProfile.notFoundDescription")}
          </p>

          {error && (
            <p className="mb-6 rounded-xl bg-stone-100 px-4 py-3 text-sm text-stone-700">
              {error}
            </p>
          )}

          <Link
            to="/"
            className="inline-flex items-center gap-2 rounded-full bg-emerald-600 px-5 py-3 font-semibold text-white transition hover:bg-emerald-700"
          >
            <ArrowLeft className="h-4 w-4" />
            {t("speciesProfile.returnHome")}
          </Link>
        </div>
      </div>
    );
  }

  /**
   * Compare system state for UI control
   */
  const inCompare = isInCompare(pet.pet_id);
  const compareDisabled = isCompareFull && !inCompare;

  const hasPetPrice = pet.pet_cost != null;

  return (
    <div className="min-h-screen bg-gradient-to-b from-emerald-50 via-white to-stone-50">
      {/* =========================
          High Danger Warning Banner
          ========================= */}
      {dangerLevel === "High" && (
        <div className="border-b border-red-200 bg-red-50 px-4 py-3 text-red-800">
          <div className="mx-auto flex max-w-6xl items-center gap-2 font-medium">
            <AlertTriangle className="h-5 w-5" />
            {t("speciesProfile.highDangerWarning")}
          </div>
        </div>
      )}

      {/* =========================
          Legal Warning Banner
          ========================= */}
      {pet.pet_banned && (
        <div className="border-b border-red-200 bg-red-50 px-4 py-3 text-red-800">
          <div className="mx-auto flex max-w-6xl items-center gap-2 font-medium">
            <AlertTriangle className="h-5 w-5" />
            {t("speciesProfile.legalWarning")}
          </div>
        </div>
      )}

      {/* =========================
          Invasive Species Warning
          ========================= */}
      {isInvasive && (
        <div className="border-b border-amber-200 bg-amber-50 px-4 py-3 text-amber-800">
          <div className="mx-auto flex max-w-6xl items-center gap-2 font-medium">
            <AlertTriangle className="h-5 w-5" />
            {t("speciesProfile.invasiveWarning")}
          </div>
        </div>
      )}

      {/* ======================================================
          HERO SECTION (Image + Title + Key Info Overlay)
          ====================================================== */}
      <div className="relative h-[450px] md:h-[550px] w-full bg-stone-900 overflow-hidden">
        {/* Top navigation overlay */}
        <div className="absolute top-6 inset-x-0 z-20">
          <div className="mx-auto max-w-7xl px-8 md:px-12 flex justify-between items-center">
            {/* Back button */}
            <button
              onClick={() => {
                if (window.history.length > 1) {
                  navigate(-1);
                } else {
                  navigate("/");
                }
              }}
              className="bg-white/20 hover:bg-white/40 backdrop-blur-md text-emerald-500 px-3 py-3 rounded-full transition-all flex items-center gap-2 shadow-lg group"
            >
              <ArrowLeft className="h-4 w-4" />
              <span>{t("speciesProfile.back")}</span>
            </button>

            {/* Compare button */}
            <button
              onClick={() => toggleCompare(pet)}
              disabled={compareDisabled}
              className={`flex items-center gap-2 rounded-full px-5 py-2.5 font-bold shadow-lg backdrop-blur-md transition-all ${
                inCompare
                  ? "bg-emerald-500 text-white hover:bg-emerald-600"
                  : compareDisabled
                    ? "cursor-not-allowed border border-white/20 bg-white/10 text-white/70"
                    : "border border-white/30 bg-white/20 text-white hover:bg-white/40"
              }`}
            >
              {inCompare ? (
                <CheckCircle2 className="h-5 w-5" />
              ) : (
                <Scale className="h-5 w-5" />
              )}
              <span>
                {inCompare
                  ? t("speciesProfile.addedToCompare")
                  : compareDisabled
                    ? t("speciesProfile.compareFull")
                    : t("speciesProfile.addToCompare")}
              </span>
            </button>
          </div>
        </div>

        {/* Dark gradient overlay for readability */}
        <div className="absolute inset-0 bg-gradient-to-t from-stone-950 via-stone-900/40 to-transparent z-10"></div>

        {/* Hero image */}
        <motion.img
          key={pet?.pet_id}
          initial={{ scale: 1.05 }}
          animate={{ scale: 1 }}
          transition={{ duration: 0.8 }}
          src={
            pet.pet_image_ref
              ? `/pet_image/${pet.pet_image_ref}`
              : "/pet_image/pet_placeholder.png"
          }
          alt={pet.pet_vernacular_name ?? "Pet Image Placeholder"}
          className="absolute inset-0 w-full h-full object-fit"
        />

        {/* Title + badges overlay */}
        <div className="absolute bottom-0 inset-x-0 z-20">
          <div className="mx-auto max-w-7xl px-8 md:px-12 pb-8 md:pb-12">
            {/* Badges */}
            <motion.div
              key={`tags-${pet?.pet_id}`}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
              className="flex items-center gap-3 mb-4 flex-wrap"
            >
              <span
                className={getSpeciesDangerBadgeClasses(
                  pet?.pet_invasive_risk || "Unknown",
                )}
              >
                <ShieldAlert className="w-4 h-4" />
                {getLocalizedPetLabel(
                  invasiveRiskLabels,
                  pet.pet_invasive_risk,
                  language,
                )}
              </span>

              <span
                className={getSpeciesCareBadgeClasses(
                  pet?.pet_care_level || "Unknown",
                )}
              >
                <HandHeart className="w-4 h-4" />
                {getLocalizedPetLabel(
                  careLevelLabels,
                  pet.pet_care_level,
                  language,
                )}
              </span>

              <span
                className={getSpeciesDangerBadgeClasses(
                  dangerLevel || "Unknown",
                )}
              >
                <Skull className="w-4 h-4" />
                {getLocalizedPetLabel(dangerLabels, dangerLevel, language)}
              </span>

              {pet.pet_banned && (
                <span className="inline-flex items-center gap-1 rounded-full bg-red-100 px-4 py-1.5 text-sm font-semibold text-red-700">
                  <Ban className="w-4 h-4" />
                  {t("speciesProfile.bannedInMalaysia")}
                </span>
              )}
            </motion.div>

            {/* Title block */}
            <div className="flex flex-col gap-6 md:flex-row md:items-end md:justify-between">
              <div className="max-w-3xl">
                {/* Common name */}
                <motion.h1
                  key={`title-${pet?.pet_id}`}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: 0.3 }}
                  className="text-4xl md:text-6xl font-extrabold text-white mb-2 drop-shadow-xl"
                >
                  <TranslatedText
                    text={primaryCommonName}
                    language={language}
                  />
                </motion.h1>

                {/* Scientific name */}
                <motion.p
                  key={`subtitle-${pet?.pet_id}`}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: 0.4 }}
                  className={`text-xl md:text-2xl text-stone-300 italic font-serif ${
                    otherCommonNames.length > 0 ? "mb-2" : ""
                  }`}
                >
                  {pet?.pet_scientific_name}
                </motion.p>

                {/* Alternative names */}
                {otherCommonNames.length > 0 && (
                  <motion.p
                    key={`aka-${pet?.pet_id}`}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, delay: 0.45 }}
                    className="text-lg md:text-xl text-stone-200 font-serif"
                  >
                    <span className="font-semibold">
                      {t("speciesProfile.aka")}
                    </span>{" "}
                    <TranslatedText
                      text={otherCommonNames.join(", ")}
                      language={language}
                    />
                  </motion.p>
                )}
              </div>

              {/* Price display */}
              {pet.pet_cost != null && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: 0.5 }}
                  className="shrink-0 self-start md:self-end rounded-2xl border border-white/20 bg-white/15 px-6 py-5 backdrop-blur-md shadow-lg min-w-[180px]"
                >
                  <p className="text-xs font-semibold uppercase tracking-[0.2em] text-stone-300">
                    {t("speciesProfile.estimatedPrice")}
                  </p>
                  <p className="mt-1 text-3xl md:text-4xl font-extrabold text-white leading-none">
                    {formatCurrencyMYR(pet.pet_cost)}
                  </p>
                </motion.div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* ======================================================
          MAIN CONTENT SECTION
          ====================================================== */}
      <section className="px-4 py-12">
        <div className="mx-auto grid max-w-6xl gap-8 lg:grid-cols-[1.6fr_1fr]">
          {/* LEFT COLUMN (Details) */}
          <div className="space-y-8">
            {/* =========================
                Suitability Analysis Card
                ========================= */}
            {suitability &&
              (suitability.reasons.length > 0 ||
                suitability.fits.length > 0) && (
                <section
                  className={`rounded-3xl border-2 p-8 shadow-sm ${
                    suitability.isSuitable
                      ? "border-emerald-200 bg-emerald-50"
                      : "border-rose-200 bg-rose-50"
                  }`}
                >
                  <h2
                    className={`mb-6 flex items-center gap-3 text-3xl font-bold ${
                      suitability.isSuitable
                        ? "text-emerald-900"
                        : "text-rose-900"
                    }`}
                  >
                    {suitability.isSuitable ? (
                      <Heart className="h-8 w-8 fill-current text-emerald-600" />
                    ) : (
                      <AlertTriangle className="h-8 w-8 text-rose-600" />
                    )}
                    {suitability.isSuitable
                      ? t("speciesProfile.whyItFitsYou")
                      : t("speciesProfile.whyThisMayNotFitYou")}
                  </h2>

                  {/* Fit / Reason grid */}
                  <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                    {suitability.isSuitable
                      ? suitability.fits.map((fit, index) => (
                          <div
                            key={`${fit}-${index}`}
                            className="flex items-center gap-3 rounded-2xl border border-emerald-100 bg-white p-5 shadow-sm"
                          >
                            <CheckCircle2 className="h-6 w-6 shrink-0 text-emerald-500" />
                            <span className="text-lg font-semibold text-emerald-900">
                              {t(fit)}
                            </span>
                          </div>
                        ))
                      : suitability.reasons.map((reason, index) => (
                          <div
                            key={`${reason}-${index}`}
                            className="flex items-center gap-3 rounded-2xl border border-rose-100 bg-white p-5 shadow-sm"
                          >
                            <AlertTriangle className="h-6 w-6 shrink-0 text-rose-500" />
                            <span className="text-lg font-semibold text-rose-900">
                              {t(reason)}
                            </span>
                          </div>
                        ))}
                  </div>
                </section>
              )}

            {/* =========================
                Recommended Alternatives
                ========================= */}
            {recommendedAlternatives?.length > 0 && (
              <div className="rounded-3xl border border-stone-200 bg-white p-7 shadow-sm">
                <div className="mb-5 flex items-center gap-2 text-emerald-800">
                  <Fish className="h-5 w-5" />
                  <h2 className="text-2xl font-bold">
                    {t("speciesProfile.recommendedAlternatives")}
                  </h2>
                </div>

                <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
                  {recommendedAlternatives.map((item) => (
                    <Link
                      key={item.pet_id}
                      to={`/species/${item.pet_id}`}
                      className="rounded-2xl border border-stone-200 p-4 transition hover:border-emerald-400 hover:bg-emerald-50"
                    >
                      {/* Badges */}
                      <div className="mb-3 flex flex-wrap gap-2">
                        {item.hasLowerRisk && (
                          <span className="inline-flex items-center gap-1 rounded-full bg-emerald-100 px-3 py-1 text-xs font-semibold text-emerald-800">
                            <ShieldAlert className="h-3.5 w-3.5" />
                            {t("speciesProfile.lowerRisk")}
                          </span>
                        )}

                        {item.hasLowerCare && (
                          <span className="inline-flex items-center gap-1 rounded-full bg-sky-100 px-3 py-1 text-xs font-semibold text-sky-800">
                            <HandHeart className="h-3.5 w-3.5" />
                            {t("speciesProfile.easierCare")}
                          </span>
                        )}
                      </div>

                      <h3 className="font-bold text-stone-900">
                        <TranslatedText
                          text={displayText(
                            item.pet_vernacular_name,
                            item.pet_scientific_name
                              ? item.pet_scientific_name
                              : t("speciesProfile.unknownSpecies"),
                          )}
                          language={language}
                        />
                      </h3>

                      <p className="mt-1 text-sm italic text-stone-600">
                        {displayText(item.pet_scientific_name)}
                      </p>

                      {/* Risk + care badges */}
                      <div className="mt-4 flex flex-wrap gap-2">
                        {item.pet_invasive_risk && (
                          <span
                            className={getDangerBadgeClasses(
                              item.pet_invasive_risk,
                            )}
                          >
                            <ShieldAlert className="w-3 h-3" />
                            {getLocalizedPetLabel(
                              invasiveRiskLabels,
                              item.pet_invasive_risk,
                              language,
                            )}
                          </span>
                        )}

                        {item.pet_care_level && (
                          <span
                            className={getCareBadgeClasses(item.pet_care_level)}
                          >
                            <HandHeart className="w-3 h-3" />
                            {getLocalizedPetLabel(
                              careLevelLabels,
                              item.pet_care_level,
                              language,
                            )}
                          </span>
                        )}
                      </div>
                    </Link>
                  ))}
                </div>
              </div>
            )}

            {/* =========================
                Basic Info Section
                ========================= */}
            <div className="rounded-3xl border border-stone-200 bg-white p-7 shadow-sm">
              <div className="mb-4 flex items-center gap-2 text-emerald-800">
                <Info className="h-5 w-5" />
                <h2 className="text-2xl font-bold">
                  {t("speciesProfile.aboutThisPet")}
                </h2>
              </div>

              {/* Grid of biological attributes */}
              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <p className="text-sm font-semibold uppercase tracking-wide text-stone-500">
                    {t("speciesProfile.vernacularName")}
                  </p>
                  <p className="mt-1 text-stone-800">
                    <TranslatedText
                      text={pet.pet_vernacular_name}
                      language={language}
                    />
                  </p>
                </div>

                <div>
                  <p className="text-sm font-semibold uppercase tracking-wide text-stone-500">
                    {t("speciesProfile.scientificName")}
                  </p>
                  <p className="mt-1 text-stone-800">
                    {displayText(pet.pet_scientific_name)}
                  </p>
                </div>

                <div>
                  <p className="text-sm font-semibold uppercase tracking-wide text-stone-500">
                    {t("speciesProfile.genus")}
                  </p>
                  <p className="mt-1 text-stone-800">
                    {displayText(pet.pet_genus)}
                  </p>
                </div>

                <div>
                  <p className="text-sm font-semibold uppercase tracking-wide text-stone-500">
                    {t("speciesProfile.family")}
                  </p>
                  <p className="mt-1 text-stone-800">
                    {displayText(pet.pet_family)}
                  </p>
                </div>

                {pet.pet_body_shape && (
                  <div>
                    <p className="text-sm font-semibold uppercase tracking-wide text-stone-500">
                      {t("speciesProfile.bodyShape")}
                    </p>
                    <p className="mt-1 text-stone-800">
                      <TranslatedText
                        text={formatPetBodyShape(pet.pet_body_shape)}
                        language={language}
                      />
                    </p>
                  </div>
                )}

                {pet.pet_migration_type && (
                  <div>
                    <p className="text-sm font-semibold uppercase tracking-wide text-stone-500">
                      {t("speciesProfile.migrationType")}
                    </p>
                    <p className="mt-1 text-stone-800">
                      <TranslatedText
                        text={displayText(pet.pet_migration_type)}
                        language={language}
                      />
                    </p>
                  </div>
                )}
              </div>
            </div>

            {/* =========================
                Traits Section
                ========================= */}
            {pet.pet_traits && (
              <div className="rounded-3xl border border-stone-200 bg-white p-7 shadow-sm">
                <div className="mb-4 flex items-center gap-2 text-emerald-800">
                  <Dna className="h-5 w-5" />
                  <h2 className="text-2xl font-bold">
                    {t("speciesProfile.traits")}
                  </h2>
                </div>

                <div className="flex flex-wrap gap-3">
                  <span className="leading-7 text-stone-700">
                    <TranslatedText
                      text={formatPetTraits(pet.pet_traits)}
                      language={language}
                    />
                  </span>
                </div>
              </div>
            )}

            {/* =========================
                Diet Section
                ========================= */}
            {pet.pet_diet &&
              (pet.pet_diet.main_type || pet.pet_diet.remarks) && (
                <div className="rounded-3xl border border-stone-200 bg-white p-7 shadow-sm">
                  <div className="mb-4 flex items-center gap-2 text-emerald-800">
                    <Leaf className="h-5 w-5" />
                    <h2 className="text-2xl font-bold">
                      {t("speciesProfile.diet")}
                    </h2>
                  </div>

                  <div className="space-y-4">
                    {/* Main diet type */}
                    {pet.pet_diet.main_type && (
                      <div>
                        <p className="text-sm font-semibold uppercase tracking-wide text-stone-500">
                          {t("speciesProfile.mainDietType")}
                        </p>
                        <div className="mt-2 flex flex-wrap gap-2">
                          <span className="inline-flex items-center rounded-full bg-emerald-100 px-4 py-1.5 text-sm font-semibold text-emerald-800">
                            <TranslatedText
                              text={displayText(pet.pet_diet.main_type)}
                              language={language}
                            />
                          </span>
                        </div>
                      </div>
                    )}

                    {/* Feeding notes */}
                    {pet.pet_diet.remarks && (
                      <div>
                        <p className="text-sm font-semibold uppercase tracking-wide text-stone-500">
                          {t("speciesProfile.feedingNotes")}
                        </p>
                        <p className="mt-1 leading-7 text-stone-700">
                          <TranslatedText
                            text={displayText(pet.pet_diet.remarks)}
                            language={language}
                          />
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              )}

            {/* =========================
                Notes Section
                ========================= */}
            <div className="rounded-3xl border border-stone-200 bg-white p-7 shadow-sm">
              <div className="mb-4 flex items-center gap-2 text-emerald-800">
                <MessageSquareText className="h-5 w-5" />
                <h2 className="text-2xl font-bold">
                  {t("speciesProfile.notes")}
                </h2>
              </div>

              <p className="leading-7 text-stone-700">
                <TranslatedText
                  text={displayText(
                    pet.pet_comments,
                    t("speciesProfile.noAdditionalComments"),
                  )}
                  language={language}
                />
              </p>
            </div>
          </div>

          {/* RIGHT SIDEBAR */}
          <aside className="space-y-6">
            {/* =========================
                Safety Summary Panel
                ========================= */}
            <div className="rounded-3xl border border-rose-800 bg-gradient-to-br from-rose-950 via-red-950 to-stone-950 p-6 text-white shadow-sm">
              <div className="mb-4 flex items-center gap-2 text-rose-100">
                <ShieldAlert className="h-5 w-5 text-rose-300" />
                <h3 className="text-xl font-bold">
                  {t("speciesProfile.safetySummary")}
                </h3>
              </div>

              <div className="space-y-4">
                {/* Danger level */}
                <div>
                  <p className="text-sm font-semibold uppercase tracking-wide text-rose-300">
                    {t("speciesProfile.danger")}
                  </p>
                  <p className="mt-1 text-rose-50">
                    <TranslatedText
                      text={displayText(pet.pet_danger)}
                      language={language}
                    />
                  </p>
                </div>

                {/* Native status */}
                <div>
                  <p className="text-sm font-semibold uppercase tracking-wide text-rose-300">
                    {t("speciesProfile.nativeStatus")}
                  </p>
                  <p className="mt-1 text-rose-50">
                    {getLocalizedPetLabel(
                      nativeStatusLabels,
                      pet.pet_is_native,
                      language,
                    ) || displayText(pet.pet_is_native)}
                  </p>
                </div>

                {/* Legal status */}
                <div>
                  <p className="text-sm font-semibold uppercase tracking-wide text-rose-300">
                    {t("speciesProfile.legalStatus")}
                  </p>
                  <p className="mt-1 text-rose-50">
                    {pet.pet_banned
                      ? t("speciesProfile.banned")
                      : t("speciesProfile.notBanned")}
                  </p>
                </div>

                {/* Aquarium status */}
                <div>
                  <p className="text-sm font-semibold uppercase tracking-wide text-rose-300">
                    {t("speciesProfile.commonAquariumSpecies")}
                  </p>
                  <div className="mt-1 flex items-center gap-2 text-rose-50">
                    {pet.pet_aquarium ? (
                      <>
                        <CheckCircle2 className="h-4 w-4 text-emerald-400" />
                        {t("speciesProfile.yes")}
                      </>
                    ) : (
                      <>
                        <XCircle className="h-4 w-4 text-rose-300" />
                        {t("speciesProfile.noOrUnknown")}
                      </>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* =========================
                Quick Facts Panel
                ========================= */}
            <div className="bg-emerald-900 text-white rounded-3xl p-8 shadow-sm sticky top-24">
              <h3 className="text-2xl font-bold mb-6 flex items-center gap-2 text-emerald-50">
                <Leaf className="w-6 h-6 text-emerald-400" />{" "}
                {t("speciesProfile.quickFacts")}
              </h3>

              <div className="space-y-6">
                {/* Physical stats grid */}
                <div className="grid gap-4 sm:grid-cols-2">
                  {pet.pet_max_length && (
                    <div className="rounded-2xl border border-emerald-700 bg-emerald-800/40 p-4 flex flex-col items-center justify-center text-center">
                      <div className="mb-3 flex items-center gap-2 text-emerald-200">
                        <Ruler className="h-4 w-4" />
                        <h4 className="text-sm font-semibold">
                          {t("speciesProfile.maxLength")}
                        </h4>
                      </div>
                      <p className="text-2xl font-bold text-white">
                        {pet.pet_max_length}
                      </p>
                      <p className="mt-1 text-sm text-emerald-300">
                        {t("speciesProfile.cm")}
                      </p>
                    </div>
                  )}

                  {pet.pet_max_weight && (
                    <div className="rounded-2xl border border-emerald-700 bg-emerald-800/40 p-4 flex flex-col items-center justify-center text-center">
                      <div className="mb-2 flex items-center gap-2 text-emerald-200">
                        <Scale className="h-4 w-4" />
                        <h4 className="text-sm font-semibold">
                          {t("speciesProfile.maxWeight")}
                        </h4>
                      </div>
                      <p className="text-2xl font-bold text-white">
                        {pet.pet_max_weight}
                      </p>
                      <p className="mt-1 text-sm text-emerald-300">
                        {t("speciesProfile.kg")}
                      </p>
                    </div>
                  )}

                  {pet.pet_longevity && (
                    <div className="rounded-2xl border border-emerald-700 bg-emerald-800/40 p-4 flex flex-col items-center justify-center text-center">
                      <div className="mb-2 flex items-center gap-2 text-emerald-200">
                        <Clock className="h-4 w-4" />
                        <h4 className="text-sm font-semibold">
                          {t("speciesProfile.longevity")}
                        </h4>
                      </div>
                      <p className="text-2xl font-bold text-white">
                        {pet.pet_longevity}
                      </p>
                      <p className="mt-1 text-sm text-emerald-300">
                        {t("speciesProfile.years")}
                      </p>
                    </div>
                  )}

                  {pet.pet_temperature && (
                    <div className="rounded-2xl border border-emerald-700 bg-emerald-800/40 p-4 flex flex-col items-center justify-center text-center">
                      <div className="mb-2 flex items-center gap-2 text-emerald-200">
                        <Thermometer className="h-4 w-4" />
                        <h4 className="text-sm font-semibold">
                          {t("speciesProfile.temperature")}
                        </h4>
                      </div>
                      <p className="text-2xl font-bold text-white">
                        {displayText(pet.pet_temperature)}
                      </p>
                    </div>
                  )}

                  {pet.pet_ph_range && (
                    <div className="rounded-2xl border border-emerald-700 bg-emerald-800/40 p-4 flex flex-col items-center justify-center text-center">
                      <div className="mb-2 flex items-center gap-2 text-emerald-200">
                        <TestTubeDiagonal className="h-4 w-4" />
                        <h4 className="text-sm font-semibold">pH</h4>
                      </div>
                      <p className="text-2xl font-bold text-white">
                        {displayText(pet.pet_ph_range)}
                      </p>
                    </div>
                  )}

                  {pet.pet_water_hardness && (
                    <div className="rounded-2xl border border-emerald-700 bg-emerald-800/40 p-4 flex flex-col items-center justify-center text-center">
                      <div className="mb-2 flex items-center gap-2 text-emerald-200">
                        <Droplet className="h-4 w-4" />
                        <h4 className="text-sm font-semibold">
                          {t("speciesProfile.waterHardness")}
                        </h4>
                      </div>
                      <p className="text-2xl font-bold text-white">
                        {displayText(pet.pet_water_hardness)}
                      </p>
                    </div>
                  )}
                </div>

                {/* Setup / requirements block */}
                {(pet.pet_cost != null ||
                  pet.pet_tank_size ||
                  pet.pet_care_level) && (
                  <div className="bg-emerald-950 p-5 rounded-2xl border border-emerald-700 space-y-3">
                    <h4 className="font-bold text-emerald-100 mb-2 border-b border-emerald-800 pb-2">
                      {t("speciesProfile.minimumSetup")}
                    </h4>

                    {pet.pet_cost != null && (
                      <div className="flex justify-between text-sm">
                        <span className="text-emerald-400">
                          {t("speciesProfile.petPriceRm")}
                        </span>
                        <span className="font-semibold text-white capitalize">
                          {pet.pet_cost}
                        </span>
                      </div>
                    )}

                    {pet.pet_tank_size && (
                      <div className="flex justify-between text-sm">
                        <span className="text-emerald-400">
                          {t("speciesProfile.tankSizeGallons")}
                        </span>
                        <span className="font-semibold text-white capitalize">
                          {pet.pet_tank_size}
                        </span>
                      </div>
                    )}

                    {pet.pet_care_level && (
                      <div className="flex justify-between text-sm">
                        <span className="text-emerald-400">
                          {t("speciesProfile.experience")}
                        </span>
                        <span className="font-semibold text-white capitalize">
                          {getLocalizedPetLabel(
                            careLevelLabels,
                            pet.pet_care_level,
                            language,
                          )}
                        </span>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          </aside>
        </div>
      </section>
    </div>
  );
}

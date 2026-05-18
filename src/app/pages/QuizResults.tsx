// ===================== React Core + Routing Imports =====================
// Import React hooks for lifecycle, memoization, and state management
import React, { useEffect, useMemo, useState } from "react";
// Import routing utilities for navigation and conditional redirects
import { Link, Navigate } from "react-router";
// Import wishlist context for user-selected species tracking
import { useWishlist } from "../context/WishlistContext";
// Import user context containing quiz answers and authentication state
import { LifestyleAnswers, useUser } from "../context/UserContext";
// Import UI icons used for visual feedback and recommendation states
import {
  CheckCircle2,
  AlertTriangle,
  ShieldAlert,
  ArrowRight,
  Heart,
  XOctagon,
  Search,
  HelpCircle,
  RefreshCw,
} from "lucide-react";
// Import animation library for UI transitions and motion effects
import { motion } from "motion/react";
// Import custom hook for fetching quiz-based pet recommendations
import { useQuizRecommendations } from "../hooks/useQuizRecommendations";
// Import typed model for recommendation results
import type { QuizRecommendationPet } from "../types/pet.types";
// Import utility to display common names for pets
import {
  getPetCommonNames,
  getLocalizedPetLabel,
  careLevelLabels,
  invasiveRiskLabels,
} from "../utils/petDisplay";
// Import loading spinner component from Material UI
import CircularProgress from "@mui/material/CircularProgress";
// Import translation hook for internationalization
import { useLanguage } from "../context/LanguageContext";
import { TranslatedText } from "../components/TranslatedText";

// ===================== Scoring Conversion Tables =====================
// Convert user answers into numerical scales for comparison logic
const levels = {
  budget: { low: 1, medium: 2, high: 3 },
  space: { small: 1, medium: 2, large: 3 },
  time: { low: 1, medium: 2, high: 3 },
  experience: { beginner: 1, intermediate: 2, advanced: 3 },
  lifespan: { short: 1, medium: 2, long: 3 },
};

// Map ecological or invasion risk levels into numeric ranking
const riskLevel: Record<string, number> = {
  Low: 1,
  Medium: 2,
  High: 3,
  Unknown: 4,
};

// ===================== Data Normalization Helpers =====================

// Convert pet budget category into numeric level
function getBudgetLevel(
  category: QuizRecommendationPet["pet_lifetime_budget_category"],
): 1 | 2 | 3 | null {
  if (category === "Low") return 1;
  if (category === "Medium") return 2;
  if (category === "High") return 3;
  return null;
}

// Convert textual care difficulty into numeric experience requirement
function getExperienceLevel(careLevel: string | null): 1 | 2 | 3 | null {
  if (!careLevel) return null;

  const value = careLevel.toLowerCase();

  if (value.includes("beginner")) return 1;
  if (value.includes("intermediate")) return 2;
  if (
    value.includes("advanced") ||
    value.includes("expert") ||
    value.includes("difficult")
  ) {
    return 3;
  }

  return null;
}

// Estimate time requirement using care level as proxy (temporary logic)
function getTimeLevel(careLevel: string | null): 1 | 2 | 3 | null {
  // temporary proxy until real maintenance-frequency data exists
  return getExperienceLevel(careLevel);
}

// Convert lifespan (years) into categorical level
function getLifespanLevel(longevity: number | null): 1 | 2 | 3 | null {
  if (typeof longevity !== "number" || !Number.isFinite(longevity)) {
    return null;
  }

  if (longevity <= 5) return 1;
  if (longevity <= 15) return 2;
  return 3;
}

// Convert tank size / physical constraints into space requirement level
function getSpaceLevel(
  tankSize: string | null,
  maxLength: number | null,
): 1 | 2 | 3 | null {
  if (tankSize) {
    const value = tankSize.toLowerCase();

    if (
      value.includes("desktop") ||
      value.includes("nano") ||
      value.includes("small")
    ) {
      return 1;
    }

    if (value.includes("medium") || value.includes("standard")) {
      return 2;
    }

    if (
      value.includes("large") ||
      value.includes("pond") ||
      value.includes("outdoor")
    ) {
      return 3;
    }
  }

  // fallback: use max length if available
  if (typeof maxLength !== "number" || !Number.isFinite(maxLength)) {
    return null;
  }

  if (maxLength <= 10) return 1;
  if (maxLength <= 30) return 2;
  return 3;
}

// Convert user-selected lifespan preference into numeric level
function getUserLifespanLevel(value: string | undefined): 1 | 2 | 3 | null {
  if (!value) return null;

  const normalized = value.trim().toLowerCase();

  if (normalized === "short") return 1;
  if (normalized === "medium") return 2;
  if (normalized === "long") return 3;

  return null;
}

// ===================== Core Evaluation Engine =====================
// Evaluate how well a pet matches a user's lifestyle answers
const evaluatePet = (pet: QuizRecommendationPet, answers: LifestyleAnswers) => {
  const reasons: string[] = [];
  const fits: string[] = [];

  const petBudget = getBudgetLevel(pet.pet_lifetime_budget_category);
  const petSpace = getSpaceLevel(pet.pet_tank_size, pet.pet_max_length);
  const petTime = getTimeLevel(pet.pet_care_level);
  const petExperience = getExperienceLevel(pet.pet_care_level);
  const petLifespan = getLifespanLevel(pet.pet_longevity);

  let score = 0;
  let blockers = 0;

  if (petBudget !== null) {
    if (levels.budget[answers.budget] < petBudget) {
      const budgetKey =
        pet.pet_lifetime_budget_category?.toLowerCase() ?? "unknown";

      reasons.push(`quizResults.reasons.budget.${budgetKey}`);
      blockers += 1;
    } else {
      fits.push("quizResults.fits.suitableBudget");
      score += 1;
    }
  }

  if (petSpace !== null) {
    if (levels.space[answers.space] < petSpace) {
      reasons.push("quizResults.reasons.space");
      blockers += 1;
    } else {
      fits.push("quizResults.fits.appropriateSpace");
      score += 1;
    }
  }

  if (petTime !== null) {
    if (levels.time[answers.time] < petTime) {
      reasons.push("quizResults.reasons.time");
      blockers += 1;
    } else {
      fits.push("quizResults.fits.manageableTime");
      score += 1;
    }
  }

  if (petExperience !== null) {
    if (levels.experience[answers.experience] < petExperience) {
      reasons.push("quizResults.reasons.experience");
      blockers += 1;
    } else {
      fits.push("quizResults.fits.manageableCare");
      score += 1;
    }
  }

  const userLifespanLevel = getUserLifespanLevel(answers.lifespan);

  if (petLifespan !== null && userLifespanLevel !== null) {
    if (petLifespan === userLifespanLevel) {
      fits.push("quizResults.fits.lifespanMatch");
      score += 1;
    } else if (petLifespan > userLifespanLevel) {
      reasons.push("quizResults.reasons.commitment");
    }
  }

  if (pet.pet_invasive_risk === "High") {
    reasons.push("quizResults.reasons.highEcologicalRisk");
  }

  const suitable = blockers === 0;

  return {
    pet,
    suitable,
    reasons,
    fits,
    score,
  };
};

// ===================== Utility: Shuffle Function =====================
// Randomize array order using Fisher-Yates shuffle
function shuffleArray<T>(items: T[]) {
  const copy = [...items];

  for (let i = copy.length - 1; i > 0; i -= 1) {
    const j = Math.floor(Math.random() * (i + 1));
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }

  return copy;
}

// ===================== Pagination + Refresh Hook =====================
// Handles paginated display and session-based persistence of results
function useRefreshableResults<T extends { pet: { pet_id: string } }>(
  items: T[],
  storageKey: string,
  pageSize = 6,
) {
  const [deck, setDeck] = useState<string[]>([]); // shuffled ID list
  const [cursor, setCursor] = useState(0); // pagination index

  // Initialize or restore deck from session storage
  useEffect(() => {
    if (items.length === 0) {
      setDeck([]);
      setCursor(0);
      return;
    }

    const currentIds = items.map((item) => item.pet.pet_id);
    const currentIdSet = new Set(currentIds);

    const savedDeckRaw = sessionStorage.getItem(`${storageKey}-deck`);
    const savedCursorRaw = sessionStorage.getItem(`${storageKey}-cursor`);

    if (savedDeckRaw) {
      try {
        const savedDeck = JSON.parse(savedDeckRaw) as string[];

        const keptIds = savedDeck.filter((id) => currentIdSet.has(id));
        const missingIds = currentIds.filter((id) => !keptIds.includes(id));
        const rebuiltDeck = [...keptIds, ...shuffleArray(missingIds)];

        if (rebuiltDeck.length > 0) {
          const parsedCursor = Number(savedCursorRaw ?? "0");
          const safeCursor =
            Number.isFinite(parsedCursor) && parsedCursor >= 0
              ? Math.min(parsedCursor, Math.max(rebuiltDeck.length - 1, 0))
              : 0;

          setDeck(rebuiltDeck);
          setCursor(safeCursor);
          return;
        }
      } catch {
        // ignore corrupted session storage
      }
    }

    const freshDeck = shuffleArray(currentIds);
    setDeck(freshDeck);
    setCursor(0);
    sessionStorage.setItem(`${storageKey}-deck`, JSON.stringify(freshDeck));
    sessionStorage.setItem(`${storageKey}-cursor`, "0");
  }, [items, storageKey]);

  // Compute visible items based on pagination window
  const visibleItems = useMemo(() => {
    const itemMap = new Map(
      items.map((item) => [item.pet.pet_id, item] as const),
    );

    return deck
      .slice(cursor, cursor + pageSize)
      .map((id) => itemMap.get(id))
      .filter((item): item is T => item !== undefined);
  }, [items, deck, cursor, pageSize]);

  // Move to next page or reshuffle when reaching end
  function refreshItems() {
    if (deck.length <= pageSize) return;

    const nextCursor = cursor + pageSize;

    if (nextCursor >= deck.length) {
      const reshuffledDeck = shuffleArray(deck);
      setDeck(reshuffledDeck);
      setCursor(0);
      sessionStorage.setItem(
        `${storageKey}-deck`,
        JSON.stringify(reshuffledDeck),
      );
      sessionStorage.setItem(`${storageKey}-cursor`, "0");
      return;
    }

    setCursor(nextCursor);
    sessionStorage.setItem(`${storageKey}-cursor`, String(nextCursor));
  }

  return {
    visibleItems,
    refreshItems,
    canRefresh: items.length > pageSize,
    totalCount: items.length,
  };
}

// ===================== Main Results Page Component =====================
export function QuizResults() {
  // Access user wishlist and quiz answers from context
  const { wishlist } = useWishlist();
  const { user, answers } = useUser();
  const { t, language } = useLanguage();

  // Fetch pet dataset and loading state from API hook
  const { pets, loading, error } = useQuizRecommendations();

  // ===================== Compute Evaluation Results =====================
  const results = useMemo(() => {
    if (!answers) return [];
    return pets.map((pet) => evaluatePet(pet, answers));
  }, [pets, answers]);

  // Filter results based on wishlist selection (if any)
  const userFocusedPets = useMemo(() => {
    return wishlist.length > 0
      ? results.filter((r) => wishlist.includes(r.pet.pet_id))
      : results;
  }, [results, wishlist]);

  // Split into suitable and unsuitable categories
  const matches = useMemo(() => {
    return userFocusedPets.filter((r) => r.suitable);
  }, [userFocusedPets]);

  const unsuitable = useMemo(() => {
    return userFocusedPets.filter((r) => !r.suitable);
  }, [userFocusedPets]);

  // Generate alternative recommendations ranked by score + risk
  const alternatives = useMemo(() => {
    return results
      .filter(
        (r) =>
          r.suitable &&
          !userFocusedPets.some((p) => p.pet.pet_id === r.pet.pet_id),
      )
      .sort((a, b) => {
        const scoreDiff = b.score - a.score;
        if (scoreDiff !== 0) return scoreDiff;

        const aRisk = riskLevel[a.pet.pet_invasive_risk ?? "Unknown"] ?? 4;
        const bRisk = riskLevel[b.pet.pet_invasive_risk ?? "Unknown"] ?? 4;
        return aRisk - bRisk;
      })
      .slice(0, 3);
  }, [results, userFocusedPets]);

  // Paginated UI handlers for match sections
  const {
    visibleItems: visibleMatches,
    refreshItems: refreshMatches,
    canRefresh: canRefreshMatches,
  } = useRefreshableResults(matches, "quiz-results-matches", 6);

  const {
    visibleItems: visibleUnsuitable,
    refreshItems: refreshUnsuitable,
    canRefresh: canRefreshUnsuitable,
  } = useRefreshableResults(unsuitable, "quiz-results-unsuitable", 6);

  // Redirect if quiz not completed
  if (!answers) {
    return <Navigate to="/quiz" replace />;
  }

  // ===================== Loading State UI =====================
  if (loading) {
    return (
      <div className="bg-stone-50 min-h-screen py-16 px-4">
        <div className="max-w-5xl mx-auto text-center text-stone-600">
          <CircularProgress size="3rem" />
          <p className="mt-4">{t("quizResults.loading")}</p>
        </div>
      </div>
    );
  }

  // ===================== Error State UI =====================
  if (error) {
    return (
      <div className="bg-stone-50 min-h-screen py-16 px-4">
        <div className="max-w-5xl mx-auto text-center text-rose-600">
          {error}
        </div>
      </div>
    );
  }

  // ===================== Main Results Rendering =====================
  return (
    <div className="bg-stone-50 min-h-screen py-16 px-4 font-sans text-stone-900">
      <div className="max-w-5xl mx-auto space-y-16">
        {/* ===================== Header Section ===================== */}
        <div className="text-center">
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: "spring", stiffness: 200 }}
            className="inline-block bg-emerald-100 p-4 rounded-full mb-6 shadow-md"
          >
            <CheckCircle2 className="w-16 h-16 text-emerald-600" />
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-4xl md:text-5xl font-extrabold mb-4"
          >
            {t("quizResults.title")}
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="text-xl text-stone-600 max-w-2xl mx-auto leading-relaxed mb-8"
          >
            {wishlist.length > 0
              ? t("quizResults.wishlistDescription")
              : t("quizResults.databaseDescription")}
          </motion.p>

          {/* Action buttons */}
          <div className="flex justify-center gap-4 flex-wrap">
            <Link
              to="/quiz"
              state={{ retake: true }}
              className="bg-white border-2 border-stone-200 text-stone-700 px-6 py-2 rounded-full font-bold hover:bg-stone-100 transition"
            >
              {t("quizResults.retakeQuiz")}
            </Link>

            <Link
              to="/identify"
              className="bg-stone-100 text-stone-700 px-6 py-2 rounded-full font-bold hover:bg-stone-200 transition inline-flex items-center gap-2"
            >
              <HelpCircle className="w-5 h-5" /> {t("quizResults.identifyHelp")}
            </Link>
          </div>
        </div>

        {/* ===================== Authentication Prompt ===================== */}
        <div className="text-center">
          {!user ? (
            <div className="mb-6 rounded-2xl border border-emerald-200 bg-emerald-50 p-5">
              <h3 className="text-lg font-semibold text-emerald-900 mb-2">
                {t("quizResults.saveResultsTitle")}
              </h3>
              <p className="text-emerald-800 mb-4">
                {t("quizResults.saveResultsDescription")}
              </p>
              <div className="flex flex-col sm:flex-row justify-center items-center gap-3">
                <Link
                  to="/login"
                  className="rounded-xl px-4 py-2 bg-emerald-600 text-white"
                >
                  {t("quizResults.createProfileLogin")}
                </Link>
              </div>
            </div>
          ) : (
            <div className="mb-6 rounded-2xl border border-stone-200 bg-white p-5">
              <h3 className="text-lg font-semibold mb-2">
                {t("quizResults.profileUpdatedTitle")}
              </h3>
              <p className="text-stone-600">
                {t("quizResults.profileUpdatedDescriptionStart")} @
                {user.username}'s{" "}
                {t("quizResults.profileUpdatedDescriptionEnd")}
              </p>
            </div>
          )}
        </div>

        {/* ===================== Suitable Matches Section ===================== */}
        {visibleMatches.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="space-y-8"
          >
            {/* Section header */}
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              <h2 className="text-3xl font-bold flex items-center gap-3 text-emerald-900 border-b-2 border-emerald-100 pb-4">
                <Heart className="w-8 h-8 text-emerald-500 fill-current" />
                {t("quizResults.suitableForYou")}
              </h2>

              {/* Refresh pagination button */}
              {canRefreshMatches && (
                <button
                  type="button"
                  onClick={refreshMatches}
                  className="inline-flex items-center gap-2 self-start sm:self-auto rounded-full border border-emerald-200 bg-white px-4 py-2 text-sm font-semibold text-emerald-700 shadow-sm hover:bg-emerald-50"
                >
                  <RefreshCw className="h-4 w-4" />
                  {t("quizResults.showOtherMatches")}
                </button>
              )}
            </div>

            {/* Match cards grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {visibleMatches.map(({ pet, fits }) => {
                const { primaryCommonName, otherCommonNames } = pet
                  ? getPetCommonNames(pet, language)
                  : { primaryCommonName: "Unknown Pet", otherCommonNames: [] };

                return (
                  <div
                    key={pet.pet_id}
                    className="bg-white rounded-3xl shadow-lg border-2 border-emerald-500 overflow-hidden flex flex-col relative"
                  >
                    {/* Image section */}
                    <div className="relative h-48">
                      <img
                        src={
                          pet.pet_image_ref
                            ? `/pet_image/${pet.pet_image_ref}`
                            : "/pet_image/pet_placeholder.png"
                        }
                        alt={pet.pet_vernacular_name ?? "Pet image"}
                        className="absolute inset-0 w-full h-full object-fit"
                      />
                      <div className="absolute top-4 right-4 bg-emerald-500 text-white px-3 py-1 rounded-full text-sm font-bold shadow-md">
                        {t("quizResults.greatFit")}
                      </div>
                    </div>

                    {/* Content section */}
                    <div className="p-6 flex flex-col flex-1">
                      <h3 className="text-2xl font-bold mb-1">
                        {primaryCommonName ||
                          pet.pet_scientific_name ||
                          t("speciesProfile.unknownSpecies")}
                      </h3>

                      <p className="text-stone-500 text-sm mb-4">
                        {t("quizResults.care")}:{" "}
                        {getLocalizedPetLabel(
                          careLevelLabels,
                          pet.pet_care_level,
                          language,
                        )}{" "}
                        • {t("quizResults.risk")}:{" "}
                        {getLocalizedPetLabel(
                          invasiveRiskLabels,
                          pet.pet_invasive_risk,
                          language,
                        )}
                      </p>

                      {/* Fit reasons */}
                      <div className="bg-emerald-50 rounded-2xl p-4 mb-6">
                        <h4 className="text-emerald-900 font-bold mb-2 flex items-center gap-2">
                          <CheckCircle2 className="w-5 h-5 text-emerald-600" />{" "}
                          {t("quizResults.whyItFitsYou")}
                        </h4>
                        <ul className="space-y-2 text-sm text-emerald-800">
                          {fits.map((fit, i) => (
                            <li key={i}>• {t(fit)}</li>
                          ))}
                        </ul>
                      </div>

                      {/* CTA */}
                      <div className="mt-auto">
                        <Link
                          to={`/species/${pet.pet_id}`}
                          className="w-full bg-emerald-600 hover:bg-emerald-700 text-white py-3 px-4 rounded-xl font-bold text-center transition-colors inline-flex items-center justify-center gap-2"
                        >
                          {t("quizResults.viewFullCareGuide")}{" "}
                          <ArrowRight className="w-5 h-5" />
                        </Link>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </motion.div>
        )}

        {/* ===================== Unsuitable Section ===================== */}
        {visibleUnsuitable.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="space-y-8"
          >
            {/* Header */}
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              <h2 className="text-3xl font-bold flex items-center gap-3 text-rose-900 border-b-2 border-rose-100 pb-4">
                <ShieldAlert className="w-8 h-8 text-rose-500" />
                {t("quizResults.notRecommended")}
              </h2>

              {/* Refresh button */}
              {canRefreshUnsuitable && (
                <button
                  type="button"
                  onClick={refreshUnsuitable}
                  className="inline-flex items-center gap-2 self-start sm:self-auto rounded-full border border-rose-200 bg-white px-4 py-2 text-sm font-semibold text-rose-700 shadow-sm hover:bg-rose-50"
                >
                  <RefreshCw className="h-4 w-4" />
                  {t("quizResults.showOtherConcerns")}
                </button>
              )}
            </div>

            {/* Unsuitable cards */}
            <div className="space-y-6">
              {visibleUnsuitable.map(({ pet, reasons }) => {
                const { primaryCommonName, otherCommonNames } =
                  getPetCommonNames(pet, language);

                return (
                  <div
                    key={pet.pet_id}
                    className="bg-white rounded-3xl p-6 border border-rose-200 shadow-sm flex flex-col md:flex-row gap-6 relative overflow-hidden"
                  >
                    <div className="absolute top-0 left-0 w-2 h-full bg-rose-500"></div>

                    {/* Image */}
                    <div className="md:w-1/3">
                      <img
                        src={
                          pet.pet_image_ref
                            ? `/pet_image/${pet.pet_image_ref}`
                            : "/pet_image/pet_placeholder.png"
                        }
                        alt={pet.pet_vernacular_name ?? "Pet image"}
                        className="w-full h-40 object-fit rounded-2xl shadow-sm"
                      />
                      <h4 className="font-bold text-xl text-stone-900 mt-3">
                        {primaryCommonName ||
                          pet.pet_scientific_name ||
                          t("speciesProfile.unknownSpecies")}
                      </h4>
                    </div>

                    {/* Reasons */}
                    <div className="md:w-2/3 bg-rose-50/50 rounded-2xl p-5 border border-rose-100">
                      <h5 className="font-bold text-rose-800 mb-3 flex items-center gap-2 text-lg">
                        <XOctagon className="w-5 h-5 text-rose-600" />
                        {t("quizResults.whyThisMayNotFitYou")}
                      </h5>

                      <ul className="space-y-3">
                        {reasons.map((reason, i) => (
                          <li
                            key={i}
                            className="flex gap-3 items-start text-rose-900 font-medium bg-white p-3 rounded-xl shadow-sm border border-rose-100"
                          >
                            <AlertTriangle className="w-5 h-5 text-rose-500 shrink-0 mt-0.5" />
                            <span>{t(reason)}</span>
                          </li>
                        ))}
                      </ul>

                      <div className="mt-4 text-sm text-stone-600 italic">
                        {t("quizResults.suggestion")}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </motion.div>
        )}

        {/* ===================== Alternatives Section ===================== */}
        {alternatives.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="bg-sky-50 rounded-3xl p-8 md:p-12 border border-sky-100 shadow-sm"
          >
            <h3 className="text-2xl font-bold text-sky-900 mb-4">
              {t("quizResults.recommendedAlternatives")}
            </h3>

            <p className="text-sky-800 mb-8 text-lg">
              {matches.length === 0
                ? t("quizResults.alternativesWhenNoMatches")
                : t("quizResults.alternativesWhenHasMatches")}
            </p>

            {/* Alternative cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {alternatives.map(({ pet, fits }) => (
                <div
                  key={pet.pet_id}
                  className="bg-white rounded-2xl overflow-hidden border border-sky-200 shadow-md flex flex-col h-full hover:shadow-lg transition-shadow"
                >
                  <img
                    src={
                      pet.pet_image_ref
                        ? `/pet_image/${pet.pet_image_ref}`
                        : "/pet_image/pet_placeholder.png"
                    }
                    alt={pet.pet_vernacular_name ?? "Pet image"}
                    className="w-full h-32 object-fit"
                  />

                  <div className="p-5 flex flex-col flex-1">
                    <div className="flex justify-between items-start mb-2">
                      <h4 className="font-bold text-xl text-stone-900 leading-tight">
                        {pet.pet_scientific_name}
                      </h4>

                      <span className="bg-emerald-100 text-emerald-800 text-xs font-bold px-2 py-1 rounded-md uppercase">
                        {t("quizResults.topMatch")}
                      </span>
                    </div>

                    {/* Tags */}
                    <div className="flex flex-wrap gap-2 mb-4">
                      <span className="text-xs bg-stone-100 text-stone-600 px-2 py-1 rounded-md">
                        {getLocalizedPetLabel(
                          careLevelLabels,
                          pet.pet_care_level,
                          language,
                        )}
                      </span>
                      <span className="text-xs bg-sky-100 text-sky-800 px-2 py-1 rounded-md">
                        {getLocalizedPetLabel(
                          invasiveRiskLabels,
                          pet.pet_invasive_risk,
                          language,
                        )}
                      </span>
                    </div>

                    {/* Highlight fit reason */}
                    <div className="text-sm text-stone-600 bg-stone-50 p-3 rounded-xl mb-4 italic flex-1">
                      “
                      {fits[0]
                        ? t(fits[0])
                        : t("quizResults.perfectFitFallback")}
                      ”
                    </div>

                    <Link
                      to={`/species/${pet.pet_id}`}
                      className="mt-auto text-sky-700 font-bold hover:text-sky-800 inline-flex items-center gap-1"
                    >
                      {t("quizResults.viewProfile")}{" "}
                      <ArrowRight className="w-4 h-4" />
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          </motion.div>
        )}

        {/* ===================== Empty State ===================== */}
        {matches.length === 0 && alternatives.length === 0 && (
          <div className="bg-stone-100 rounded-3xl p-12 text-center border border-stone-200">
            <Search className="w-16 h-16 text-stone-400 mx-auto mb-4" />
            <h3 className="text-2xl font-bold text-stone-900 mb-2">
              {t("quizResults.noRecommendationTitle")}
            </h3>
            <p className="text-stone-600 mb-6 text-lg">
              {t("quizResults.noRecommendationDescription")}
            </p>

            <Link
              to="/quiz"
              state={{ retake: true }}
              className="bg-emerald-600 text-white px-8 py-3 rounded-full font-bold hover:bg-emerald-700 transition inline-block"
            >
              {t("quizResults.adjustAnswers")}
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}

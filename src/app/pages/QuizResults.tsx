import React, { useEffect, useMemo, useState } from "react";
import { useLocation, Link, Navigate } from "react-router";
import { useWishlist } from "../context/WishlistContext";
import { LifestyleAnswers, useUser } from "../context/UserContext";
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
import { motion } from "motion/react";
import { useQuizRecommendations } from "../hooks/useQuizRecommendations";
import type { QuizRecommendationPet } from "../types/pet.types";
import { getPetCommonNames } from "../utils/petDisplay";
import CircularProgress from "@mui/material/CircularProgress";

const levels = {
  budget: { low: 1, medium: 2, high: 3 },
  space: { small: 1, medium: 2, large: 3 },
  time: { low: 1, medium: 2, high: 3 },
  experience: { beginner: 1, intermediate: 2, advanced: 3 },
  lifespan: { short: 1, medium: 2, long: 3 },
};

const riskLevel: Record<string, number> = {
  Low: 1,
  Medium: 2,
  High: 3,
  Unknown: 4,
};

function getBudgetLevel(
  category: QuizRecommendationPet["pet_lifetime_budget_category"],
): 1 | 2 | 3 | null {
  if (category === "Low") return 1;
  if (category === "Medium") return 2;
  if (category === "High") return 3;
  return null;
}

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

function getTimeLevel(careLevel: string | null): 1 | 2 | 3 | null {
  // temporary proxy until you have a real maintenance-frequency column
  return getExperienceLevel(careLevel);
}

function getLifespanLevel(longevity: number | null): 1 | 2 | 3 | null {
  if (typeof longevity !== "number" || !Number.isFinite(longevity)) {
    return null;
  }

  if (longevity <= 5) return 1;
  if (longevity <= 15) return 2;
  return 3;
}

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

  if (typeof maxLength !== "number" || !Number.isFinite(maxLength)) {
    return null;
  }

  if (maxLength <= 10) return 1;
  if (maxLength <= 30) return 2;
  return 3;
}

function getUserLifespanLevel(value: string | undefined): 1 | 2 | 3 | null {
  if (!value) return null;

  const normalized = value.trim().toLowerCase();

  if (normalized === "short") return 1;
  if (normalized === "medium") return 2;
  if (normalized === "long") return 3;

  return null;
}

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
      reasons.push(
        `Budget: This pet likely needs a ${pet.pet_lifetime_budget_category?.toLowerCase()} lifetime budget, which is above your selected budget.`,
      );
      blockers += 1;
    } else {
      fits.push("Suitable budget");
      score += 1;
    }
  }

  if (petSpace !== null) {
    if (levels.space[answers.space] < petSpace) {
      reasons.push(
        "Space: This pet may need a larger habitat setup than the space you selected.",
      );
      blockers += 1;
    } else {
      fits.push("Appropriate space requirement");
      score += 1;
    }
  }

  if (petTime !== null) {
    if (levels.time[answers.time] < petTime) {
      reasons.push(
        "Time: This pet may require more care time than your current availability.",
      );
      blockers += 1;
    } else {
      fits.push("Manageable maintenance time");
      score += 1;
    }
  }

  if (petExperience !== null) {
    if (levels.experience[answers.experience] < petExperience) {
      reasons.push(
        "Experience: This pet may be too challenging for your current experience level.",
      );
      blockers += 1;
    } else {
      fits.push("Manageable care level");
      score += 1;
    }
  }

  // lifespan is better as a preference signal, not a hard blocker
  const userLifespanLevel = getUserLifespanLevel(answers.lifespan);

  if (petLifespan !== null && userLifespanLevel !== null) {
    if (petLifespan === userLifespanLevel) {
      fits.push("Matches your lifespan preference");
      score += 1;
    } else if (petLifespan > userLifespanLevel) {
      reasons.push(
        "Commitment: This pet may live longer than the commitment you prefer.",
      );
    }
  }

  if (pet.pet_invasive_risk === "High") {
    reasons.push(
      "High ecological risk: This species needs especially responsible containment and must never be released.",
    );
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

function shuffleArray<T>(items: T[]) {
  const copy = [...items];

  for (let i = copy.length - 1; i > 0; i -= 1) {
    const j = Math.floor(Math.random() * (i + 1));
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }

  return copy;
}

function useRefreshableResults<T extends { pet: { pet_id: string } }>(
  items: T[],
  storageKey: string,
  pageSize = 6,
) {
  const [deck, setDeck] = useState<string[]>([]);
  const [cursor, setCursor] = useState(0);

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
        // ignore bad session data
      }
    }

    const freshDeck = shuffleArray(currentIds);
    setDeck(freshDeck);
    setCursor(0);
    sessionStorage.setItem(`${storageKey}-deck`, JSON.stringify(freshDeck));
    sessionStorage.setItem(`${storageKey}-cursor`, "0");
  }, [items, storageKey]);

  const visibleItems = useMemo(() => {
    const itemMap = new Map(
      items.map((item) => [item.pet.pet_id, item] as const),
    );

    return deck
      .slice(cursor, cursor + pageSize)
      .map((id) => itemMap.get(id))
      .filter((item): item is T => item !== undefined);
  }, [items, deck, cursor, pageSize]);

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

export function QuizResults() {
  const { wishlist } = useWishlist();
  const { user, answers } = useUser();
  const { pets, loading, error } = useQuizRecommendations();

  const results = useMemo(() => {
    if (!answers) return [];
    return pets.map((pet) => evaluatePet(pet, answers));
  }, [pets, answers]);

  const userFocusedPets = useMemo(() => {
    return wishlist.length > 0
      ? results.filter((r) => wishlist.includes(r.pet.pet_id))
      : results;
  }, [results, wishlist]);

  const matches = useMemo(() => {
    return userFocusedPets.filter((r) => r.suitable);
  }, [userFocusedPets]);

  const unsuitable = useMemo(() => {
    return userFocusedPets.filter((r) => !r.suitable);
  }, [userFocusedPets]);

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

  if (!answers) {
    return <Navigate to="/quiz" replace />;
  }

  if (loading) {
    return (
      <div className="bg-stone-50 min-h-screen py-16 px-4">
        <div className="max-w-5xl mx-auto text-center text-stone-600">
          <CircularProgress size="3rem" />
          <p className="mt-4">Loading your quiz matches...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-stone-50 min-h-screen py-16 px-4">
        <div className="max-w-5xl mx-auto text-center text-rose-600">
          {error}
        </div>
      </div>
    );
  }

  return (
    <div className="bg-stone-50 min-h-screen py-16 px-4 font-sans text-stone-900">
      <div className="max-w-5xl mx-auto space-y-16">
        {/* Header */}
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
            Your Lifestyle Compatibility Results
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="text-xl text-stone-600 max-w-2xl mx-auto leading-relaxed mb-8"
          >
            {wishlist.length > 0
              ? "We've evaluated the species on your list against your answers."
              : "We've evaluated our database to find the best matches for your lifestyle."}
          </motion.p>
          <div className="flex justify-center gap-4 flex-wrap">
            <Link
              to="/quiz"
              state={{ retake: true }}
              className="bg-white border-2 border-stone-200 text-stone-700 px-6 py-2 rounded-full font-bold hover:bg-stone-100 transition"
            >
              Retake Quiz
            </Link>
            <Link
              to="/identify"
              className="bg-stone-100 text-stone-700 px-6 py-2 rounded-full font-bold hover:bg-stone-200 transition inline-flex items-center gap-2"
            >
              <HelpCircle className="w-5 h-5" /> Not sure what pet you have?
            </Link>
          </div>
        </div>
        <div className="text-center">
          {!user ? (
            <div className="mb-6 rounded-2xl border border-emerald-200 bg-emerald-50 p-5">
              <h3 className="text-lg font-semibold text-emerald-900 mb-2">
                Save these results to your profile
              </h3>
              <p className="text-emerald-800 mb-4">
                Create a profile or log in to keep your quiz answers and update
                them whenever you retake the quiz.
              </p>
              <div className="flex flex-col sm:flex-row justify-center items-center gap-3">
                <Link
                  to="/login"
                  className="rounded-xl px-4 py-2 bg-emerald-600 text-white"
                >
                  Create profile / Log in
                </Link>
                <Link
                  to="/quiz"
                  className="rounded-xl px-4 py-2 border border-emerald-300 text-emerald-900"
                >
                  Retake quiz
                </Link>
              </div>
            </div>
          ) : (
            <div className="mb-6 rounded-2xl border border-stone-200 bg-white p-5">
              <h3 className="text-lg font-semibold mb-2">Profile updated</h3>
              <p className="text-stone-600">
                Your latest quiz answers are saved to @{user.username}'s
                profile. Retaking the quiz will update them automatically.
              </p>
            </div>
          )}
        </div>

        {/* Suitable Matches */}
        {visibleMatches.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="space-y-8"
          >
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              <h2 className="text-3xl font-bold flex items-center gap-3 text-emerald-900 border-b-2 border-emerald-100 pb-4">
                <Heart className="w-8 h-8 text-emerald-500 fill-current" />
                Suitable For You
              </h2>
              {canRefreshMatches && (
                <button
                  type="button"
                  onClick={refreshMatches}
                  className="inline-flex items-center gap-2 self-start sm:self-auto rounded-full border border-emerald-200 bg-white px-4 py-2 text-sm font-semibold text-emerald-700 shadow-sm hover:bg-emerald-50"
                >
                  <RefreshCw className="h-4 w-4" />
                  Show other matches
                </button>
              )}
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {visibleMatches.map(({ pet, fits }) => {
                const { primaryCommonName, otherCommonNames } =
                  getPetCommonNames(pet);
                return (
                  <div
                    key={pet.pet_id}
                    className="bg-white rounded-3xl shadow-lg border-2 border-emerald-500 overflow-hidden flex flex-col relative"
                  >
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
                        Great Fit
                      </div>
                    </div>
                    <div className="p-6 flex flex-col flex-1">
                      <h3 className="text-2xl font-bold mb-1">
                        {primaryCommonName ?? pet.pet_scientific_name}
                      </h3>
                      <p className="text-stone-500 text-sm mb-4">
                        Care: {pet.pet_care_level} • Risk:{" "}
                        {pet.pet_invasive_risk}
                      </p>

                      <div className="bg-emerald-50 rounded-2xl p-4 mb-6">
                        <h4 className="text-emerald-900 font-bold mb-2 flex items-center gap-2">
                          <CheckCircle2 className="w-5 h-5 text-emerald-600" />{" "}
                          Why it fits you:
                        </h4>
                        <ul className="space-y-2 text-sm text-emerald-800">
                          {fits.map((fit, i) => (
                            <li key={i}>• {fit}</li>
                          ))}
                        </ul>
                      </div>

                      <div className="mt-auto">
                        <Link
                          to={`/species/${pet.pet_id}`}
                          className="w-full bg-emerald-600 hover:bg-emerald-700 text-white py-3 px-4 rounded-xl font-bold text-center transition-colors inline-flex items-center justify-center gap-2"
                        >
                          View Full Care Guide{" "}
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

        {/* Unsuitable / Reconsider */}

        {visibleUnsuitable.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="space-y-8"
          >
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              <h2 className="text-3xl font-bold flex items-center gap-3 text-rose-900 border-b-2 border-rose-100 pb-4">
                <ShieldAlert className="w-8 h-8 text-rose-500" />
                Not Recommended
              </h2>

              {canRefreshUnsuitable && (
                <button
                  type="button"
                  onClick={refreshUnsuitable}
                  className="inline-flex items-center gap-2 self-start sm:self-auto rounded-full border border-rose-200 bg-white px-4 py-2 text-sm font-semibold text-rose-700 shadow-sm hover:bg-rose-50"
                >
                  <RefreshCw className="h-4 w-4" />
                  Show other concerns
                </button>
              )}
            </div>

            <div className="space-y-6">
              {visibleUnsuitable.map(({ pet, reasons }) => {
                const { primaryCommonName, otherCommonNames } =
                  getPetCommonNames(pet);
                return (
                  <div
                    key={pet.pet_id}
                    className="bg-white rounded-3xl p-6 border border-rose-200 shadow-sm flex flex-col md:flex-row gap-6 relative overflow-hidden"
                  >
                    <div className="absolute top-0 left-0 w-2 h-full bg-rose-500"></div>
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
                        {primaryCommonName ?? pet.pet_scientific_name}
                      </h4>
                    </div>
                    <div className="md:w-2/3 bg-rose-50/50 rounded-2xl p-5 border border-rose-100">
                      <h5 className="font-bold text-rose-800 mb-3 flex items-center gap-2 text-lg">
                        <XOctagon className="w-5 h-5 text-rose-600" /> Why this
                        may not fit you:
                      </h5>
                      <ul className="space-y-3">
                        {reasons.map((reason, i) => (
                          <li
                            key={i}
                            className="flex gap-3 items-start text-rose-900 font-medium bg-white p-3 rounded-xl shadow-sm border border-rose-100"
                          >
                            <AlertTriangle className="w-5 h-5 text-rose-500 shrink-0 mt-0.5" />
                            <span>{reason}</span>
                          </li>
                        ))}
                      </ul>
                      <div className="mt-4 text-sm text-stone-600 italic">
                        Suggestion: Consider adjusting your budget or freeing up
                        more space, otherwise explore the alternatives below.
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </motion.div>
        )}

        {/* Top Recommended Alternatives (Always show if no matches, or as extra suggestions) */}
        {alternatives.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="bg-sky-50 rounded-3xl p-8 md:p-12 border border-sky-100 shadow-sm"
          >
            <h3 className="text-2xl font-bold text-sky-900 mb-4">
              Recommended Alternatives
            </h3>
            <p className="text-sky-800 mb-8 text-lg">
              {matches.length === 0
                ? "Since none of the pets on your list fit your lifestyle, we highly recommend these safer, better-matching alternatives (ranked by lowest ecological risk):"
                : "You might also want to consider these highly suitable pets:"}
            </p>
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
                        Top Match
                      </span>
                    </div>
                    <div className="flex flex-wrap gap-2 mb-4">
                      <span className="text-xs bg-stone-100 text-stone-600 px-2 py-1 rounded-md">
                        {pet.pet_care_level} Care
                      </span>
                      <span className="text-xs bg-sky-100 text-sky-800 px-2 py-1 rounded-md">
                        {pet.pet_invasive_risk} Risk
                      </span>
                    </div>
                    <div className="text-sm text-stone-600 bg-stone-50 p-3 rounded-xl mb-4 italic flex-1">
                      "{fits[0] || "Perfect fit for your space and budget"}"
                    </div>
                    <Link
                      to={`/species/${pet.pet_id}`}
                      className="mt-auto text-sky-700 font-bold hover:text-sky-800 inline-flex items-center gap-1"
                    >
                      View Profile <ArrowRight className="w-4 h-4" />
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          </motion.div>
        )}

        {/* Empty State / No Match At All */}
        {matches.length === 0 && alternatives.length === 0 && (
          <div className="bg-stone-100 rounded-3xl p-12 text-center border border-stone-200">
            <Search className="w-16 h-16 text-stone-400 mx-auto mb-4" />
            <h3 className="text-2xl font-bold text-stone-900 mb-2">
              No suitable recommendation found
            </h3>
            <p className="text-stone-600 mb-6 text-lg">
              Your current lifestyle constraints might make it difficult to
              properly care for the aquatic pets in our database.
            </p>
            <Link
              to="/quiz"
              state={{ retake: true }}
              className="bg-emerald-600 text-white px-8 py-3 rounded-full font-bold hover:bg-emerald-700 transition inline-block"
            >
              Adjust Your Answers
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}

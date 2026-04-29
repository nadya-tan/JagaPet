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
} from "../utils/petDisplay";
import { useCompare } from "../context/CompareContext";
import { useUser } from "../context/UserContext";

type ExperienceLevel = "beginner" | "intermediate" | "advanced";
type RiskLevel = "low" | "medium" | "high";

const experienceRank: Record<ExperienceLevel, number> = {
  beginner: 1,
  intermediate: 2,
  advanced: 3,
};

const riskRank: Record<RiskLevel, number> = {
  low: 1,
  medium: 2,
  high: 3,
};

function normalizeCareLevel(
  value: string | null | undefined,
): ExperienceLevel | null {
  const text = (value ?? "").toLowerCase();

  if (text.includes("begin")) return "beginner";
  if (text.includes("intermediate")) return "intermediate";
  if (text.includes("advanced")) return "advanced";

  return null;
}

function normalizeRiskLevel(
  value: string | null | undefined,
): RiskLevel | null {
  const text = (value ?? "").toLowerCase();

  if (text.includes("low")) return "low";
  if (text.includes("medium")) return "medium";
  if (text.includes("high")) return "high";

  return null;
}

export function SpeciesProfile() {
  const navigate = useNavigate();
  const { toggleCompare, isInCompare, isCompareFull } = useCompare();
  const { id } = useParams<{ id: string }>();
  const { pet, relatedPets, loading, error } = usePetDetail(id);
  const { answers } = useUser();

  const suitability = useMemo(() => {
    if (!answers || !pet) return null;

    const fits: string[] = [];
    const reasons: string[] = [];

    const petCareLevel = normalizeCareLevel(pet.pet_care_level);
    const petRiskLevel = normalizeRiskLevel(pet.pet_invasive_risk);

    // hard-stop reason
    if (pet.pet_banned) {
      reasons.push("This species is banned in Malaysia");
    }

    // ecological risk
    if (petRiskLevel === "high") {
      reasons.push("Higher ecological risk");
    } else if (petRiskLevel === "low") {
      fits.push("Low ecological risk");
    }

    // care vs user experience
    if (petCareLevel) {
      if (experienceRank[answers.experience] >= experienceRank[petCareLevel]) {
        fits.push("Manageable care level");
      } else {
        reasons.push("High care difficulty for your experience level");
      }
    }

    return {
      isSuitable: reasons.length === 0,
      fits,
      reasons,
    };
  }, [answers, pet]);

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

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [id]);

  const dangerLevel = useMemo(
    () => normalizeDangerBadge(pet?.pet_danger),
    [pet?.pet_danger],
  );

  const isInvasive = useMemo(
    () => isInvasiveSpecies(pet?.pet_is_native),
    [pet?.pet_is_native],
  );

  const { primaryCommonName, otherCommonNames } = pet
    ? getPetCommonNames(pet)
    : { primaryCommonName: "Unknown Pet", otherCommonNames: [] };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-emerald-50 via-white to-stone-50 px-4 py-10">
        <div className="mx-auto max-w-6xl">
          <p className="text-stone-600">Loading pet profile...</p>
        </div>
      </div>
    );
  }

  if (error || !pet) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-emerald-50 via-white to-stone-50 px-4 py-10">
        <div className="mx-auto max-w-3xl rounded-3xl border border-stone-200 bg-white p-8 shadow-sm">
          <div className="mb-4 flex items-center gap-3 text-amber-700">
            <AlertTriangle className="h-6 w-6" />
            <h1 className="text-2xl font-bold">Species Not Found</h1>
          </div>
          <p className="mb-6 text-stone-600">
            The pet you are looking for might not be in the database yet, or the
            link may be incorrect.
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
            Return Home
          </Link>
        </div>
      </div>
    );
  }

  const inCompare = isInCompare(pet.pet_id);
  const compareDisabled = isCompareFull && !inCompare;
  const hasPetPrice = pet.pet_cost != null;

  return (
    <div className="min-h-screen bg-gradient-to-b from-emerald-50 via-white to-stone-50">
      {dangerLevel === "High" && (
        <div className="border-b border-red-200 bg-red-50 px-4 py-3 text-red-800">
          <div className="mx-auto flex max-w-6xl items-center gap-2 font-medium">
            <AlertTriangle className="h-5 w-5" />
            Warning: this pet may pose a higher danger risk. Review handling and
            safety information carefully.
          </div>
        </div>
      )}

      {pet.pet_banned && (
        <div className="border-b border-red-200 bg-red-50 px-4 py-3 text-red-800">
          <div className="mx-auto flex max-w-6xl items-center gap-2 font-medium">
            <AlertTriangle className="h-5 w-5" />
            Warning: this species is prohibited in Malaysia. If you are caught
            importing, selling, or keeping it, you can face a hefty fine or even
            jail time.
          </div>
        </div>
      )}

      {isInvasive && (
        <div className="border-b border-amber-200 bg-amber-50 px-4 py-3 text-amber-800">
          <div className="mx-auto flex max-w-6xl items-center gap-2 font-medium">
            <AlertTriangle className="h-5 w-5" />
            Notice: this species is considered invasive. Avoid release into
            local waterways and follow regional regulations.
          </div>
        </div>
      )}

      {/* Hero Header */}
      <div className="relative h-[450px] md:h-[550px] w-full bg-stone-900 overflow-hidden">
        <div className="absolute top-6 inset-x-0 z-20">
          <div className="mx-auto max-w-7xl px-8 md:px-12 flex justify-between items-center">
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
              <span>Back</span>
            </button>

            {/* // Compare Button */}
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
                  ? "Added to Compare"
                  : compareDisabled
                    ? "Compare Full"
                    : "Add to Compare"}
              </span>
            </button>
          </div>
        </div>

        <div className="absolute inset-0 bg-gradient-to-t from-stone-950 via-stone-900/40 to-transparent z-10"></div>
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

        <div className="absolute bottom-0 inset-x-0 z-20">
          <div className="mx-auto max-w-7xl px-8 md:px-12 pb-8 md:pb-12">
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
                {pet?.pet_invasive_risk || "Unknown"} Biodiversity Risk
              </span>

              <span
                className={getSpeciesCareBadgeClasses(
                  pet?.pet_care_level || "Unknown",
                )}
              >
                <HandHeart className="w-4 h-4" />
                {pet?.pet_care_level || "Unknown"} Care
              </span>

              <span
                className={getSpeciesDangerBadgeClasses(
                  dangerLevel || "Unknown",
                )}
              >
                <Skull className="w-4 h-4" />
                {dangerLevel || "Unknown"} Danger
              </span>

              {pet.pet_banned && (
                <span className="inline-flex items-center gap-1 rounded-full bg-red-100 px-4 py-1.5 text-sm font-semibold text-red-700">
                  <Ban className="w-4 h-4" />
                  Banned in Malaysia
                </span>
              )}
            </motion.div>

            <div className="flex flex-col gap-6 md:flex-row md:items-end md:justify-between">
              <div className="max-w-3xl">
                <motion.h1
                  key={`title-${pet?.pet_id}`}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: 0.3 }}
                  className="text-4xl md:text-6xl font-extrabold text-white mb-2 drop-shadow-xl"
                >
                  {primaryCommonName}
                </motion.h1>

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

                {otherCommonNames.length > 0 && (
                  <motion.p
                    key={`aka-${pet?.pet_id}`}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, delay: 0.45 }}
                    className="text-lg md:text-xl text-stone-200 font-serif"
                  >
                    <span className="font-semibold">A.K.A:</span>{" "}
                    {otherCommonNames.join(", ")}
                  </motion.p>
                )}
              </div>

              {pet.pet_cost != null && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: 0.5 }}
                  className="shrink-0 self-start md:self-end rounded-2xl border border-white/20 bg-white/15 px-6 py-5 backdrop-blur-md shadow-lg min-w-[180px]"
                >
                  <p className="text-xs font-semibold uppercase tracking-[0.2em] text-stone-300">
                    Estimated Price
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

      <section className="px-4 py-12">
        <div className="mx-auto grid max-w-6xl gap-8 lg:grid-cols-[1.6fr_1fr]">
          <div className="space-y-8">
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
                      ? "Why it fits you"
                      : "Why this may not fit you"}
                  </h2>

                  <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                    {suitability.isSuitable
                      ? suitability.fits.map((fit, index) => (
                          <div
                            key={`${fit}-${index}`}
                            className="flex items-center gap-3 rounded-2xl border border-emerald-100 bg-white p-5 shadow-sm"
                          >
                            <CheckCircle2 className="h-6 w-6 shrink-0 text-emerald-500" />
                            <span className="text-lg font-semibold text-emerald-900">
                              {fit}
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
                              {reason}
                            </span>
                          </div>
                        ))}
                  </div>
                </section>
              )}

            {recommendedAlternatives?.length > 0 && (
              <div className="rounded-3xl border border-stone-200 bg-white p-7 shadow-sm">
                <div className="mb-5 flex items-center gap-2 text-emerald-800">
                  <Fish className="h-5 w-5" />
                  <h2 className="text-2xl font-bold">
                    Recommended Alternatives
                  </h2>
                </div>

                <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
                  {recommendedAlternatives.map((item) => (
                    <Link
                      key={item.pet_id}
                      to={`/species/${item.pet_id}`}
                      className="rounded-2xl border border-stone-200 p-4 transition hover:border-emerald-400 hover:bg-emerald-50"
                    >
                      <div className="mb-3 flex flex-wrap gap-2">
                        {item.hasLowerRisk && (
                          <span className="inline-flex items-center gap-1 rounded-full bg-emerald-100 px-3 py-1 text-xs font-semibold text-emerald-800">
                            <ShieldAlert className="h-3.5 w-3.5" />
                            Lower Risk
                          </span>
                        )}

                        {item.hasLowerCare && (
                          <span className="inline-flex items-center gap-1 rounded-full bg-sky-100 px-3 py-1 text-xs font-semibold text-sky-800">
                            <HandHeart className="h-3.5 w-3.5" />
                            Easier Care
                          </span>
                        )}
                      </div>

                      <h3 className="font-bold text-stone-900">
                        {displayText(
                          item.pet_vernacular_name,
                          item.pet_scientific_name
                            ? item.pet_scientific_name
                            : "Unknown Species",
                        )}
                      </h3>

                      <p className="mt-1 text-sm italic text-stone-600">
                        {displayText(item.pet_scientific_name)}
                      </p>

                      <div className="mt-4 flex flex-wrap gap-2">
                        {item.pet_invasive_risk && (
                          <span
                            className={getDangerBadgeClasses(
                              item.pet_invasive_risk,
                            )}
                          >
                            <ShieldAlert className="w-3 h-3" />
                            {item.pet_invasive_risk} Risk
                          </span>
                        )}

                        {item.pet_care_level && (
                          <span
                            className={getCareBadgeClasses(item.pet_care_level)}
                          >
                            <HandHeart className="w-3 h-3" />
                            {item.pet_care_level} Care
                          </span>
                        )}
                      </div>
                    </Link>
                  ))}
                </div>
              </div>
            )}

            <div className="rounded-3xl border border-stone-200 bg-white p-7 shadow-sm">
              <div className="mb-4 flex items-center gap-2 text-emerald-800">
                <Info className="h-5 w-5" />
                <h2 className="text-2xl font-bold">About this pet</h2>
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <p className="text-sm font-semibold uppercase tracking-wide text-stone-500">
                    Vernacular name
                  </p>
                  <p className="mt-1 text-stone-800">
                    {displayText(pet.pet_vernacular_name)}
                  </p>
                </div>

                <div>
                  <p className="text-sm font-semibold uppercase tracking-wide text-stone-500">
                    Scientific name
                  </p>
                  <p className="mt-1 text-stone-800">
                    {displayText(pet.pet_scientific_name)}
                  </p>
                </div>

                <div>
                  <p className="text-sm font-semibold uppercase tracking-wide text-stone-500">
                    Genus
                  </p>
                  <p className="mt-1 text-stone-800">
                    {displayText(pet.pet_genus)}
                  </p>
                </div>

                <div>
                  <p className="text-sm font-semibold uppercase tracking-wide text-stone-500">
                    Family
                  </p>
                  <p className="mt-1 text-stone-800">
                    {displayText(pet.pet_family)}
                  </p>
                </div>

                {pet.pet_body_shape && (
                  <div>
                    <p className="text-sm font-semibold uppercase tracking-wide text-stone-500">
                      Body shape
                    </p>
                    <p className="mt-1 text-stone-800">
                      {formatPetBodyShape(pet.pet_body_shape)}
                    </p>
                  </div>
                )}

                {pet.pet_migration_type && (
                  <div>
                    <p className="text-sm font-semibold uppercase tracking-wide text-stone-500">
                      Migration type
                    </p>
                    <p className="mt-1 text-stone-800">
                      {displayText(pet.pet_migration_type)}
                    </p>
                  </div>
                )}
              </div>
            </div>

            {pet.pet_traits && (
              <div className="rounded-3xl border border-stone-200 bg-white p-7 shadow-sm">
                <div className="mb-4 flex items-center gap-2 text-emerald-800">
                  <Dna className="h-5 w-5" />
                  <h2 className="text-2xl font-bold">Traits</h2>
                </div>

                <div className="flex flex-wrap gap-3">
                  <span className="leading-7 text-stone-700">
                    {formatPetTraits(pet.pet_traits)}
                  </span>
                </div>
              </div>
            )}

            {pet.pet_diet &&
              (pet.pet_diet.main_type || pet.pet_diet.remarks) && (
                <div className="rounded-3xl border border-stone-200 bg-white p-7 shadow-sm">
                  <div className="mb-4 flex items-center gap-2 text-emerald-800">
                    <Leaf className="h-5 w-5" />
                    <h2 className="text-2xl font-bold">Diet</h2>
                  </div>

                  <div className="space-y-4">
                    {pet.pet_diet.main_type && (
                      <div>
                        <p className="text-sm font-semibold uppercase tracking-wide text-stone-500">
                          Main diet type
                        </p>
                        <div className="mt-2 flex flex-wrap gap-2">
                          <span className="inline-flex items-center rounded-full bg-emerald-100 px-4 py-1.5 text-sm font-semibold text-emerald-800">
                            {displayText(pet.pet_diet.main_type)}
                          </span>
                        </div>
                      </div>
                    )}

                    {pet.pet_diet.remarks && (
                      <div>
                        <p className="text-sm font-semibold uppercase tracking-wide text-stone-500">
                          Feeding notes
                        </p>
                        <p className="mt-1 leading-7 text-stone-700">
                          {displayText(pet.pet_diet.remarks)}
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              )}

            <div className="rounded-3xl border border-stone-200 bg-white p-7 shadow-sm">
              <div className="mb-4 flex items-center gap-2 text-emerald-800">
                <MessageSquareText className="h-5 w-5" />
                <h2 className="text-2xl font-bold">Notes</h2>
              </div>
              <p className="leading-7 text-stone-700">
                {displayText(
                  pet.pet_comments,
                  "No additional comments are available for this pet.",
                )}
              </p>
            </div>
          </div>

          <aside className="space-y-6">
            <div className="rounded-3xl border border-rose-800 bg-gradient-to-br from-rose-950 via-red-950 to-stone-950 p-6 text-white shadow-sm">
              <div className="mb-4 flex items-center gap-2 text-rose-100">
                <ShieldAlert className="h-5 w-5 text-rose-300" />
                <h3 className="text-xl font-bold">Safety Summary</h3>
              </div>

              <div className="space-y-4">
                <div>
                  <p className="text-sm font-semibold uppercase tracking-wide text-rose-300">
                    Danger
                  </p>
                  <p className="mt-1 text-rose-50">
                    {displayText(pet.pet_danger)}
                  </p>
                </div>

                <div>
                  <p className="text-sm font-semibold uppercase tracking-wide text-rose-300">
                    Native Status
                  </p>
                  <p className="mt-1 text-rose-50">
                    {displayText(pet.pet_is_native)}
                  </p>
                </div>

                <div>
                  <p className="text-sm font-semibold uppercase tracking-wide text-rose-300">
                    Legal Status
                  </p>
                  <p className="mt-1 text-rose-50">
                    {pet.pet_banned ? "Banned" : "Not banned"}
                  </p>
                </div>

                <div>
                  <p className="text-sm font-semibold uppercase tracking-wide text-rose-300">
                    Common Aquarium Species
                  </p>
                  <div className="mt-1 flex items-center gap-2 text-rose-50">
                    {pet.pet_aquarium ? (
                      <>
                        <CheckCircle2 className="h-4 w-4 text-emerald-400" />
                        Yes
                      </>
                    ) : (
                      <>
                        <XCircle className="h-4 w-4 text-rose-300" />
                        No / unknown
                      </>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* Care Tips */}
            <div className="bg-emerald-900 text-white rounded-3xl p-8 shadow-sm sticky top-24">
              <h3 className="text-2xl font-bold mb-6 flex items-center gap-2 text-emerald-50">
                <Leaf className="w-6 h-6 text-emerald-400" /> Quick Facts
              </h3>
              <div className="space-y-6">
                <div className="grid gap-4 sm:grid-cols-2">
                  {pet.pet_max_length && (
                    <div className="rounded-2xl border border-emerald-700 bg-emerald-800/40 p-4 flex flex-col items-center justify-center text-center">
                      <div className="mb-3 flex items-center gap-2 text-emerald-200">
                        <Ruler className="h-4 w-4" />
                        <h4 className="text-sm font-semibold">Max Length</h4>
                      </div>
                      <p className="text-2xl font-bold text-white">
                        {pet.pet_max_length}
                      </p>
                      <p className="mt-1 text-sm text-emerald-300">cm</p>
                    </div>
                  )}

                  {pet.pet_max_weight && (
                    <div className="rounded-2xl border border-emerald-700 bg-emerald-800/40 p-4 flex flex-col items-center justify-center text-center">
                      <div className="mb-2 flex items-center gap-2 text-emerald-200">
                        <Scale className="h-4 w-4" />
                        <h4 className="text-sm font-semibold">Max Weight</h4>
                      </div>
                      <p className="text-2xl font-bold text-white">
                        {pet.pet_max_weight}
                      </p>
                      <p className="mt-1 text-sm text-emerald-300">kg</p>
                    </div>
                  )}

                  {pet.pet_longevity && (
                    <div className="rounded-2xl border border-emerald-700 bg-emerald-800/40 p-4 flex flex-col items-center justify-center text-center">
                      <div className="mb-2 flex items-center gap-2 text-emerald-200">
                        <Clock className="h-4 w-4" />
                        <h4 className="text-sm font-semibold">Longevity</h4>
                      </div>
                      <p className="text-2xl font-bold text-white">
                        {pet.pet_longevity}
                      </p>
                      <p className="mt-1 text-sm text-emerald-300">years</p>
                    </div>
                  )}

                  {pet.pet_temperature && (
                    <div className="rounded-2xl border border-emerald-700 bg-emerald-800/40 p-4 flex flex-col items-center justify-center text-center">
                      <div className="mb-2 flex items-center gap-2 text-emerald-200">
                        <Thermometer className="h-4 w-4" />
                        <h4 className="text-sm font-semibold">Temperature</h4>
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
                          Water Hardness
                        </h4>
                      </div>
                      <p className="text-2xl font-bold text-white">
                        {displayText(pet.pet_water_hardness)}
                      </p>
                    </div>
                  )}
                </div>

                {(pet.pet_cost != null ||
                  pet.pet_tank_size ||
                  pet.pet_care_level) && (
                  <div className="bg-emerald-950 p-5 rounded-2xl border border-emerald-700 space-y-3">
                    <h4 className="font-bold text-emerald-100 mb-2 border-b border-emerald-800 pb-2">
                      Minimum Setup:
                    </h4>
                    {pet.pet_cost != null && (
                      <div className="flex justify-between text-sm">
                        <span className="text-emerald-400">Pet Price (RM)</span>
                        <span className="font-semibold text-white capitalize">
                          {pet.pet_cost}
                        </span>
                      </div>
                    )}
                    {pet.pet_tank_size && (
                      <div className="flex justify-between text-sm">
                        <span className="text-emerald-400">
                          Tank Size (Gallons)
                        </span>
                        <span className="font-semibold text-white capitalize">
                          {pet.pet_tank_size}
                        </span>
                      </div>
                    )}
                    {pet.pet_care_level && (
                      <div className="flex justify-between text-sm">
                        <span className="text-emerald-400">Experience</span>
                        <span className="font-semibold text-white capitalize">
                          {pet.pet_care_level}
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

import { Link, useNavigate } from "react-router";
import {
  AlertTriangle,
  ShieldCheck,
  Camera,
  HeartHandshake,
  Leaf,
  Fish,
  Sparkles,
  ShieldAlert,
  HandHeart,
  Banknote,
  RefreshCw,
  ScanHeart,
} from "lucide-react";
import { motion } from "motion/react";
import { SearchAutocomplete } from "../components/SearchAutocomplete";
import { usePetRecommendationPool } from "../hooks/usePetRecommendations";
import { useHighRiskSpecies } from "../hooks/useHighRiskSpecies";
import {
  getPetCommonNames,
  getDangerBadgeClasses,
  getCareBadgeClasses,
  getCostBadgeClasses,
  getNativeBadgeClasses,
} from "../utils/petDisplay";
import CircularProgress from "@mui/material/CircularProgress";
import { useEffect, useMemo, useRef, useState, type ChangeEvent } from "react";
import { RecommendedPet } from "../types/pet.types";

function shuffleArray<T>(items: T[]) {
  const copy = [...items];
  for (let i = copy.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }
  return copy;
}

export function Home() {
  const { recommendations, loading, error } = usePetRecommendationPool();
  const navigate = useNavigate();
  const {
    highRiskSpecies,
    loading: highRiskLoading,
    error: highRiskError,
  } = useHighRiskSpecies();
  const identifyFileInputRef = useRef<HTMLInputElement | null>(null);

  const [deck, setDeck] = useState<string[]>([]);
  const [cursor, setCursor] = useState(0);

  const [highRiskDeck, setHighRiskDeck] = useState<string[]>([]);
  const [highRiskCursor, setHighRiskCursor] = useState(0);

  const handleIdentifyPhotoSelect = (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];

    if (!file) {
      return;
    }

    if (!file.type.startsWith("image/")) {
      return;
    }

    navigate("/identify", {
      state: {
        imageFile: file,
      },
    });

    event.target.value = "";
  };

  useEffect(() => {
    if (!recommendations.length) return;

    const savedDeck = sessionStorage.getItem("home-recommendation-deck");
    const savedCursor = sessionStorage.getItem("home-recommendation-cursor");

    const validIds = new Set(recommendations.map((pet) => pet.pet_id));

    if (savedDeck) {
      const parsedDeck = JSON.parse(savedDeck) as string[];
      const filteredDeck = parsedDeck.filter((id) => validIds.has(id));

      if (filteredDeck.length >= 4) {
        setDeck(filteredDeck);
        setCursor(savedCursor ? Number(savedCursor) : 0);
        return;
      }
    }

    const shuffled = shuffleArray(recommendations.map((pet) => pet.pet_id));
    setDeck(shuffled);
    setCursor(0);
    sessionStorage.setItem(
      "home-recommendation-deck",
      JSON.stringify(shuffled),
    );
    sessionStorage.setItem("home-recommendation-cursor", "0");
  }, [recommendations]);

  useEffect(() => {
    if (!highRiskSpecies.length) return;

    const savedDeck = sessionStorage.getItem("home-high-risk-deck");
    const savedCursor = sessionStorage.getItem("home-high-risk-cursor");

    const validIds = new Set(highRiskSpecies.map((pet) => pet.pet_id));

    if (savedDeck) {
      const parsedDeck = JSON.parse(savedDeck) as string[];
      const filteredDeck = parsedDeck.filter((id) => validIds.has(id));

      if (filteredDeck.length >= 4) {
        setHighRiskDeck(filteredDeck);
        setHighRiskCursor(savedCursor ? Number(savedCursor) : 0);
        return;
      }
    }

    const shuffled = shuffleArray(highRiskSpecies.map((pet) => pet.pet_id));
    setHighRiskDeck(shuffled);
    setHighRiskCursor(0);
    sessionStorage.setItem("home-high-risk-deck", JSON.stringify(shuffled));
    sessionStorage.setItem("home-high-risk-cursor", "0");
  }, [highRiskSpecies]);

  const visibleRecommendations = useMemo(() => {
    const petMap = new Map(
      recommendations.map((pet) => [pet.pet_id, pet] as const),
    );

    return deck
      .slice(cursor, cursor + 4)
      .map((id) => petMap.get(id))
      .filter((pet): pet is RecommendedPet => pet !== undefined);
  }, [recommendations, deck, cursor]);

  const visibleHighRiskSpecies = useMemo(() => {
    const petMap = new Map(
      highRiskSpecies.map((pet) => [pet.pet_id, pet] as const),
    );

    return highRiskDeck
      .slice(highRiskCursor, highRiskCursor + 4)
      .map((id) => petMap.get(id))
      .filter((pet): pet is RecommendedPet => pet !== undefined);
  }, [highRiskSpecies, highRiskDeck, highRiskCursor]);

  function showNextRecommendations() {
    if (!deck.length) return;

    let nextCursor = cursor + 4;

    if (nextCursor >= deck.length) {
      const reshuffled = shuffleArray(deck);
      setDeck(reshuffled);
      setCursor(0);
      sessionStorage.setItem(
        "home-recommendation-deck",
        JSON.stringify(reshuffled),
      );
      sessionStorage.setItem("home-recommendation-cursor", "0");
      return;
    }

    setCursor(nextCursor);
    sessionStorage.setItem("home-recommendation-cursor", String(nextCursor));
  }

  function showNextHighRiskSpecies() {
    if (!highRiskDeck.length) return;

    let nextCursor = highRiskCursor + 4;

    if (nextCursor >= highRiskDeck.length) {
      const reshuffled = shuffleArray(highRiskDeck);
      setHighRiskDeck(reshuffled);
      setHighRiskCursor(0);
      sessionStorage.setItem("home-high-risk-deck", JSON.stringify(reshuffled));
      sessionStorage.setItem("home-high-risk-cursor", "0");
      return;
    }

    setHighRiskCursor(nextCursor);
    sessionStorage.setItem("home-high-risk-cursor", String(nextCursor));
  }

  return (
    <div className="flex flex-col gap-12 pb-24 font-sans bg-stone-50 text-stone-900 overflow-hidden">
      {/* Hero Section */}
      <section className="relative w-full min-h-[600px] pb-32 flex items-center justify-center">
        <div className="absolute inset-0 bg-emerald-900/60 z-10 overflow-hidden"></div>
        <img
          src="https://images.unsplash.com/photo-1764175760954-e99714c7dd98?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxiZWF1dGlmdWwlMjBwbGFudGVkJTIwYXF1YXJpdW0lMjB0YW5rfGVufDF8fHx8MTc3NDcxODU3Mnww&ixlib=rb-4.1.0&q=80&w=1080"
          alt="Beautiful planted aquarium"
          className="absolute inset-0 w-full h-full object-cover"
        />

        <div className="relative z-20 max-w-4xl mx-auto px-4 text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="bg-rose-600 text-white px-4 py-2 rounded-full inline-flex items-center gap-2 text-sm font-semibold mb-6 shadow-lg uppercase tracking-wider"
          >
            <AlertTriangle className="w-4 h-4" />
            Never Release Pets Into the Wild
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="text-4xl md:text-6xl font-extrabold text-white mb-6 drop-shadow-md leading-tight"
          >
            Responsible Pet Ownership Starts Here
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="text-lg md:text-xl text-emerald-50 mb-10 max-w-2xl mx-auto font-medium"
          >
            Explore species profiles, check lifestyle compatibility, and learn
            how to safely manage your ornamental fish and pet turtles in
            Malaysia.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.3 }}
            className="max-w-xl mx-auto shadow-2xl"
          >
            <>
              <input
                ref={identifyFileInputRef}
                type="file"
                accept="image/*"
                className="hidden"
                onChange={handleIdentifyPhotoSelect}
              />

              <SearchAutocomplete
                rightAction={
                  <button
                    type="button"
                    onClick={() => identifyFileInputRef.current?.click()}
                    className="rounded-full p-2 text-stone-500 hover:bg-stone-100 hover:text-emerald-700 transition"
                    aria-label="Identify pet by photo"
                    title="Identify pet by photo"
                  >
                    <Camera className="h-5 w-5" />
                  </button>
                }
              />
            </>
          </motion.div>
        </div>
      </section>

      {/* Quick Action Cards */}
      <section className="max-w-7xl mx-auto px-4 w-full mt-16 relative">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <Link
            to="/quiz"
            className="bg-white rounded-2xl p-6 shadow-xl border border-stone-100 hover:-translate-y-1 transition-all group overflow-hidden relative"
          >
            <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-50 rounded-full -mr-16 -mt-16 transition-transform group-hover:scale-150"></div>
            <div className="relative z-10">
              <ShieldCheck className="w-12 h-12 text-emerald-600 mb-4 bg-emerald-50 p-2 rounded-xl" />
              <h3 className="text-xl font-bold text-stone-800 mb-2">
                Pre-Purchase Quiz
              </h3>
              <p className="text-stone-600">
                Find out if you have the budget, space, and time for that
                specific pet.
              </p>
            </div>
          </Link>

          <Link
            to="/identify"
            className="bg-white rounded-2xl p-6 shadow-xl border border-stone-100 hover:-translate-y-1 transition-all group overflow-hidden relative"
          >
            <div className="absolute top-0 right-0 w-32 h-32 bg-sky-50 rounded-full -mr-16 -mt-16 transition-transform group-hover:scale-150"></div>
            <div className="relative z-10">
              <Camera className="w-12 h-12 text-sky-600 mb-4 bg-sky-50 p-2 rounded-xl" />
              <h3 className="text-xl font-bold text-stone-800 mb-2">
                Identify a Pet
              </h3>
              <p className="text-stone-600">
                Snap a photo to identify a species and view its biodiversity
                risk.
              </p>
            </div>
          </Link>

          <Link
            to="/health-screening"
            className="bg-white rounded-2xl p-6 shadow-xl border border-stone-100 hover:-translate-y-1 transition-all group overflow-hidden relative"
          >
            <div className="absolute top-0 right-0 w-32 h-32 bg-amber-50 rounded-full -mr-16 -mt-16 transition-transform group-hover:scale-150"></div>

            <div className="relative z-10">
              <ScanHeart className="w-12 h-12 text-amber-600 mb-4 bg-amber-50 p-2 rounded-xl" />

              <h3 className="text-xl font-bold text-stone-800 mb-2">
                Health Screening
              </h3>

              <p className="text-stone-600">
                Upload a fish photo to screen for possible visible disease
                signs.
              </p>
            </div>
          </Link>

          <Link
            to="/safe-exit"
            className="bg-white rounded-2xl p-6 shadow-xl border border-rose-100 hover:-translate-y-1 transition-all group overflow-hidden relative"
          >
            <div className="absolute top-0 right-0 w-32 h-32 bg-rose-50 rounded-full -mr-16 -mt-16 transition-transform group-hover:scale-150"></div>
            <div className="relative z-10">
              <HeartHandshake className="w-12 h-12 text-rose-500 mb-4 bg-rose-50 p-2 rounded-xl" />
              <h3 className="text-xl font-bold text-stone-800 mb-2">
                Need to Rehome?
              </h3>
              <p className="text-stone-600">
                Can't keep your pet anymore? Learn how to exit safely without
                releasing.
              </p>
            </div>
          </Link>
        </div>
      </section>

      {/* Recommended Species Section */}
      <section className="max-w-7xl mx-auto px-4 w-full pt-12">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h2 className="text-3xl font-extrabold text-stone-900 flex items-center gap-3">
              <Sparkles className="text-emerald-600" />
              Recommended for Beginners
            </h2>
            <p className="text-stone-600 mt-2 text-lg">
              Great starter species that are easier to care for and pose lower
              ecological risks.
            </p>
          </div>
          {!loading && !error && recommendations.length > 4 && (
            <button
              type="button"
              onClick={showNextRecommendations}
              className="inline-flex items-center gap-2 self-start sm:self-auto rounded-full border border-stone-200 bg-white px-4 py-2 text-sm font-semibold text-stone-700 shadow-sm hover:bg-stone-50"
            >
              <RefreshCw className="h-4 w-4" />
              Not my type
            </button>
          )}
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
          {loading ? (
            <div className="col-span-full flex items-center justify-center py-12">
              <CircularProgress size={20} />
            </div>
          ) : error ? (
            <p className="text-rose-600">{error}</p>
          ) : visibleRecommendations.length === 0 ? (
            <p className="text-stone-600">No recommendations found.</p>
          ) : (
            visibleRecommendations.map((pet, index) => {
              const { primaryCommonName } = getPetCommonNames(pet);
              return (
                <motion.div
                  key={pet.pet_id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                >
                  <Link
                    to={`/species/${pet.pet_id}`}
                    className="bg-white rounded-3xl overflow-hidden shadow-lg hover:shadow-2xl border border-stone-100 transition-all flex flex-col group cursor-pointer h-full"
                  >
                    <div className="relative h-56 overflow-hidden">
                      <img
                        src={
                          pet.pet_image_ref
                            ? `/pet_image/${pet.pet_image_ref}`
                            : "/pet_image/pet_placeholder.png"
                        }
                        alt={pet.pet_vernacular_name ?? "Pet image"}
                        className="w-full h-full object-fit group-hover:scale-105 transition duration-500"
                      />

                      <div className="absolute top-4 left-4 right-4 flex flex-wrap gap-2">
                        {pet.pet_invasive_risk && (
                          <span
                            className={getDangerBadgeClasses(
                              pet.pet_invasive_risk,
                            )}
                          >
                            <ShieldAlert className="w-3 h-3" />
                            {pet.pet_invasive_risk} Risk
                          </span>
                        )}

                        <span className="inline-flex items-center gap-1 bg-emerald-500/90 text-white px-3 py-1 rounded-full text-xs font-bold backdrop-blur-md shadow-sm">
                          <Sparkles className="w-3 h-3" />
                          Recommended
                        </span>
                      </div>
                    </div>

                    <div className="p-6 flex-1 flex flex-col">
                      <h3 className="text-xl font-bold text-stone-900 mb-1">
                        {primaryCommonName}
                      </h3>

                      <p className="text-sm text-stone-500 italic mb-4 font-serif">
                        {pet.pet_scientific_name ??
                          "Scientific name unavailable"}
                      </p>

                      <div className="mb-4 flex flex-wrap gap-2">
                        {pet.pet_is_native && (
                          <span
                            className={getNativeBadgeClasses(pet.pet_is_native)}
                          >
                            <Fish className="w-3 h-3" />
                            {pet.pet_is_native}
                          </span>
                        )}
                        {pet.pet_care_level && (
                          <span
                            className={getCareBadgeClasses(pet.pet_care_level)}
                          >
                            <HandHeart className="w-3 h-3" />
                            {pet.pet_care_level} Care
                          </span>
                        )}

                        {pet.pet_lifetime_budget_category && (
                          <span
                            className={getCostBadgeClasses(
                              pet.pet_lifetime_budget_category,
                            )}
                          >
                            <Banknote className="w-3 h-3" />
                            {pet.pet_lifetime_budget_category} Budget
                          </span>
                        )}
                      </div>

                      {pet.pet_comments && (
                        <p className="text-stone-600 text-sm line-clamp-3 mb-6 flex-1">
                          {pet.pet_comments}
                        </p>
                      )}

                      <div className="text-emerald-700 font-semibold text-sm">
                        View Profile & Care Guide →
                      </div>
                    </div>
                  </Link>
                </motion.div>
              );
            })
          )}
        </div>
      </section>

      <section className="max-w-7xl mx-auto px-4 w-full pt-12">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h2 className="text-3xl font-extrabold text-stone-900 flex items-center gap-3">
              <Leaf className="text-emerald-600" />
              High Biodiversity Risk Alert
            </h2>
            <p className="text-stone-600 mt-2 text-lg">
              Commonly bought pets that pose threats to local ecosystems if
              released.
            </p>
          </div>

          {!highRiskLoading && !highRiskError && highRiskSpecies.length > 4 && (
            <button
              type="button"
              onClick={showNextHighRiskSpecies}
              className="inline-flex items-center gap-2 self-start sm:self-auto rounded-full border border-stone-200 bg-white px-4 py-2 text-sm font-semibold text-stone-700 shadow-sm hover:bg-stone-50"
            >
              <RefreshCw className="h-4 w-4" />
              Show more
            </button>
          )}
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
          {highRiskLoading ? (
            <div className="col-span-full flex items-center justify-center py-12">
              <CircularProgress size={20} />
            </div>
          ) : highRiskError ? (
            <p className="text-rose-600">{highRiskError}</p>
          ) : visibleHighRiskSpecies.length === 0 ? (
            <p className="text-stone-600">No high risk species found.</p>
          ) : (
            visibleHighRiskSpecies.map((pet, index) => {
              const { primaryCommonName } = getPetCommonNames(pet);

              return (
                <motion.div
                  key={pet.pet_id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                >
                  <Link
                    to={`/species/${pet.pet_id}`}
                    className="bg-white rounded-3xl overflow-hidden shadow-lg hover:shadow-2xl border border-stone-100 transition-all flex flex-col group cursor-pointer h-full"
                  >
                    <div className="relative h-56 overflow-hidden">
                      <img
                        src={
                          pet.pet_image_ref
                            ? `/pet_image/${pet.pet_image_ref}`
                            : "/pet_image/pet_placeholder.png"
                        }
                        alt={pet.pet_vernacular_name ?? "Pet image"}
                        className="w-full h-full object-fit group-hover:scale-105 transition duration-500"
                      />

                      <div className="absolute top-4 left-4 right-4 flex flex-wrap gap-2">
                        {pet.pet_invasive_risk && (
                          <span
                            className={getDangerBadgeClasses(
                              pet.pet_invasive_risk,
                            )}
                          >
                            <ShieldAlert className="w-3 h-3" />
                            {pet.pet_invasive_risk} Risk
                          </span>
                        )}

                        {pet.pet_care_level && (
                          <span
                            className={getCareBadgeClasses(pet.pet_care_level)}
                          >
                            <HandHeart className="w-3 h-3" />
                            {pet.pet_care_level} Care
                          </span>
                        )}
                      </div>
                    </div>

                    <div className="p-6 flex-1 flex flex-col">
                      <h3 className="text-xl font-bold text-stone-900 mb-1">
                        {primaryCommonName}
                      </h3>

                      <p className="text-sm text-stone-500 italic mb-4 font-serif">
                        {pet.pet_scientific_name ??
                          "Scientific name unavailable"}
                      </p>

                      <div className="mb-4 flex flex-wrap gap-2">
                        {pet.pet_is_native && (
                          <span
                            className={getNativeBadgeClasses(pet.pet_is_native)}
                          >
                            <Fish className="w-3 h-3" />
                            {pet.pet_is_native}
                          </span>
                        )}
                      </div>

                      {pet.pet_comments && (
                        <p className="text-stone-600 text-sm line-clamp-3 mb-6 flex-1">
                          {pet.pet_comments}
                        </p>
                      )}

                      <div className="text-emerald-700 font-semibold text-sm flex items-center gap-1 group-hover:gap-2 transition-all">
                        View Profile & Care Guide →
                      </div>
                    </div>
                  </Link>
                </motion.div>
              );
            })
          )}
        </div>
      </section>

      {/* Educational Banner */}
      <section className="max-w-5xl mx-auto px-4 w-full">
        <div className="bg-gradient-to-br from-stone-800 to-stone-900 rounded-3xl p-8 md:p-12 shadow-2xl relative overflow-hidden">
          <div className="absolute top-0 right-0 opacity-10 transform scale-150 translate-x-12 -translate-y-12 pointer-events-none">
            <Fish className="w-64 h-64 text-white" />
          </div>
          <div className="relative z-10 max-w-2xl">
            <h2 className="text-3xl font-bold text-white mb-4">
              Why shouldn't I set my pet free?
            </h2>
            <p className="text-stone-300 text-lg mb-8 leading-relaxed">
              Pets like the Red-Eared Slider or Suckermouth Catfish (Pleco)
              aren't native to Malaysia. When released into our rivers and
              lakes, they aggressively outcompete local wildlife for food,
              destroy habitats, and spread foreign diseases. Our local species
              suffer immensely.
            </p>
            <div className="flex flex-wrap gap-4">
              <Link
                to="/safe-exit"
                className="bg-white text-stone-900 hover:bg-emerald-50 px-6 py-3 rounded-full font-bold transition shadow-md"
              >
                Find Alternative Rehoming
              </Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}

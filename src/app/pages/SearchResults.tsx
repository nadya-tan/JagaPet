import { useState } from "react";
import { useSearchParams, Link, useNavigate } from "react-router";
import {
  Search,
  Fish,
  AlertCircle,
  ArrowLeft,
  Sparkles,
  HandHeart,
  ShieldAlert,
  Skull,
  ScanEye,
  Ban,
} from "lucide-react";
import { motion } from "motion/react";
import type { SortOption } from "../types/pet.types";
import {
  getPetCommonNames,
  getLocalizedPetComments,
  displayText,
  normalizeDangerBadge,
  getDangerBadgeClasses,
  getCareBadgeClasses,
  getNativeBadgeClasses,
  getLocalizedPetLabel,
  careLevelLabels,
  invasiveRiskLabels,
  nativeStatusLabels,
  dangerLabels,
} from "../utils/petDisplay.ts";
import { usePetSearch } from "../hooks/usePetSearch";
import { useSortedPets } from "../hooks/useSortedPets";
import { usePagination } from "../hooks/usePagination";
import { useLanguage } from "../context/LanguageContext";
import { TranslatedText } from "../components/TranslatedText.tsx";

/**
 * SearchResults Component
 * ========================
 * This component is responsible for:
 * 1. Reading search query parameters from URL
 * 2. Fetching pet search results based on query
 * 3. Sorting and paginating results
 * 4. Rendering search UI, loading/error states, and result cards
 */
export function SearchResults() {
  /**
   * =====================
   * Language Setup
   * =====================
   */

  const { t, language } = useLanguage();

  /**
   * =====================
   * URL & Navigation Setup
   * =====================
   */

  // Extract query parameters from URL (?q=xxx)
  const [searchParams] = useSearchParams();

  // Navigation handler (used for back/home navigation)
  const navigate = useNavigate();

  // Extract search query string, fallback to empty string
  const query = searchParams.get("q") || "";

  /**
   * =====================
   * Local State
   * =====================
   */

  // Sorting mode for search results (default: aquarium/popularity)
  const [sortBy, setSortBy] = useState<SortOption>("aquarium");

  /**
   * =====================
   * Data Fetching Layer
   * =====================
   */

  // Custom hook: performs API/search logic for pets
  const { results, loading, error } = usePetSearch(query);

  // Custom hook: sorts results based on selected sort method
  const sortedResults = useSortedPets(results, sortBy);

  /**
   * =====================
   * Pagination Layer
   * =====================
   *
   * Splits sorted results into pages and provides navigation helpers
   */
  const {
    currentPage,
    totalPages,
    paginatedItems,
    goToPage,
    goNext,
    goPrevious,
  } = usePagination(sortedResults, 9, [query, sortBy]);

  return (
    <div className="min-h-screen bg-gradient-to-b from-emerald-50 via-white to-stone-50 px-4 py-10">
      <div className="mx-auto max-w-6xl">
        {/* =====================
            Back Navigation Button
            ===================== */}
        <button
          onClick={() => {
            // If browser history exists, go back; otherwise go home
            if (window.history.length > 1) {
              navigate(-1);
            } else {
              navigate("/");
            }
          }}
          className="group mb-6 flex items-center gap-2 text-stone-600 transition hover:text-emerald-600"
        >
          <ArrowLeft className="h-4 w-4 transition group-hover:-translate-x-1" />
          {t("searchResults.back")}
        </button>

        {/* =====================
            Search Header Section
            ===================== */}
        <div className="mb-8 rounded-[2rem] bg-gradient-to-r from-emerald-700 via-emerald-600 to-teal-600 p-8 text-white shadow-xl">
          <div className="mb-3 flex items-center gap-3">
            <Search className="h-7 w-7" />
            <h1 className="text-3xl font-black tracking-tight">
              {t("searchResults.title")}
            </h1>
          </div>

          {/* Display current query */}
          <p className="text-emerald-50">
            {t("searchResults.searchingFor")}{" "}
            <span className="font-semibold">"{query}"</span>
          </p>
        </div>

        {/* =====================
            Loading / Error / Results / Empty States
            ===================== */}
        {loading ? (
          <div className="rounded-3xl border border-stone-200 bg-white p-8 shadow-sm">
            <p className="text-stone-600">{t("searchResults.loading")}</p>
          </div>
        ) : error ? (
          <div className="rounded-3xl border border-red-200 bg-red-50 p-8 shadow-sm">
            <div className="mb-3 flex items-center gap-2 text-red-700">
              <AlertCircle className="h-5 w-5" />
              <h2 className="text-xl font-bold">
                {t("searchResults.searchError")}
              </h2>
            </div>
            <p className="text-red-800">{error}</p>
          </div>
        ) : results.length > 0 ? (
          <>
            {/* Results summary */}
            <div className="mb-6 rounded-3xl border border-emerald-200 bg-emerald-50 p-6">
              <div className="mb-2 flex items-center gap-2 text-emerald-700">
                <Sparkles className="h-5 w-5" />
                <h2 className="text-xl font-bold">
                  {t("searchResults.matchingPets")}
                </h2>
              </div>

              <p className="text-stone-700">
                {t("searchResults.summary.foundPrefix")} {results.length}{" "}
                {results.length === 1
                  ? t("searchResults.summary.resultSingular")
                  : t("searchResults.summary.resultPlural")}{" "}
                {t("searchResults.summary.foundSuffix")}
              </p>
            </div>

            {/* =====================
                Sorting Control
                ===================== */}
            <div className="mb-6 flex items-center gap-3">
              <label
                htmlFor="sort"
                className="text-xl font-semibold text-emerald-700"
              >
                {t("searchResults.sortBy")}
              </label>

              {/* Dropdown controlling sort mode */}
              <select
                id="sort"
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as SortOption)}
                className="rounded-full border border-stone-300 bg-white px-4 py-2 text-base font-medium text-stone-700 shadow-sm outline-none transition focus:border-emerald-500"
              >
                <option value="aquarium">
                  {t("searchResults.sortOptions.aquarium")}
                </option>
                <option value="alphabet_asc">
                  {t("searchResults.sortOptions.alphabetAsc")}
                </option>
                <option value="alphabet_desc">
                  {t("searchResults.sortOptions.alphabetDesc")}
                </option>
                <option value="invasive_risk_desc">
                  {t("searchResults.sortOptions.invasiveRiskDesc")}
                </option>
                <option value="invasive_risk_asc">
                  {t("searchResults.sortOptions.invasiveRiskAsc")}
                </option>
                <option value="care_level_desc">
                  {t("searchResults.sortOptions.careLevelDesc")}
                </option>
                <option value="care_level_asc">
                  {t("searchResults.sortOptions.careLevelAsc")}
                </option>
                <option value="native_status_desc">
                  {t("searchResults.sortOptions.nativeStatusDesc")}
                </option>
                <option value="native_status_asc">
                  {t("searchResults.sortOptions.nativeStatusAsc")}
                </option>
                <option value="cost_desc">
                  {t("searchResults.sortOptions.costDesc")}
                </option>
                <option value="cost_asc">
                  {t("searchResults.sortOptions.costAsc")}
                </option>
              </select>
            </div>

            {/* =====================
                Results Grid
                ===================== */}
            <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
              {paginatedItems.map((pet, index) => {
                // Normalize danger level into consistent format
                const danger = normalizeDangerBadge(pet.pet_danger);

                // Extract display names (primary + alternative names)
                const { primaryCommonName, otherCommonNames } = pet
                  ? getPetCommonNames(pet, language)
                  : { primaryCommonName: "Unknown Pet", otherCommonNames: [] };

                const localizedComments = pet
                  ? getLocalizedPetComments(pet, language)
                  : "";

                return (
                  <motion.div
                    key={pet.pet_id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.1 }}
                  >
                    {/* Card link to species detail page */}
                    <Link
                      to={`/species/${pet.pet_id}`}
                      className="bg-white rounded-2xl overflow-hidden shadow-lg hover:shadow-2xl border border-stone-100 transition-all flex flex-col group cursor-pointer h-full"
                    >
                      {/* =====================
                          Image Section
                          ===================== */}
                      <div className="relative h-64 overflow-hidden">
                        <img
                          src={
                            pet.pet_image_ref
                              ? `/pet_image/${pet.pet_image_ref}`
                              : "/pet_image/pet_placeholder.png"
                          }
                          alt={primaryCommonName}
                          className="w-full h-full object-fit group-hover:scale-105 transition duration-500"
                        />

                        {/* Badges overlay */}
                        <div className="absolute top-4 left-4 flex flex-wrap gap-2">
                          {/* Biodiversity risk badge */}
                          {pet.pet_invasive_risk && (
                            <span
                              className={getDangerBadgeClasses(
                                pet.pet_invasive_risk,
                              )}
                            >
                              <ShieldAlert className="w-3 h-3" />
                              {getLocalizedPetLabel(
                                invasiveRiskLabels,
                                pet.pet_invasive_risk,
                                language,
                              )}
                            </span>
                          )}

                          {/* Care level badge */}
                          {pet.pet_care_level && (
                            <span
                              className={getCareBadgeClasses(
                                pet.pet_care_level,
                              )}
                            >
                              <HandHeart className="w-3 h-3" />
                              {getLocalizedPetLabel(
                                careLevelLabels,
                                pet.pet_care_level,
                                language,
                              )}
                            </span>
                          )}

                          {/* Legal restriction badge */}
                          {pet.pet_banned && (
                            <span className="inline-flex items-center gap-1 rounded-full bg-red-100 px-3 py-1 text-xs font-bold text-red-700">
                              <Ban className="w-4 h-4" />
                              {t("searchResults.badges.bannedInMalaysia")}
                            </span>
                          )}
                        </div>
                      </div>

                      {/* =====================
                          Content Section
                          ===================== */}
                      <div className="p-6 flex-1 flex flex-col">
                        {/* Primary name */}
                        <h3 className="text-xl font-bold text-stone-900 mb-1 group-hover:text-emerald-700 transition">
                          {primaryCommonName}
                        </h3>

                        {/* Scientific name */}
                        <p className="text-sm text-stone-500 italic mb-2 font-serif">
                          {pet.pet_scientific_name}
                        </p>

                        {/* Alternative names */}
                        {otherCommonNames.length > 0 && (
                          <p className="text-sm text-stone-500 mb-3">
                            <span className="font-semibold">
                              {t("searchResults.aka")}
                            </span>{" "}
                            {otherCommonNames.join(", ")}
                          </p>
                        )}

                        {/* Attribute badges */}
                        <div className="mb-4 flex flex-wrap gap-2">
                          {/* Danger level */}
                          <span className={getDangerBadgeClasses(danger)}>
                            <Skull className="w-3 h-3" />
                            {getLocalizedPetLabel(
                              dangerLabels,
                              danger,
                              language,
                            )}
                          </span>

                          {/* Native status */}
                          {pet.pet_is_native && (
                            <span
                              className={getNativeBadgeClasses(
                                pet.pet_is_native,
                              )}
                            >
                              <Fish className="w-3 h-3" />
                              {getLocalizedPetLabel(
                                nativeStatusLabels,
                                pet.pet_is_native,
                                language,
                              )}
                            </span>
                          )}

                          {/* Popular/common indicator */}
                          {pet.pet_aquarium && (
                            <span className="inline-flex items-center gap-1 rounded-full bg-blue-100 px-3 py-1 text-xs font-bold text-blue-700">
                              <ScanEye className="w-3 h-3" />
                              {t("searchResults.badges.common")}
                            </span>
                          )}
                        </div>

                        {/* Description text */}
                        <p className="text-stone-600 text-sm mb-6 line-clamp-3">
                          {displayText(
                            localizedComments,
                            t("searchResults.noDescription"),
                          )}
                        </p>

                        {/* CTA */}
                        <div className="mt-auto flex items-center justify-between">
                          <div className="text-emerald-700 font-semibold text-sm flex items-center gap-1 group-hover:gap-2 transition-all">
                            {t("searchResults.viewProfileCareGuide")}
                          </div>
                        </div>
                      </div>
                    </Link>
                  </motion.div>
                );
              })}
            </div>

            {/* =====================
                Pagination Controls
                ===================== */}
            {totalPages > 1 && (
              <div className="mt-8 flex flex-wrap items-center justify-center gap-2">
                {/* Previous page */}
                <button
                  onClick={goPrevious}
                  disabled={currentPage === 1}
                  className="rounded-full border border-stone-300 bg-white px-4 py-2 text-sm font-semibold text-stone-700 transition disabled:cursor-not-allowed disabled:opacity-50 hover:border-emerald-500 hover:text-emerald-700"
                >
                  {t("searchResults.pagination.previous")}
                </button>

                {/* Page number buttons */}
                {Array.from({ length: totalPages }, (_, i) => i + 1).map(
                  (page) => (
                    <button
                      key={page}
                      onClick={() => goToPage(page)}
                      className={`rounded-full px-4 py-2 text-sm font-semibold transition ${
                        currentPage === page
                          ? "bg-emerald-600 text-white"
                          : "border border-stone-300 bg-white text-stone-700 hover:border-emerald-500 hover:text-emerald-700"
                      }`}
                    >
                      {page}
                    </button>
                  ),
                )}

                {/* Next page */}
                <button
                  onClick={goNext}
                  disabled={currentPage === totalPages}
                  className="rounded-full border border-stone-300 bg-white px-4 py-2 text-sm font-semibold text-stone-700 transition disabled:cursor-not-allowed disabled:opacity-50 hover:border-emerald-500 hover:text-emerald-700"
                >
                  {t("searchResults.pagination.next")}
                </button>
              </div>
            )}

            {/* Page indicator */}
            <p className="mt-4 text-center text-base text-stone-600">
              {t("searchResults.pagination.pagePrefix")} {currentPage}{" "}
              {t("searchResults.pagination.pageMiddle")} {totalPages}
              {t("searchResults.pagination.pageSuffix")}
            </p>
          </>
        ) : (
          /* =====================
            Empty State
            ===================== */
          <div className="rounded-[2rem] border border-stone-200 bg-white p-10 text-center shadow-sm">
            {/* Icon */}
            <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-stone-100">
              <AlertCircle className="h-7 w-7 text-stone-500" />
            </div>

            {/* Title */}
            <h2 className="text-2xl font-bold text-stone-900">
              {t("searchResults.empty.title")}
            </h2>

            {/* Description */}
            <p className="mx-auto mt-3 max-w-2xl text-stone-600">
              {t("searchResults.empty.descriptionStart")} "{query}".{" "}
              {t("searchResults.empty.descriptionEnd")}
            </p>

            {/* Action buttons */}
            <div className="mt-6 flex flex-wrap justify-center gap-3">
              <Link
                to="/"
                className="rounded-full bg-emerald-600 px-6 py-3 font-semibold text-white transition hover:bg-emerald-700"
              >
                {t("searchResults.empty.browseHome")}
              </Link>
              <button
                onClick={() => navigate(-1)}
                className="rounded-full border-2 border-stone-300 px-6 py-3 font-semibold text-stone-700 transition hover:border-emerald-600 hover:text-emerald-700"
              >
                {t("searchResults.empty.goBack")}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

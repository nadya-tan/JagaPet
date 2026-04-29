import { useState, useEffect, useRef, type ReactNode } from "react";
import { useNavigate } from "react-router";
import { Search, X } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { usePetSearch } from "../hooks/usePetSearch";
import { displayText, getPetCommonNames } from "../utils/petDisplay";
import { useDebouncedValue } from "../hooks/useDebouncedValue";

interface SearchAutocompleteProps {
  placeholder?: string;
  className?: string;
  onSearch?: () => void;
  rightAction?: ReactNode;
}

function normalizeRiskLevel(value: string | null | undefined) {
  const text = (value ?? "").toLowerCase();

  if (text.includes("high")) return "High";
  if (text.includes("medium")) return "Medium";
  if (text.includes("low")) return "Low";
  return "Unknown";
}

function getPetImageSrc(imageRef: string | null) {
  return imageRef ? `/pet_image/${imageRef}` : "/pet_image/pet_placeholder.png";
}

export function SearchAutocomplete({
  placeholder = "Search 'Red-Eared Slider', 'Pleco'...",
  className = "",
  onSearch,
  rightAction,
}: SearchAutocompleteProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [showSuggestions, setShowSuggestions] = useState(false);
  const navigate = useNavigate();
  const wrapperRef = useRef<HTMLDivElement>(null);

  const debouncedQuery = useDebouncedValue(searchQuery, 300);
  const { results, loading } = usePetSearch(debouncedQuery);
  const suggestions = results.slice(0, 6);

  useEffect(() => {
    if (searchQuery.trim().length >= 1) {
      setShowSuggestions(true);
    } else {
      setShowSuggestions(false);
    }
  }, [searchQuery]);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        wrapperRef.current &&
        !wrapperRef.current.contains(event.target as Node)
      ) {
        setShowSuggestions(false);
      }
    }

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();

    if (!searchQuery.trim()) return;

    navigate(`/search?q=${encodeURIComponent(searchQuery)}`);
    setShowSuggestions(false);
    onSearch?.();
  };

  const handleSuggestionClick = (petId: string) => {
    navigate(`/species/${petId}`);
    setSearchQuery("");
    setShowSuggestions(false);
    onSearch?.();
  };

  const clearSearch = () => {
    setSearchQuery("");
    setShowSuggestions(false);
  };

  return (
    <div ref={wrapperRef} className={`relative z-50 ${className}`}>
      <form onSubmit={handleSearch} className="relative">
        <Search className="absolute left-4 top-1/2 z-10 h-6 w-6 -translate-y-1/2 text-stone-400 pointer-events-none" />

        <input
          type="text"
          placeholder={placeholder}
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          onFocus={() => searchQuery.length >= 1 && setShowSuggestions(true)}
          className={`w-full bg-white/95 backdrop-blur py-5 pl-14 ${
            rightAction ? "pr-56" : "pr-32"
          } text-lg text-stone-800 focus:outline-none focus:ring-4 focus:ring-emerald-400 transition-all rounded-full border-none`}
        />

        {searchQuery && (
          <button
            type="button"
            onClick={clearSearch}
            className={`absolute ${
              rightAction ? "right-44" : "right-32"
            } top-1/2 -translate-y-1/2 text-stone-400 hover:text-stone-600 transition p-2`}
          >
            <X className="w-5 h-5" />
          </button>
        )}

        {rightAction && (
          <div className="absolute right-32 top-1/2 z-20 -translate-y-1/2">
            {rightAction}
          </div>
        )}

        <button
          type="submit"
          className="absolute right-2 top-1/2 -translate-y-1/2 bg-emerald-600 hover:bg-emerald-700 text-white px-6 py-3 rounded-full font-semibold transition shadow-md"
        >
          Search
        </button>
      </form>

      <AnimatePresence>
        {showSuggestions &&
          searchQuery.trim().length > 0 &&
          suggestions.length > 0 && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.2 }}
              className="absolute top-full left-0 right-0 mt-4 bg-white rounded-2xl shadow-2xl border border-stone-300 overflow-hidden z-[9999]"
              style={{
                maxHeight: "400px",
                boxShadow:
                  "0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04), 0 0 0 1px rgba(0, 0, 0, 0.05)",
              }}
            >
              <div className="py-2 max-h-[340px] overflow-y-auto">
                {suggestions.map((pet) => {
                  const { primaryCommonName } = getPetCommonNames(pet);
                  const riskLevel = normalizeRiskLevel(pet.pet_invasive_risk);

                  return (
                    <button
                      key={pet.pet_id}
                      onClick={() => handleSuggestionClick(pet.pet_id)}
                      className="w-full px-6 py-3 flex items-center gap-4 hover:bg-emerald-50 transition text-left group"
                    >
                      <div className="w-12 h-12 rounded-xl overflow-hidden flex-shrink-0 bg-stone-100">
                        <img
                          src={getPetImageSrc(pet.pet_image_ref)}
                          alt={primaryCommonName}
                          className="w-full h-full object-cover"
                        />
                      </div>

                      <div className="flex-1 min-w-0">
                        <div className="font-semibold text-stone-900 truncate group-hover:text-emerald-700 transition">
                          {primaryCommonName}
                        </div>
                        <div className="text-sm text-stone-500 italic truncate">
                          {displayText(pet.pet_scientific_name)}
                        </div>
                      </div>

                      <div className="flex items-center gap-2 flex-shrink-0">
                        <span
                          className={`px-2 py-1 rounded-full text-xs font-bold uppercase tracking-wide ${
                            riskLevel === "High"
                              ? "bg-rose-100 text-rose-700"
                              : riskLevel === "Medium"
                                ? "bg-amber-100 text-amber-700"
                                : riskLevel === "Low"
                                  ? "bg-emerald-100 text-emerald-700"
                                  : "bg-stone-100 text-stone-700"
                          }`}
                        >
                          {riskLevel} Risk
                        </span>
                      </div>
                    </button>
                  );
                })}
              </div>

              <div className="px-6 py-3 bg-stone-50 text-xs text-stone-500 border-t border-stone-200">
                Press Enter to search or click a suggestion
              </div>
            </motion.div>
          )}
      </AnimatePresence>

      {showSuggestions &&
        searchQuery.trim().length > 0 &&
        !loading &&
        suggestions.length === 0 && (
          <div className="absolute top-full left-0 right-0 mt-4 bg-white rounded-2xl shadow-xl border border-stone-300 px-6 py-4 text-sm text-stone-500 z-[9999]">
            No matching pets found.
          </div>
        )}
    </div>
  );
}

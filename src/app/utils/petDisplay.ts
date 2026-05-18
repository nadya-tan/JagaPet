import type {
  Pet,
  PetBodyShape,
  PetTraits,
  RecommendedPet,
} from "../types/pet.types";

import type { Language } from "../context/LanguageContext";

// ===================== Localized Labels =====================
export type LocalizedLabelMap = Record<string, Record<Language, string>>;

// Localized labels for pet attributes (care level, invasive risk, budget, native status)
export const careLevelLabels: LocalizedLabelMap = {
  Beginner: {
    en: "Beginner Care",
    ms: "Pemula Penjagaan",
    zh: "新手养护",
  },
  Intermediate: {
    en: "Intermediate Care",
    ms: "Pertengahan Penjagaan",
    zh: "中级养护",
  },
  Advanced: {
    en: "Advanced Care",
    ms: "Lanjutan Penjagaan",
    zh: "高级养护",
  },
  Unknown: {
    en: "Unknown Care",
    ms: "Penjagaan Tidak Diketahui",
    zh: "养护未知",
  },
};

export const invasiveRiskLabels: LocalizedLabelMap = {
  Low: {
    en: "Low Risk",
    ms: "Risiko Rendah",
    zh: "低风险",
  },
  Medium: {
    en: "Medium Risk",
    ms: "Risiko Sederhana",
    zh: "中风险",
  },
  High: {
    en: "High Risk",
    ms: "Risiko Tinggi",
    zh: "高风险",
  },
  Unknown: {
    en: "Unknown Risk",
    ms: "Risiko Tidak Diketahui",
    zh: "风险未知",
  },
};

export const budgetLabels: LocalizedLabelMap = {
  Low: {
    en: "Low Budget",
    ms: "Kos Rendah",
    zh: "低预算",
  },
  Medium: {
    en: "Medium Budget",
    ms: "Kos Sederhana",
    zh: "中预算",
  },
  High: {
    en: "High Budget",
    ms: "Kos Tinggi",
    zh: "高预算",
  },
  Unknown: {
    en: "Unknown Budget",
    ms: "Anggaran Tidak Diketahui",
    zh: "预算未知",
  },
};

export const nativeStatusLabels: LocalizedLabelMap = {
  Native: {
    en: "Native",
    ms: "Asli",
    zh: "本地物种",
  },
  "Not Native": {
    en: "Not Native",
    ms: "Bukan Asli",
    zh: "非本地物种",
  },
  Invasive: {
    en: "Invasive",
    ms: "Invasif",
    zh: "入侵物种",
  },
  Unknown: {
    en: "Unknown Status",
    ms: "Status Tidak Diketahui",
    zh: "状态未知",
  },
};

export const dangerLabels: LocalizedLabelMap = {
  High: {
    en: "High Danger",
    ms: "Bahaya Tinggi",
    zh: "高危险",
  },
  Medium: {
    en: "Medium Danger",
    ms: "Bahaya Sederhana",
    zh: "中危险",
  },
  Low: {
    en: "Low Danger",
    ms: "Bahaya Rendah",
    zh: "低危险",
  },
  Unknown: {
    en: "Unknown Danger",
    ms: "Bahaya Tidak Diketahui",
    zh: "危险未知",
  },
};

export function getLocalizedPetLabel(
  labels: LocalizedLabelMap,
  value: string | null | undefined,
  language: Language,
) {
  if (!value) return "";

  const key = value.trim();

  return labels[key]?.[language] ?? key;
}

// ===================== Name / Display Utilities =====================

/**
 * Get normalized display name for a pet
 * Priority: vernacular name → scientific name → empty string
 * Output is converted to lowercase for consistency
 */
export function getPetDisplayName(
  pet: Pet | RecommendedPet,
  language: Language = "en",
) {
  const localizedName =
    language === "zh"
      ? pet.pet_vernacular_name_cn
      : language === "ms"
        ? pet.pet_vernacular_name_ms
        : pet.pet_vernacular_name;

  return (
    localizedName ??
    pet.pet_vernacular_name ??
    pet.pet_scientific_name ??
    ""
  ).toLowerCase();
}

/**
 * Extract and normalize common names for a pet
 * Supports multiple names separated by ";" or ","
 * Returns primary + additional aliases
 */
export function getPetCommonNames(
  pet: Pet | RecommendedPet,
  language: Language = "en",
) {
  const localizedVernacularName =
    language === "zh"
      ? pet.pet_vernacular_name_cn
      : language === "ms"
        ? pet.pet_vernacular_name_ms
        : pet.pet_vernacular_name;

  const fallbackName =
    pet.pet_vernacular_name ?? pet.pet_scientific_name ?? "Unknown Pet";

  const vernacularNames = (localizedVernacularName ?? fallbackName)
    .split(/[;,]/)
    .map((name) => name.trim())
    .filter(Boolean);

  return {
    primaryCommonName: vernacularNames[0] ?? fallbackName,
    otherCommonNames: vernacularNames.slice(1),
  };
}

export function getLocalizedPetComments(
  pet: Pet | RecommendedPet,
  language: Language,
) {
  const localizedComments =
    language === "zh"
      ? pet.pet_comments_cn
      : language === "ms"
        ? pet.pet_comments_ms
        : pet.pet_comments;

  return localizedComments?.trim() || pet.pet_comments?.trim() || "";
}

// ===================== Body Shape Formatting =====================

/**
 * Format structured body shape information into readable text
 * Supports fish and turtle data structures
 */
export function formatPetBodyShape(bodyShape: PetBodyShape): string {
  if (!bodyShape) return "-";

  // Fish morphology formatting
  if ("fish" in bodyShape) {
    return bodyShape.fish.body_shape ?? "-";
  }

  // Turtle morphology formatting
  if ("turtle" in bodyShape) {
    const { shell_type, no_of_toes_fore, no_of_toes_hind } = bodyShape.turtle;

    return (
      [
        shell_type ? `Shell type: ${shell_type}` : null,
        no_of_toes_fore != null ? `Fore toes: ${no_of_toes_fore}` : null,
        no_of_toes_hind != null ? `Hind toes: ${no_of_toes_hind}` : null,
      ]
        .filter(Boolean)
        .join(", ") || "-"
    );
  }

  return "-";
}

// ===================== Traits Formatting =====================

/**
 * Format pet traits into human-readable string
 * Handles fish and turtle trait structures
 */
export function formatPetTraits(traits: PetTraits): string {
  if (!traits) return "-";

  // Fish currently has no extended trait metadata
  if ("fish" in traits) {
    return "-";
  }

  // Turtle trait formatting
  if ("turtle" in traits) {
    const { carapace_colour, dorsal_colour, dorsal_pattern, underside_colour } =
      traits.turtle;

    return (
      [
        carapace_colour ? `Carapace Colour: ${carapace_colour}` : null,
        dorsal_colour ? `Dorsal Colour: ${dorsal_colour}` : null,
        dorsal_pattern ? `Dorsal Pattern: ${dorsal_pattern}` : null,
        underside_colour ? `Underside Colour: ${underside_colour}` : null,
      ]
        .filter(Boolean)
        .join(", ") || "-"
    );
  }

  return "-";
}

// ===================== Generic Display Helpers =====================

/**
 * Safely display string values with fallback
 * Prevents empty/null UI rendering issues
 */
export function displayText(
  value: string | null | undefined,
  fallback = "Unknown",
) {
  if (value == null || value.trim() === "") return fallback;
  return value;
}

/**
 * Safely display numeric values with optional suffix
 * Returns fallback if value is null/invalid
 */
export function displayNumber(
  value: number | null | undefined,
  suffix = "",
  fallback = "Unknown",
) {
  if (value == null || Number.isNaN(value)) return fallback;
  return `${value}${suffix}`;
}

/**
 * Format number into Malaysian Ringgit currency format (MYR)
 */
export function formatCurrencyMYR(value: number) {
  return new Intl.NumberFormat("ms-MY", {
    style: "currency",
    currency: "MYR",
    maximumFractionDigits: 0,
  }).format(value);
}

// ===================== Trait Parsing Utilities =====================

/**
 * Split trait string into structured array
 * Supports multiple delimiters: comma, semicolon, slash, pipe
 */
export function splitTraits(value: string | null | undefined) {
  if (!value) return [];

  return value
    .split(/[,;/|]/)
    .map((item) => item.trim())
    .filter(Boolean);
}

// ===================== Ecological Classification =====================

/**
 * Check if species is invasive
 */
export function isInvasiveSpecies(value: string | null | undefined) {
  return (value ?? "").toLowerCase() === "invasive";
}

/**
 * Normalize danger level into standard categories:
 * High / Medium / Low / Unknown
 */
export function normalizeDangerBadge(value: string | null | undefined) {
  const text = (value ?? "").toLowerCase();

  if (
    text.includes("high") ||
    text.includes("dangerous") ||
    text.includes("venom") ||
    text.includes("poison") ||
    text.includes("aggressive") ||
    text.includes("venomous") ||
    text.includes("poisonous") ||
    text.includes("strongly")
  ) {
    return "High";
  }

  if (
    text.includes("medium") ||
    text.includes("moderate") ||
    text.includes("caution")
  ) {
    return "Medium";
  }

  if (
    text.includes("harmless") ||
    text.includes("weakly") ||
    text.includes("electrosensing") ||
    text.includes("special")
  ) {
    return "Low";
  }

  return "Unknown";
}

// ===================== UI Badge Styling Helpers =====================

/**
 * Return CSS class for cost badge styling
 */
export function getCostBadgeClasses(cost: string) {
  switch (cost) {
    case "High":
      return "inline-flex items-center gap-1 rounded-full bg-red-100 px-3 py-1 text-xs font-bold text-red-700";
    case "Low":
      return "inline-flex items-center gap-1 rounded-full bg-emerald-100 px-3 py-1 text-xs font-bold text-emerald-700";
    case "Medium":
      return "inline-flex items-center gap-1 rounded-full bg-orange-100 px-3 py-1 text-xs font-bold text-orange-700";
    default:
      return "inline-flex items-center gap-1 rounded-full bg-stone-100 px-3 py-1 text-xs font-bold text-stone-700";
  }
}

/**
 * Return CSS class for danger badge (compact version)
 */
export function getDangerBadgeClasses(danger: string) {
  switch (danger) {
    case "High":
      return "inline-flex items-center gap-1 rounded-full bg-red-100 px-3 py-1 text-xs font-bold text-red-700";
    case "Low":
      return "inline-flex items-center gap-1 rounded-full bg-emerald-100 px-3 py-1 text-xs font-bold text-emerald-700";
    case "Medium":
      return "inline-flex items-center gap-1 rounded-full bg-orange-100 px-3 py-1 text-xs font-bold text-orange-700";
    default:
      return "inline-flex items-center gap-1 rounded-full bg-stone-100 px-3 py-1 text-xs font-bold text-stone-700";
  }
}

/**
 * Return CSS class for species danger badge (larger UI variant)
 */
export function getSpeciesDangerBadgeClasses(danger: string) {
  switch (danger) {
    case "High":
      return "inline-flex items-center gap-1 rounded-full bg-red-100 px-4 py-1.5 text-sm font-semibold text-red-700";
    case "Low":
      return "inline-flex items-center gap-1 rounded-full bg-emerald-100 px-4 py-1.5 text-sm font-semibold text-emerald-700";
    case "Medium":
      return "inline-flex items-center gap-1 rounded-full bg-orange-100 px-4 py-1.5 text-sm font-semibold text-orange-700";
    default:
      return "inline-flex items-center gap-1 rounded-full bg-stone-100 px-4 py-1.5 text-sm font-semibold text-stone-700";
  }
}

/**
 * Return CSS class for care level badge (compact version)
 */
export function getCareBadgeClasses(careLevel: string) {
  switch (careLevel) {
    case "Advanced":
      return "inline-flex items-center gap-1 rounded-full bg-red-100 px-3 py-1 text-xs font-bold text-red-700";
    case "Beginner":
      return "inline-flex items-center gap-1 rounded-full bg-emerald-100 px-3 py-1 text-xs font-bold text-emerald-700";
    default:
      return "inline-flex items-center gap-1 rounded-full bg-orange-100 px-3 py-1 text-xs font-bold text-orange-700";
  }
}

/**
 * Return CSS class for species care badge (larger UI variant)
 */
export function getSpeciesCareBadgeClasses(careLevel: string) {
  switch (careLevel) {
    case "Advanced":
      return "inline-flex items-center gap-1 rounded-full bg-red-100 px-4 py-1.5 text-sm font-semibold text-red-700";
    case "Beginner":
      return "inline-flex items-center gap-1 rounded-full bg-emerald-100 px-4 py-1.5 text-sm font-semibold text-emerald-700";
    case "Intermediate":
      return "inline-flex items-center gap-1 rounded-full bg-orange-100 px-4 py-1.5 text-sm font-semibold text-orange-700";
    default:
      return "inline-flex items-center gap-1 rounded-full bg-stone-100 px-4 py-1.5 text-sm font-semibold text-stone-700";
  }
}

/**
 * Return CSS class for native / invasive status badge
 */
export function getNativeBadgeClasses(nativeStatus: string | null) {
  switch (nativeStatus) {
    case "Invasive":
      return "inline-flex items-center gap-1 rounded-full bg-red-100 px-3 py-1 text-xs font-bold text-red-700";
    case "Native":
      return "inline-flex items-center gap-1 rounded-full bg-emerald-100 px-3 py-1 text-xs font-bold text-emerald-700";
    default:
      return "inline-flex items-center gap-1 rounded-full bg-orange-100 px-3 py-1 text-xs font-bold text-orange-700";
  }
}

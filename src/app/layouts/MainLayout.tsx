import React, { useState } from "react";
import { Outlet, Link, useLocation } from "react-router";
import {
  Languages,
  Menu,
  Type,
  X,
  Scale,
} from "lucide-react";
import { useCompare } from "../context/CompareContext";
import logoImage from "../../imports/image-0.jpg";
import { AiChatbot } from "../components/chatbot";
import { useLanguage, type Language } from "../context/LanguageContext";
import { useAccessibility } from "../context/AccessibilityContext";
import { SpeechButton } from "../components/SpeechButton";

export function MainLayout() {
  // Control mobile navigation menu visibility
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  // Get current route path for active navigation styling
  const location = useLocation();

  // Get compare list state from global context
  const { comparePets } = useCompare();

  // Get language context for translations
  const { language, setLanguage, t, languageLabels } = useLanguage();
  const { textSize, setTextSize, textSizeOptions } = useAccessibility();

  // Main navigation links used in desktop + mobile menus
  // const navLinks = [
  //   { name: "Home", path: "/" },
  //   { name: "Identify Pet", path: "/identify" },
  //   { name: "Health Screening", path: "/health-screening" },
  //   { name: "Compatibility Quiz", path: "/quiz" },
  //   { name: "Need to Rehome?", path: "/safe-exit" },
  //   { name: "Profile", path: "/profile" },
  // ];
  const navLinks = [
    { name: t("nav.home"), path: "/" },
    { name: t("nav.identify"), path: "/identify" },
    { name: t("nav.health"), path: "/health-screening" },
    { name: t("nav.quiz"), path: "/quiz" },
    { name: t("nav.rehome"), path: "/safe-exit" },
    { name: t("nav.profile"), path: "/profile" },
  ];

  const pageSpeechSummaries: Record<string, string> = {
    "/":
      "Welcome to Shell and Fin MY. This page helps you identify aquatic pets, compare species, start a compatibility quiz, check health concerns, and find safe rehoming guidance.",
    "/identify":
      "Identify Pet helps you upload a pet photo and get guidance about possible aquatic species and responsible care.",
    "/health-screening":
      "Health Screening helps you review visible illness signs in aquatic pets and decide when expert care may be needed.",
    "/safe-exit":
      "Safe rehoming explains responsible options if you can no longer care for a non-native aquatic pet.",
    "/profile":
      "Profile keeps your saved pets, care tasks, and account details in one place.",
    "/compare":
      "Compare Species shows your selected pets side by side, including care needs, suitability, and risk information.",
    "/search":
      "Search Results lists aquatic pet species that match your search and filters.",
    "/login":
      "Login or register to save your pets, quiz results, and care information.",
    "/quiz-results":
      "Quiz Results shows your recommended aquatic pet matches based on your lifestyle answers.",
  };

  const getQuizSpeechText = (mainContent: HTMLElement) => {
    const progress = mainContent.querySelector<HTMLElement>("[data-quiz-progress]")?.innerText.trim();
    const question = mainContent.querySelector<HTMLElement>("[data-quiz-question]")?.innerText.trim();
    const options = Array.from(
      mainContent.querySelectorAll<HTMLElement>("[data-quiz-option]"),
    )
      .map((option, index) => {
        const label = option.innerText.trim();
        const selected = option.dataset.selected === "true";
        return selected
          ? `Option ${index + 1}: ${label}. Currently selected.`
          : `Option ${index + 1}: ${label}.`;
      })
      .join(" ");

    return [progress ? `Question ${progress}.` : "", question, options]
      .filter(Boolean)
      .join(" ");
  };

  const getCurrentPageSpeechText = () => {
    const mainContent = document.getElementById("main-content");
    if (!mainContent) return "";

    if (location.pathname === "/quiz") {
      return getQuizSpeechText(mainContent);
    }

    return (
      pageSpeechSummaries[location.pathname] ||
      "This Shell and Fin MY page provides aquatic pet information, care guidance, and responsible ownership support."
    );
  };

  return (
    <div className="min-h-screen flex flex-col font-sans bg-stone-50 text-stone-800">
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-[60] focus:rounded-md focus:bg-white focus:px-4 focus:py-2 focus:text-sm focus:font-semibold focus:text-emerald-800 focus:shadow-lg focus:outline-none focus:ring-2 focus:ring-emerald-600"
      >
        Skip to main content
      </a>

      {/* ===================== Navigation Header ===================== */}
      <header className="bg-white border-b border-stone-200 sticky top-0 z-40 shadow-sm">
        <div className="w-full px-[16px] sm:px-[24px] lg:px-[32px]">
          <div className="flex min-w-0 items-center justify-between gap-[16px] py-[8px] min-h-[64px]">
            {/* Website Logo + Home Link */}
            <Link
              to="/"
              className="flex shrink-0 items-center gap-[8px] hover:opacity-80 transition"
              aria-label="Shell & Fin MY home"
            >
              <img
                src={logoImage}
                alt="Shell & Fin MY Logo"
                className="h-[40px] w-[40px] object-cover rounded-full mix-blend-multiply xl:h-[48px] xl:w-[48px]"
              />
              <span className="hidden whitespace-nowrap text-[18px] font-bold tracking-tight text-emerald-700 xl:inline 2xl:text-[20px]">
                Shell & Fin MY
              </span>
            </Link>

            {/* ===================== Desktop Navigation ===================== */}
            <nav
              className="hidden lg:flex flex-1 min-w-0 flex-wrap items-center justify-end gap-x-[8px] gap-y-[8px] xl:gap-x-[12px]"
              aria-label="Primary navigation"
            >
              {navLinks.map((link) => (
                <Link
                  key={link.name}
                  to={link.path}
                  aria-current={location.pathname === link.path ? "page" : undefined}
                  className={`shrink-0 whitespace-nowrap border-b-2 px-[4px] text-[13px] font-medium transition xl:text-[14px] ${
                    location.pathname === link.path
                      ? "border-emerald-700 text-emerald-700"
                      : "border-transparent text-stone-600 hover:text-emerald-600"
                  }`}
                >
                  {link.name}
                </Link>
              ))}

              {/* Compare Wishlist Button */}
              <Link
                to="/compare"
                aria-label={`${t("nav.compare")}, ${comparePets.length} pets selected`}
                className={`flex shrink-0 items-center gap-[6px] whitespace-nowrap px-[12px] py-[8px] rounded-full text-[13px] font-bold transition shadow-sm xl:text-[14px] ${
                  comparePets.length > 0
                    ? "bg-emerald-100 text-emerald-800 hover:bg-emerald-200"
                    : "bg-stone-100 text-stone-400 hover:bg-stone-200 hover:text-stone-600"
                }`}
              >
                <Scale className="h-[16px] w-[16px]" />
                {/* Compare ({comparePets.length}) */}
                {t("nav.compare")} ({comparePets.length})
              </Link>

              {/* Language Selector */}
              <div className="flex shrink-0 items-center gap-[6px] whitespace-nowrap rounded-full border border-stone-200 bg-white px-[12px] py-[8px] text-[13px] font-semibold text-stone-700 shadow-sm xl:text-[14px]">
                <Languages className="h-[16px] w-[16px] text-emerald-700" aria-hidden="true" />

                <select
                  value={language}
                  onChange={(event) =>
                    setLanguage(event.target.value as Language)
                  }
                  className="bg-transparent outline-none cursor-pointer"
                  aria-label="Select language"
                >
                  <option value="en">{languageLabels.en}</option>
                  <option value="ms">{languageLabels.ms}</option>
                  <option value="zh">{languageLabels.zh}</option>
                </select>
              </div>

              <SpeechButton
                text={getCurrentPageSpeechText}
                label="Read page"
                options={{ lang: language === "ms" ? "ms-MY" : language === "zh" ? "zh-CN" : "en-MY" }}
              />

              <div className="flex shrink-0 items-center gap-[6px] whitespace-nowrap rounded-full border border-stone-200 bg-white px-[12px] py-[8px] text-[13px] font-semibold text-stone-700 shadow-sm xl:text-[14px]">
                <Type className="h-[16px] w-[16px] text-emerald-700" aria-hidden="true" />
                <label htmlFor="desktop-text-size" className="sr-only">
                  Text size
                </label>
                <select
                  id="desktop-text-size"
                  value={textSize}
                  onChange={(event) =>
                    setTextSize(event.target.value as typeof textSize)
                  }
                  className="bg-transparent outline-none cursor-pointer"
                  aria-label="Text size"
                >
                  {textSizeOptions.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
              </div>
            </nav>

            {/* ===================== Mobile Menu Button ===================== */}
            <button
              className="lg:hidden p-2 text-stone-600 hover:text-emerald-700 focus:outline-none"
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              aria-label={isMenuOpen ? "Close navigation menu" : "Open navigation menu"}
              aria-expanded={isMenuOpen}
              aria-controls="mobile-navigation"
            >
              {isMenuOpen ? (
                <X className="h-6 w-6" />
              ) : (
                <Menu className="h-6 w-6" />
              )}
            </button>
          </div>
        </div>

        {/* ===================== Mobile Navigation Panel ===================== */}
        {isMenuOpen && (
          <nav
            id="mobile-navigation"
            className="lg:hidden bg-white border-t border-stone-100 px-4 pt-2 pb-4 space-y-1 shadow-lg flex flex-col"
            aria-label="Mobile navigation"
          >
            {navLinks.map((link) => (
              <Link
                key={link.name}
                to={link.path}
                aria-current={location.pathname === link.path ? "page" : undefined}
                className={`block px-3 py-2 rounded-md text-base font-medium ${
                  location.pathname === link.path
                    ? "bg-emerald-50 text-emerald-700"
                    : "text-stone-600 hover:bg-stone-50 hover:text-emerald-600"
                }`}
                onClick={() => setIsMenuOpen(false)}
              >
                {link.name}
              </Link>
            ))}

            {/* language selector */}
            <div className="mt-2 flex items-center justify-between px-3 py-2 rounded-md text-base font-medium bg-stone-50 text-stone-700">
              <span className="flex items-center gap-2">
                <Languages className="h-[16px] w-[16px] text-emerald-700" aria-hidden="true" />
                {t("language.label")}
              </span>

              <select
                value={language}
                onChange={(event) =>
                  setLanguage(event.target.value as Language)
                }
                className="bg-transparent outline-none cursor-pointer"
                aria-label="Select language"
              >
                <option value="en">{languageLabels.en}</option>
                <option value="ms">{languageLabels.ms}</option>
                <option value="zh">{languageLabels.zh}</option>
              </select>
            </div>

            <SpeechButton
              text={getCurrentPageSpeechText}
              label="Read page"
              variant="mobile"
              options={{ lang: language === "ms" ? "ms-MY" : language === "zh" ? "zh-CN" : "en-MY" }}
              className="mt-2"
            />

            <div className="mt-2 flex items-center justify-between px-3 py-2 rounded-md text-base font-medium bg-stone-50 text-stone-700">
              <span className="flex items-center gap-2">
                <Type className="h-[16px] w-[16px] text-emerald-700" aria-hidden="true" />
                Text size
              </span>

              <select
                value={textSize}
                onChange={(event) =>
                  setTextSize(event.target.value as typeof textSize)
                }
                className="bg-transparent outline-none cursor-pointer"
                aria-label="Text size"
              >
                {textSizeOptions.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </div>

            {/* Mobile Compare Button */}
            <Link
              to="/compare"
              onClick={() => setIsMenuOpen(false)}
              aria-label={`${t("nav.compare")}, ${comparePets.length} pets selected`}
              className="mt-2 flex items-center justify-between px-3 py-2 rounded-md text-base font-medium bg-emerald-50 text-emerald-800"
            >
              <span>Compare Wishlist</span>
              <span className="bg-emerald-200 text-emerald-900 px-2 py-0.5 rounded-full text-xs">
                {comparePets.length}
              </span>
            </Link>
          </nav>
        )}
      </header>

      {/* ===================== Main Routed Content ===================== */}
      <main id="main-content" className="flex-1 w-full" tabIndex={-1}>
        {/* Nested route content renders here */}
        <Outlet />
      </main>

      {/* ===================== Footer Section ===================== */}
      <footer className="bg-emerald-900 text-emerald-50 py-12 mt-auto">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Brand Description */}
          <div>
            <div className="flex items-center gap-3 mb-4">
              <img
                src={logoImage}
                alt="Shell & Fin MY Logo"
                className="h-10 w-10 object-cover rounded-full brightness-110"
              />
              <span className="text-xl font-bold">Shell & Fin MY</span>
            </div>

            <p className="text-emerald-200 text-sm leading-relaxed max-w-xs">
              {/* Empowering Malaysians to make safe, responsible choices for
              non-native pets. Protect our biodiversity, one pet at a time. */}
              {t("footer.description")}
            </p>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="font-semibold text-lg mb-4 text-emerald-100">
              {/* Quick Links */}
              {t("footer.quickLinks")}
            </h3>

            <ul className="space-y-2 text-sm text-emerald-200">
              <li>
                <Link to="/quiz" className="hover:text-white transition">
                  {/* Pre-purchase Quiz */}
                  {t("footer.quiz")}
                </Link>
              </li>

              <li>
                <Link to="/identify" className="hover:text-white transition">
                  {/* Identify Your Pet */}
                  {t("footer.identify")}
                </Link>
              </li>

              <li>
                <Link to="/compare" className="hover:text-white transition">
                  {/* Compare Species */}
                  {t("footer.compare")}
                </Link>
              </li>

              <li>
                <Link
                  to="/safe-exit"
                  className="hover:text-white transition text-rose-300 font-medium"
                >
                  {/* Safe Rehoming Options */}
                  {t("footer.safeRehoming")}
                </Link>
              </li>
            </ul>
          </div>

          {/* Legal / Emergency Information */}
          <div>
            <h3 className="font-semibold text-lg mb-4 text-emerald-100">
              {/* Emergency & Legal */}
              {t("footer.emergencyLegal")}
            </h3>

            <ul className="space-y-2 text-sm text-emerald-200">
              {/* PERHILITAN Hotline: 1-800-88-5151 */}
              <li>{t("footer.hotline")}</li>
              {/* Department of Fisheries Malaysia */}
              <li>{t("footer.dof")}</li>

              {/* Releasing non-native species into public waterways is illegal
                under Malaysian law. */}
              <li className="text-xs mt-4 opacity-70">{t("footer.legal")}</li>
            </ul>
          </div>
        </div>
      </footer>

      <AiChatbot />
    </div>
  );
}

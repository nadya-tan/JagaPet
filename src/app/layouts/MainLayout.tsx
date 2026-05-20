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
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between gap-4 h-16 min-w-0">
            {/* Website Logo + Home Link */}
            <Link
              to="/"
              className="flex shrink-0 items-center gap-3 hover:opacity-80 transition"
              aria-label="Shell & Fin MY home"
            >
              <img
                src={logoImage}
                alt="Shell & Fin MY Logo"
                className="h-12 w-12 object-cover rounded-full mix-blend-multiply"
              />
              <span className="whitespace-nowrap text-xl font-bold tracking-tight text-emerald-700">
                Shell & Fin MY
              </span>
            </Link>

            {/* ===================== Desktop Navigation ===================== */}
            <nav
              className="hidden lg:flex flex-1 min-w-0 items-center justify-end gap-3 xl:gap-6"
              aria-label="Primary navigation"
            >
              {navLinks.map((link) => (
                <Link
                  key={link.name}
                  to={link.path}
                  aria-current={location.pathname === link.path ? "page" : undefined}
                  className={`shrink-0 whitespace-nowrap border-b-2 px-1 text-sm font-medium transition ${
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
                className={`flex shrink-0 items-center gap-2 whitespace-nowrap px-3 xl:px-4 py-2 rounded-full text-sm font-bold transition shadow-sm ${
                  comparePets.length > 0
                    ? "bg-emerald-100 text-emerald-800 hover:bg-emerald-200"
                    : "bg-stone-100 text-stone-400 hover:bg-stone-200 hover:text-stone-600"
                }`}
              >
                <Scale className="w-4 h-4" />
                {/* Compare ({comparePets.length}) */}
                {t("nav.compare")} ({comparePets.length})
              </Link>

              {/* Language Selector */}
              <div className="flex shrink-0 items-center gap-2 whitespace-nowrap rounded-full border border-stone-200 bg-white px-3 py-2 text-sm font-semibold text-stone-700 shadow-sm">
                <Languages className="h-4 w-4 text-emerald-700" aria-hidden="true" />

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

              <div className="flex shrink-0 items-center gap-2 whitespace-nowrap rounded-full border border-stone-200 bg-white px-3 py-2 text-sm font-semibold text-stone-700 shadow-sm">
                <Type className="h-4 w-4 text-emerald-700" aria-hidden="true" />
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
                <Languages className="h-4 w-4 text-emerald-700" aria-hidden="true" />
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

            <div className="mt-2 flex items-center justify-between px-3 py-2 rounded-md text-base font-medium bg-stone-50 text-stone-700">
              <span className="flex items-center gap-2">
                <Type className="h-4 w-4 text-emerald-700" aria-hidden="true" />
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

import React, { useState } from "react";
import { Outlet, Link, useLocation } from "react-router";
import {
  Fish,
  Menu,
  X,
  Scale,
} from "lucide-react";
import { useCompare } from "../context/CompareContext";
import logoImage from "../../imports/image-0.jpg";
import { AiChatbot } from "../components/chatbot";

export function MainLayout() {
  // Control mobile navigation menu visibility
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  // Get current route path for active navigation styling
  const location = useLocation();

  // Get compare list state from global context
  const { comparePets } = useCompare();

  // Main navigation links used in desktop + mobile menus
  const navLinks = [
    { name: "Home", path: "/" },
    { name: "Identify Pet", path: "/identify" },
    { name: "Health Screening", path: "/health-screening" },
    { name: "Compatibility Quiz", path: "/quiz" },
    { name: "Need to Rehome?", path: "/safe-exit" },
    { name: "Profile", path: "/profile" },
  ];

  return (
    <div className="min-h-screen flex flex-col font-sans bg-stone-50 text-stone-800">
      {/* ===================== Navigation Header ===================== */}
      <header className="bg-white border-b border-stone-200 sticky top-0 z-40 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            {/* Website Logo + Home Link */}
            <Link
              to="/"
              className="flex items-center gap-3 hover:opacity-80 transition"
            >
              <img
                src={logoImage}
                alt="Shell & Fin MY Logo"
                className="h-12 w-12 object-cover rounded-full mix-blend-multiply"
              />
              <span className="text-xl font-bold tracking-tight text-emerald-700">
                Shell & Fin MY
              </span>
            </Link>

            {/* ===================== Desktop Navigation ===================== */}
            <nav className="hidden md:flex items-center space-x-8">
              {navLinks.map((link) => (
                <Link
                  key={link.name}
                  to={link.path}
                  className={`text-sm font-medium transition ${
                    location.pathname === link.path
                      ? "text-emerald-700 border-b-2 border-emerald-700"
                      : "text-stone-600 hover:text-emerald-600"
                  }`}
                >
                  {link.name}
                </Link>
              ))}

              {/* Compare Wishlist Button */}
              <Link
                to="/compare"
                className={`flex items-center gap-2 px-4 py-2 rounded-full text-sm font-bold transition shadow-sm ${
                  comparePets.length > 0
                    ? "bg-emerald-100 text-emerald-800 hover:bg-emerald-200"
                    : "bg-stone-100 text-stone-400 hover:bg-stone-200 hover:text-stone-600"
                }`}
              >
                <Scale className="w-4 h-4" />
                Compare ({comparePets.length})
              </Link>
            </nav>

            {/* ===================== Mobile Menu Button ===================== */}
            <button
              className="md:hidden p-2 text-stone-600 hover:text-emerald-700 focus:outline-none"
              onClick={() => setIsMenuOpen(!isMenuOpen)}
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
          <div className="md:hidden bg-white border-t border-stone-100 px-4 pt-2 pb-4 space-y-1 shadow-lg flex flex-col">
            {navLinks.map((link) => (
              <Link
                key={link.name}
                to={link.path}
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

            {/* Mobile Compare Button */}
            <Link
              to="/compare"
              onClick={() => setIsMenuOpen(false)}
              className="mt-2 flex items-center justify-between px-3 py-2 rounded-md text-base font-medium bg-emerald-50 text-emerald-800"
            >
              <span>Compare Wishlist</span>
              <span className="bg-emerald-200 text-emerald-900 px-2 py-0.5 rounded-full text-xs">
                {comparePets.length}
              </span>
            </Link>
          </div>
        )}
      </header>

      {/* ===================== Main Routed Content ===================== */}
      <main className="flex-1 w-full">
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
              Empowering Malaysians to make safe, responsible choices for
              non-native pets. Protect our biodiversity, one pet at a time.
            </p>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="font-semibold text-lg mb-4 text-emerald-100">
              Quick Links
            </h3>

            <ul className="space-y-2 text-sm text-emerald-200">
              <li>
                <Link to="/quiz" className="hover:text-white transition">
                  Pre-purchase Quiz
                </Link>
              </li>

              <li>
                <Link to="/identify" className="hover:text-white transition">
                  Identify Your Pet
                </Link>
              </li>

              <li>
                <Link to="/compare" className="hover:text-white transition">
                  Compare Species
                </Link>
              </li>

              <li>
                <Link
                  to="/safe-exit"
                  className="hover:text-white transition text-rose-300 font-medium"
                >
                  Safe Rehoming Options
                </Link>
              </li>
            </ul>
          </div>

          {/* Legal / Emergency Information */}
          <div>
            <h3 className="font-semibold text-lg mb-4 text-emerald-100">
              Emergency & Legal
            </h3>

            <ul className="space-y-2 text-sm text-emerald-200">
              <li>PERHILITAN Hotline: 1-800-88-5151</li>
              <li>Department of Fisheries Malaysia</li>

              <li className="text-xs mt-4 opacity-70">
                Releasing non-native species into public waterways is illegal
                under Malaysian law.
              </li>
            </ul>
          </div>
        </div>
      </footer>

      <AiChatbot />
    </div>
  );
}

import React, { useState } from "react";
import { Outlet, Link, useLocation } from "react-router";
import {
  Fish,
  Menu,
  X,
  MessageCircleQuestion,
  HelpCircle,
  Scale,
} from "lucide-react";
import { useCompare } from "../context/CompareContext";
import logoImage from "../../imports/image-0.jpg";

export function MainLayout() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isChatOpen, setIsChatOpen] = useState(false);
  const location = useLocation();
  const { comparePets } = useCompare();

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
      {/* Navigation */}
      <header className="bg-white border-b border-stone-200 sticky top-0 z-40 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
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

            {/* Desktop Nav */}
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

            {/* Mobile Menu Button */}
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

        {/* Mobile Nav */}
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

      {/* Main Content */}
      <main className="flex-1 w-full">
        <Outlet />
      </main>

      {/* Footer */}
      <footer className="bg-emerald-900 text-emerald-50 py-12 mt-auto">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 grid grid-cols-1 md:grid-cols-3 gap-8">
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
              <li className="mt-4 pt-4 border-t border-emerald-700">
                <Link
                  to="/api-test-lab"
                  className="hover:text-white transition text-xs opacity-60 hover:opacity-100"
                >
                  🔬 API Test Lab (Dev)
                </Link>
              </li>
            </ul>
          </div>
        </div>
      </footer>

      {/* Floating AI ChatBot */}
      <div className="fixed bottom-6 right-6 z-50">
        {isChatOpen ? (
          <div className="bg-white w-80 sm:w-96 rounded-2xl shadow-2xl border border-stone-200 overflow-hidden flex flex-col h-[500px] transition-all transform origin-bottom-right">
            <div className="bg-emerald-700 p-4 text-white flex justify-between items-center">
              <div className="flex items-center gap-2">
                <HelpCircle className="h-5 w-5" />
                <h3 className="font-semibold">Shell & Fin MY Assistant</h3>
              </div>
              <button
                onClick={() => setIsChatOpen(false)}
                className="text-emerald-200 hover:text-white"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            <div className="flex-1 p-4 overflow-y-auto bg-stone-50 space-y-4 text-sm">
              <div className="bg-emerald-100 text-emerald-900 p-3 rounded-2xl rounded-tl-sm self-start max-w-[85%]">
                Hi! I'm your Shell & Fin MY Assistant. Do you have questions
                about caring for a specific species, or need advice on rehoming
                a pet you can no longer keep?
              </div>
              {/* Fake conversation for prototype */}
              <div className="bg-white border border-stone-200 text-stone-800 p-3 rounded-2xl rounded-tr-sm self-end max-w-[85%] ml-auto shadow-sm">
                What size tank does a red-eared slider need?
              </div>
              <div className="bg-emerald-100 text-emerald-900 p-3 rounded-2xl rounded-tl-sm self-start max-w-[85%]">
                A baby slider can start in a 20-gallon tank, but they grow fast!
                An adult needs a minimum of 100 gallons (about 380 liters) or a
                large outdoor pond, plus a dry basking area with UV light. Are
                you thinking of getting one?
              </div>
            </div>
            <div className="p-3 bg-white border-t border-stone-200">
              <div className="flex items-center gap-2 bg-stone-100 rounded-full px-4 py-2">
                <input
                  type="text"
                  placeholder="Type a message..."
                  className="bg-transparent border-none focus:outline-none flex-1 text-sm text-stone-700 placeholder-stone-400"
                />
                <button className="text-emerald-600 hover:text-emerald-700">
                  <MessageCircleQuestion className="h-5 w-5" />
                </button>
              </div>
            </div>
          </div>
        ) : (
          <button
            onClick={() => setIsChatOpen(true)}
            className="bg-emerald-600 hover:bg-emerald-700 text-white p-4 rounded-full shadow-lg hover:shadow-xl transition-all flex items-center justify-center transform hover:scale-105"
            aria-label="Open AI Assistant"
          >
            <MessageCircleQuestion className="h-6 w-6" />
          </button>
        )}
      </div>
    </div>
  );
}

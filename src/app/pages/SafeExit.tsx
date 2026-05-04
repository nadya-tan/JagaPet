import React from "react";
import {
  AlertTriangle,
  ShieldAlert,
  HeartHandshake,
  Phone,
  ArrowRight,
  XOctagon,
} from "lucide-react";
import { motion } from "motion/react";
import { Link } from "react-router";

// ===================== SafeExit Component =====================
// This component presents safe pet rehoming guidance and discourages illegal/unsafe release practices
export function SafeExit() {
  return (
    // ===================== Page Container =====================
    <div className="bg-stone-50 min-h-screen py-16 px-4 md:px-8 font-sans text-stone-900">
      <div className="max-w-4xl mx-auto space-y-16">
        {/* ===================== Header Section ===================== */}
        <div className="text-center">
          <motion.div
            // Entry animation: scale-in effect
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: "spring", stiffness: 200 }}
            // Icon container styling
            className="inline-block bg-rose-100 p-5 rounded-full mb-6 shadow-md"
          >
            {/* Main symbolic icon for empathy and rehoming */}
            <HeartHandshake className="w-16 h-16 text-rose-600" />
          </motion.div>

          {/* Title with fade-up animation */}
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-4xl md:text-6xl font-extrabold mb-6 tracking-tight text-stone-900"
          >
            Safe Rehoming Options
          </motion.h1>

          {/* Subtitle explanation */}
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="text-xl text-stone-600 max-w-3xl mx-auto leading-relaxed"
          >
            We understand that circumstances change and you may no longer be
            able to care for your pet. However,{" "}
            <strong className="text-rose-600">
              releasing them into the wild is never the answer
            </strong>
            .
          </motion.p>
        </div>

        {/* ===================== Critical Warning Section ===================== */}
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          // High-emphasis warning container with gradient background
          className="bg-gradient-to-br from-rose-600 to-rose-800 rounded-3xl p-8 md:p-12 shadow-2xl relative overflow-hidden text-white"
        >
          {/* Decorative background icon (non-interactive) */}
          <div className="absolute top-0 right-0 opacity-10 transform scale-150 translate-x-12 -translate-y-12 pointer-events-none">
            <XOctagon className="w-64 h-64 text-white" />
          </div>

          {/* Content layout */}
          <div className="relative z-10 flex flex-col md:flex-row gap-8 items-start">
            {/* Warning icon */}
            <ShieldAlert className="w-16 h-16 text-rose-200 shrink-0 mt-2" />

            <div>
              {/* Section title */}
              <h2 className="text-3xl font-bold mb-4 flex items-center gap-3">
                Do Not Release Your Pet
              </h2>

              {/* Risk explanation list */}
              <ul className="space-y-4 text-rose-50 text-lg leading-relaxed mb-8">
                {/* Legal risk */}
                <li className="flex gap-3 items-start">
                  <XOctagon className="w-6 h-6 text-rose-300 shrink-0 mt-0.5" />
                  <strong>It's Illegal:</strong> Releasing non-native species
                  into Malaysian waterways violates local wildlife laws.
                </li>

                {/* Animal welfare risk */}
                <li className="flex gap-3 items-start">
                  <XOctagon className="w-6 h-6 text-rose-300 shrink-0 mt-0.5" />
                  <strong>It's Cruel:</strong> Pets raised in captivity often
                  starve, get sick, or are eaten by predators.
                </li>

                {/* Ecological impact */}
                <li className="flex gap-3 items-start">
                  <XOctagon className="w-6 h-6 text-rose-300 shrink-0 mt-0.5" />
                  <strong>It Destroys Biodiversity:</strong> Species like the
                  Red-Eared Slider or Pleco aggressively outcompete local
                  wildlife, leading to the extinction of native Malaysian
                  species.
                </li>
              </ul>
            </div>
          </div>
        </motion.div>

        {/* ===================== Safe Alternatives Section ===================== */}
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          // Container for alternative actions
          className="space-y-8"
        >
          {/* Section heading */}
          <h2 className="text-3xl font-bold text-center mb-10 text-stone-900">
            What You Should Do Instead
          </h2>

          {/* Two-option grid layout */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* ===================== Option 1: Community Rehoming ===================== */}
            <div className="bg-white rounded-3xl p-8 shadow-xl border border-stone-100 hover:-translate-y-1 transition-transform">
              {/* Icon container */}
              <div className="bg-emerald-100 w-16 h-16 rounded-2xl flex items-center justify-center mb-6">
                <HeartHandshake className="w-8 h-8 text-emerald-600" />
              </div>

              {/* Title */}
              <h3 className="text-2xl font-bold text-stone-900 mb-4">
                Rehome via Local Groups
              </h3>

              {/* Description */}
              <p className="text-stone-600 mb-6 leading-relaxed text-lg">
                There are dedicated aquarium and reptile hobbyist groups in
                Malaysia on Facebook and Telegram who are often willing to take
                in unwanted pets.
              </p>

              {/* External action link */}
              <a
                href="#"
                className="inline-flex items-center text-emerald-600 font-bold hover:text-emerald-700 hover:gap-3 transition-all"
              >
                Find local hobbyist groups{" "}
                <ArrowRight className="w-5 h-5 ml-2" />
              </a>
            </div>

            {/* ===================== Option 2: Pet Store Assistance ===================== */}
            <div className="bg-white rounded-3xl p-8 shadow-xl border border-stone-100 hover:-translate-y-1 transition-transform">
              {/* Icon */}
              <div className="bg-sky-100 w-16 h-16 rounded-2xl flex items-center justify-center mb-6">
                <Phone className="w-8 h-8 text-sky-600" />
              </div>

              {/* Title */}
              <h3 className="text-2xl font-bold text-stone-900 mb-4">
                Contact Pet Stores
              </h3>

              {/* Description */}
              <p className="text-stone-600 mb-6 leading-relaxed text-lg">
                Many local aquarium shops (LFS) will accept surrendered fish or
                turtles, especially if they are healthy. Call ahead to confirm.
              </p>

              {/* Internal navigation link */}
              <Link
                to="/"
                className="inline-flex items-center text-sky-600 font-bold hover:text-sky-700 hover:gap-3 transition-all"
              >
                Search nearby stores <ArrowRight className="w-5 h-5 ml-2" />
              </Link>
            </div>
          </div>

          {/* ===================== Emergency Contact Section ===================== */}
          <div className="bg-stone-900 text-stone-50 rounded-3xl p-8 shadow-xl mt-8 flex flex-col sm:flex-row items-center justify-between gap-8 border-l-8 border-emerald-500">
            {/* Text content */}
            <div>
              <h3 className="text-2xl font-bold mb-2 text-white">
                Need emergency assistance?
              </h3>
              <p className="text-stone-400 text-lg">
                If you are completely unable to find a home, contact the
                Department of Fisheries or PERHILITAN for guidance.
              </p>
            </div>

            {/* Hotline button (call action) */}
            <button className="bg-emerald-500 hover:bg-emerald-400 text-emerald-950 px-8 py-4 rounded-xl font-bold whitespace-nowrap transition-colors shadow-lg shadow-emerald-500/20">
              Call Hotline: 1-800-88-5151
            </button>
          </div>
        </motion.div>
      </div>
    </div>
  );
}

// import React from "react";
// import {
//   AlertTriangle,
//   ShieldAlert,
//   HeartHandshake,
//   Phone,
//   ArrowRight,
//   XOctagon,
// } from "lucide-react";
// import { motion } from "motion/react";
// import { Link } from "react-router";

// // ===================== SafeExit Component =====================
// // This component presents safe pet rehoming guidance and discourages illegal/unsafe release practices
// export function SafeExit() {
//   return (
//     // ===================== Page Container =====================
//     <div className="bg-stone-50 min-h-screen py-16 px-4 md:px-8 font-sans text-stone-900">
//       <div className="max-w-4xl mx-auto space-y-16">
//         {/* ===================== Header Section ===================== */}
//         <div className="text-center">
//           <motion.div
//             // Entry animation: scale-in effect
//             initial={{ scale: 0 }}
//             animate={{ scale: 1 }}
//             transition={{ type: "spring", stiffness: 200 }}
//             // Icon container styling
//             className="inline-block bg-rose-100 p-5 rounded-full mb-6 shadow-md"
//           >
//             {/* Main symbolic icon for empathy and rehoming */}
//             <HeartHandshake className="w-16 h-16 text-rose-600" />
//           </motion.div>

//           {/* Title with fade-up animation */}
//           <motion.h1
//             initial={{ opacity: 0, y: 20 }}
//             animate={{ opacity: 1, y: 0 }}
//             className="text-4xl md:text-6xl font-extrabold mb-6 tracking-tight text-stone-900"
//           >
//             Safe Rehoming Options
//           </motion.h1>

//           {/* Subtitle explanation */}
//           <motion.p
//             initial={{ opacity: 0, y: 20 }}
//             animate={{ opacity: 1, y: 0 }}
//             transition={{ delay: 0.1 }}
//             className="text-xl text-stone-600 max-w-3xl mx-auto leading-relaxed"
//           >
//             We understand that circumstances change and you may no longer be
//             able to care for your pet. However,{" "}
//             <strong className="text-rose-600">
//               releasing them into the wild is never the answer
//             </strong>
//             .
//           </motion.p>
//         </div>

//         {/* ===================== Critical Warning Section ===================== */}
//         <motion.div
//           initial={{ opacity: 0, y: 40 }}
//           animate={{ opacity: 1, y: 0 }}
//           transition={{ delay: 0.2 }}
//           // High-emphasis warning container with gradient background
//           className="bg-gradient-to-br from-rose-600 to-rose-800 rounded-3xl p-8 md:p-12 shadow-2xl relative overflow-hidden text-white"
//         >
//           {/* Decorative background icon (non-interactive) */}
//           <div className="absolute top-0 right-0 opacity-10 transform scale-150 translate-x-12 -translate-y-12 pointer-events-none">
//             <XOctagon className="w-64 h-64 text-white" />
//           </div>

//           {/* Content layoutsss */}
//           <div className="relative z-10 flex flex-col md:flex-row gap-8 items-start">
//             {/* Warning icon */}
//             <ShieldAlert className="w-16 h-16 text-rose-200 shrink-0 mt-2" />

//             <div>
//               {/* Section title */}
//               <h2 className="text-3xl font-bold mb-4 flex items-center gap-3">
//                 Do Not Release Your Pet
//               </h2>

//               {/* Risk explanation list */}
//               <ul className="space-y-4 text-rose-50 text-lg leading-relaxed mb-8">
//                 {/* Legal risk */}
//                 <li className="flex gap-3 items-start">
//                   <XOctagon className="w-6 h-6 text-rose-300 shrink-0 mt-0.5" />
//                   <strong>It's Illegal:</strong> Releasing non-native species
//                   into Malaysian waterways violates local wildlife laws.
//                 </li>

//                 {/* Animal welfare risk */}
//                 <li className="flex gap-3 items-start">
//                   <XOctagon className="w-6 h-6 text-rose-300 shrink-0 mt-0.5" />
//                   <strong>It's Cruel:</strong> Pets raised in captivity often
//                   starve, get sick, or are eaten by predators.
//                 </li>

//                 {/* Ecological impact */}
//                 <li className="flex gap-3 items-start">
//                   <XOctagon className="w-6 h-6 text-rose-300 shrink-0 mt-0.5" />
//                   <strong>It Destroys Biodiversity:</strong> Species like the
//                   Red-Eared Slider or Pleco aggressively outcompete local
//                   wildlife, leading to the extinction of native Malaysian
//                   species.
//                 </li>
//               </ul>
//             </div>
//           </div>
//         </motion.div>

//         {/* ===================== Safe Alternatives Section ===================== */}
//         <motion.div
//           initial={{ opacity: 0, y: 40 }}
//           animate={{ opacity: 1, y: 0 }}
//           transition={{ delay: 0.3 }}
//           // Container for alternative actions
//           className="space-y-8"
//         >
//           {/* Section heading */}
//           <h2 className="text-3xl font-bold text-center mb-10 text-stone-900">
//             What You Should Do Instead
//           </h2>

//           {/* Two-option grid layout */}
//           <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
//             {/* ===================== Option 1: Community Rehoming ===================== */}
//             <div className="bg-white rounded-3xl p-8 shadow-xl border border-stone-100 hover:-translate-y-1 transition-transform">
//               {/* Icon container */}
//               <div className="bg-emerald-100 w-16 h-16 rounded-2xl flex items-center justify-center mb-6">
//                 <HeartHandshake className="w-8 h-8 text-emerald-600" />
//               </div>

//               {/* Title */}
//               <h3 className="text-2xl font-bold text-stone-900 mb-4">
//                 Rehome via Local Groups
//               </h3>

//               {/* Description */}
//               <p className="text-stone-600 mb-6 leading-relaxed text-lg">
//                 There are dedicated aquarium and reptile hobbyist groups in
//                 Malaysia on Facebook and Telegram who are often willing to take
//                 in unwanted pets.
//               </p>

//               {/* External action link */}
//               <a
//                 href="#"
//                 className="inline-flex items-center text-emerald-600 font-bold hover:text-emerald-700 hover:gap-3 transition-all"
//               >
//                 Find local hobbyist groups{" "}
//                 <ArrowRight className="w-5 h-5 ml-2" />
//               </a>
//             </div>

//             {/* ===================== Option 2: Pet Store Assistance ===================== */}
//             <div className="bg-white rounded-3xl p-8 shadow-xl border border-stone-100 hover:-translate-y-1 transition-transform">
//               {/* Icon */}
//               <div className="bg-sky-100 w-16 h-16 rounded-2xl flex items-center justify-center mb-6">
//                 <Phone className="w-8 h-8 text-sky-600" />
//               </div>

//               {/* Title */}
//               <h3 className="text-2xl font-bold text-stone-900 mb-4">
//                 Contact Pet Stores
//               </h3>

//               {/* Description */}
//               <p className="text-stone-600 mb-6 leading-relaxed text-lg">
//                 Many local aquarium shops (LFS) will accept surrendered fish or
//                 turtles, especially if they are healthy. Call ahead to confirm.
//               </p>

//               {/* Internal navigation link */}
//               <Link
//                 to="/"
//                 className="inline-flex items-center text-sky-600 font-bold hover:text-sky-700 hover:gap-3 transition-all"
//               >
//                 Search nearby stores <ArrowRight className="w-5 h-5 ml-2" />
//               </Link>
//             </div>
//           </div>

//           {/* ===================== Emergency Contact Section ===================== */}
//           <div className="bg-stone-900 text-stone-50 rounded-3xl p-8 shadow-xl mt-8 flex flex-col sm:flex-row items-center justify-between gap-8 border-l-8 border-emerald-500">
//             {/* Text content */}
//             <div>
//               <h3 className="text-2xl font-bold mb-2 text-white">
//                 Need emergency assistance?
//               </h3>
//               <p className="text-stone-400 text-lg">
//                 If you are completely unable to find a home, contact the
//                 Department of Fisheries or PERHILITAN for guidance.
//               </p>
//             </div>

//             {/* Hotline button (call action) */}
//             <button className="bg-emerald-500 hover:bg-emerald-400 text-emerald-950 px-8 py-4 rounded-xl font-bold whitespace-nowrap transition-colors shadow-lg shadow-emerald-500/20">
//               Call Hotline: 1-800-88-5151
//             </button>
//           </div>
//         </motion.div>
//       </div>
//     </div>
//   );
// }

import React, { useMemo, useState } from "react";
import {
  AlertTriangle,
  ShieldAlert,
  HeartHandshake,
  Phone,
  ArrowRight,
  XOctagon,
  CheckCircle2,
} from "lucide-react";
import { motion } from "motion/react";
import { Link } from "react-router";

type GuidanceType = "support" | "rehome" | "urgent";

type RehomeReason = {
  id: string;
  label: string;
  description: string;
  type: GuidanceType;
  tips: string[];
  nextSteps: string[];
};

const rehomeReasons: RehomeReason[] = [
  {
    id: "not-enough-time",
    label: "I do not have enough time",
    description:
      "This may be manageable if the care routine can be simplified.",
    type: "support",
    tips: [
      "Create a simple weekly care schedule.",
      "Use reminders for feeding and water changes.",
      "Ask a family member to help with one small task.",
      "Reduce tank complexity if the current setup is too demanding.",
    ],
    nextSteps: [
      "Try a 2-week care routine first.",
      "If the pet is still being neglected, start looking for a responsible adopter.",
    ],
  },
  {
    id: "too-expensive",
    label: "The cost is becoming too high",
    description:
      "Some costs can be reduced, but the pet should still receive proper care.",
    type: "support",
    tips: [
      "Prioritise essentials: food, clean water, filter, and safe housing.",
      "Look for second-hand aquarium equipment from hobbyist groups.",
      "Avoid buying unnecessary decorations or accessories.",
      "Ask local hobbyists for lower-cost care advice.",
    ],
    nextSteps: [
      "Estimate the monthly cost honestly.",
      "If basic care is still unaffordable, rehoming may be safer for the pet.",
    ],
  },
  {
    id: "maintenance-hard",
    label: "Cleaning or water maintenance is too hard",
    description:
      "This is common for beginners and may be fixable with better setup habits.",
    type: "support",
    tips: [
      "Check whether the tank is overcrowded.",
      "Do smaller regular water changes instead of rare major cleanups.",
      "Make sure the filter is suitable for the tank size.",
      "Avoid overfeeding, because leftover food makes water dirty faster.",
    ],
    nextSteps: [
      "Improve the care routine first.",
      "If the setup is still impossible to maintain, consider rehoming to someone experienced.",
    ],
  },
  {
    id: "pet-too-big",
    label: "My pet grew bigger than expected",
    description:
      "This can become serious if the tank or enclosure is no longer suitable.",
    type: "rehome",
    tips: [
      "Check the adult size of the species.",
      "Do not release the pet into rivers, ponds, drains, or lakes.",
      "Avoid giving the pet to someone who also lacks proper space.",
    ],
    nextSteps: [
      "Upgrade the tank or enclosure if possible.",
      "If you cannot provide enough space, look for an experienced keeper, aquarium shop, or rescue contact.",
    ],
  },
  {
    id: "lost-interest",
    label: "I lost interest or became too busy",
    description:
      "Losing interest is not a reason to release a pet, but it is a sign that support or rehoming may be needed.",
    type: "support",
    tips: [
      "Set a minimum care routine: feeding, checking water, and cleaning.",
      "Ask someone in the household if they can share responsibility.",
      "Keep the setup simple so care feels less overwhelming.",
    ],
    nextSteps: [
      "Try to maintain basic care while searching for help.",
      "If no one can care for the pet consistently, arrange safe rehoming.",
    ],
  },
  {
    id: "family-issue",
    label: "My family or housemates do not want the pet",
    description:
      "Sometimes this can be solved through better placement, cleaning, or discussion.",
    type: "support",
    tips: [
      "Ask what the main issue is: smell, space, noise, electricity, or safety.",
      "Move the tank or enclosure to a more suitable area if possible.",
      "Improve cleaning frequency if smell is the main concern.",
    ],
    nextSteps: [
      "Try solving the specific complaint first.",
      "If the household no longer allows the pet, plan a safe rehome.",
    ],
  },
  {
    id: "moving-no-pets",
    label: "I am moving somewhere pets are not allowed",
    description:
      "If pets are not allowed in the new place, rehoming may be necessary.",
    type: "rehome",
    tips: [
      "Do not wait until moving day.",
      "Prepare clear photos and basic care information for adopters.",
      "Be honest about the pet’s size, behaviour, and care needs.",
    ],
    nextSteps: [
      "Contact trusted hobbyist groups early.",
      "Ask pet stores or experienced keepers if they can accept the pet.",
    ],
  },
  {
    id: "relocation",
    label: "I am relocating long-term",
    description:
      "Long-term relocation can make safe rehoming the most realistic option.",
    type: "rehome",
    tips: [
      "Avoid last-minute surrender.",
      "Do not pass the pet to someone who only wants it temporarily.",
      "Write down the pet’s diet, tank size, and care requirements.",
    ],
    nextSteps: [
      "Find a committed adopter before you leave.",
      "Use local groups, pet stores, or animal welfare contacts.",
    ],
  },
  {
    id: "cannot-provide-care",
    label: "I cannot provide proper space or care anymore",
    description:
      "If the pet’s basic welfare needs cannot be met, rehoming may be the kinder option.",
    type: "rehome",
    tips: [
      "Check whether the issue is temporary or long-term.",
      "Do not reduce care below safe minimum needs.",
      "Look for someone who already understands the species.",
    ],
    nextSteps: [
      "Continue basic care while searching for a new home.",
      "Prioritise experienced adopters over random buyers.",
    ],
  },
  {
    id: "too-many-pets",
    label: "I have too many pets or accidental breeding",
    description:
      "Overcrowding can quickly affect animal health and water quality.",
    type: "rehome",
    tips: [
      "Separate breeding pairs if possible.",
      "Do not release extra fish or turtles outdoors.",
      "Avoid giving many animals to one unprepared person.",
    ],
    nextSteps: [
      "Rehome gradually through responsible adopters.",
      "Ask hobbyist groups or shops for help managing surplus pets.",
    ],
  },
  {
    id: "dangerous-or-restricted",
    label: "The pet is dangerous, restricted, or illegal",
    description:
      "This needs extra caution. Do not sell, release, or hand it to an unqualified person.",
    type: "urgent",
    tips: [
      "Avoid handling the animal unnecessarily.",
      "Keep it securely contained.",
      "Do not release it into the environment.",
      "Do not give it to someone without proper knowledge.",
    ],
    nextSteps: [
      "Contact relevant authorities, experienced rescuers, or specialist keepers.",
      "Ask for official guidance before transferring the animal.",
    ],
  },
];

const guidanceStyles: Record<
  GuidanceType,
  {
    badge: string;
    card: string;
    title: string;
    heading: string;
  }
> = {
  support: {
    badge: "bg-emerald-100 text-emerald-800",
    card: "border-emerald-200 bg-emerald-50",
    title: "Try support first",
    heading: "This may be fixable before rehoming",
  },
  rehome: {
    badge: "bg-sky-100 text-sky-800",
    card: "border-sky-200 bg-sky-50",
    title: "Rehoming may be needed",
    heading: "Safe rehoming may be the responsible choice",
  },
  urgent: {
    badge: "bg-rose-100 text-rose-800",
    card: "border-rose-200 bg-rose-50",
    title: "Handle carefully",
    heading: "This needs urgent or specialist help",
  },
};

export function SafeExit() {
  const [selectedReasonId, setSelectedReasonId] = useState<string | null>(null);

  const selectedReason = useMemo(
    () => rehomeReasons.find((reason) => reason.id === selectedReasonId),
    [selectedReasonId],
  );

  return (
    <div className="bg-stone-50 min-h-screen py-16 px-4 md:px-8 font-sans text-stone-900">
      <div className="max-w-4xl mx-auto space-y-16">
        {/* Header Section */}
        <div className="text-center">
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: "spring", stiffness: 200 }}
            className="inline-block bg-rose-100 p-5 rounded-full mb-6 shadow-md"
          >
            <HeartHandshake className="w-16 h-16 text-rose-600" />
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-4xl md:text-6xl font-extrabold mb-6 tracking-tight text-stone-900"
          >
            Safe Rehoming Options
          </motion.h1>

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

        {/* Critical Warning Section */}
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-gradient-to-br from-rose-600 to-rose-800 rounded-3xl p-8 md:p-12 shadow-2xl relative overflow-hidden text-white"
        >
          <div className="absolute top-0 right-0 opacity-10 transform scale-150 translate-x-12 -translate-y-12 pointer-events-none">
            <XOctagon className="w-64 h-64 text-white" />
          </div>

          <div className="relative z-10 flex flex-col md:flex-row gap-8 items-start">
            <ShieldAlert className="w-16 h-16 text-rose-200 shrink-0 mt-2" />

            <div>
              <h2 className="text-3xl font-bold mb-4 flex items-center gap-3">
                Do Not Release Your Pet
              </h2>

              <ul className="space-y-4 text-rose-50 text-lg leading-relaxed mb-2">
                <li className="flex gap-3 items-start">
                  <XOctagon className="w-6 h-6 text-rose-300 shrink-0 mt-0.5" />
                  <span>
                    <strong>It's unsafe:</strong> Pets raised in captivity may
                    not survive outdoors.
                  </span>
                </li>

                <li className="flex gap-3 items-start">
                  <XOctagon className="w-6 h-6 text-rose-300 shrink-0 mt-0.5" />
                  <span>
                    <strong>It harms ecosystems:</strong> Released pets can
                    compete with native species and spread disease.
                  </span>
                </li>

                <li className="flex gap-3 items-start">
                  <XOctagon className="w-6 h-6 text-rose-300 shrink-0 mt-0.5" />
                  <span>
                    <strong>There are safer options:</strong> Rehoming,
                    surrendering, or getting advice is always better than
                    release.
                  </span>
                </li>
              </ul>
            </div>
          </div>
        </motion.div>

        {/* Reason Selector Section */}
        <motion.section
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.25 }}
          className="bg-white rounded-3xl p-8 shadow-xl border border-stone-100"
        >
          <div className="mb-8 text-center">
            <h2 className="text-3xl font-bold text-stone-900 mb-3">
              Tell us why you cannot keep your pet
            </h2>
            <p className="text-stone-600 text-lg max-w-2xl mx-auto">
              Choose the closest reason. We will suggest whether you should try
              support first or start safe rehoming.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {rehomeReasons.map((reason) => {
              const isSelected = selectedReasonId === reason.id;
              const style = guidanceStyles[reason.type];

              return (
                <button
                  key={reason.id}
                  type="button"
                  onClick={() => setSelectedReasonId(reason.id)}
                  className={`text-left rounded-2xl border p-5 transition-all hover:-translate-y-0.5 hover:shadow-md ${
                    isSelected
                      ? "border-emerald-500 bg-emerald-50 shadow-md"
                      : "border-stone-200 bg-white hover:border-emerald-300"
                  }`}
                >
                  <div className="flex items-start justify-between gap-3">
                    <h3 className="font-bold text-stone-900">{reason.label}</h3>

                    {isSelected && (
                      <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
                    )}
                  </div>

                  <p className="mt-2 text-sm text-stone-600">
                    {reason.description}
                  </p>

                  <span
                    className={`mt-4 inline-flex rounded-full px-3 py-1 text-xs font-bold ${style.badge}`}
                  >
                    {style.title}
                  </span>
                </button>
              );
            })}
          </div>

          {selectedReason && (
            <motion.div
              key={selectedReason.id}
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              className={`mt-8 rounded-3xl border p-6 ${
                guidanceStyles[selectedReason.type].card
              }`}
            >
              <div className="mb-5 flex items-start gap-3">
                {selectedReason.type === "support" ? (
                  <CheckCircle2 className="w-7 h-7 text-emerald-600 shrink-0 mt-1" />
                ) : selectedReason.type === "rehome" ? (
                  <HeartHandshake className="w-7 h-7 text-sky-600 shrink-0 mt-1" />
                ) : (
                  <AlertTriangle className="w-7 h-7 text-rose-600 shrink-0 mt-1" />
                )}

                <div>
                  <h3 className="text-2xl font-bold text-stone-900">
                    {guidanceStyles[selectedReason.type].heading}
                  </h3>
                  <p className="mt-1 text-stone-700">
                    {selectedReason.description}
                  </p>
                </div>
              </div>

              <div className="grid gap-6 md:grid-cols-2">
                <div>
                  <h4 className="font-bold text-stone-900 mb-3">
                    Helpful tips
                  </h4>
                  <ul className="space-y-2">
                    {selectedReason.tips.map((tip) => (
                      <li
                        key={tip}
                        className="flex gap-2 text-sm text-stone-700"
                      >
                        <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                        <span>{tip}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                <div>
                  <h4 className="font-bold text-stone-900 mb-3">
                    Next safe steps
                  </h4>
                  <ul className="space-y-2">
                    {selectedReason.nextSteps.map((step) => (
                      <li
                        key={step}
                        className="flex gap-2 text-sm text-stone-700"
                      >
                        <ArrowRight className="w-4 h-4 text-sky-600 shrink-0 mt-0.5" />
                        <span>{step}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </motion.div>
          )}
        </motion.section>

        {/* Safe Alternatives Section */}
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="space-y-8"
        >
          <h2 className="text-3xl font-bold text-center mb-10 text-stone-900">
            What You Should Do Instead
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="bg-white rounded-3xl p-8 shadow-xl border border-stone-100 hover:-translate-y-1 transition-transform">
              <div className="bg-emerald-100 w-16 h-16 rounded-2xl flex items-center justify-center mb-6">
                <HeartHandshake className="w-8 h-8 text-emerald-600" />
              </div>

              <h3 className="text-2xl font-bold text-stone-900 mb-4">
                Rehome via Local Groups
              </h3>

              <p className="text-stone-600 mb-6 leading-relaxed text-lg">
                Look for responsible aquarium or reptile hobbyist groups. Share
                the pet’s species, size, care needs, and clear photos.
              </p>

              <a
                href="#"
                className="inline-flex items-center text-emerald-600 font-bold hover:text-emerald-700 hover:gap-3 transition-all"
              >
                Find local hobbyist groups{" "}
                <ArrowRight className="w-5 h-5 ml-2" />
              </a>
            </div>

            <div className="bg-white rounded-3xl p-8 shadow-xl border border-stone-100 hover:-translate-y-1 transition-transform">
              <div className="bg-sky-100 w-16 h-16 rounded-2xl flex items-center justify-center mb-6">
                <Phone className="w-8 h-8 text-sky-600" />
              </div>

              <h3 className="text-2xl font-bold text-stone-900 mb-4">
                Contact Pet Stores
              </h3>

              <p className="text-stone-600 mb-6 leading-relaxed text-lg">
                Some aquarium shops may accept surrendered fish or turtles,
                especially if they are healthy. Call ahead before visiting.
              </p>

              <Link
                to="/"
                className="inline-flex items-center text-sky-600 font-bold hover:text-sky-700 hover:gap-3 transition-all"
              >
                Search nearby stores <ArrowRight className="w-5 h-5 ml-2" />
              </Link>
            </div>
          </div>

          <div className="bg-stone-900 text-stone-50 rounded-3xl p-8 shadow-xl mt-8 flex flex-col sm:flex-row items-center justify-between gap-8 border-l-8 border-emerald-500">
            <div>
              <h3 className="text-2xl font-bold mb-2 text-white">
                Need urgent assistance?
              </h3>
              <p className="text-stone-400 text-lg">
                If the animal is dangerous, restricted, illegal, or you cannot
                provide basic care immediately, contact relevant authorities or
                experienced rescue contacts for guidance.
              </p>
            </div>

            <button className="bg-emerald-500 hover:bg-emerald-400 text-emerald-950 px-8 py-4 rounded-xl font-bold whitespace-nowrap transition-colors shadow-lg shadow-emerald-500/20">
              Get Guidance
            </button>
          </div>
        </motion.div>
      </div>
    </div>
  );
}

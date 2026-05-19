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
  RotateCcw,
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { Link } from "react-router";

type GuidanceType = "support" | "rehome" | "urgent";

type Reason = {
  id: string;
  categoryId: string;
  label: string;
  description: string;
  type: GuidanceType;
};

type ReasonCategory = {
  id: string;
  title: string;
  description: string;
};

type GuidanceResult = {
  type: GuidanceType;
  title: string;
  description: string;
  tips: string[];
  nextSteps: string[];
};

const reasonCategories: ReasonCategory[] = [
  {
    id: "care",
    title: "Care is becoming difficult",
    description:
      "Time, cost, cleaning, or pet size is becoming hard to manage.",
  },
  {
    id: "life",
    title: "My living situation changed",
    description: "Moving, relocation, landlord rules, or family decisions.",
  },
  {
    id: "space",
    title: "I cannot provide proper space",
    description:
      "The pet needs more space, better equipment, or safer housing.",
  },
  {
    id: "safety",
    title: "Safety, legal, or urgent issue",
    description:
      "The pet may be dangerous, restricted, sick, or urgent to handle.",
  },
];

const reasons: Reason[] = [
  {
    id: "not-enough-time",
    categoryId: "care",
    label: "I do not have enough time",
    description: "The pet care routine is becoming difficult to follow.",
    type: "support",
  },
  {
    id: "too-expensive",
    categoryId: "care",
    label: "The cost is becoming too high",
    description:
      "Food, equipment, electricity, or treatment is becoming expensive.",
    type: "support",
  },
  {
    id: "maintenance-hard",
    categoryId: "care",
    label: "Cleaning or water maintenance is too hard",
    description:
      "The tank gets dirty quickly or maintenance feels overwhelming.",
    type: "support",
  },
  {
    id: "lost-interest",
    categoryId: "care",
    label: "I lost interest or became too busy",
    description: "I am worried I cannot care for the pet consistently anymore.",
    type: "support",
  },
  {
    id: "moving-no-pets",
    categoryId: "life",
    label: "I am moving somewhere pets are not allowed",
    description: "The new place does not allow pets or aquariums.",
    type: "rehome",
  },
  {
    id: "relocation",
    categoryId: "life",
    label: "I am relocating long-term",
    description: "I cannot bring the pet with me for a long period of time.",
    type: "rehome",
  },
  {
    id: "family-issue",
    categoryId: "life",
    label: "My family or housemates do not want the pet",
    description:
      "There are complaints about space, smell, noise, cost, or safety.",
    type: "support",
  },
  {
    id: "pet-too-big",
    categoryId: "space",
    label: "My pet grew bigger than expected",
    description: "The current tank or enclosure is no longer suitable.",
    type: "rehome",
  },
  {
    id: "cannot-provide-care",
    categoryId: "space",
    label: "I cannot provide proper space or care anymore",
    description: "The pet’s basic welfare needs cannot be met long-term.",
    type: "rehome",
  },
  {
    id: "too-many-pets",
    categoryId: "space",
    label: "I have too many pets or accidental breeding",
    description: "There are too many animals to care for properly.",
    type: "rehome",
  },
  {
    id: "dangerous-or-restricted",
    categoryId: "safety",
    label: "The pet is dangerous, restricted, or illegal",
    description: "The animal may need specialist or official handling.",
    type: "urgent",
  },
  {
    id: "sick-urgent",
    categoryId: "safety",
    label: "The pet needs urgent care and I cannot provide it",
    description: "The pet may be sick, injured, or declining quickly.",
    type: "urgent",
  },
];

const guidanceStyles: Record<
  GuidanceType,
  {
    card: string;
    badge: string;
    icon: React.ReactNode;
  }
> = {
  support: {
    card: "border-emerald-200 bg-emerald-50",
    badge: "bg-emerald-100 text-emerald-800",
    icon: <CheckCircle2 className="w-8 h-8 text-emerald-600 shrink-0" />,
  },
  rehome: {
    card: "border-sky-200 bg-sky-50",
    badge: "bg-sky-100 text-sky-800",
    icon: <HeartHandshake className="w-8 h-8 text-sky-600 shrink-0" />,
  },
  urgent: {
    card: "border-rose-200 bg-rose-50",
    badge: "bg-rose-100 text-rose-800",
    icon: <AlertTriangle className="w-8 h-8 text-rose-600 shrink-0" />,
  },
};

function getGuidanceType(selectedReasons: Reason[]): GuidanceType {
  if (selectedReasons.some((reason) => reason.type === "urgent")) {
    return "urgent";
  }

  if (selectedReasons.some((reason) => reason.type === "rehome")) {
    return "rehome";
  }

  return "support";
}

function getGuidanceResult(selectedReasons: Reason[]): GuidanceResult {
  const type = getGuidanceType(selectedReasons);

  if (type === "urgent") {
    return {
      type,
      title: "This needs urgent or specialist guidance",
      description:
        "Because this involves safety, legal status, or urgent animal welfare, do not release, sell, or pass the pet to an unprepared person.",
      tips: [
        "Keep the pet safely contained.",
        "Avoid unnecessary handling.",
        "Do not release the pet into drains, ponds, lakes, or rivers.",
        "Prepare the pet’s species name, size, photos, and current condition.",
      ],
      nextSteps: [
        "Contact an experienced keeper, rescue contact, pet store, or relevant authority for guidance.",
        "Ask before transporting the animal, especially if it may be dangerous or restricted.",
        "Continue basic care while waiting for help.",
      ],
    };
  }

  if (type === "rehome") {
    return {
      type,
      title: "Safe rehoming may be the responsible choice",
      description:
        "Based on your reason, rehoming may be better than keeping the pet in unsuitable conditions. The important part is to rehome safely, not release.",
      tips: [
        "Do not wait until the last minute.",
        "Take clear photos of the pet and its current setup.",
        "Be honest about the pet’s size, behaviour, diet, and care needs.",
        "Do not give the pet to someone who cannot provide proper space or care.",
      ],
      nextSteps: [
        "Ask trusted aquarium or reptile hobbyist groups first.",
        "Contact local pet stores and ask whether they accept surrender cases.",
        "Prepare a simple care note for the new keeper.",
      ],
    };
  }

  return {
    type,
    title: "Try support first before rehoming",
    description:
      "Your reason may be fixable with a simpler routine, lower-cost setup, or help from others. Rehoming is still an option if the pet’s basic care cannot be maintained.",
    tips: [
      "Create a simple weekly care routine.",
      "Prioritise essentials: food, clean water, filter, and safe housing.",
      "Ask a family member or experienced hobbyist for help.",
      "Reduce unnecessary decorations or complicated setup tasks.",
    ],
    nextSteps: [
      "Try the improved routine for 1 to 2 weeks.",
      "If the pet is still being neglected, start safe rehoming early.",
      "Do not release the pet even if care feels overwhelming.",
    ],
  };
}

export function SafeExit() {
  const [activeCategoryId, setActiveCategoryId] = useState(
    reasonCategories[0].id,
  );
  const [selectedReasonIds, setSelectedReasonIds] = useState<string[]>([]);
  const [hasConfirmed, setHasConfirmed] = useState(false);

  const activeCategory = reasonCategories.find(
    (category) => category.id === activeCategoryId,
  );

  const visibleReasons = reasons.filter(
    (reason) => reason.categoryId === activeCategoryId,
  );

  const selectedReasons = useMemo(
    () => reasons.filter((reason) => selectedReasonIds.includes(reason.id)),
    [selectedReasonIds],
  );

  const guidance = useMemo(
    () => getGuidanceResult(selectedReasons),
    [selectedReasons],
  );

  function toggleReason(reasonId: string) {
    setSelectedReasonIds((current) =>
      current.includes(reasonId)
        ? current.filter((id) => id !== reasonId)
        : [...current, reasonId],
    );
  }

  function handleConfirm() {
    if (selectedReasonIds.length === 0) return;
    setHasConfirmed(true);
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  function handleEditReasons() {
    setHasConfirmed(false);
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  function handleReset() {
    setSelectedReasonIds([]);
    setActiveCategoryId(reasonCategories[0].id);
    setHasConfirmed(false);
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  return (
    <div className="bg-stone-50 min-h-screen py-16 px-4 md:px-8 font-sans text-stone-900">
      <div className="max-w-4xl mx-auto space-y-12">
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
            Safe Rehoming Helper
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="text-xl text-stone-600 max-w-3xl mx-auto leading-relaxed"
          >
            Tell us why you may not be able to keep your pet. We will suggest
            whether you should try support first or start safe rehoming.
          </motion.p>
        </div>

        {/* Critical Warning Section */}
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-gradient-to-br from-rose-600 to-rose-800 rounded-3xl p-8 md:p-10 shadow-2xl relative overflow-hidden text-white"
        >
          <div className="absolute top-0 right-0 opacity-10 transform scale-150 translate-x-12 -translate-y-12 pointer-events-none">
            <XOctagon className="w-64 h-64 text-white" />
          </div>

          <div className="relative z-10 flex flex-col md:flex-row gap-6 items-start">
            <ShieldAlert className="w-14 h-14 text-rose-200 shrink-0 mt-1" />

            <div>
              <h2 className="text-3xl font-bold mb-4">
                Do Not Release Your Pet
              </h2>

              <p className="text-rose-50 text-lg leading-relaxed">
                Releasing pet fish or turtles into drains, ponds, lakes, or
                rivers can harm the animal and local biodiversity. There is
                always a safer option than release.
              </p>
            </div>
          </div>
        </motion.div>

        {/* Main Flow Card */}
        <motion.section
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.25 }}
          className="bg-white rounded-3xl p-6 md:p-8 shadow-xl border border-stone-100"
        >
          <AnimatePresence mode="wait">
            {!hasConfirmed ? (
              <motion.div
                key="reason-selection"
                initial={{ opacity: 0, x: -16 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 16 }}
                transition={{ duration: 0.25 }}
              >
                <div className="mb-8">
                  <p className="text-sm font-bold uppercase tracking-widest text-emerald-700 mb-2">
                    Step 1 of 2
                  </p>
                  <h2 className="text-3xl font-bold text-stone-900 mb-3">
                    What is the main situation?
                  </h2>
                  <p className="text-stone-600 text-lg">
                    Choose a category first, then select one or more reasons
                    that match your situation.
                  </p>
                </div>

                {/* Category Selector */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
                  {reasonCategories.map((category) => {
                    const isActive = activeCategoryId === category.id;

                    return (
                      <button
                        key={category.id}
                        type="button"
                        onClick={() => setActiveCategoryId(category.id)}
                        className={`text-left rounded-2xl border p-5 transition-all ${
                          isActive
                            ? "border-emerald-500 bg-emerald-50 shadow-md"
                            : "border-stone-200 bg-white hover:border-emerald-300 hover:bg-emerald-50/50"
                        }`}
                      >
                        <div className="flex items-start justify-between gap-3">
                          <h3 className="font-bold text-stone-900">
                            {category.title}
                          </h3>

                          {isActive && (
                            <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
                          )}
                        </div>

                        <p className="mt-2 text-sm text-stone-600">
                          {category.description}
                        </p>
                      </button>
                    );
                  })}
                </div>

                {/* Reason Selector */}
                <div className="rounded-3xl border border-stone-200 bg-stone-50 p-5 md:p-6">
                  <div className="mb-5">
                    <p className="text-sm font-bold uppercase tracking-widest text-stone-500 mb-1">
                      Step 2 of 2
                    </p>
                    <h3 className="text-2xl font-bold text-stone-900">
                      {activeCategory?.title}
                    </h3>
                    <p className="text-stone-600 mt-1">
                      Select all that apply.
                    </p>
                  </div>

                  <div className="space-y-3">
                    {visibleReasons.map((reason) => {
                      const isSelected = selectedReasonIds.includes(reason.id);
                      const style = guidanceStyles[reason.type];

                      return (
                        <button
                          key={reason.id}
                          type="button"
                          onClick={() => toggleReason(reason.id)}
                          className={`w-full text-left rounded-2xl border p-5 transition-all ${
                            isSelected
                              ? "border-emerald-500 bg-white shadow-sm"
                              : "border-stone-200 bg-white hover:border-emerald-300"
                          }`}
                        >
                          <div className="flex items-start justify-between gap-4">
                            <div>
                              <h4 className="font-bold text-stone-900">
                                {reason.label}
                              </h4>
                              <p className="mt-1 text-sm text-stone-600">
                                {reason.description}
                              </p>
                              <span
                                className={`mt-3 inline-flex rounded-full px-3 py-1 text-xs font-bold ${style.badge}`}
                              >
                                {reason.type === "support"
                                  ? "Try support first"
                                  : reason.type === "rehome"
                                    ? "Rehoming may be needed"
                                    : "Handle carefully"}
                              </span>
                            </div>

                            <span
                              className={`mt-1 flex h-6 w-6 shrink-0 items-center justify-center rounded-full border ${
                                isSelected
                                  ? "border-emerald-600 bg-emerald-600 text-white"
                                  : "border-stone-300 bg-white"
                              }`}
                            >
                              {isSelected && (
                                <CheckCircle2 className="h-4 w-4" />
                              )}
                            </span>
                          </div>
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Selection Summary + Confirm */}
                <div className="mt-8 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                  <div>
                    <p className="font-semibold text-stone-900">
                      Selected reasons: {selectedReasonIds.length}
                    </p>
                    <p className="text-sm text-stone-500">
                      You can select more than one reason before confirming.
                    </p>
                  </div>

                  <button
                    type="button"
                    onClick={handleConfirm}
                    disabled={selectedReasonIds.length === 0}
                    className={`inline-flex items-center justify-center gap-2 rounded-full px-6 py-3 font-bold transition ${
                      selectedReasonIds.length === 0
                        ? "cursor-not-allowed bg-stone-200 text-stone-500"
                        : "bg-emerald-600 text-white hover:bg-emerald-700"
                    }`}
                  >
                    Confirm and show guidance
                    <ArrowRight className="w-5 h-5" />
                  </button>
                </div>
              </motion.div>
            ) : (
              <motion.div
                key="solution"
                initial={{ opacity: 0, x: 16 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -16 }}
                transition={{ duration: 0.25 }}
              >
                <div className="mb-8 flex flex-col md:flex-row md:items-start md:justify-between gap-4">
                  <div>
                    <p className="text-sm font-bold uppercase tracking-widest text-emerald-700 mb-2">
                      Your guidance
                    </p>
                    <h2 className="text-3xl font-bold text-stone-900">
                      Recommended next step
                    </h2>
                    <p className="text-stone-600 mt-2">
                      Based on the reason you selected, here is the safest path.
                    </p>
                  </div>

                  <button
                    type="button"
                    onClick={handleEditReasons}
                    className="inline-flex items-center justify-center gap-2 rounded-full border border-stone-200 bg-white px-5 py-2.5 font-bold text-stone-700 hover:bg-stone-50"
                  >
                    <RotateCcw className="w-4 h-4" />
                    Change reason
                  </button>
                </div>

                <div className="mb-6 flex flex-wrap gap-2">
                  {selectedReasons.map((reason) => (
                    <span
                      key={reason.id}
                      className="rounded-full bg-stone-100 px-3 py-1 text-sm font-semibold text-stone-700"
                    >
                      {reason.label}
                    </span>
                  ))}
                </div>

                <div
                  className={`rounded-3xl border p-6 md:p-8 ${
                    guidanceStyles[guidance.type].card
                  }`}
                >
                  <div className="mb-6 flex items-start gap-4">
                    {guidanceStyles[guidance.type].icon}

                    <div>
                      <h3 className="text-2xl md:text-3xl font-bold text-stone-900">
                        {guidance.title}
                      </h3>
                      <p className="mt-2 text-stone-700 leading-relaxed">
                        {guidance.description}
                      </p>
                    </div>
                  </div>

                  <div className="grid gap-6 md:grid-cols-2">
                    <div>
                      <h4 className="font-bold text-stone-900 mb-3">
                        Helpful tips
                      </h4>
                      <ul className="space-y-3">
                        {guidance.tips.map((tip) => (
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
                      <ul className="space-y-3">
                        {guidance.nextSteps.map((step) => (
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
                </div>

                {/* Action Cards shown only after confirmation */}
                <div className="mt-8 grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="rounded-3xl border border-stone-100 bg-white p-6 shadow-sm">
                    <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-emerald-100">
                      <HeartHandshake className="h-7 w-7 text-emerald-600" />
                    </div>

                    <h3 className="text-xl font-bold text-stone-900 mb-2">
                      Contact PERHILITAN or Department of Fisheries for guidance
                    </h3>

                    <p className="text-stone-600 leading-relaxed mb-5">
                      If the pet is wildlife, restricted, dangerous, or you are
                      unsure what to do, contact PERHILITAN for proper guidance.
                    </p>

                    <a
                      href="https://www.wildlife.gov.my"
                      target="_blank"
                      rel="noreferrer"
                      className="inline-flex items-center font-bold text-emerald-700 hover:text-emerald-800 mb-2"
                    >
                      Visit PERHILITAN website
                      <ArrowRight className="ml-2 h-4 w-4" />
                    </a>

                    <a
                      href="https://www.dof.gov.my/en/"
                      target="_blank"
                      rel="noreferrer"
                      className="inline-flex items-center font-bold text-emerald-700 hover:text-emerald-800"
                    >
                      Visit Department of Fisheries website
                      <ArrowRight className="ml-2 h-4 w-4" />
                    </a>
                  </div>

                  <div className="rounded-3xl border border-stone-100 bg-white p-6 shadow-sm">
                    <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-sky-100">
                      <Phone className="h-7 w-7 text-sky-600" />
                    </div>

                    <h3 className="text-xl font-bold text-stone-900 mb-2">
                      List your pet for adoption
                    </h3>

                    <p className="text-stone-600 leading-relaxed mb-5">
                      Use a pet adoption platform to look for responsible
                      adopters. Include clear photos, species details, size, and
                      care requirements.
                    </p>

                    <a
                      href="https://www.petfinder.my/listings.htm"
                      target="_blank"
                      rel="noreferrer"
                      className="inline-flex items-center font-bold text-sky-700 hover:text-sky-800"
                    >
                      Visit PetFinder adoption listings
                      <ArrowRight className="ml-2 h-4 w-4" />
                    </a>
                  </div>
                </div>

                <div className="mt-8 flex justify-center">
                  <button
                    type="button"
                    onClick={handleReset}
                    className="text-sm font-bold text-stone-500 hover:text-stone-800"
                  >
                    Start over
                  </button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.section>
      </div>
    </div>
  );
}

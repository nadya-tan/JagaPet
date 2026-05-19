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
import { useLanguage } from "../context/LanguageContext";

type GuidanceType = "support" | "rehome" | "urgent";

type Reason = {
  id: string;
  categoryId: string;
  labelKey: string;
  descriptionKey: string;
  type: GuidanceType;
};

type ReasonCategory = {
  id: string;
  titleKey: string;
  descriptionKey: string;
};

type GuidanceResult = {
  type: GuidanceType;
  titleKey: string;
  descriptionKey: string;
  tipKeys: string[];
  nextStepKeys: string[];
};

const reasonCategories: ReasonCategory[] = [
  {
    id: "care",
    titleKey: "safeExit.categories.care.title",
    descriptionKey: "safeExit.categories.care.description",
  },
  {
    id: "life",
    titleKey: "safeExit.categories.life.title",
    descriptionKey: "safeExit.categories.life.description",
  },
  {
    id: "space",
    titleKey: "safeExit.categories.space.title",
    descriptionKey: "safeExit.categories.space.description",
  },
  {
    id: "safety",
    titleKey: "safeExit.categories.safety.title",
    descriptionKey: "safeExit.categories.safety.description",
  },
];

const reasons: Reason[] = [
  {
    id: "not-enough-time",
    categoryId: "care",
    labelKey: "safeExit.reasons.notEnoughTime.label",
    descriptionKey: "safeExit.reasons.notEnoughTime.description",
    type: "support",
  },
  {
    id: "too-expensive",
    categoryId: "care",
    labelKey: "safeExit.reasons.tooExpensive.label",
    descriptionKey: "safeExit.reasons.tooExpensive.description",
    type: "support",
  },
  {
    id: "maintenance-hard",
    categoryId: "care",
    labelKey: "safeExit.reasons.maintenanceHard.label",
    descriptionKey: "safeExit.reasons.maintenanceHard.description",
    type: "support",
  },
  {
    id: "lost-interest",
    categoryId: "care",
    labelKey: "safeExit.reasons.lostInterest.label",
    descriptionKey: "safeExit.reasons.lostInterest.description",
    type: "support",
  },
  {
    id: "moving-no-pets",
    categoryId: "life",
    labelKey: "safeExit.reasons.movingNoPets.label",
    descriptionKey: "safeExit.reasons.movingNoPets.description",
    type: "rehome",
  },
  {
    id: "relocation",
    categoryId: "life",
    labelKey: "safeExit.reasons.relocation.label",
    descriptionKey: "safeExit.reasons.relocation.description",
    type: "rehome",
  },
  {
    id: "family-issue",
    categoryId: "life",
    labelKey: "safeExit.reasons.familyIssue.label",
    descriptionKey: "safeExit.reasons.familyIssue.description",
    type: "support",
  },
  {
    id: "pet-too-big",
    categoryId: "space",
    labelKey: "safeExit.reasons.petTooBig.label",
    descriptionKey: "safeExit.reasons.petTooBig.description",
    type: "rehome",
  },
  {
    id: "cannot-provide-care",
    categoryId: "space",
    labelKey: "safeExit.reasons.cannotProvideCare.label",
    descriptionKey: "safeExit.reasons.cannotProvideCare.description",
    type: "rehome",
  },
  {
    id: "too-many-pets",
    categoryId: "space",
    labelKey: "safeExit.reasons.tooManyPets.label",
    descriptionKey: "safeExit.reasons.tooManyPets.description",
    type: "rehome",
  },
  {
    id: "dangerous-or-restricted",
    categoryId: "safety",
    labelKey: "safeExit.reasons.dangerousOrRestricted.label",
    descriptionKey: "safeExit.reasons.dangerousOrRestricted.description",
    type: "urgent",
  },
  {
    id: "sick-urgent",
    categoryId: "safety",
    labelKey: "safeExit.reasons.sickUrgent.label",
    descriptionKey: "safeExit.reasons.sickUrgent.description",
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
      titleKey: "safeExit.guidance.urgent.title",
      descriptionKey: "safeExit.guidance.urgent.description",
      tipKeys: [
        "safeExit.guidance.urgent.tips.keepContained",
        "safeExit.guidance.urgent.tips.avoidHandling",
        "safeExit.guidance.urgent.tips.doNotRelease",
        "safeExit.guidance.urgent.tips.prepareDetails",
      ],
      nextStepKeys: [
        "safeExit.guidance.urgent.nextSteps.contactExpert",
        "safeExit.guidance.urgent.nextSteps.askBeforeTransporting",
        "safeExit.guidance.urgent.nextSteps.continueBasicCare",
      ],
    };
  }

  if (type === "rehome") {
    return {
      type,
      titleKey: "safeExit.guidance.rehome.title",
      descriptionKey: "safeExit.guidance.rehome.description",
      tipKeys: [
        "safeExit.guidance.rehome.tips.doNotWait",
        "safeExit.guidance.rehome.tips.takePhotos",
        "safeExit.guidance.rehome.tips.beHonest",
        "safeExit.guidance.rehome.tips.doNotGiveUnprepared",
      ],
      nextStepKeys: [
        "safeExit.guidance.rehome.nextSteps.askGroups",
        "safeExit.guidance.rehome.nextSteps.contactStores",
        "safeExit.guidance.rehome.nextSteps.prepareCareNote",
      ],
    };
  }

  return {
    type,
    titleKey: "safeExit.guidance.support.title",
    descriptionKey: "safeExit.guidance.support.description",
    tipKeys: [
      "safeExit.guidance.support.tips.weeklyRoutine",
      "safeExit.guidance.support.tips.prioritiseEssentials",
      "safeExit.guidance.support.tips.askForHelp",
      "safeExit.guidance.support.tips.simplifySetup",
    ],
    nextStepKeys: [
      "safeExit.guidance.support.nextSteps.tryRoutine",
      "safeExit.guidance.support.nextSteps.startRehomingEarly",
      "safeExit.guidance.support.nextSteps.doNotRelease",
    ],
  };
}

function getReasonBadgeKey(type: GuidanceType) {
  if (type === "support") return "safeExit.badges.support";
  if (type === "rehome") return "safeExit.badges.rehome";
  return "safeExit.badges.urgent";
}

export function SafeExit() {
  const { t } = useLanguage();

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
            {t("safeExit.title")}
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="text-xl text-stone-600 max-w-3xl mx-auto leading-relaxed"
          >
            {t("safeExit.description")}
          </motion.p>
        </div>

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
                {t("safeExit.warningTitle")}
              </h2>

              <p className="text-rose-50 text-lg leading-relaxed">
                {t("safeExit.warningDescription")}
              </p>
            </div>
          </div>
        </motion.div>

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
                    {t("safeExit.step1")}
                  </p>
                  <h2 className="text-3xl font-bold text-stone-900 mb-3">
                    {t("safeExit.mainSituationTitle")}
                  </h2>
                  <p className="text-stone-600 text-lg">
                    {t("safeExit.mainSituationDescription")}
                  </p>
                </div>

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
                            {t(category.titleKey)}
                          </h3>

                          {isActive && (
                            <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
                          )}
                        </div>

                        <p className="mt-2 text-sm text-stone-600">
                          {t(category.descriptionKey)}
                        </p>
                      </button>
                    );
                  })}
                </div>

                <div className="rounded-3xl border border-stone-200 bg-stone-50 p-5 md:p-6">
                  <div className="mb-5">
                    <p className="text-sm font-bold uppercase tracking-widest text-stone-500 mb-1">
                      {t("safeExit.step2")}
                    </p>
                    <h3 className="text-2xl font-bold text-stone-900">
                      {activeCategory ? t(activeCategory.titleKey) : ""}
                    </h3>
                    <p className="text-stone-600 mt-1">
                      {t("safeExit.selectAll")}
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
                                {t(reason.labelKey)}
                              </h4>
                              <p className="mt-1 text-sm text-stone-600">
                                {t(reason.descriptionKey)}
                              </p>
                              <span
                                className={`mt-3 inline-flex rounded-full px-3 py-1 text-xs font-bold ${style.badge}`}
                              >
                                {t(getReasonBadgeKey(reason.type))}
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

                <div className="mt-8 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                  <div>
                    <p className="font-semibold text-stone-900">
                      {t("safeExit.selectedReasons")}:{" "}
                      {selectedReasonIds.length}
                    </p>
                    <p className="text-sm text-stone-500">
                      {t("safeExit.selectedReasonsHint")}
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
                    {t("safeExit.confirmButton")}
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
                      {t("safeExit.yourGuidance")}
                    </p>
                    <h2 className="text-3xl font-bold text-stone-900">
                      {t("safeExit.recommendedNextStep")}
                    </h2>
                    <p className="text-stone-600 mt-2">
                      {t("safeExit.recommendedDescription")}
                    </p>
                  </div>

                  <button
                    type="button"
                    onClick={handleEditReasons}
                    className="inline-flex items-center justify-center gap-2 rounded-full border border-stone-200 bg-white px-5 py-2.5 font-bold text-stone-700 hover:bg-stone-50"
                  >
                    <RotateCcw className="w-4 h-4" />
                    {t("safeExit.changeReason")}
                  </button>
                </div>

                <div className="mb-6 flex flex-wrap gap-2">
                  {selectedReasons.map((reason) => (
                    <span
                      key={reason.id}
                      className="rounded-full bg-stone-100 px-3 py-1 text-sm font-semibold text-stone-700"
                    >
                      {t(reason.labelKey)}
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
                        {t(guidance.titleKey)}
                      </h3>
                      <p className="mt-2 text-stone-700 leading-relaxed">
                        {t(guidance.descriptionKey)}
                      </p>
                    </div>
                  </div>

                  <div className="grid gap-6 md:grid-cols-2">
                    <div>
                      <h4 className="font-bold text-stone-900 mb-3">
                        {t("safeExit.helpfulTips")}
                      </h4>
                      <ul className="space-y-3">
                        {guidance.tipKeys.map((tipKey) => (
                          <li
                            key={tipKey}
                            className="flex gap-2 text-sm text-stone-700"
                          >
                            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                            <span>{t(tipKey)}</span>
                          </li>
                        ))}
                      </ul>
                    </div>

                    <div>
                      <h4 className="font-bold text-stone-900 mb-3">
                        {t("safeExit.nextSafeSteps")}
                      </h4>
                      <ul className="space-y-3">
                        {guidance.nextStepKeys.map((stepKey) => (
                          <li
                            key={stepKey}
                            className="flex gap-2 text-sm text-stone-700"
                          >
                            <ArrowRight className="w-4 h-4 text-sky-600 shrink-0 mt-0.5" />
                            <span>{t(stepKey)}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                </div>

                <div className="mt-8 grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="rounded-3xl border border-stone-100 bg-white p-6 shadow-sm">
                    <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-emerald-100">
                      <HeartHandshake className="h-7 w-7 text-emerald-600" />
                    </div>

                    <h3 className="text-xl font-bold text-stone-900 mb-2">
                      {t("safeExit.authorityCardTitle")}
                    </h3>

                    <p className="text-stone-600 leading-relaxed mb-5">
                      {t("safeExit.authorityCardDescription")}
                    </p>

                    <a
                      href="https://www.wildlife.gov.my"
                      target="_blank"
                      rel="noreferrer"
                      className="inline-flex items-center font-bold text-emerald-700 hover:text-emerald-800 mb-2"
                    >
                      {t("safeExit.visitPerhilitan")}
                      <ArrowRight className="ml-2 h-4 w-4" />
                    </a>

                    <a
                      href="https://www.dof.gov.my/en/"
                      target="_blank"
                      rel="noreferrer"
                      className="inline-flex items-center font-bold text-emerald-700 hover:text-emerald-800"
                    >
                      {t("safeExit.visitDof")}
                      <ArrowRight className="ml-2 h-4 w-4" />
                    </a>
                  </div>

                  <div className="rounded-3xl border border-stone-100 bg-white p-6 shadow-sm">
                    <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-sky-100">
                      <Phone className="h-7 w-7 text-sky-600" />
                    </div>

                    <h3 className="text-xl font-bold text-stone-900 mb-2">
                      {t("safeExit.adoptionCardTitle")}
                    </h3>

                    <p className="text-stone-600 leading-relaxed mb-5">
                      {t("safeExit.adoptionCardDescription")}
                    </p>

                    <a
                      href="https://www.petfinder.my/listings.htm"
                      target="_blank"
                      rel="noreferrer"
                      className="inline-flex items-center font-bold text-sky-700 hover:text-sky-800"
                    >
                      {t("safeExit.visitPetFinder")}
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
                    {t("safeExit.startOver")}
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

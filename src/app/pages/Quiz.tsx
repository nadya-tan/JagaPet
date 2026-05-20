// ===================== React + Routing + State Imports =====================
// Import React state management hook
import { useState } from "react";
// Import navigation, linking, and routing utilities
import { useNavigate, Link, useLocation, Navigate } from "react-router";
// Import global user context (stores quiz answers and loading state)
import { useUser, LifestyleAnswers } from "../context/UserContext";
// Import UI icons used in buttons and hints
import { ArrowRight, ArrowLeft, HelpCircle } from "lucide-react";
// Import animation utilities for smooth transitions
import { motion, AnimatePresence } from "motion/react";
// Import custom hook for accessing current language (for i18n)
import { useLanguage } from "../context/LanguageContext";

// ===================== Quiz Configuration Data =====================
// Define all quiz questions, each with an id, title, and selectable options
type QuizQuestion = {
  id: keyof LifestyleAnswers;
  titleKey: string;
  options: {
    labelKey: string;
    value: string;
  }[];
};

const questions: QuizQuestion[] = [
  {
    id: "age",
    titleKey: "quiz.questions.age",
    options: [
      { labelKey: "profile.answers.age.under_18", value: "under_18" },
      { labelKey: "profile.answers.age.18_35", value: "18_35" },
      { labelKey: "profile.answers.age.36_55", value: "36_55" },
      { labelKey: "profile.answers.age.56_plus", value: "56_plus" },
    ],
  },
  {
    id: "time",
    titleKey: "quiz.questions.time",
    options: [
      { labelKey: "profile.answers.time.low", value: "low" },
      { labelKey: "profile.answers.time.medium", value: "medium" },
      { labelKey: "profile.answers.time.high", value: "high" },
    ],
  },
  {
    id: "budget",
    titleKey: "quiz.questions.budget",
    options: [
      { labelKey: "profile.answers.budget.low", value: "low" },
      { labelKey: "profile.answers.budget.medium", value: "medium" },
      { labelKey: "profile.answers.budget.high", value: "high" },
    ],
  },
  {
    id: "space",
    titleKey: "quiz.questions.space",
    options: [
      { labelKey: "quiz.options.space.small", value: "small" },
      { labelKey: "quiz.options.space.medium", value: "medium" },
      { labelKey: "quiz.options.space.large", value: "large" },
    ],
  },
  {
    id: "lifespan",
    titleKey: "quiz.questions.lifespan",
    options: [
      { labelKey: "profile.answers.lifespan.short", value: "short" },
      { labelKey: "profile.answers.lifespan.medium", value: "medium" },
      { labelKey: "quiz.options.lifespan.long", value: "long" },
    ],
  },
  {
    id: "experience",
    titleKey: "quiz.questions.experience",
    options: [
      { labelKey: "profile.answers.experience.beginner", value: "beginner" },
      {
        labelKey: "quiz.options.experience.intermediate",
        value: "intermediate",
      },
      { labelKey: "profile.answers.experience.advanced", value: "advanced" },
    ],
  },
];

// ===================== Route State Type Definition =====================
// Defines optional navigation state passed via React Router
type QuizLocationState = {
  retake?: boolean;
};

// ===================== Main Quiz Component =====================
export function Quiz() {
  // Access translation function for current language
  const { t } = useLanguage();
  // Navigation hook for redirecting between pages
  const navigate = useNavigate();
  // Access router location state (used for retake detection)
  const location = useLocation();
  // Access global user context (answers + loading + setter)
  const { setAnswers, answers, loading } = useUser();

  // Check whether user is retaking the quiz
  const isRetake = Boolean(
    (location.state as QuizLocationState | null)?.retake,
  );

  // Track current question index (step in quiz flow)
  const [currentStep, setCurrentStep] = useState(0);
  // Store user-selected answers locally before submission
  const [formData, setFormData] = useState<Partial<LifestyleAnswers>>({});

  // Calculate progress percentage for progress bar
  const progress = ((currentStep + 1) / questions.length) * 100;

  const currentQuestion = questions[currentStep];

  // ===================== Loading State Handling =====================
  // Show loading screen while user data is being fetched
  if (loading) {
    return (
      <div className="bg-stone-50 min-h-screen flex items-center justify-center text-stone-600">
        {t("quiz.loading")}
      </div>
    );
  }

  // ===================== Redirect If Already Completed =====================
  // If user already has answers and is not retaking, redirect to results page
  if (answers && !isRetake) {
    return <Navigate to="/quiz-results" replace />;
  }

  // ===================== Answer Selection Handler =====================
  // Store selected option for the current question
  const handleSelect = (value: string) => {
    setFormData((prev) => ({
      ...prev,
      [currentQuestion.id]: value,
    }));
  };

  // ===================== Next Step Handler =====================
  // Move to next question or submit quiz if at final step
  const handleNext = async () => {
    if (currentStep < questions.length - 1) {
      setCurrentStep((prev) => prev + 1);
    } else {
      // Submit final answers to global context
      await setAnswers(formData as LifestyleAnswers);
      // Redirect to results page
      navigate("/quiz-results", { replace: true });
    }
  };

  // ===================== Back Navigation Handler =====================
  // Move back one question if not at the beginning
  const handleBack = () => {
    if (currentStep > 0) setCurrentStep((prev) => prev - 1);
  };

  // ===================== Validation + Progress Calculation =====================
  // Check if current question has been answered
  const isCurrentAnswered = !!formData[currentQuestion.id];

  // ===================== UI Rendering =====================
  return (
    <div
      className="bg-stone-50 min-h-screen flex flex-col font-sans text-stone-900 relative"
      data-quiz-screen="true"
    >
      <div className="max-w-3xl w-full mx-auto px-4 py-8 md:py-16 flex-1 flex flex-col">
        {/* ===================== Header Section ===================== */}
        <div className="mb-12">
          <div className="flex justify-between items-end mb-4">
            <div>
              {/* Quiz Title */}
              <h1 className="text-3xl font-extrabold text-stone-900">
                {t("quiz.title")}
              </h1>
              {/* Subtitle description */}
              <p className="text-stone-600 mt-2 text-lg">
                {t("quiz.description")}
              </p>
            </div>

            {/* Step indicator exposed for the shared read-aloud control. */}
            <div
              className="text-emerald-600 font-bold text-lg"
              data-quiz-progress="true"
            >
              {currentStep + 1} / {questions.length}
            </div>
          </div>

          {/* Progress bar container */}
          <div className="w-full bg-stone-200 h-3 rounded-full overflow-hidden">
            <motion.div
              className="bg-emerald-500 h-full"
              initial={{ width: 0 }}
              animate={{ width: `${progress}%` }}
              transition={{ duration: 0.3 }}
            />
          </div>
        </div>

        {/* ===================== Question Section ===================== */}
        <div className="flex-1 flex flex-col justify-center">
          <AnimatePresence mode="wait">
            <motion.div
              key={currentStep}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.3 }}
              className="w-full max-w-2xl mx-auto"
            >
              {/* Current question title exposed for the shared read-aloud control. */}
              <h2
                className="text-3xl md:text-4xl font-bold mb-8 text-stone-900 leading-tight"
                data-quiz-question="true"
              >
                {t(currentQuestion.titleKey)}
              </h2>

              {/* Options list */}
              <div className="space-y-4">
                {currentQuestion.options.map((option) => {
                  // Check if option is currently selected
                  const isSelected =
                    formData[currentQuestion.id as keyof LifestyleAnswers] ===
                    option.value;

                  return (
                    <button
                      key={option.value}
                      onClick={() => handleSelect(option.value)}
                      aria-pressed={isSelected}
                      data-quiz-option="true"
                      data-selected={isSelected}
                      className={`w-full text-left p-6 rounded-2xl border-2 transition-all text-xl font-medium ${
                        isSelected
                          ? "border-emerald-500 bg-emerald-50 text-emerald-900 shadow-md"
                          : "border-stone-200 bg-white hover:border-emerald-300 hover:bg-stone-50 text-stone-700"
                      }`}
                    >
                      {t(option.labelKey)}
                    </button>
                  );
                })}
              </div>
            </motion.div>
          </AnimatePresence>
        </div>

        {/* ===================== Navigation Buttons ===================== */}
        <div className="mt-12 flex justify-between items-center pt-6 border-t border-stone-200">
          {/* Back button */}
          <button
            onClick={handleBack}
            disabled={currentStep === 0}
            className={`flex items-center gap-2 px-6 py-3 rounded-full font-bold transition-colors ${
              currentStep === 0
                ? "text-stone-300 cursor-not-allowed"
                : "text-stone-600 hover:bg-stone-200"
            }`}
          >
            <ArrowLeft className="w-5 h-5" /> {t("quiz.back")}
          </button>

          {/* Next / Submit button */}
          <button
            onClick={handleNext}
            disabled={!isCurrentAnswered}
            className={`flex items-center gap-2 px-8 py-4 rounded-full font-bold text-lg transition-all shadow-md ${
              isCurrentAnswered
                ? "bg-emerald-600 text-white hover:bg-emerald-700"
                : "bg-stone-200 text-stone-400 cursor-not-allowed"
            }`}
          >
            {currentStep === questions.length - 1
              ? t("quiz.seeResults")
              : t("quiz.continue")}{" "}
            <ArrowRight className="w-5 h-5" />
          </button>
        </div>

        {/* ===================== Help / Alternate Flow Link ===================== */}
        <div className="mt-8 text-center">
          <Link
            to="/identify"
            className="inline-flex items-center gap-2 text-stone-500 hover:text-emerald-600 font-medium transition-colors"
          >
            <HelpCircle className="w-5 h-5" />
            {t("quiz.identifyHelp")}
          </Link>
        </div>
      </div>
    </div>
  );
}

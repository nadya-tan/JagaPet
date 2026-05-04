import React from "react";
import { createBrowserRouter } from "react-router";
import { MainLayout } from "./layouts/MainLayout";
import { Home } from "./pages/Home";
import { SpeciesProfile } from "./pages/SpeciesProfile";
import { IdentifyPet } from "./pages/IdentifyPet";
import { Quiz } from "./pages/Quiz";
import { QuizResults } from "./pages/QuizResults";
import { SafeExit } from "./pages/SafeExit";
import { Compare } from "./pages/Compare";
import { SearchResults } from "./pages/SearchResults";
import { Auth } from "./pages/Auth";
import { Profile } from "./pages/Profile";
import { CareGuideDetail } from "./pages/CareGuideDetail";
import { HealthScreening } from "./pages/HealthScreening";

/**
 * Application router configuration
 *
 * This defines all frontend routes using React Router (data router API).
 * The routes are nested under MainLayout, which acts as the shared UI shell.
 */
export const router = createBrowserRouter([
  {
    path: "/",
    element: <MainLayout />,
    children: [
      // Home page (index route)
      { index: true, element: <Home /> },

      // Species detail page with dynamic ID parameter
      { path: "species/:id", element: <SpeciesProfile /> },

      // Pet identification tool page
      { path: "identify", element: <IdentifyPet /> },

      // Quiz flow page
      { path: "quiz", element: <Quiz /> },

      // Quiz results page
      { path: "quiz-results", element: <QuizResults /> },

      // Safe exit / emergency exit page
      { path: "safe-exit", element: <SafeExit /> },

      // Compare multiple items/species
      { path: "compare", element: <Compare /> },

      // Search results page
      { path: "search", element: <SearchResults /> },

      // Authentication (login/register)
      { path: "login", element: <Auth /> },

      // User profile page
      { path: "profile", element: <Profile /> },

      // Care guide detail page with dynamic ID
      { path: "/care-guide/:id", element: <CareGuideDetail /> },

      // Health screening tool page
      { path: "/health-screening", element: <HealthScreening /> },
    ],
  },
]);

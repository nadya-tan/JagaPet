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
import { ApiTestLab } from "./pages/ApiTestLab";
import { Auth } from "./pages/Auth";
import { Profile } from "./pages/Profile";
import { CareGuideDetail } from "./pages/CareGuideDetail";
import { HealthScreening } from "./pages/HealthScreening";

export const router = createBrowserRouter([
  {
    path: "/",
    element: <MainLayout />,
    children: [
      { index: true, element: <Home /> },
      { path: "species/:id", element: <SpeciesProfile /> },
      { path: "identify", element: <IdentifyPet /> },
      { path: "quiz", element: <Quiz /> },
      { path: "quiz-results", element: <QuizResults /> },
      { path: "safe-exit", element: <SafeExit /> },
      { path: "compare", element: <Compare /> },
      { path: "search", element: <SearchResults /> },
      { path: "api-test-lab", element: <ApiTestLab /> },
      { path: "login", element: <Auth /> },
      { path: "profile", element: <Profile /> },
      { path: "/care-guide/:id", element: <CareGuideDetail /> },
      { path: "/health-screening", element: <HealthScreening /> },
    ],
  },
]);

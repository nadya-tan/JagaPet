import React from "react";
import { RouterProvider } from "react-router";
import { router } from "./routes";
import { CompareProvider } from "./context/CompareContext";
import { UserProvider } from "./context/UserContext";
import { HealthScreeningProvider } from "./context/HealthScreeningContext";
import { LanguageProvider } from "./context/LanguageContext";

export default function App() {
  return (
    <LanguageProvider>
      <UserProvider>
        <CompareProvider>
          <HealthScreeningProvider>
            <RouterProvider router={router} />
          </HealthScreeningProvider>
        </CompareProvider>
      </UserProvider>
    </LanguageProvider>
  );
}

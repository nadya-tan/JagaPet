import React, { useState } from "react";
import { Navigate } from "react-router";
import { useUser } from "../context/UserContext";
import { useLanguage } from "../context/LanguageContext";

export function Auth() {
  // Language context for localization
  const { t } = useLanguage();

  // Get current user state and authentication functions from context
  const { user, login, register } = useUser();

  // State to control current form mode: login or register
  const [mode, setMode] = useState<"login" | "register">("login");

  // State to store username input value
  const [username, setUsername] = useState("");

  // State to store password input value
  const [password, setPassword] = useState("");

  // State to store error message during authentication process
  const [error, setError] = useState("");

  // If user already logged in, redirect to profile page
  if (user) return <Navigate to="/profile" replace />;

  // Handle form submission for login or registration
  const handleSubmit = async (e: React.FormEvent) => {
    // Prevent default browser form submission behavior
    e.preventDefault();

    // Clear previous error message
    setError("");

    try {
      // If mode is login, call login function
      if (mode === "login") {
        await login(username, password);
      } else {
        // Otherwise call register function
        await register(username, password);
      }
    } catch (err: any) {
      // Display error message if authentication fails
      setError(err.message || t("auth.errors.generic"));
    }
  };

  const isLoginMode = mode === "login";

  return (
    <div className="max-w-md mx-auto px-6 py-10">
      {/* Page title changes based on current mode */}
      <h1 className="text-3xl font-bold mb-2">
        {isLoginMode ? t("auth.loginTitle") : t("auth.registerTitle")}
      </h1>

      {/* Short description text */}
      <p className="text-stone-600 mb-6">{t("auth.description")}</p>

      {/* Authentication form */}
      <form
        onSubmit={handleSubmit}
        className="space-y-4 bg-white border border-stone-200 rounded-2xl p-6"
      >
        {/* Username input field */}
        <div>
          <label className="block mb-1 font-medium" htmlFor="username">
            {t("auth.username")}
          </label>
          <input
            id="username"
            className="w-full rounded-xl border border-stone-300 px-4 py-3"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            placeholder={t("auth.usernamePlaceholder")}
          />
        </div>

        {/* Password input field */}
        <div>
          <label className="block mb-1 font-medium" htmlFor="password">
            {t("auth.password")}
          </label>
          <input
            id="password"
            type="password"
            className="w-full rounded-xl border border-stone-300 px-4 py-3"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder={t("auth.passwordPlaceholder")}
          />
        </div>

        {/* Show error message only if error exists */}
        {error ? <p className="text-red-600 text-sm">{error}</p> : null}

        {/* Submit button for login/register */}
        <button className="w-full rounded-xl bg-emerald-600 text-white px-4 py-3">
          {isLoginMode ? t("auth.loginButton") : t("auth.registerButton")}
        </button>

        {/* Button to switch between login and register mode */}
        <button
          type="button"
          className="w-full text-stone-600"
          onClick={() => setMode(isLoginMode ? "register" : "login")}
        >
          {isLoginMode ? t("auth.switchToRegister") : t("auth.switchToLogin")}
        </button>
      </form>
    </div>
  );
}

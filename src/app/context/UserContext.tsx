import React, {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
  ReactNode,
} from "react";

/**
 * User lifestyle quiz answers structure
 */
export interface LifestyleAnswers {
  age?: string;
  time: "low" | "medium" | "high";
  budget: "low" | "medium" | "high";
  space: "small" | "medium" | "large";
  lifespan?: string;
  experience: "beginner" | "intermediate" | "advanced";
}

/**
 * Authenticated user information
 */
interface AuthUser {
  userId: string;
  username: string;
}

/**
 * Species dropdown option format
 */
export interface SpeciesOption {
  petId: string;
  name: string;
  scientificName: string | null;
  imageUrl: string | null;
}

/**
 * User-owned pet entity
 */
export interface UserPet {
  petListId: string;
  petId: string;
  nickname: string;
  age: number | null;
  addedDate: string | null;
  speciesName: string;
  scientificName: string | null;
  imageUrl: string | null;
}

/**
 * Scheduled care task for a pet
 */
export interface CareTask {
  id: string;
  petListId: string;
  type: string;
  done: boolean;
  count: number;
  interval: number;
  intervalUnit: "day" | "week" | "month" | "year";
  lastCompleted?: string | null;
}

/**
 * Full user context state and actions
 */
interface UserContextType {
  user: AuthUser | null;
  answers: LifestyleAnswers | null;
  loading: boolean;

  setAnswers: (answers: LifestyleAnswers) => Promise<void>;
  clearAnswers: () => void;

  register: (username: string, password: string) => Promise<void>;
  login: (username: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  refreshUser: () => Promise<void>;

  speciesOptions: SpeciesOption[];
  userPets: UserPet[];
  careTasks: CareTask[];

  petsLoading: boolean;
  petError: string;

  loadPetData: () => Promise<void>;
  addUserPet: (
    petId: string,
    nickname: string,
    age: number | null,
  ) => Promise<void>;
  removeUserPet: (petListId: string) => Promise<void>;
  completeCareTask: (taskId: string) => Promise<void>;
  clearPetError: () => void;
}

/**
 * Default context values (used before provider initialization)
 */
const UserContext = createContext<UserContextType>({
  user: null,
  answers: null,
  loading: true,
  setAnswers: async () => {},
  clearAnswers: () => {},
  register: async () => {},
  login: async () => {},
  logout: async () => {},
  refreshUser: async () => {},
  speciesOptions: [],
  userPets: [],
  careTasks: [],
  petsLoading: false,
  petError: "",
  loadPetData: async () => {},
  addUserPet: async () => {},
  removeUserPet: async () => {},
  completeCareTask: async () => {},
  clearPetError: () => {},
});

/**
 * Hook to access user context
 */
export const useUser = () => useContext(UserContext);

/**
 * Safely parse JSON response from API
 *
 * Ensures backend always returns valid JSON or throws descriptive error
 */
async function parseJsonResponse(res: Response) {
  const text = await res.text();

  try {
    return JSON.parse(text);
  } catch {
    throw new Error(
      `Expected JSON response but received: ${text || "[empty response]"}`,
    );
  }
}

/**
 * Generic fetch wrapper with JSON parsing + error handling
 */
async function fetchJson<T>(url: string, options?: RequestInit): Promise<T> {
  const res = await fetch(url, {
    credentials: "include",
    ...options,
  });

  const data = await parseJsonResponse(res);

  if (!res.ok) {
    throw new Error(data.error || "Request failed");
  }

  return data as T;
}

/**
 * User context provider component
 *
 * Responsibilities:
 * - Authentication state management
 * - Quiz/lifestyle answers persistence
 * - Pet management system (CRUD)
 * - Care task tracking system
 */
export const UserProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [answers, setAnswersState] = useState<LifestyleAnswers | null>(null);

  const [speciesOptions, setSpeciesOptions] = useState<SpeciesOption[]>([]);
  const [userPets, setUserPets] = useState<UserPet[]>([]);
  const [careTasks, setCareTasks] = useState<CareTask[]>([]);

  const [petsLoading, setPetsLoading] = useState(false);
  const [petError, setPetError] = useState("");
  const [petsLoaded, setPetsLoaded] = useState(false);

  const [loading, setLoading] = useState(true);

  /**
   * Fetch current authenticated user session
   */
  const refreshUser = async () => {
    setLoading(true);

    try {
      const res = await fetch("/api/auth?action=me", {
        credentials: "include",
      });

      const data = await parseJsonResponse(res);

      if (!res.ok) {
        throw new Error(data.error || "Failed to load user session.");
      }

      if (data.user) {
        setUser({
          userId: data.user.userId,
          username: data.user.username,
        });
        setAnswersState(data.user.answers ?? null);
      } else {
        setUser(null);

        const local = localStorage.getItem("guest_quiz_answers");
        setAnswersState(local ? JSON.parse(local) : null);
      }
    } finally {
      setLoading(false);
    }
  };

  /**
   * Load user session on first render
   */
  useEffect(() => {
    refreshUser();
  }, []);

  /**
   * Update lifestyle answers (user or guest)
   */
  const setAnswers = async (newAnswers: LifestyleAnswers) => {
    setAnswersState(newAnswers);

    if (user) {
      const res = await fetch("/api/profile", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ answers: newAnswers }),
      });

      const data = await parseJsonResponse(res);

      if (!res.ok) {
        throw new Error(data.error || "Failed to save quiz answers.");
      }
    } else {
      localStorage.setItem("guest_quiz_answers", JSON.stringify(newAnswers));
    }
  };

  /**
   * Clear quiz answers (logout/reset state)
   */
  const clearAnswers = () => {
    setAnswersState(null);
    localStorage.removeItem("guest_quiz_answers");
  };

  /**
   * Reset all pet-related state
   */
  const resetPetData = () => {
    setSpeciesOptions([]);
    setUserPets([]);
    setCareTasks([]);
    setPetError("");
    setPetsLoaded(false);
  };

  /**
   * Load species + user pet data from backend
   */
  const loadPetData = async () => {
    if (!user) return;
    if (petsLoaded) return;

    try {
      setPetsLoading(true);
      setPetError("");

      const [species, petData] = await Promise.all([
        fetchJson<SpeciesOption[]>("/api/species"),
        fetchJson<{ pets: UserPet[]; tasks: CareTask[] }>("/api/user-pets"),
      ]);

      setSpeciesOptions(species);
      setUserPets(petData.pets);
      setCareTasks(petData.tasks);
      setPetsLoaded(true);
    } catch (error) {
      console.error(error);
      setPetError("Could not load your pet data.");
    } finally {
      setPetsLoading(false);
    }
  };

  /**
   * Add a new pet to user profile
   */
  const addUserPet = async (
    petId: string,
    nickname: string,
    age: number | null,
  ) => {
    const data = await fetchJson<{ pets: UserPet[]; tasks: CareTask[] }>(
      "/api/user-pets",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          petId,
          nickname,
          age,
        }),
      },
    );

    setUserPets(data.pets);
    setCareTasks(data.tasks);
    setPetsLoaded(true);
  };

  /**
   * Remove a pet from user profile
   */
  const removeUserPet = async (petListId: string) => {
    await fetchJson<{ ok: boolean }>(
      `/api/user-pets?petListId=${encodeURIComponent(petListId)}`,
      {
        method: "DELETE",
      },
    );

    setUserPets((pets) => pets.filter((pet) => pet.petListId !== petListId));
    setCareTasks((tasks) =>
      tasks.filter((task) => task.petListId !== petListId),
    );
  };

  /**
   * Mark care task as completed
   */
  const completeCareTask = async (taskId: string) => {
    const updatedTask = await fetchJson<CareTask>("/api/user-pet-tasks", {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ taskId }),
    });

    setCareTasks((tasks) =>
      tasks.map((task) => (task.id === taskId ? updatedTask : task)),
    );
  };

  /**
   * Clear pet error message
   */
  const clearPetError = () => {
    setPetError("");
  };

  /**
   * User registration
   */
  const register = async (username: string, password: string) => {
    const res = await fetch("/api/auth?action=register", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify({ username, password }),
    });

    const data = await parseJsonResponse(res);

    if (!res.ok) {
      throw new Error(data.error || "Registration failed");
    }

    setUser(data.user);

    if (answers) {
      const profileRes = await fetch("/api/profile", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ answers }),
      });

      const profileData = await parseJsonResponse(profileRes);

      if (!profileRes.ok) {
        throw new Error(
          profileData.error ||
            "Profile was created, but saving quiz answers failed.",
        );
      }

      localStorage.removeItem("guest_quiz_answers");
      setAnswersState(answers);
    }
  };

  /**
   * User login
   */
  const login = async (username: string, password: string) => {
    const res = await fetch("/api/auth?action=login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify({ username, password }),
    });

    const data = await parseJsonResponse(res);

    if (!res.ok) {
      throw new Error(data.error || "Login failed");
    }

    setUser(data.user);

    if (answers) {
      const profileRes = await fetch("/api/profile", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ answers }),
      });

      const profileData = await parseJsonResponse(profileRes);

      if (!profileRes.ok) {
        throw new Error(
          profileData.error || "Logged in, but saving quiz answers failed.",
        );
      }

      localStorage.removeItem("guest_quiz_answers");
      setAnswersState(answers);
    } else {
      await refreshUser();
    }
  };

  /**
   * User logout
   */
  const logout = async () => {
    const res = await fetch("/api/auth?action=logout", {
      method: "POST",
      credentials: "include",
    });

    const data = await parseJsonResponse(res);

    if (!res.ok) {
      throw new Error(data.error || "Logout failed");
    }

    setUser(null);
    resetPetData();

    const local = localStorage.getItem("guest_quiz_answers");
    setAnswersState(local ? JSON.parse(local) : null);
  };

  /**
   * Memoized context value to prevent unnecessary rerenders
   */
  const value = useMemo(
    () => ({
      user,
      answers,
      loading,
      setAnswers,
      clearAnswers,
      register,
      login,
      logout,
      refreshUser,
      speciesOptions,
      userPets,
      careTasks,
      petsLoading,
      petError,
      loadPetData,
      addUserPet,
      removeUserPet,
      completeCareTask,
      clearPetError,
    }),
    [
      user,
      answers,
      loading,
      speciesOptions,
      userPets,
      careTasks,
      petsLoading,
      petError,
    ],
  );

  return <UserContext.Provider value={value}>{children}</UserContext.Provider>;
};
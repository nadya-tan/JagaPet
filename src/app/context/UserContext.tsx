import React, {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
  ReactNode,
} from "react";

export interface LifestyleAnswers {
  age?: string;
  time: "low" | "medium" | "high";
  budget: "low" | "medium" | "high";
  space: "small" | "medium" | "large";
  lifespan?: string;
  experience: "beginner" | "intermediate" | "advanced";
}

interface AuthUser {
  userId: string;
  username: string;
}

export interface SpeciesOption {
  petId: string;
  name: string;
  scientificName: string | null;
  imageUrl: string | null;
}

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

export const useUser = () => useContext(UserContext);

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

  useEffect(() => {
    refreshUser();
  }, []);

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

  const clearAnswers = () => {
    setAnswersState(null);
    localStorage.removeItem("guest_quiz_answers");
  };

  const resetPetData = () => {
    setSpeciesOptions([]);
    setUserPets([]);
    setCareTasks([]);
    setPetError("");
    setPetsLoaded(false);
  };

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

  const clearPetError = () => {
    setPetError("");
  };

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

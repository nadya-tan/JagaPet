import React, { useEffect, useMemo, useState } from "react";
import { Navigate, Link } from "react-router";
import {
  User,
  PlusCircle,
  CheckCircle2,
  Clock,
  Droplets,
  Utensils,
  Thermometer,
  Trash2,
} from "lucide-react";
import { useUser } from "../context/UserContext";

const answerLabels: Record<string, Record<string, string>> = {
  age: {
    under_18: "Under 18",
    "18_35": "18 - 35",
    "36_55": "36 - 55",
    "56_plus": "56+",
  },
  time: {
    low: "A few minutes (Low)",
    medium: "A few hours (Medium)",
    high: "Daily dedication (High)",
  },
  budget: {
    low: "Under RM 100 (Low)",
    medium: "RM 100 - RM 500 (Medium)",
    high: "RM 500+ (High)",
  },
  space: {
    small: "Small table / Desktop",
    medium: "Dedicated corner / Stand",
    large: "Large room / Outdoor pond",
  },
  lifespan: {
    short: "1 - 5 years",
    medium: "5 - 15 years",
    long: "15+ years",
  },
  experience: {
    beginner: "First-time owner (Beginner)",
    intermediate: "Intermediate",
    advanced: "Experienced hobbyist (Advanced)",
  },
};

interface SpeciesOption {
  petId: string;
  name: string;
  scientificName: string | null;
  imageUrl: string | null;
}

interface UserPet {
  petListId: string;
  petId: string;
  nickname: string;
  age: number | null;
  addedDate: string | null;
  speciesName: string;
  scientificName: string | null;
  imageUrl: string | null;
}

interface CareTask {
  id: string;
  petListId: string;
  type: string;
  done: boolean;
  count: number;
  interval: number;
  intervalUnit: "day" | "week" | "month" | "year";
  lastCompleted?: string | null;
}

const TASK_ICONS: Record<string, React.ReactNode> = {
  "water-change": <Droplets className="w-5 h-5" />,
  feeding: <Utensils className="w-5 h-5" />,
  "filter-clean": <CheckCircle2 className="w-5 h-5" />,
  "health-check": <User className="w-5 h-5" />,
  "temperature-check": <Thermometer className="w-5 h-5" />,
};

const TASK_NAMES: Record<string, string> = {
  "water-change": "25% Water Change",
  feeding: "Feeding",
  "filter-clean": "Clean Filter",
  "health-check": "Health Check",
  "temperature-check": "Temperature Check",
};

function formatFrequency(task: CareTask) {
  const unit = task.intervalUnit;
  const pluralUnit = task.interval === 1 ? unit : `${unit}s`;

  if (task.count === 1 && task.interval === 1 && unit === "day") {
    return "daily";
  }

  if (task.count === 1 && task.interval === 1 && unit === "week") {
    return "weekly";
  }

  if (task.count === 1 && task.interval === 1 && unit === "month") {
    return "monthly";
  }

  if (task.count === 1 && task.interval === 1 && unit === "year") {
    return "yearly";
  }

  if (task.count > 1 && task.interval === 1) {
    return `${task.count} times per ${unit}`;
  }

  if (task.count > 1) {
    return `${task.count} times every ${task.interval} ${pluralUnit}`;
  }

  return `every ${task.interval} ${pluralUnit}`;
}

export function Profile() {
  const {
    user,
    answers,
    logout,
    loading,
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
  } = useUser();

  const [activeTab, setActiveTab] = useState<"profile" | "pets">("profile");

  const [formError, setFormError] = useState("");

  const [showAddPet, setShowAddPet] = useState(false);
  const [selectedSpeciesId, setSelectedSpeciesId] = useState("");
  const [petNickname, setPetNickname] = useState("");
  const [petAge, setPetAge] = useState("");
  const [savingPet, setSavingPet] = useState(false);

  useEffect(() => {
    if (!user || loading) return;

    loadPetData();
  }, [user, loading]);

  const tasksByPetListId = useMemo(() => {
    return careTasks.reduce<Record<string, CareTask[]>>((groups, task) => {
      if (!groups[task.petListId]) {
        groups[task.petListId] = [];
      }

      groups[task.petListId].push(task);
      return groups;
    }, {});
  }, [careTasks]);

  if (loading) return <div className="p-8">Loading...</div>;
  if (!user) return <Navigate to="/login" replace />;

  const rows = [
    ["Age group", answers?.age, "age"],
    ["Free time", answers?.time, "time"],
    ["Budget", answers?.budget, "budget"],
    ["Habitat space", answers?.space, "space"],
    ["Lifespan", answers?.lifespan, "lifespan"],
    ["Experience", answers?.experience, "experience"],
  ];

  const handleAddPet = async () => {
    if (!selectedSpeciesId || !petNickname.trim()) return;

    try {
      setSavingPet(true);
      setFormError("");
      clearPetError();

      await addUserPet(
        selectedSpeciesId,
        petNickname.trim(),
        petAge.trim() ? Number(petAge) : null,
      );

      setSelectedSpeciesId("");
      setPetNickname("");
      setPetAge("");
      setShowAddPet(false);
    } catch (error) {
      console.error(error);
      setFormError(
        error instanceof Error ? error.message : "Could not add pet.",
      );
    } finally {
      setSavingPet(false);
    }
  };

  const handleRemovePet = async (petListId: string) => {
    try {
      setFormError("");
      clearPetError();

      await removeUserPet(petListId);
    } catch (error) {
      console.error(error);
      setFormError(
        error instanceof Error ? error.message : "Could not remove pet.",
      );
    }
  };

  const handleCompleteTask = async (taskId: string) => {
    try {
      setFormError("");
      clearPetError();

      await completeCareTask(taskId);
    } catch (error) {
      console.error(error);
      setFormError(
        error instanceof Error ? error.message : "Could not update task.",
      );
    }
  };

  const calculateDaysSince = (dateString?: string | null) => {
    if (!dateString) return null;

    const dateValue = new Date(dateString).getTime();

    if (Number.isNaN(dateValue)) return null;

    return Math.floor((Date.now() - dateValue) / (1000 * 60 * 60 * 24));
  };

  const isCompletedToday = (dateString?: string | null) => {
    if (!dateString) return false;

    const completedDate = new Date(dateString);
    const today = new Date();

    return (
      completedDate.getFullYear() === today.getFullYear() &&
      completedDate.getMonth() === today.getMonth() &&
      completedDate.getDate() === today.getDate()
    );
  };

  return (
    <div className="max-w-6xl mx-auto px-6 py-10">
      <h1 className="text-3xl font-bold mb-2">My Profile</h1>
      <p className="text-stone-600 mb-8">Signed in as @{user.username}</p>

      <div className="flex gap-2 mb-6 rounded-2xl bg-stone-100 p-1">
        <button
          onClick={() => setActiveTab("profile")}
          className={`flex-1 rounded-xl px-4 py-2 font-semibold ${
            activeTab === "profile"
              ? "bg-white shadow-sm text-emerald-700"
              : "text-stone-600"
          }`}
        >
          Quiz Profile
        </button>

        <button
          onClick={() => setActiveTab("pets")}
          className={`flex-1 rounded-xl px-4 py-2 font-semibold ${
            activeTab === "pets"
              ? "bg-white shadow-sm text-emerald-700"
              : "text-stone-600"
          }`}
        >
          My Pets
        </button>
      </div>

      {(formError || petError) && (
        <div className="mb-6 rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-rose-700">
          {formError || petError}
        </div>
      )}
      {activeTab === "profile" && (
        <div className="bg-white rounded-2xl border border-stone-200 p-6 shadow-sm">
          <h2 className="text-xl font-semibold mb-4">
            Saved compatibility quiz answers
          </h2>

          {!answers ? (
            <div>
              <p className="text-stone-600 mb-4">
                You have not saved any quiz answers yet.
              </p>
              <Link
                to="/quiz"
                className="inline-flex rounded-xl px-4 py-2 bg-emerald-600 text-white"
              >
                Take quiz
              </Link>
            </div>
          ) : (
            <div className="space-y-3">
              {rows.map(([label, value, key]) => (
                <div
                  key={String(key)}
                  className="flex justify-between gap-4 border-b border-stone-100 pb-3"
                >
                  <span className="font-medium text-stone-700">{label}</span>
                  <span className="text-stone-600 text-right">
                    {value
                      ? (answerLabels[String(key)]?.[String(value)] ??
                        String(value))
                      : "Not answered"}
                  </span>
                </div>
              ))}

              <div className="pt-4 flex gap-3">
                <Link
                  to="/quiz"
                  className="rounded-xl px-4 py-2 bg-emerald-600 text-white"
                >
                  Retake quiz
                </Link>
                <button
                  onClick={logout}
                  className="rounded-xl px-4 py-2 border border-stone-300 text-stone-700"
                >
                  Log out
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      {activeTab === "pets" && (
        <div className="bg-white rounded-3xl shadow-sm p-8 border border-stone-200">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-stone-900 flex items-center gap-2">
              <User className="w-6 h-6 text-emerald-600" />
              My Pets
            </h2>

            <button
              onClick={() => setShowAddPet(!showAddPet)}
              className="flex items-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white px-5 py-3 rounded-xl font-bold transition-all shadow-md"
            >
              <PlusCircle className="w-5 h-5" />
              Add Pet
            </button>
          </div>

          {showAddPet && (
            <div className="bg-emerald-50 p-6 rounded-2xl mb-6 border border-emerald-200">
              <h3 className="font-bold text-emerald-900 mb-4">Add a New Pet</h3>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-bold text-stone-700 mb-2">
                    Species
                  </label>
                  <select
                    value={selectedSpeciesId}
                    onChange={(e) => setSelectedSpeciesId(e.target.value)}
                    className="w-full px-4 py-3 rounded-xl border-2 border-stone-200 focus:border-emerald-500 outline-none bg-white"
                  >
                    <option value="">Select a species...</option>
                    {speciesOptions.map((species) => (
                      <option key={species.petId} value={species.petId}>
                        {species.name}
                        {species.scientificName
                          ? ` (${species.scientificName})`
                          : ""}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-bold text-stone-700 mb-2">
                    Nickname
                  </label>
                  <input
                    type="text"
                    value={petNickname}
                    onChange={(e) => setPetNickname(e.target.value)}
                    placeholder="e.g., Bubbles, Goldie, Pleccy"
                    className="w-full px-4 py-3 rounded-xl border-2 border-stone-200 focus:border-emerald-500 outline-none bg-white"
                  />
                </div>

                <div>
                  <label className="block text-sm font-bold text-stone-700 mb-2">
                    Age in years, optional
                  </label>
                  <input
                    type="number"
                    min="0"
                    step="0.1"
                    value={petAge}
                    onChange={(e) => setPetAge(e.target.value)}
                    placeholder="e.g., 1.5"
                    className="w-full px-4 py-3 rounded-xl border-2 border-stone-200 focus:border-emerald-500 outline-none bg-white"
                  />
                </div>

                <div className="flex gap-3">
                  <button
                    onClick={handleAddPet}
                    disabled={
                      savingPet || !selectedSpeciesId || !petNickname.trim()
                    }
                    className="flex-1 bg-emerald-600 hover:bg-emerald-700 disabled:bg-stone-300 text-white px-6 py-3 rounded-xl font-bold transition-all shadow-md"
                  >
                    {savingPet ? "Adding..." : "Add Pet"}
                  </button>

                  <button
                    onClick={() => setShowAddPet(false)}
                    className="px-6 py-3 rounded-xl font-bold border-2 border-stone-300 hover:bg-stone-100 transition-all"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            </div>
          )}

          {petsLoading ? (
            <div className="text-center py-12 bg-stone-50 rounded-2xl border border-stone-200">
              <p className="text-stone-600">Loading your pets...</p>
            </div>
          ) : userPets.length === 0 ? (
            <div className="text-center py-12 bg-stone-50 rounded-2xl border border-stone-200">
              <p className="text-stone-600 mb-4">
                You have not added any pets yet.
              </p>
              <button
                onClick={() => setShowAddPet(true)}
                className="inline-flex items-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white px-6 py-3 rounded-xl font-bold transition-all shadow-md"
              >
                <PlusCircle className="w-5 h-5" />
                Add your first pet
              </button>
            </div>
          ) : (
            <div className="space-y-6">
              {userPets.map((pet) => {
                const petTasks = tasksByPetListId[pet.petListId] || [];

                return (
                  <div
                    key={pet.petListId}
                    className="bg-stone-50 rounded-2xl p-6 border border-stone-200"
                  >
                    <div className="flex items-start justify-between mb-6">
                      <div className="flex gap-4 items-center">
                        <img
                          src={
                            pet.imageUrl
                              ? `/pet_image/${pet.imageUrl}`
                              : "/pet_image/pet_placeholder.png"
                          }
                          alt={pet.speciesName}
                          className="w-24 h-24 rounded-xl object-fit shadow-md"
                        />

                        <div>
                          <h3 className="text-2xl font-bold text-stone-900">
                            {pet.nickname}
                          </h3>
                          <p className="text-stone-600">{pet.speciesName}</p>
                          {pet.scientificName && (
                            <p className="text-sm italic text-stone-500">
                              {pet.scientificName}
                            </p>
                          )}
                          {pet.age !== null && (
                            <p className="text-sm text-stone-500 mt-1">
                              Age: {pet.age} years
                            </p>
                          )}
                          {pet.addedDate && (
                            <p className="text-sm text-stone-500 mt-1">
                              Added{" "}
                              {new Date(pet.addedDate).toLocaleDateString(
                                "en-GB",
                              )}
                            </p>
                          )}
                        </div>
                      </div>

                      <button
                        onClick={() => handleRemovePet(pet.petListId)}
                        className="text-rose-600 hover:bg-rose-100 p-2 rounded-lg transition-all"
                      >
                        <Trash2 className="w-5 h-5" />
                      </button>
                    </div>

                    <div className="mt-6">
                      <h4 className="font-bold text-stone-800 mb-4 flex items-center gap-2 text-lg">
                        <Clock className="w-5 h-5 text-emerald-600" />
                        Care Schedule
                      </h4>

                      {petTasks.length === 0 ? (
                        <div className="bg-white border border-stone-200 rounded-2xl p-5 text-stone-600">
                          No care tasks were generated for this pet yet.
                        </div>
                      ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          {petTasks.map((task) => {
                            const daysSince = calculateDaysSince(
                              task.lastCompleted,
                            );
                            const completedToday = isCompletedToday(
                              task.lastCompleted,
                            );

                            return (
                              <div
                                key={task.id}
                                className={`p-5 rounded-2xl border-2 ${
                                  task.lastCompleted
                                    ? "bg-white border-emerald-200"
                                    : "bg-amber-50 border-amber-300"
                                }`}
                              >
                                <div className="flex items-start justify-between mb-3">
                                  <div className="flex items-center gap-2">
                                    <span
                                      className={
                                        task.lastCompleted
                                          ? "text-emerald-600"
                                          : "text-amber-600"
                                      }
                                    >
                                      {TASK_ICONS[task.type] || (
                                        <CheckCircle2 className="w-5 h-5" />
                                      )}
                                    </span>

                                    <div>
                                      <h5 className="font-bold text-stone-900">
                                        {TASK_NAMES[task.type] || task.type}
                                      </h5>
                                      <p className="text-sm text-stone-600">
                                        {formatFrequency(task)}
                                      </p>
                                    </div>
                                  </div>
                                </div>

                                {task.lastCompleted ? (
                                  <p className="text-sm text-emerald-700 font-semibold mb-3">
                                    {completedToday
                                      ? "Completed today"
                                      : `Last done: ${
                                          daysSince === null
                                            ? "Recently"
                                            : `${daysSince} days ago`
                                        }`}
                                  </p>
                                ) : (
                                  <p className="text-sm text-amber-700 font-semibold mb-3">
                                    Not completed yet
                                  </p>
                                )}

                                <button
                                  onClick={() => handleCompleteTask(task.id)}
                                  disabled={completedToday}
                                  className={`w-full py-3 rounded-xl font-bold transition-all ${
                                    completedToday
                                      ? "bg-stone-300 text-stone-600 cursor-not-allowed"
                                      : "bg-emerald-600 hover:bg-emerald-700 text-white"
                                  }`}
                                >
                                  {completedToday
                                    ? "Done for Today"
                                    : "Mark as Done Today"}
                                </button>
                              </div>
                            );
                          })}
                        </div>
                      )}
                    </div>

                    <div className="grid grid-cols-1 mt-6">
                      <Link
                        to={`/care-guide/${pet.petId}`}
                        className="bg-white rounded-2xl border border-stone-200 p-4 text-center font-bold text-emerald-700 hover:bg-emerald-50 transition-all"
                      >
                        Full Guide
                      </Link>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

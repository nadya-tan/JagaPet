import React from "react";
import { Link } from "react-router";
import {
  Scale,
  Trash2,
  ArrowRight,
  Thermometer,
  ShieldAlert,
  Skull,
  Ban,
  Wallet,
  Ruler,
  Clock,
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { useCompare } from "../context/CompareContext";
import {
  displayText,
  getPetCommonNames,
  normalizeDangerBadge,
  getSpeciesCareBadgeClasses,
  getSpeciesDangerBadgeClasses,
} from "../utils/petDisplay";

export function Compare() {
  const { comparePets, removeCompare, clearCompare } = useCompare();

  if (comparePets.length === 0) {
    return (
      <div className="flex min-h-[70vh] flex-col items-center justify-center bg-stone-50 p-8 text-center text-stone-800">
        <div className="mb-6 rounded-full bg-stone-200 p-6">
          <Scale className="h-16 w-16 text-stone-400" />
        </div>

        <h2 className="mb-4 text-3xl font-bold text-stone-900">
          You haven&apos;t added any pets yet
        </h2>

        <p className="mb-8 max-w-md text-lg text-stone-600">
          Add pets to your compare list to view their care level, biodiversity
          risk, danger level, and setup requirements side-by-side.
        </p>

        <Link
          to="/"
          className="inline-flex items-center gap-2 rounded-full bg-emerald-600 px-8 py-4 font-bold text-white shadow-lg transition hover:bg-emerald-700"
        >
          Browse Species <ArrowRight className="h-5 w-5" />
        </Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-stone-50 px-4 py-16 font-sans text-stone-900 md:px-8">
      <div className="mx-auto max-w-7xl space-y-10">
        <div className="flex flex-col justify-between gap-6 md:flex-row md:items-end">
          <div>
            <h1 className="mb-4 flex items-center gap-4 text-4xl font-extrabold text-stone-900 md:text-5xl">
              <Scale className="h-10 w-10 text-emerald-600" />
              Compare Pets
            </h1>

            <p className="max-w-2xl text-xl text-stone-600">
              Compare real pet data side-by-side before making a decision.
            </p>
          </div>

          <button
            onClick={clearCompare}
            className="flex items-center gap-2 px-4 py-2 font-semibold text-stone-500 transition-colors hover:text-rose-600"
          >
            <Trash2 className="h-4 w-4" />
            Clear List
          </button>
        </div>

        <div className="overflow-x-auto pb-8">
          <div className="flex min-w-max gap-6">
            <AnimatePresence>
              {comparePets.map((pet) => {
                const { primaryCommonName } = getPetCommonNames(pet);
                const dangerLevel = normalizeDangerBadge(pet.pet_danger);
                const imageSrc = pet.pet_image_ref
                  ? `/pet_image/${pet.pet_image_ref}`
                  : "/pet_image/pet_placeholder.png";

                return (
                  <motion.div
                    key={pet.pet_id}
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.9 }}
                    className="relative flex w-[340px] shrink-0 flex-col overflow-hidden rounded-3xl border-2 border-stone-100 bg-white shadow-xl"
                  >
                    <button
                      onClick={() => removeCompare(pet.pet_id)}
                      className="absolute right-4 top-4 z-20 rounded-full bg-stone-900/50 p-2 text-white backdrop-blur-md transition-colors hover:bg-rose-500"
                      aria-label="Remove from compare"
                    >
                      <Trash2 className="h-5 w-5" />
                    </button>

                    <div className="relative h-48">
                      <img
                        src={imageSrc}
                        alt={primaryCommonName}
                        className="h-full w-full object-fit"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-stone-900/80 to-transparent" />

                      <div className="absolute bottom-4 left-4 right-4">
                        <h3 className="text-2xl font-bold leading-tight text-white drop-shadow-md">
                          {primaryCommonName}
                        </h3>
                        <p className="mt-1 text-sm italic text-stone-200">
                          {displayText(pet.pet_scientific_name)}
                        </p>
                      </div>
                    </div>

                    <div className="flex flex-1 flex-col space-y-6 p-6">
                      <div className="flex flex-wrap gap-2">
                        <span
                          className={getSpeciesCareBadgeClasses(
                            pet.pet_care_level || "Unknown",
                          )}
                        >
                          <Thermometer className="h-4 w-4" />
                          {pet.pet_care_level || "Unknown"} Care
                        </span>

                        <span
                          className={getSpeciesDangerBadgeClasses(
                            pet.pet_invasive_risk || "Unknown",
                          )}
                        >
                          <ShieldAlert className="h-4 w-4" />
                          {pet.pet_invasive_risk || "Unknown"} Risk
                        </span>

                        <span
                          className={getSpeciesDangerBadgeClasses(
                            dangerLevel || "Unknown",
                          )}
                        >
                          <Skull className="h-4 w-4" />
                          {dangerLevel || "Unknown"} Danger
                        </span>

                        {pet.pet_banned && (
                          <span className="inline-flex items-center gap-1 rounded-full bg-red-100 px-3 py-1 text-xs font-semibold text-red-700">
                            <Ban className="h-4 w-4" />
                            Banned
                          </span>
                        )}
                      </div>

                      <div className="grid gap-3 border-b border-stone-100 pb-6">
                        <div className="flex items-center justify-between">
                          <span className="flex items-center gap-2 text-sm font-bold uppercase text-stone-500">
                            <Ruler className="h-4 w-4" />
                            Max Length
                          </span>
                          <span className="font-bold text-stone-900">
                            {pet.pet_max_length != null
                              ? `${pet.pet_max_length} cm`
                              : "Unknown"}
                          </span>
                        </div>

                        <div className="flex items-center justify-between">
                          <span className="flex items-center gap-2 text-sm font-bold uppercase text-stone-500">
                            <Clock className="h-4 w-4" />
                            Longevity
                          </span>
                          <span className="font-bold text-stone-900">
                            {pet.pet_longevity != null
                              ? `${pet.pet_longevity} years`
                              : "Unknown"}
                          </span>
                        </div>

                        <div className="flex items-center justify-between">
                          <span className="flex items-center gap-2 text-sm font-bold uppercase text-stone-500">
                            <Wallet className="h-4 w-4" />
                            Cost
                          </span>
                          <span className="font-bold text-stone-900">
                            {pet.pet_cost != null
                              ? `RM ${pet.pet_cost}`
                              : "Unknown"}
                          </span>
                        </div>

                        <div className="flex items-center justify-between">
                          <span className="text-sm font-bold uppercase text-stone-500">
                            Tank Size
                          </span>
                          <span className="font-bold text-right text-stone-900">
                            {displayText(pet.pet_tank_size)}
                          </span>
                        </div>

                        <div className="flex items-center justify-between">
                          <span className="text-sm font-bold uppercase text-stone-500">
                            Native Status
                          </span>
                          <span className="font-bold text-right text-stone-900">
                            {displayText(pet.pet_is_native)}
                          </span>
                        </div>
                      </div>

                      <div className="mt-auto pt-2 text-center">
                        <Link
                          to={`/species/${pet.pet_id}`}
                          className="inline-flex items-center gap-1 font-bold text-emerald-600 transition-colors hover:text-emerald-700"
                        >
                          View Full Profile <ArrowRight className="h-4 w-4" />
                        </Link>
                      </div>
                    </div>
                  </motion.div>
                );
              })}
            </AnimatePresence>

            {comparePets.length < 4 && (
              <Link
                to="/"
                className="flex min-h-[520px] w-[340px] shrink-0 flex-col items-center justify-center rounded-3xl border-4 border-dashed border-stone-200 text-stone-400 transition-all hover:border-emerald-400 hover:bg-emerald-50 hover:text-emerald-600"
              >
                <div className="mb-4 rounded-full bg-white p-4 shadow-sm">
                  <Scale className="h-8 w-8" />
                </div>
                <span className="text-lg font-bold">Add another species</span>
              </Link>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

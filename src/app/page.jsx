'use client'
import { useForm } from "react-hook-form";
import api from "./utils/api";
import { useRouter } from "next/navigation";
import { useState, useEffect } from "react";

export default function Register() {
  const { register, handleSubmit } = useForm();
  const router = useRouter();
  const [dark, setDark] = useState(false);

  useEffect(() => {
    if (dark) {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
  }, [dark]);

  const onSubmit = async (data) => {
    try {
      await api.post("/users/register", data);
      alert("Registration successful");
      router.push("/login");
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center 
      bg-gradient-to-br from-emerald-50 to-emerald-100
      dark:from-gray-900 dark:to-gray-800 transition">

      {/* Dark mode toggle */}
      <button
        onClick={() => setDark(!dark)}
        className="absolute top-5 right-5 px-4 py-1 rounded-full
        text-sm font-medium
        bg-emerald-500 text-white
        dark:bg-gray-700 dark:text-gray-200"
      >
        {dark ? "Light Mode" : "Dark Mode"}
      </button>

      <div className="w-[420px] p-8 rounded-2xl shadow-xl
        bg-white dark:bg-gray-900
        border border-emerald-100 dark:border-gray-700 transition">

        <h2 className="text-3xl font-bold text-center 
          text-emerald-600 dark:text-emerald-400 mb-2">
          Student Registration
        </h2>

        <p className="text-center text-gray-500 dark:text-gray-400 text-sm mb-6">
          Create your university account
        </p>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">

          <input
            {...register("name")}
            placeholder="Full Name"
            required
            className="w-full px-4 py-2 rounded-lg border
            bg-white dark:bg-gray-800
            text-gray-800 dark:text-gray-200
            border-gray-300 dark:border-gray-700
            focus:ring-2 focus:ring-emerald-400 outline-none"
          />

          <input
            {...register("email")}
            type="email"
            placeholder="student@university.edu"
            required
            className="w-full px-4 py-2 rounded-lg border
            bg-white dark:bg-gray-800
            text-gray-800 dark:text-gray-200
            border-gray-300 dark:border-gray-700
            focus:ring-2 focus:ring-emerald-400 outline-none"
          />

          <input
            {...register("password")}
            type="password"
            placeholder="Password"
            required
            className="w-full px-4 py-2 rounded-lg border
            bg-white dark:bg-gray-800
            text-gray-800 dark:text-gray-200
            border-gray-300 dark:border-gray-700
            focus:ring-2 focus:ring-emerald-400 outline-none"
          />

          <select
            {...register("role")}
            className="w-full px-4 py-2 rounded-lg border
            bg-white dark:bg-gray-800
            text-gray-800 dark:text-gray-200
            border-gray-300 dark:border-gray-700
            focus:ring-2 focus:ring-emerald-400 outline-none"
          >
            <option value="student">Student</option>
          </select>

          <button
            type="submit"
            className="w-full bg-emerald-500 text-white py-2 rounded-lg
            hover:bg-emerald-600 transition font-semibold"
          >
            Register
          </button>
        </form>

        <p className="text-center mt-6 text-sm text-gray-500 dark:text-gray-400">
          Already have an account?{" "}
          <span
            onClick={() => router.push("/login")}
            className="text-emerald-600 dark:text-emerald-400
            font-medium cursor-pointer hover:underline"
          >
            Login
          </span>
        </p>
      </div>
    </div>
  );
}

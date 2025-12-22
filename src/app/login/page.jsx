'use client'
import { useForm } from "react-hook-form";
import api from "../utils/api";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

export default function Login() {
  const { register, handleSubmit } = useForm();
  const router = useRouter();

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // block login page if already logged in
  useEffect(() => {
    const token = localStorage.getItem("token");
    if (token) {
      router.replace("/dashboard");
    }
  }, [router]);

  const onSubmit = async (data) => {
    setError("");
    setLoading(true);

    try {
      const res = await api.post("/users/login", data);
      localStorage.setItem("token", res.data.token);
      router.push("/dashboard");
    } catch (err) {
      setError(err.response?.data?.message || "Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-green-100 via-emerald-100 to-teal-100 px-4">
      <div className="w-full max-w-md bg-white rounded-2xl shadow-xl p-8">

        <h2 className="text-3xl font-bold text-center text-emerald-700 mb-2">
          Student Login
        </h2>
        <p className="text-center text-gray-500 mb-6 text-sm">
          Login to access your dashboard
        </p>

        {/* Error */}
        {error && (
          <div className="mb-4 text-sm text-red-600 bg-red-50 border border-red-200 px-4 py-2 rounded-lg animate-shake">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">

          <input
            {...register("email")}
            type="email"
            required
            placeholder="Email"
            className="w-full px-4 py-3 rounded-xl border border-gray-300
                       focus:ring-2 focus:ring-emerald-500 outline-none"
          />

          <input
            {...register("password")}
            type="password"
            required
            placeholder="Password"
            className="w-full px-4 py-3 rounded-xl border border-gray-300
                       focus:ring-2 focus:ring-emerald-500 outline-none"
          />

          {/* 🔥 AWESOME BUTTON */}
          <button
            type="submit"
            disabled={loading}
            className={`
              w-full py-3 rounded-xl text-white font-semibold
              transition-all duration-300
              flex items-center justify-center gap-3
              ${loading
                ? "bg-emerald-400 cursor-not-allowed"
                : "bg-emerald-600 hover:bg-emerald-700 hover:shadow-lg active:scale-95"}
            `}
          >
            {loading ? (
              <>
                {/* spinner */}
                <span className="w-5 h-5 border-2 border-white/70 border-t-white rounded-full animate-spin"></span>

                {/* animated text */}
                <span className="animate-pulse tracking-wide">
                  Logging in...
                </span>
              </>
            ) : (
              "Login"
            )}
          </button>
        </form>

        <p className="mt-6 text-center text-sm text-gray-600">
          Don’t have an account?{" "}
          <span
            onClick={() => router.push("/")}
            className="text-emerald-600 font-semibold cursor-pointer hover:underline"
          >
            Register
          </span>
        </p>
      </div>
    </div>
  );
}

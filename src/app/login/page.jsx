'use client'
import { useForm } from "react-hook-form";
import api from "../utils/api";
import { useRouter } from "next/navigation";

export default function Login() {
  const { register, handleSubmit } = useForm(); // ✅ React Hook Form
  const router = useRouter();

  const onSubmit = async (data) => {
    try {
      const res = await api.post("/users/login", data);
      localStorage.setItem("token", res.data.token);
      router.push("/dashboard");
    } catch (err) {
      alert(err.response?.data?.message || "Error");
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <div className="bg-white p-10 rounded-xl shadow-lg w-96">
        <h2 className="text-3xl font-bold mb-8 text-center text-gray-800">Login</h2>
        <form className="flex flex-col gap-5" onSubmit={handleSubmit(onSubmit)}>
          <input
            className="border p-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400"
            placeholder="Email"
            {...register("email")} // ✅ React Hook Form binding
            type="email"
            required
          />
          <input
            className="border p-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400"
            placeholder="Password"
            {...register("password")} // ✅ React Hook Form binding
            type="password"
            required
          />
          <button
            className="bg-blue-500 text-white p-3 rounded-lg hover:bg-blue-600 transition-colors"
            type="submit"
          >
            Login
          </button>
        </form>
        <p className="mt-4 text-center text-gray-600">
          Don't have an account?{" "}
          <span
            className="text-blue-500 cursor-pointer hover:underline"
            onClick={() => router.push("/")}
          >
            Register
          </span>
        </p>
      </div>
    </div>
  );
}

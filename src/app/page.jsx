'use client'
import { useForm } from "react-hook-form";
import api from "./utils/api";
import { useRouter } from "next/navigation";

export default function Register() {
  const { register, handleSubmit } = useForm();
  const router = useRouter();

  const onSubmit = async (data) => {
    try {
      await api.post("/users/register", data);
      alert("User registered!");
      router.push("/login"); // redirect to login after register
    } catch (err) {
      alert(err.response?.data?.message || "Error");
    }
  };

  return (
     <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <div className="bg-white p-8 rounded shadow-md w-96">
        <h2 className="text-2xl font-bold mb-6 text-center">Register</h2>
        <form className="flex flex-col gap-4" onSubmit={handleSubmit(onSubmit)}>
          <input className="border p-2 rounded" placeholder="Name" {...register("name")} required />
          <input className="border p-2 rounded" placeholder="Email" {...register("email")} type="email" required />
          <input className="border p-2 rounded" placeholder="Password" {...register("password")} type="password" required />
          <select className="border p-2 rounded" {...register("role")}>
            <option value="student">Student</option>
            
          </select>
          <button className="bg-blue-500 text-white p-2 rounded hover:bg-blue-600" type="submit">Register</button>
        </form>

        {/* Already have account */}
        <p className="text-center mt-4 text-gray-600">
          Already have an account?{" "}
          <span
            onClick={() => router.push("/login")}
            className="text-blue-500 hover:underline cursor-pointer"
          >
            Login
          </span>
        </p>
      </div>
    </div>
  );
}

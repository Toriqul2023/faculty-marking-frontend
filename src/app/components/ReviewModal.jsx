'use client'
import { useForm } from "react-hook-form";
import api from "../utils/api";
import { FaStar } from "react-icons/fa";

export default function ReviewModal({ faculty, onClose, onReviewSubmit }) {
  const { register, handleSubmit, reset } = useForm();

  const onSubmit = async (data) => {
    try {
      const token = localStorage.getItem("token");
      const res = await api.post(
        `/reviews/${faculty._id}`,
        data,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      onReviewSubmit(res.data); // parent update
      reset();
      onClose();
    } catch (err) {
      alert(err.response?.data?.message || "Error submitting review");
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white/90 backdrop-blur-md p-6 rounded-3xl shadow-2xl w-96 max-w-full relative">
        {/* Close button */}
        <button
          onClick={onClose}
          className="absolute top-3 right-3 text-gray-500 hover:text-gray-800 transition text-xl font-bold"
        >
          ×
        </button>

        <h2 className="text-2xl font-bold mb-4 text-gray-800 text-center">
          Review {faculty.name}
        </h2>

        <form className="flex flex-col gap-4" onSubmit={handleSubmit(onSubmit)}>
          {/* Rating */}
          <div className="flex items-center gap-2">
            <label className="font-medium text-gray-700">Rating:</label>
            <input
              type="number"
              placeholder="1-5"
              {...register("rating", { required: true, min: 1, max: 5 })}
              className="w-full border border-gray-300 rounded-lg p-2 focus:outline-none focus:ring-2 focus:ring-indigo-400"
                onInput={(e) => {
                const value = parseInt(e.target.value);
                if (value > 5) e.target.value = 5; 
                if (value < 1) e.target.value = 1; 
  }}
            />
            <FaStar className="text-yellow-400" />
          </div>

          {/* Course selector */}
          <select
            {...register("course", { required: true })}
            className="border border-gray-300 p-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-400"
            defaultValue=""
          >
            <option value="" disabled>Select Course</option>
            {faculty.courses.map((course, index) => (
              <option key={index} value={course}>
                {course}
              </option>
            ))}
          </select>

          {/* Comment */}
          <textarea
            placeholder="Write your comment..."
            {...register("comment")}
            className="border border-gray-300 p-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-400 resize-none h-24"
          />

          {/* Anonymous toggle */}
          <label className="flex items-center gap-2 cursor-pointer select-none">
            <input
              type="checkbox"
              {...register("isAnonymous")}
              className="h-5 w-5 accent-indigo-500"
            />
            <span className="text-gray-700 font-medium">Submit as Anonymous</span>
          </label>

          {/* Buttons */}
          <div className="flex justify-end gap-3 mt-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-full border border-gray-300 hover:bg-gray-100 transition font-medium"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 rounded-full bg-gradient-to-r from-indigo-500 to-purple-500 text-white font-semibold hover:from-indigo-600 hover:to-purple-600 transition shadow-lg"
            >
              Submit
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

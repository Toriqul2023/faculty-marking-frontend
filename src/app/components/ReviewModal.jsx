'use client'
import { useForm } from "react-hook-form";
import api from "../utils/api";
import { FaStar } from "react-icons/fa";
import { useState } from "react";

export default function ReviewModal({ faculty, onClose, onReviewSubmit }) {
  const { register, handleSubmit, reset } = useForm();
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);

  const onSubmit = async (data) => {
    setSubmitting(true);
    try {
      const token = localStorage.getItem("token");
      const res = await api.post(
        `/reviews/${faculty._id}`,
        data,
        { headers: { Authorization: `Bearer ${token}` } }
      );

      // Update parent dashboard
      onReviewSubmit({
        facultyId: faculty._id,
        rating: res.data.rating
      });

      // Show success message
      setSuccess(true);
      setTimeout(() => setSuccess(false), 2500);

      reset();
    } catch (err) {
      alert(err.response?.data?.message || "Error submitting review");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white/90 backdrop-blur-md p-6 rounded-3xl shadow-2xl w-96 max-w-full relative">
        {/* Close button */}
        <button
          onClick={onClose}
          disabled={submitting}
          className={`absolute top-3 right-3 text-gray-500 hover:text-gray-800 transition text-xl font-bold ${submitting ? "opacity-50 cursor-not-allowed" : ""}`}
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
              className="w-full border border-gray-300 rounded-lg p-2 focus:outline-none focus:ring-2 focus:ring-emerald-400"
              onInput={(e) => {
                const value = parseInt(e.target.value);
                if (value > 5) e.target.value = 5;
                if (value < 1) e.target.value = 1;
              }}
              disabled={submitting}
            />
            <FaStar className="text-yellow-400" />
          </div>

          {/* Course selector */}
          <select
            {...register("course", { required: true })}
            className="border border-gray-300 p-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-400"
            defaultValue=""
            disabled={submitting}
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
            className="border border-gray-300 p-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-400 resize-none h-24"
            disabled={submitting}
          />

          {/* Anonymous toggle */}
          <label className="flex items-center gap-2 cursor-pointer select-none">
            <input
              type="checkbox"
              {...register("isAnonymous")}
              className="h-5 w-5 accent-emerald-500"
              disabled={submitting}
            />
            <span className="text-gray-700 font-medium">Submit as Anonymous</span>
          </label>

          {/* Buttons */}
          <div className="flex justify-end gap-3 mt-3">
            <button
              type="button"
              onClick={onClose}
              disabled={submitting}
              className={`px-4 py-2 rounded-full border border-gray-300 hover:bg-gray-100 transition font-medium ${submitting ? "opacity-50 cursor-not-allowed" : ""}`}
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting}
              className={`px-4 py-2 rounded-full bg-gradient-to-r from-emerald-500 to-green-600 text-white font-semibold hover:from-emerald-600 hover:to-green-700 transition shadow-lg flex items-center justify-center gap-2 ${submitting ? "opacity-70 cursor-not-allowed" : ""}`}
            >
              {submitting ? (
                <>
                  <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
                  Submitting...
                </>
              ) : "Submit"}
            </button>
          </div>
        </form>

        {/* Success Toast */}
        {success && (
          <div className="absolute top-4 left-1/2 -translate-x-1/2 bg-emerald-500 text-white px-4 py-2 rounded-xl shadow-lg animate-bounce">
            ✅ Review submitted!
          </div>
        )}
      </div>
    </div>
  );
}

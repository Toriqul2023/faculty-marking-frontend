'use client'
import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import api from "../../utils/api";
import { useForm } from "react-hook-form";

export default function FacultyReviewsPage() {
  const { id } = useParams();
  const router = useRouter();
  const [faculty, setFaculty] = useState(null);
  const [reviews, setReviews] = useState([]);
  const [replies, setReplies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [replyTo, setReplyTo] = useState(null); // Full object
  const { register, handleSubmit, reset } = useForm();

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) return router.push("/login");

    const fetchData = async () => {
      try {
        const resFaculty = await api.get(`/faculty/${id}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        setFaculty(resFaculty.data);

        const resReviews = await api.get(`/reviews/${id}`, {
          headers: { Authorization: `Bearer ${token}` },
        });

        const resReplies = await api.get(`/reviews/replies/${id}`, {
          headers: { Authorization: `Bearer ${token}` },
        });

        setReviews(resReviews.data);
        setReplies(resReplies.data);
      } catch (err) {
        alert(err.response?.data?.message || "Error fetching data");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [id, router]);

  // ---------------- Submit Reply ----------------
  const onSubmitReply = async (data) => {
    try {
      const token = localStorage.getItem("token");

      const res = await api.post(`/reviews/reply/${id}`, {
        comment: data.comment,
        parentReviewId: replyTo?.isReview ? replyTo._id : replyTo.parentReviewId || replyTo._id,
        parentReplyId: replyTo?.isReview ? null : replyTo._id
      }, {
        headers: { Authorization: `Bearer ${token}` },
      });

      setReplies(prev => [...prev, res.data]);
      setReplyTo(null);
      reset();
    } catch (err) {
      alert(err.response?.data?.message || "Error submitting reply");
    }
  };

  // ---------------- Build Nested Tree ----------------
  const buildTree = () => {
    const map = {};
    const tree = [];

    reviews.forEach(r => map[r._id] = { ...r, replies: [] });
    replies.forEach(rep => map[rep._id] = { ...rep, replies: [] });

    replies.forEach(rep => {
      if (rep.parentReplyId && map[rep.parentReplyId]) {
        map[rep.parentReplyId].replies.push(map[rep._id]);
      } else if (rep.parentReviewId && map[rep.parentReviewId]) {
        map[rep.parentReviewId].replies.push(map[rep._id]);
      }
    });

    Object.values(map).forEach(item => {
      if (!item.parentReviewId && !item.parentReplyId) tree.push(item);
    });

    return tree;
  };

  const nestedReviews = buildTree();

  // ---------------- Render Replies ----------------
  const renderReplies = (replies, level = 1) => {
    return replies.map(r => (
      <div key={r._id} className={`ml-${level * 6} mt-4 border-l-2 border-gray-200 pl-4`}>
        <div className="bg-gray-50 p-4 rounded-xl shadow hover:shadow-lg transition duration-200">
          <div className="flex justify-between items-center mb-2">
            <span className="font-semibold text-sm text-gray-700">
              {r.isAnonymous ? "Anonymous" : r.userId?.name}
            </span>
            <span className="text-xs text-gray-400">
              {new Date(r.createdAt).toLocaleString()}
            </span>
          </div>
          <p className="text-gray-700">{r.comment}</p>
          <button
            className="text-blue-500 text-xs mt-2 hover:underline"
            onClick={() => setReplyTo({ ...r, isReview: false })}
          >
            Reply
          </button>
        </div>
        {r.replies.length > 0 && renderReplies(r.replies, level + 1)}
      </div>
    ));
  };

  if (loading) return <p className="text-center mt-20 text-gray-500">Loading...</p>;
  if (!faculty) return <p className="text-center mt-20 text-red-500">Faculty not found</p>;

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-gray-100 p-6">
      <button
        className="mb-6 px-5 py-2 bg-white rounded-full shadow hover:shadow-lg border transition flex items-center gap-2"
        onClick={() => router.back()}
      >
        ← Back
      </button>

      <div className="bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 text-white p-8 rounded-3xl shadow-xl mb-10 border-t-8 border-white relative overflow-hidden">
        <h1 className="text-4xl font-extrabold">{faculty.name}</h1>
        <p className="text-xl font-semibold mt-2">{faculty.initials}</p>
        <div className="mt-4">
          <span className="bg-white text-indigo-600 font-bold px-4 py-1 rounded-full shadow">
            Avg Rating: {faculty.avgRating || 0} ⭐
          </span>
        </div>
      </div>

      <h2 className="text-3xl font-bold text-gray-700 mb-6">Student Reviews</h2>

      {nestedReviews.length === 0 ? (
        <p className="text-gray-500 text-lg">No reviews yet. Be the first to add one!</p>
      ) : (
        <div className="space-y-6">
          {nestedReviews.map(r => (
            <div key={r._id} className="bg-white p-6 rounded-2xl shadow-lg hover:shadow-2xl transition duration-200 border-l-4 border-indigo-400">
              <div className="flex justify-between items-center mb-3">
                <span className="font-semibold text-lg text-gray-800">
                  {r.isAnonymous ? "Anonymous" : r.userId?.name}
                </span>
                {r.rating && <span className="flex items-center gap-1 font-bold text-indigo-600">{r.rating} ⭐</span>}
              </div>
              <p className="text-gray-700 mb-2">{r.comment || "No comment"}</p>
              {r.course && <p className="text-sm text-gray-400 mb-3">Course: <span className="font-medium">{r.course}</span></p>}
              <button
                className="text-indigo-500 font-semibold text-sm hover:underline"
                onClick={() => setReplyTo({ ...r, isReview: true })}
              >
                Reply
              </button>

              {r.replies.length > 0 && renderReplies(r.replies)}
            </div>
          ))}
        </div>
      )}

      {replyTo && (
        <form
          onSubmit={handleSubmit(onSubmitReply)}
          className="bg-white p-6 rounded-2xl shadow-xl mt-10 border-t-4 border-indigo-400"
        >
          <textarea
            {...register("comment", { required: true })}
            placeholder="Write your reply..."
            className="w-full border border-gray-300 p-4 rounded-xl mb-4 focus:outline-none focus:ring-2 focus:ring-indigo-400"
          />
          <div className="flex gap-4 justify-end">
            <button type="button" className="px-5 py-2 border rounded-xl hover:bg-gray-100 transition" onClick={() => setReplyTo(null)}>Cancel</button>
            <button type="submit" className="px-5 py-2 bg-gradient-to-r from-indigo-500 to-purple-500 text-white rounded-xl hover:from-indigo-600 hover:to-purple-600 transition">Submit Reply</button>
          </div>
        </form>
      )}
    </div>
  );
}

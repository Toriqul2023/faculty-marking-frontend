'use client'
import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import api from "../../utils/api";
import { useForm } from "react-hook-form";
import { motion, AnimatePresence } from "framer-motion";

export default function FacultyReviewsPage() {
  const { id } = useParams();
  const router = useRouter();

  const [faculty, setFaculty] = useState(null);
  const [reviews, setReviews] = useState([]);
  const [replies, setReplies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [replyTo, setReplyTo] = useState(null);
  const [expandedReplies, setExpandedReplies] = useState({});
  const [expandedComments, setExpandedComments] = useState({});
  const [toast, setToast] = useState("");

  const { register, handleSubmit, reset } = useForm();

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) return router.push("/login");
    if (!id) return;

    const fetchData = async () => {
      try {
        const [resFaculty, resReviews, resReplies] = await Promise.all([
          api.get(`/faculty/${id}`, { headers: { Authorization: `Bearer ${token}` } }),
          api.get(`/reviews/${id}`, { headers: { Authorization: `Bearer ${token}` } }),
          api.get(`/reviews/replies/${id}`, { headers: { Authorization: `Bearer ${token}` } }),
        ]);
        setFaculty(resFaculty.data);
        setReviews(resReviews.data);
        setReplies(resReplies.data);
      } catch (err) {
        alert(err.response?.data?.message || "Error fetching data");
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [id]);

  const showToast = (msg) => {
    setToast(msg);
    setTimeout(() => setToast(""), 3000);
  };

  const onSubmitReply = async (data) => {
    try {
      const token = localStorage.getItem("token");
      const res = await api.post(
        `/reviews/reply/${id}`,
        {
          comment: data.comment,
          parentReviewId: replyTo?.isReview ? replyTo._id : replyTo.parentReviewId || replyTo._id,
          parentReplyId: replyTo?.isReview ? null : replyTo._id,
        },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setReplies((prev) => [...prev, res.data]);
      setReplyTo(null);
      reset();
      showToast("Reply submitted successfully!");
    } catch (err) {
      alert(err.response?.data?.message || "Error submitting reply");
    }
  };

  const buildTree = () => {
    const map = {};
    const tree = [];
    reviews.forEach((r) => (map[r._id] = { ...r, replies: [] }));
    replies.forEach((rep) => (map[rep._id] = { ...rep, replies: [] }));

    replies.forEach((rep) => {
      if (rep.parentReplyId && map[rep.parentReplyId]) map[rep.parentReplyId].replies.push(map[rep._id]);
      else if (rep.parentReviewId && map[rep.parentReviewId]) map[rep.parentReviewId].replies.push(map[rep._id]);
    });

    Object.values(map).forEach((item) => {
      if (!item.parentReviewId && !item.parentReplyId) tree.push(item);
    });

    return tree;
  };

  const nestedReviews = buildTree();

  const renderReplies = (replies, level = 1, parentId = "") => {
    const visibleCount = 2;
    const isExpanded = expandedReplies[parentId];
    const visibleReplies = isExpanded ? replies : replies.slice(0, visibleCount);

    return (
      <div>
        {visibleReplies.map((r) => (
          <motion.div
            key={r._id}
            initial={{ opacity: 0, y: -5 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -5 }}
            style={{ marginLeft: level * 16 }}
            className="mt-2"
          >
            <div className="bg-gray-50 p-3 rounded-md shadow-sm border max-w-xl">
              <div className="flex justify-between items-center mb-1">
                <span className="font-bold text-base text-gray-800">
                  {r.isAnonymous ? "Anonymous" : r.userId?.name}
                </span>
                <span className="text-[10px] text-gray-400">{new Date(r.createdAt).toLocaleString()}</span>
              </div>
              <p className={`text-gray-700 text-sm ${expandedComments[r._id] ? "" : "line-clamp-3"}`}>{r.comment}</p>
              {r.comment.length > 100 && (
                <button
                  className="text-blue-500 text-[11px] mt-1 hover:underline"
                  onClick={() => setExpandedComments((prev) => ({ ...prev, [r._id]: !prev[r._id] }))}
                >
                  {expandedComments[r._id] ? "Show less" : "Read more"}
                </button>
              )}
              <button
                className="text-green-600 text-[11px] mt-1 hover:underline font-medium"
                onClick={() => setReplyTo({ ...r, isReview: false })}
              >
                Reply
              </button>
            </div>
            {r.replies?.length > 0 && <AnimatePresence>{renderReplies(r.replies, level + 1, r._id)}</AnimatePresence>}
          </motion.div>
        ))}
        {replies.length > visibleCount && (
          <button
            className="text-blue-600 text-[11px] mt-1 ml-4 hover:underline"
            onClick={() => setExpandedReplies((prev) => ({ ...prev, [parentId]: !prev[parentId] }))}
          >
            {isExpanded ? "Hide replies" : `Show ${replies.length - visibleCount} more replies`}
          </button>
        )}
      </div>
    );
  };

  if (loading)
    return (
      <div className="min-h-screen flex items-center justify-center bg-green-50">
        <div className="flex flex-col items-center gap-3">
          <span className="w-10 h-10 border-4 border-green-500 border-t-transparent rounded-full animate-spin"></span>
          <p className="text-gray-600 text-sm">Loading faculty reviews...</p>
        </div>
      </div>
    );

  if (!faculty) return <p className="text-center mt-20 text-red-500">Faculty not found</p>;

  return (
    <div className="min-h-screen bg-green-50 p-3 flex justify-center relative">
      <div className="w-full max-w-2xl space-y-4">
        {toast && (
          <div className="fixed top-5 left-1/2 transform -translate-x-1/2 bg-green-600 text-white px-4 py-2 rounded-md shadow-lg z-50 animate-fadeIn">
            {toast}
          </div>
        )}
        <button
          className="px-3 py-1 bg-white rounded-md shadow-sm border text-xs hover:bg-gray-50 transition"
          onClick={() => router.back()}
        >
          ← Back
        </button>

        <div className="bg-white p-4 rounded-lg shadow-md border">
          <h1 className="text-2xl font-bold text-gray-800">{faculty.name}</h1>
          <p className="text-sm text-gray-500">{faculty.initials}</p>
          <div className="mt-2 inline-flex items-center gap-1 bg-green-100 text-green-700 font-medium px-2 py-0.5 rounded-full text-sm">
            ⭐ Avg Rating: {faculty.avgRating || 0}
          </div>
        </div>

        <h2 className="text-lg font-semibold text-gray-700">Student Reviews</h2>
        {nestedReviews.length === 0 ? (
          <p className="text-gray-500 text-sm bg-white p-3 rounded-lg shadow-sm border">
            No reviews yet. Be the first to add one!
          </p>
        ) : (
          nestedReviews.map((r) => (
            <motion.div
              key={r._id}
              initial={{ opacity: 0, y: -5 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -5 }}
              className="bg-white p-3 rounded-lg shadow-md border space-y-1 hover:shadow-lg transition-all duration-200"
            >
              <div className="flex justify-between items-center">
                <span className="font-bold text-lg text-gray-800">{r.isAnonymous ? "Anonymous" : r.userId?.name}</span>
                {r.rating && <span className="text-green-600 font-semibold text-sm">{r.rating} ⭐</span>}
              </div>
              <p className={`text-gray-700 text-sm ${expandedComments[r._id] ? "" : "line-clamp-3"}`}>{r.comment}</p>
              {r.comment.length > 100 && (
                <button
                  className="text-blue-500 text-sm mt-1 hover:underline"
                  onClick={() => setExpandedComments((prev) => ({ ...prev, [r._id]: !prev[r._id] }))}
                >
                  {expandedComments[r._id] ? "Show less" : "Read more"}
                </button>
              )}
              {r.course && (
                <p className="text-sm text-gray-500">
                  Course: <span className="font-medium">{r.course}</span>
                </p>
              )}
              <button className="text-green-600 text-sm hover:underline font-medium" onClick={() => setReplyTo({ ...r, isReview: true })}>
                Reply
              </button>
              {r.replies.length > 0 && <AnimatePresence>{renderReplies(r.replies)}</AnimatePresence>}
            </motion.div>
          ))
        )}

        {replyTo && (
          <form
            onSubmit={handleSubmit(onSubmitReply)}
            className="bg-white p-3 rounded-lg shadow-md border space-y-2 fixed bottom-5 w-full max-w-2xl left-1/2 transform -translate-x-1/2"
          >
            <textarea
              {...register("comment", { required: true })}
              placeholder={`Replying to ${replyTo.isReview ? "review" : "reply"}...`}
              className="w-full border border-gray-300 p-2 rounded-md text-sm focus:ring focus:ring-green-100 outline-none"
            />
            <div className="flex justify-end gap-2">
              <button type="button" className="px-3 py-1 border rounded-md text-sm hover:bg-gray-50" onClick={() => setReplyTo(null)}>
                Cancel
              </button>
              <button type="submit" className="px-3 py-1 bg-green-600 text-white rounded-md text-sm hover:bg-green-700 transition">
                Submit
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}

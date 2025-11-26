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
  const [replyTo, setReplyTo] = useState(null);

  const { register, handleSubmit, reset } = useForm();

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) return router.push("/login");

    const fetchData = async () => {
      try {
        const resFaculty = await api.get(`/faculty/${id}`, {
          headers: { Authorization: `Bearer ${token}` },
        });

        const resReviews = await api.get(`/reviews/${id}`, {
          headers: { Authorization: `Bearer ${token}` },
        });

        const resReplies = await api.get(`/reviews/replies/${id}`, {
          headers: { Authorization: `Bearer ${token}` },
        });

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
  }, [id, router]);

  // Submit reply
  const onSubmitReply = async (data) => {
    try {
      const token = localStorage.getItem("token");

      const res = await api.post(
        `/reviews/reply/${id}`,
        {
          comment: data.comment,
          parentReviewId: replyTo?.isReview
            ? replyTo._id
            : replyTo.parentReviewId || replyTo._id,
          parentReplyId: replyTo?.isReview ? null : replyTo._id,
        },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      setReplies((prev) => [...prev, res.data]);
      setReplyTo(null);
      reset();
    } catch (err) {
      alert(err.response?.data?.message || "Error submitting reply");
    }
  };

  // Build tree
  const buildTree = () => {
    const map = {};
    const tree = [];

    reviews.forEach((r) => (map[r._id] = { ...r, replies: [] }));
    replies.forEach((rep) => (map[rep._id] = { ...rep, replies: [] }));

    replies.forEach((rep) => {
      if (rep.parentReplyId && map[rep.parentReplyId]) {
        map[rep.parentReplyId].replies.push(map[rep._id]);
      } else if (rep.parentReviewId && map[rep.parentReviewId]) {
        map[rep.parentReviewId].replies.push(map[rep._id]);
      }
    });

    Object.values(map).forEach((item) => {
      if (!item.parentReviewId && !item.parentReplyId) tree.push(item);
    });

    return tree;
  };

  const nestedReviews = buildTree();

  // Render nested replies
  const renderReplies = (replies, level = 1) => {
    return replies.map((r) => (
      <div key={r._id} style={{ marginLeft: level * 20 }} className="mt-2">
        <div className="bg-gray-100 p-2 rounded-lg border border-gray-200 max-w-2xl">
          <div className="flex justify-between items-center mb-1">
            <span className="font-medium text-sm">
              {r.isAnonymous ? "Anonymous" : r.userId?.name}
            </span>
            <span className="text-xs text-gray-400">
              {new Date(r.createdAt).toLocaleString()}
            </span>
          </div>

          <p className="text-gray-700 text-sm">{r.comment}</p>

          <button
            className="text-blue-600 text-xs mt-1"
            onClick={() => setReplyTo({ ...r, isReview: false })}
          >
            Reply
          </button>
        </div>

        {r.replies.length > 0 && renderReplies(r.replies, level + 1)}
      </div>
    ));
  };

  if (loading)
    return <p className="text-center mt-20 text-gray-500">Loading...</p>;
  if (!faculty)
    return (
      <p className="text-center mt-20 text-red-500">Faculty not found</p>
    );

  return (
    <div className="min-h-screen bg-gray-100 p-4 flex justify-center">
      <div className="w-full max-w-3xl">

        <button
          className="mb-4 px-4 py-1 bg-white rounded-lg shadow border text-sm"
          onClick={() => router.back()}
        >
          ← Back
        </button>

        {/* Faculty header */}
        <div className="bg-white p-4 rounded-lg shadow border mb-6">
          <h1 className="text-xl font-bold">{faculty.name}</h1>
          <p className="text-sm text-gray-500">{faculty.initials}</p>

          <span className="mt-2 inline-block bg-blue-100 text-blue-700 font-medium px-3 py-1 rounded-full text-sm">
            Avg Rating: {faculty.avgRating || 0} ⭐
          </span>
        </div>

        <h2 className="text-xl font-semibold text-gray-700 mb-3">
          Student Reviews
        </h2>

        {nestedReviews.length === 0 ? (
          <p className="text-gray-500 text-sm">
            No reviews yet. Be the first to add one!
          </p>
        ) : (
          nestedReviews.map((r) => (
            <div
              key={r._id}
              className="bg-white p-3 rounded-lg shadow border mb-4 max-w-2xl"
            >
              <div className="flex justify-between items-center">
                <span className="font-semibold text-sm">
                  {r.isAnonymous ? "Anonymous" : r.userId?.name}
                </span>

                {r.rating && (
                  <span className="text-blue-600 font-semibold text-sm">
                    {r.rating} ⭐
                  </span>
                )}
              </div>

              <p className="text-gray-800 text-sm mt-1">{r.comment}</p>

              {r.course && (
                <p className="text-xs text-gray-400 mt-1">
                  Course: <span className="font-medium">{r.course}</span>
                </p>
              )}

              <button
                className="text-blue-600 text-xs mt-2"
                onClick={() => setReplyTo({ ...r, isReview: true })}
              >
                Reply
              </button>

              {r.replies.length > 0 && renderReplies(r.replies)}
            </div>
          ))
        )}

        {/* Reply box */}
        {replyTo && (
          <form
            onSubmit={handleSubmit(onSubmitReply)}
            className="bg-white p-3 mt-5 rounded-lg shadow border max-w-2xl"
          >
            <textarea
              {...register("comment", { required: true })}
              placeholder="Write a reply..."
              className="w-full border border-gray-300 p-2 rounded-lg text-sm mb-2"
            />

            <div className="flex justify-end gap-2">
              <button
                type="button"
                className="px-3 py-1 border rounded text-sm"
                onClick={() => setReplyTo(null)}
              >
                Cancel
              </button>

              <button
                type="submit"
                className="px-3 py-1 bg-blue-600 text-white rounded text-sm"
              >
                Submit
              </button>
            </div>
          </form>
        )}

      </div>
    </div>
  );
}

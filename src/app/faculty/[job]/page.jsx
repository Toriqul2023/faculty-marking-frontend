'use client'

import api from "@/app/utils/api";
import { useParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import Comment from "./Comment";

const Page = () => {
  const router = useRouter();
  const id = useParams().job;

  const [facultyData, setFacultyData] = useState(null);
  const [reviewsData, setReviewsData] = useState([]);
  const [replies, setReplies] = useState([]);

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) return router.push("/login");

    const fetchData = async () => {
      try {
        const [resFaculty, resReviews, resReplies] = await Promise.all([
          api.get(`/faculty/${id}`, {
            headers: { Authorization: `Bearer ${token}` },
          }),
          api.get(`/reviews/${id}`, {
            headers: { Authorization: `Bearer ${token}` },
          }),
          api.get(`/reviews/replies/${id}`, {
            headers: { Authorization: `Bearer ${token}` },
          }),
        ]);

        setFacultyData(resFaculty.data);
        setReviewsData(resReviews.data);
        setReplies(resReplies.data);
      } catch (err) {
        console.error(err);
      }
    };

    fetchData();
  }, [router, id]);

  // build nested reply tree
  const buildTree = (replies) => {
    const map = {};
    const roots = [];

    replies.forEach(r => (map[r._id] = { ...r, children: [] }));
    replies.forEach(r => {
      r.parentReplyId
        ? map[r.parentReplyId]?.children.push(map[r._id])
        : roots.push(map[r._id]);
    });

    return roots;
  };

  const handleReplySubmit = async (parentReplyId, reviewId, content) => {
    const token = localStorage.getItem("token");
    try {
      const response = await api.post(
        `/reviews/reply/${id}`,
        {
          comment: content,
          parentReplyId: parentReplyId || null,
          parentReviewId: reviewId,
        },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      setReplies(prev => [...prev, response.data]);
    } catch (err) {
      alert("Failed to submit reply");
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-white to-green-50 p-6">
      
      {/* Header */}
      <h3 className="text-3xl font-bold text-emerald-800">
        Faculty Reviews
      </h3>
      <p className="text-emerald-600 mt-1 text-sm">
        Student feedback & discussion board
      </p>

      {/* Faculty Card */}
      {facultyData && (
        <div className="mt-6 bg-white p-6 rounded-2xl shadow-md border border-emerald-100">
          <h4 className="text-xl font-semibold text-emerald-800">
            {facultyData.name}
          </h4>
          <p className="text-gray-600">{facultyData.department}</p>
          <p className="text-gray-500 text-sm">{facultyData.email}</p>
        </div>
      )}

      {/* Reviews */}
      <div className="mt-8">
        <h4 className="text-2xl font-semibold mb-4 text-emerald-800">
          Student Reviews
        </h4>

        {reviewsData.map(review => {
          const replyTree = buildTree(
            replies.filter(r => r.parentReviewId === review._id)
          );
          
          console.log(review?.userId?.name)
          return (
            <div
              key={review._id}
              className="bg-white p-6 rounded-2xl shadow-md
                         border border-gray-100 mb-6"
            >
             <p className="text-gray-800 leading-relaxed">
               {review?.userId?.name || "Anonymous"}
              </p>
              <p className="text-gray-800 leading-relaxed">
                {review.comment}
              </p>

              {/* Replies */}
              <div className="mt-4 space-y-3">
                {replyTree.map(r => (
                  <Comment
                    key={r._id}
                    reply={r}
                    handleReplySubmit={handleReplySubmit}
                  />
                ))}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default Page;

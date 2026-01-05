'use client'
import React, { useState } from 'react';

const Comment = ({ reply, handleReplySubmit }) => {
  const [open, setOpen] = useState(false);
  const [openChildren, setOpenChildren] = useState(false);
  const [replyContent, setReplyContent] = useState("");

  return (
    <div className="ml-4 mt-4">
      
      {/* Comment Card */}
      <div className="bg-emerald-50 border border-emerald-200 
                      px-4 py-3 rounded-xl shadow-sm
                      hover:shadow-md transition">

        {/* User name */}
        <p className="text-sm font-semibold text-emerald-700">
          {reply?.userId?.name || 'Anonymous'}
        </p>

        {/* Comment text */}
        <p className="text-sm text-gray-700 mt-1 leading-relaxed">
          {reply.comment}
        </p>

        {/* Actions */}
        <div className="flex gap-5 mt-2 text-xs font-medium">
          <button
            onClick={() => setOpen(!open)}
            className="text-emerald-600 hover:text-emerald-800 transition"
          >
            💬 Reply
          </button>

          {reply.children?.length > 0 && (
            <button
              onClick={() => setOpenChildren(!openChildren)}
              className="text-green-600 hover:text-green-800 transition"
            >
              {openChildren
                ? "➖ Hide replies"
                : `➕ View replies (${reply.children.length})`}
            </button>
          )}
        </div>
      </div>

      {/* Reply Box */}
      {open && (
        <div className="ml-6 mt-3 bg-white p-3 rounded-lg
                        border border-emerald-200 shadow-sm">
          <textarea
            value={replyContent}
            onChange={(e) => setReplyContent(e.target.value)}
            placeholder="Write your reply..."
            className="w-full border border-emerald-300
                       rounded-md p-2 text-sm
                       focus:outline-none
                       focus:ring-2 focus:ring-emerald-400"
            rows={2}
          />
          <button
            onClick={() => {
              handleReplySubmit(
                reply._id,
                reply.parentReviewId,
                replyContent
              );
              setReplyContent("");
              setOpen(false);
            }}
            className="mt-2 px-4 py-1.5 text-sm
                       bg-emerald-500 text-white
                       rounded-md hover:bg-emerald-600 transition"
          >
            Submit
          </button>
        </div>
      )}

      {/* Children Replies */}
      {openChildren && (
        <div className="ml-8 mt-3 border-l-2 border-emerald-300 pl-4">
          {reply.children.map(child => (
            <Comment
              key={child._id}
              reply={child}
              handleReplySubmit={handleReplySubmit}
            />
          ))}
        </div>
      )}
    </div>
  );
};

export default Comment;

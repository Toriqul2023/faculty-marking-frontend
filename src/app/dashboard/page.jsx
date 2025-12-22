'use client'
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import api from "../utils/api";
import ReviewModal from "../components/ReviewModal";

export default function Dashboard() {
  const router = useRouter();
  const [user, setUser] = useState(null);
  const [faculties, setFaculties] = useState([]);
  const [selectedFaculty, setSelectedFaculty] = useState(null);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);

  // Fetch user and faculties on mount
  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) return router.push("/login");

    const fetchData = async () => {
      try {
        const [resUser, resFaculty] = await Promise.all([
          api.get("/users/me", { headers: { Authorization: `Bearer ${token}` } }),
          api.get("/faculty", { headers: { Authorization: `Bearer ${token}` } }),
        ]);
        setUser(resUser.data);
        setFaculties(resFaculty.data);
        setLoading(false);
      } catch (err) {
        localStorage.removeItem("token");
        router.push("/login");
      }
    };

    fetchData();
  }, [router]);

  const logout = () => {
    localStorage.removeItem("token");
    router.push("/login");
  };

  // Filter faculties by course search
  const filteredFaculties = faculties.filter(f =>
    f.courses.some(course =>
      course.toLowerCase().includes(search.toLowerCase())
    )
  );

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-green-50">
        <div className="flex flex-col items-center gap-3">
          <span className="w-10 h-10 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin"></span>
          <p className="text-gray-600 text-sm">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-white to-emerald-50">

      {/* Navbar */}
      <nav className="bg-emerald-600 text-white px-6 py-4 flex justify-between items-center shadow">
        <h1 className="text-xl md:text-2xl font-bold tracking-wide">
          Faculty Review System
        </h1>
        <button
          onClick={logout}
          className="bg-red-500 hover:bg-red-600 px-4 py-2 rounded-xl text-sm font-medium transition"
        >
          Logout
        </button>
      </nav>

      {/* Search */}
      <div className="px-6 mt-8 flex justify-center">
        <input
          type="text"
          placeholder="Search by course name..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full max-w-md px-4 py-3 rounded-xl border border-gray-300
                     focus:ring-2 focus:ring-emerald-400 outline-none
                     shadow-sm transition"
        />
      </div>

      {/* Content */}
      <div className="px-6 py-10 max-w-7xl mx-auto">

        {/* Welcome */}
        <h2 className="text-2xl md:text-3xl font-bold text-gray-700 mb-6">
          👋 Welcome, <span className="text-emerald-600">{user.name}</span>
        </h2>

        {/* Admin Card */}
        {user.role === "admin" && (
          <div className="mb-10">
            <div className="bg-white p-6 rounded-2xl shadow-md hover:shadow-xl transition">
              <h3 className="text-lg font-bold text-emerald-600 mb-1">
                Admin Panel
              </h3>
              <p className="text-gray-600 text-sm">
                You can manage faculty members from here.
              </p>
            </div>
          </div>
        )}

        {/* Faculty List */}
        <h3 className="text-xl font-bold text-gray-700 mb-4">
          Faculty List
        </h3>

        {filteredFaculties.length === 0 ? (
          <p className="text-gray-500 text-sm">
            No faculties found for this course.
          </p>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredFaculties.map(f => (
              <div
                key={f._id}
                className="bg-white p-5 rounded-2xl shadow-md
                           hover:shadow-xl hover:-translate-y-1
                           transition duration-300"
              >
                <div className="flex justify-between items-center mb-2">
                  <h4 className="font-semibold text-gray-800">
                    {f.name} <span className="text-sm text-gray-500">({f.initials})</span>
                  </h4>
                  <span
                    className={`
                      flex items-center gap-1 px-2 py-1 rounded-full text-sm font-semibold
                      ${f.avgRating >= 4 
                        ? "bg-emerald-100 text-emerald-700 animate-pulse" 
                        : "bg-yellow-100 text-yellow-700"}
                    `}
                  >
                    ⭐ {f.avgRating || 0}
                  </span>
                </div>

                <p className="text-gray-600 text-sm mb-4">
                  {f.courses.join(", ")}
                </p>

                <div className="flex gap-2">
                  {user.role === "student" && (
                    <button
                      onClick={() => setSelectedFaculty(f)}
                      className="flex-1 bg-emerald-500 text-white py-2 rounded-xl
                                 hover:bg-emerald-600 transition text-sm"
                    >
                      Give Review
                    </button>
                  )}

                  <button
                    onClick={() => router.push(`/faculty/${f._id}`)}
                    className="flex-1 bg-gray-100 text-gray-700 py-2 rounded-xl
                               hover:bg-gray-200 transition text-sm"
                  >
                    See Reviews
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Review Modal */}
      {selectedFaculty && (
        <ReviewModal
          faculty={selectedFaculty}
          onClose={() => setSelectedFaculty(null)}
          onReviewSubmit={async (updatedReview) => {
            try {
              const token = localStorage.getItem("token");
              const res = await api.get(`/faculty/${updatedReview.facultyId}`, {
                headers: { Authorization: `Bearer ${token}` },
              });

              // Update faculty state with latest data
              setFaculties(prev =>
                prev.map(f =>
                  f._id === updatedReview.facultyId ? res.data : f
                )
              );

              setSelectedFaculty(null); // close modal
            } catch (err) {
              alert("Failed to fetch updated faculty");
              setSelectedFaculty(null);
            }
          }}
        />
      )}
    </div>
  );
}

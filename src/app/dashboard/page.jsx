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

  useEffect(() => {
    const token = localStorage.getItem("token");
if (!token) return router.push("/login");

const fetchData = async () => {
  try {
    const [resUser, resFaculty] = await Promise.all([
      api.get("/users/me", {
        headers: { Authorization: `Bearer ${token}` },
      }),
      api.get("/faculty", {
        headers: { Authorization: `Bearer ${token}` },
      }),
    ]);

    setUser(resUser.data);
    setFaculties(resFaculty.data);

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

  const handleOpenReview = (faculty) => setSelectedFaculty(faculty);
  const handleCloseReview = () => setSelectedFaculty(null);

  const handleReviewSubmit = (review) => {
    setFaculties((prev) =>
      prev.map((f) =>
        f._id === review.facultyId ? { ...f, avgRating: review.rating } : f
      )
    );
  };

  const filteredFaculties = faculties.filter(f =>
    f.courses.some(course =>
      course.toLowerCase().includes(search.toLowerCase())
    )
  );

  if (!user) return <p className="text-center mt-20 text-gray-500">Loading...</p>;

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-blue-50">
      {/* Navbar */}
      <nav className="bg-gradient-to-r from-blue-600 to-blue-500 text-white p-4 flex justify-between items-center shadow-lg">
        <h1 className="text-2xl font-bold tracking-wide">Faculty Marking Dashboard</h1>
        <button
          onClick={logout}
          className="bg-red-500 hover:bg-red-600 px-4 py-2 rounded-xl shadow transition"
        >
          Logout
        </button>
      </nav>

      {/* Search Bar */}
      <div className="p-8 flex justify-center">
        <input
          type="text"
          placeholder="Search by course..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="border-2 border-gray-300 p-3 rounded-xl w-full max-w-md focus:outline-none focus:ring-2 focus:ring-blue-400 shadow-sm transition"
        />
      </div>

      {/* Welcome */}
      <div className="p-8 max-w-7xl mx-auto">
        <h2 className="text-3xl font-bold mb-6 text-gray-700">Welcome, {user.name}!</h2>

        {/* Dashboard cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          {user.role === "admin" && (
            <div className="bg-white p-6 rounded-2xl shadow-lg hover:shadow-2xl transition transform hover:-translate-y-1 hover:scale-105">
              <h3 className="text-xl font-bold mb-2 text-blue-600">Add Faculty</h3>
              <p className="text-gray-600">Click here to add new faculty members.</p>
            </div>
          )}

         
        </div>

        {/* Faculty List */}
        <div>
          <h2 className="text-2xl font-bold mb-4 text-gray-700">Faculty List</h2>
          {filteredFaculties.length === 0 ? (
            <p className="text-gray-500">No faculties found for this course.</p>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredFaculties.map(f => (
                <div key={f._id} className="bg-white p-5 rounded-2xl shadow-lg hover:shadow-2xl transform hover:-translate-y-1 hover:scale-105 transition duration-300">
                  <div className="flex justify-between items-center mb-2">
                    <h3 className="font-semibold text-lg text-gray-800">{`${f.name} (${f.initials})`}</h3>
                    <span className="text-yellow-500 font-bold">⭐ {f.avgRating || 0}</span>
                  </div>
                  <p className="text-gray-600 mb-3">{f.courses.join(", ")}</p>
                  <div className="flex gap-2 mt-2">
                    {user.role === "student" && (
                      <button
                        onClick={() => handleOpenReview(f)}
                        className="flex-1 bg-blue-500 text-white rounded-xl hover:bg-blue-600 px-4 py-2 shadow transition"
                      >
                        Give Review
                      </button>
                    )}
                    <button
                      onClick={() => router.push(`/faculty/${f._id}`)}
                      className="flex-1 bg-green-500 text-white rounded-xl hover:bg-green-600 px-4 py-2 shadow transition"
                    >
                      See Reviews
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Review Modal */}
       {selectedFaculty && (
        <ReviewModal
          faculty={selectedFaculty}
          onClose={handleCloseReview}
          onReviewSubmit={handleReviewSubmit}
        />
      )} 
    </div>
  );
}

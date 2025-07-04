import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import PaginationControls from "../components/PaginationControl";

export default function ListOfReviews() {
  const { id } = useParams();
  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState({ comment: "", rating: 0 });
  const [ReviewData, setReviews] = useState([]);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const itemsPerPage = 5;
  const [reviewStats, setReviewStats] = useState(null);
  const [sort, setSort] = useState("date"); // "date" or "rating"
  
  const fetchReviews = async () => {
    try {
      const res = await fetch(`http://localhost:5000/api/products/${id}/reviews?page=${page}&per_page=${itemsPerPage}&sort=${sort}`);
      const data = await res.json();

      if (data.reviews) {
        setReviews(data.reviews);
        setTotalPages(data.total_pages);
      } else {
        setReviews([]); // fallback
        setTotalPages(1);
      }
    } catch (err) {
      console.error("Error fetching reviews:", err);
    }
  };

  const fetchReviewStats = async () => {
    try {
      const res = await fetch(`http://localhost:5000/api/products/${id}/reviews/stats`);
      const data = await res.json();
      setReviewStats(data);
    } catch (err) {
      console.error("Error fetching review stats:", err);
    }
  };

  useEffect(() => {
    fetchReviews();
    fetchReviewStats();
  }, [id, page, sort]);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleRating = (value) => {
    setForm({ ...form, rating: value });
  };

  const handleDelete = async (reviewId) => {
    if (!window.confirm("Are you sure you want to delete this review?")) return;
    try {
      const response = await fetch(`http://localhost:5000/api/reviews/${reviewId}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      });
      if (response.ok) {
        setReviews((prev) => prev.filter((review) => review.id !== reviewId));
        alert("Review deleted successfully");
      } else {
        const errorData = await response.json();
        alert(errorData.error || "Failed to delete review");
      }
    } catch (err) {
      console.error(err);
      alert("Error deleting review");
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const response = await fetch(`http://localhost:5000/api/products/${id}/reviews`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
        body: JSON.stringify({
          comment: form.comment,
          rating: form.rating,
        }),
      });

      if (response.ok) {
        setForm({ comment: "", rating: 0 });
        setShowModal(false);
        fetchReviews(); // Re-fetch updated reviews
      } else {
        const errorData = await response.json();
        alert(errorData.error || "Failed to submit review");
      }
    } catch (err) {
      console.error(err);
      alert("Error submitting review");
    }
  };

  return (
  <div className="container mx-auto px-4 py-8 max-w-4xl">
    {/* Header Section */}
    <div className="text-center mb-8">
      <h1 className="text-3xl font-bold text-gray-800 mb-2">Customer Reviews</h1>
      <p className="text-gray-600">Hear More From Our Beloved Customers</p>
    </div>

    {/* Review Stats Section */}
    <div className="bg-white rounded-xl shadow-md p-6 mb-8">
      <div className="flex flex-col md:flex-row items-center justify-between">
        <div className="text-center md:text-left mb-4 md:mb-0">
          <div className="flex items-center justify-center md:justify-start">
            <div className="text-4xl font-bold text-gray-800 mr-2">
              ⭐ {reviewStats?.average_rating != null ? reviewStats.average_rating.toFixed(1) : "N/A"}
            </div>
            <div className="flex flex-col ml-2">
              <div className="flex">
                {[1, 2, 3, 4, 5].map((i) => (
                  <span key={i} className="text-yellow-400 text-lg">
                    {reviewStats?.average_rating >= i ? "★" : reviewStats?.average_rating >= i - 0.5 ? "☆" : "☆"}
                  </span>
                ))}
              </div>
              <div className="text-sm text-gray-500">
                Based on {reviewStats?.total_reviews || 0} review{reviewStats?.total_reviews !== 1 ? "s" : ""}
              </div>
            </div>
          </div>
        </div>
        {/* Add Review Button */}
          <div className="text-center md:text-right mt-6">
            <button
              onClick={() => setShowModal(true)}
              className="bg-blue-600 hover:bg-blue-700 text-white py-2 px-4 rounded-lg transition duration-200"
            >
              <i className="fas fa-plus mr-2"></i>
              Add Review
            </button>
          </div>
      </div>
    </div>

    {/* Sort Options */}
    <div className="flex flex-col sm:flex-row justify-between items-center mb-6">
      <h2 className="text-xl font-semibold text-gray-800 mb-4 sm:mb-0">Recent Reviews</h2>
      <div className="flex space-x-2">
        <select
          value={sort}
          onChange={(e) => setSort(e.target.value)}
          className="bg-white border border-gray-300 text-gray-700 py-2 px-4 pr-8 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
        >
          <option value="date">Sort by Date (Newest)</option>
          <option value="rating">Sort by Rating (Highest)</option>
        </select>
      </div>
    </div>

    {/* Reviews List */}
    <ul className="flex flex-col gap-3 mt-14">
      {Array.isArray(ReviewData) &&
        ReviewData.map(({ id, profile_pic, name, text, rating, created_at }) => (
          <li key={id} className="bg-white rounded-xl shadow-md overflow-hidden transition duration-300 hover:shadow-lg p-6">
            <div className="flex items-start gap-3">
              {profile_pic ? (
                <img
                  src={`http://localhost:5000/profile-image/${profile_pic}`}
                  alt={`${name}'s profile`}
                  className="w-10 h-10 rounded-full object-cover"
                />
              ) : (
                <div className="w-10 h-10 flex items-center justify-center rounded-full bg-red-500 text-white font-bold uppercase">
                  {name?.[0] || "U"}
                </div>
              )}
              <div>
                <p className="font-semibold">{name}</p>
                <div className="text-yellow-500 text-sm">
                  {"★".repeat(rating)}<span className="text-gray-300">{"★".repeat(5 - rating)}</span>
                </div>
                <p className="mt-1 text-gray-800">{text}</p>
                <p className="text-xs text-gray-500 mt-1">{new Date(created_at).toLocaleDateString()}</p>
              </div>
            </div>
          </li>
        ))}
    </ul>

  

    {/* Modal for Review Submission */}
    {showModal && (
      <div className="fixed inset-0 bg-black bg-opacity-40 flex justify-center items-center">
        <div className="bg-white p-6 rounded-lg w-full max-w-md">
          <h3 className="text-lg font-semibold mb-4">Submit a Review</h3>
          <form onSubmit={handleSubmit} className="space-y-4">
            <textarea
              name="comment"
              value={form.comment}
              onChange={handleChange}
              placeholder="Your Review"
              className="w-full border px-3 py-2 rounded"
              required
            />
            <div className="flex gap-1">
              {[1, 2, 3, 4, 5].map((star) => (
                <span
                  key={star}
                  onClick={() => handleRating(star)}
                  className={`cursor-pointer text-xl ${form.rating >= star ? "text-yellow-500" : "text-gray-300"}`}
                >
                  ★
                </span>
              ))}
            </div>
            <div className="flex justify-end gap-2">
              <button type="button" onClick={() => setShowModal(false)} className="text-gray-500 hover:underline">
                Cancel
              </button>
              <button type="submit" className="bg-blue-500 text-white px-4 py-2 rounded">
                Submit
              </button>
            </div>
          </form>
        </div>
      </div>
    )}

    {/* Pagination */}
      <PaginationControls
        page={page}
        totalPages={totalPages}
        onPageChange={(newPage) => setPage(newPage)}
      />
  </div>
);
}

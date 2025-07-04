import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import { validateImageTypeAndSize } from "../components/validator"; // Import the validation function
import PaginationControls from "../components/PaginationControl";

function Profile({ user, setUser }) {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    fullname: "",
    phonenumber: "",
    address: "",
  });
  const [file, setFile] = useState(null);
  const [imageUrl, setImageUrl] = useState(null);
  const [tab, setTab] = useState("profile");
  const [purchaseHistory, setPurchaseHistory] = useState([]);
  const [myReviews, setMyReviews] = useState([]);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const itemsPerPage = 3;

  useEffect(() => {
    const fetchHistory = async () => {
      if (tab === "history" && user) {
        try {
          const res = await fetch(
            `http://localhost:5000/api/purchase-history/${user.user_id}`
          );
          const data = await res.json();
          console.log(data);
          setPurchaseHistory(data);
        } catch (error) {
          console.error("Failed to fetch history:", error);
          toast.error("Could not load purchase history.");
        }
      }
    };

    const fetchMyReviews = async () => {
    if (tab === "myreviews") {
      const token = localStorage.getItem("token");
      try {
        const res = await fetch(`http://localhost:5000/my-reviews?page=${page}&per_page=${itemsPerPage}`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        const data = await res.json();
        if (Array.isArray(data.reviews)) {
          setMyReviews(data.reviews);
          setTotalPages(data.total_pages || 1);
        } else {
          setMyReviews([]);
          toast.error("Unexpected review data.");
        }
      } catch (error) {
        toast.error("Failed to load your reviews.");
      }
    }
  };

    fetchHistory();
    fetchMyReviews();
  }, [tab, user, page]);

  useEffect(() => {
    const token = localStorage.getItem("token");

    // Redirect if no user or no token
    if (!user || !token) {
      toast.error("Please log in to access your profile.");
      navigate("/login");
      return;
    }

    if (user) {
      setFormData({
        fullname: user.full_name || "",
        phonenumber: user.phone_number || "",
        address: user.address || "",
      });

      setImageUrl(`http://localhost:5000/profile-image/${user.profile_pic}`);
    }
  }, [user, navigate]);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleUpdate = async (e) => {
    e.preventDefault();
    const token = localStorage.getItem("token");

    const res = await fetch("http://localhost:5000/update-profile", {
      method: "PUT",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(formData),
    });

    if (res.ok) {
      alert("Profile updated!");
      const updatedUser = {
        ...user,
        full_name: formData.fullname,
        phone_number: formData.phonenumber,
        address: formData.address,
      };
      setUser(updatedUser);
    }
  };

  const handleImageUpload = async () => {
    // Validate the file type and size
    if (!validateImageTypeAndSize(file)) {
      return;
    }

    const token = localStorage.getItem("token");
    const formData = new FormData();
    formData.append("image", file);

    const response = await fetch("http://localhost:5000/upload-profile-image", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
      },
      body: formData,
    });

    const data = await response.json();
    if (response.ok) {
      setImageUrl(`http://localhost:5000/profile-image/${data.filename}`);
      setUser({ ...user, profile_pic: data.filename });
      console.log(data);
      alert("Image Uploaded!");
      toast.success("Image uploaded successfully!");
    } else {
      alert(data.error || "failed to upload");
    }
  };

  const handleDeleteReview = async (reviewId) => {
  const token = localStorage.getItem("token");
  if (!window.confirm("Are you sure you want to delete this review?")) return;

    try {
      const res = await fetch(`http://localhost:5000/api/reviews/${reviewId}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      if (res.ok) {
        setMyReviews(myReviews.filter((review) => review.id !== reviewId));
        toast.success("Review deleted successfully.");
      } else {
        const errorData = await res.json();
        toast.error(errorData.error || "Failed to delete review.");
      }
    } catch (error) {
      console.error("Error deleting review:", error);
      toast.error("An error occurred while deleting the review.");
    }
  };

  if (!user) return <p className="p-4">Loading...</p>;

  return (
    <main className="flex w-5/6 px-8 py-4">
      <div className="w-full flex-col mx-auto p-6 bg-white shadow rounded">
        <div className="profile-header w-full flex">
          {imageUrl && (
            <div className="my-4 mr-2">
              <img
                src={imageUrl}
                alt="Profile"
                className="h-32 w-32 object-cover rounded"
              />
            </div>
          )}
          <div className="flex flex-col justify-end">
            <h3 className="text-2xl font-bold">{user.username}</h3>
            <p className="text-sm/6">{user.email}</p>
          </div>
        </div>

        <div className="flex space-x-4 mb-6 border-b mt-5 pb-2">
          <button
            className={`px-4 py-2 rounded-t font-semibold ${
              tab === "profile"
                ? "border-b-2 border-orange-500 text-orange-600"
                : "text-gray-600 hover:text-orange-500"
            }`}
            onClick={() => setTab("profile")}
          >
            Update Info
          </button>
          <button
            className={`px-4 py-2 rounded-t font-semibold ${
              tab === "history"
                ? "border-b-2 border-orange-500 text-orange-600"
                : "text-gray-600 hover:text-orange-500"
            }`}
            onClick={() => setTab("history")}
          >
            Purchase History
          </button>
          <button
            className={`px-4 py-2 rounded-t font-semibold ${
              tab === "enquiries"
                ? "border-b-2 border-orange-500 text-orange-600"
                : "text-gray-600 hover:text-orange-500"
            }`}
            onClick={() => setTab("enquiries")}
          >
            Enquiries
          </button>
        
        <button
          className={`px-4 py-2 rounded-t font-semibold ${
              tab === "myreviews"
              ? "border-b-2 border-orange-500 text-orange-600"
              : "text-gray-600 hover:text-orange-500"
          }`}
          onClick={() => setTab("myreviews")}
          >
            My Reviews
          </button>

         </div>
 

        {tab === "profile" && (
          <>
            <input
              type="file"
              accept="image/*"
              onChange={(e) => setFile(e.target.files[0])}
            />
            <button
              onClick={handleImageUpload}
              className="mt-2 py-2 px-4 bg-accent text-white rounded hover:bg-accent_focused"
            >
              Upload Profile Image
            </button>

            <form className="space-y-4 mt-4" onSubmit={handleUpdate}>
              <label className="block text-sm font-medium text-black">
                Full Name:
              </label>
              <input
                type="text"
                placeholder="Full Name"
                className="w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500"
                value={formData.fullname}
                name="fullname"
                onChange={handleChange}
              />
              <label className="block text-sm font-medium text-black">
                Phone Number:
              </label>
              <small>(Format: 1234 5678)</small>
              <input
                type="tel"
                name="phonenumber"
                placeholder="Phone number"
                pattern="[0-9]{4} [0-9]{4}"
                className="w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500"
                value={formData.phonenumber}
                onChange={handleChange}
              />
              <label className="block text-sm font-medium text-black">
                Address:
              </label>
              <input
                type="text"
                name="address"
                placeholder="Address"
                className="w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500"
                value={formData.address}
                onChange={handleChange}
              />

              <button
                type="submit"
                className="w-full py-2 rounded-md text-white font-semibold transition bg-orange-500 hover:bg-orange-600"
              >
                Update Profile
              </button>
            </form>
          </>
        )}

        {tab === "history" && (
          <div className="mt-4 space-y-6">
            {purchaseHistory.length === 0 ? (
              <p>No purchase history found.</p>
            ) : (
              purchaseHistory.map((order) => (
                <div
                  key={order.order_id}
                  className="border rounded p-4 shadow-sm bg-gray-50"
                >
                  <div className="flex justify-between items-center border-b pb-2">
                    <h4 className="font-semibold">Order #{order.order_id}</h4>
                    <span className="text-sm text-gray-600">
                      {new Date(order.order_date).toLocaleString()}
                    </span>
                  </div>

                  <div className="mt-2 space-y-2">
                    {order.items.map((item, idx) => (
                      <div
                        key={idx}
                        className="text-sm text-gray-700 pl-2 border-l-2 border-orange-200"
                      >
                        <p>
                          <strong>Product:</strong> {item.product_name}
                        </p>
                        <p>
                          <strong>Quantity:</strong> {item.quantity}
                        </p>
                        <p>
                          <strong>Price:</strong> $
                          {Number(item.price_at_purchase).toFixed(2)}
                        </p>
                      </div>
                    ))}
                  </div>

                  <div className="mt-3 text-sm text-gray-600">
                    <span>
                      <strong>Status:</strong> {order.status}
                    </span>
                    <span className="ml-4">
                      <strong>Total:</strong> $
                      {Number(order.total_amount).toFixed(2)}
                    </span>
                  </div>
                </div>
              ))
            )}
          </div>
        )}

              {tab === "myreviews" && (
          <div className="space-y-4 mt-4">
            {myReviews.length === 0 ? (
              <p>No reviews yet.</p>
            ) : (
              myReviews.map((review) => (
                <div
                  key={review.id}
                  className="border rounded p-4 shadow-sm bg-blue-50"
                >
                  <div className="flex justify-between items-center">
                    <div>
                      <h4 className="font-semibold">
                        {review.product_name}
                      </h4>
                      <p className="text-sm text-gray-600">
                        {new Date(review.created_at).toLocaleString()}
                      </p>
                    </div>
                    <button
                      onClick={() => handleDeleteReview(review.id)}
                      className="text-red-600 hover:underline text-sm"
                    >
                      Delete
                    </button>
                  </div>
                  <p className="text-yellow-500 text-sm">
                    {"★".repeat(review.rating)}{" "}
                    <span className="text-gray-300">
                      {"★".repeat(5 - review.rating)}
                    </span>
                  </p>
                  <p className="text-gray-800 mt-2">{review.text}</p>
                </div>
              ))
              
            )}
              <PaginationControls
                page={page}
                totalPages={totalPages}
                onPageChange={(newPage) => setPage(newPage)}
              />
          </div>
        )}

      </div>
        
    </main>
  );
}

export default Profile;

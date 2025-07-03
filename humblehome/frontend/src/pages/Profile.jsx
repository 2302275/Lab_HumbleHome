import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import { validateImageTypeAndSize } from "../components/validator"; // Import the validation function

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

    fetchHistory();
  }, [tab, user]);

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
              <input
                type="text"
                placeholder="Full Name"
                className="w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500"
                value={formData.fullname}
                name="fullname"
                onChange={handleChange}
              />
              <label className="block text-sm font-medium text-gray-700">
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
      </div>
    </main>
  );
}

export default Profile;

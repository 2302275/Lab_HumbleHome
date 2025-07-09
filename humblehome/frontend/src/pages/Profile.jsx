import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import { validateImageTypeAndSize } from "../components/validator"; // Import the validation function
import PropTypes from "prop-types";

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
  const [enquiries, setEnquiries] = useState([]);
  const [replyInputs, setReplyInputs] = useState({});

  useEffect(() => {
    const fetchEnquiries = async () => {
      if (tab === "enquiries" && user) {
        const token = localStorage.getItem("token");
        try {
          const res = await fetch("/api/enquiries", {
            method: "GET",
            headers: {
              Authorization: `Bearer ${token}`,
            },
          });
          const data = await res.json();
          console.log(data);
          setEnquiries(data);
        } catch (error) {
          toast.error("Failed to fetch enquiries.");
          console.error(error);
        }
      }
    };

    fetchEnquiries();
  }, [tab, user]);

  const handleReplySubmit = async (enquiryId) => {
    const token = localStorage.getItem("token");
    const message = replyInputs[enquiryId];

    if (!message) {
      toast.error("Reply message cannot be empty.");
      return;
    }

    try {
      const res = await fetch(`/api/enquiries/${enquiryId}/userreply`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ message }),
      });

      const data = await res.json();
      if (res.ok) {
        toast.success("Reply sent!");

        // Clear input
        setReplyInputs((prev) => ({ ...prev, [enquiryId]: "" }));

        // Optionally refetch enquiries to reflect new message
        setTab("reload"); // Triggers re-fetch
        setTimeout(() => setTab("enquiries"), 50);
      } else {
        toast.error(data.error || "Failed to send reply.");
      }
    } catch (error) {
      toast.error("Something went wrong.");
      console.error(error);
    }
  };

  useEffect(() => {
    const fetchHistory = async () => {
      if (tab === "history" && user) {
        var token = localStorage.getItem("token");
        try {
          const res = await fetch("/api/purchase-history", {
            method: "GET",
            headers: {
              Authorization: `Bearer ${token}`,
            },
          });
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

      setImageUrl(`uploads/image/${user.profile_pic}`);
    }
  }, [user, navigate]);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleUpdate = async (e) => {
    e.preventDefault();
    const token = localStorage.getItem("token");

    const res = await fetch("/api/update-profile", {
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
    // if (!validateImageTypeAndSize(file)) {
    //   return;
    // }

    const token = localStorage.getItem("token");
    const formData = new FormData();
    formData.append("image", file);

    try {
      const response = await fetch("/api/upload-profile-image", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: formData,
      });

      try {
        const data = await response.json();
        if (response.ok) {
          setImageUrl(`uploads/image${data.filename}`);
          setUser({ ...user, profile_pic: data.filename });
          console.log(data);
          // alert("Image Uploaded!");
          toast.success("Image uploaded successfully!");
        } else {
          // alert(data.error || "Failed to upload");
          toast.error(data.error || "Failed to upload");
        }
      } catch (jsonError) {
        toast.error("File size exceeds the maximum limit of 3MB.");
      }
    } catch (error) {
      toast.error("Failed to upload image. Please try again.");
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
                src={`api/${imageUrl}`}
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

        {tab === "enquiries" && (
          <div className="mt-4 space-y-4">
            {enquiries.length === 0 ? (
              <p>No enquiries submitted.</p>
            ) : (
              enquiries.map((enq) => (
                <div
                  key={enq.enquiry_id}
                  className="border p-4 rounded shadow-sm bg-gray-50"
                >
                  <h4 className="text-md font-semibold mb-1">{enq.subject}</h4>
                  <p className="text-sm text-gray-700 mb-1">
                    <strong>Status:</strong> {enq.status}
                  </p>
                  <p className="text-xs text-gray-500 mb-2">
                    Created: {new Date(enq.created_at).toLocaleString()}
                  </p>

                  <div className="text-sm p-2 border-l-4 border-orange-300 bg-white mb-2">
                    <strong>You:</strong> {enq.message}
                  </div>

                  {enq.messages?.map((msg) => (
                    <div
                      key={msg.message_id}
                      className={`text-sm p-2 rounded mb-2 ${
                        msg.sender_role === "admin"
                          ? "bg-blue-100 border-l-4 border-blue-400"
                          : "bg-orange-100 border-l-4 border-orange-400"
                      }`}
                    >
                      <strong>
                        {msg.sender_role === "admin" ? "Admin" : "You"}:
                      </strong>{" "}
                      {msg.message}
                      <div className="text-xs text-gray-500 mt-1">
                        {new Date(msg.created_at).toLocaleString()}
                      </div>
                    </div>
                  ))}

                  <textarea
                    rows="2"
                    placeholder="Type your reply..."
                    className="w-full p-2 border rounded mb-2"
                    value={replyInputs[enq.enquiry_id] || ""}
                    onChange={(e) =>
                      setReplyInputs((prev) => ({
                        ...prev,
                        [enq.enquiry_id]: e.target.value,
                      }))
                    }
                  />
                  <button
                    onClick={() => handleReplySubmit(enq.enquiry_id)}
                    className="px-4 py-2 text-sm text-white bg-orange-500 rounded hover:bg-orange-600"
                  >
                    Send Reply
                  </button>
                </div>
              ))
            )}
          </div>
        )}
      </div>
    </main>
  );
}

Profile.propTypes = {
  user: PropTypes.shape({
    user_id: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
    username: PropTypes.string,
    email: PropTypes.string,
    role: PropTypes.string,
    full_name: PropTypes.string,
    phone_number: PropTypes.string,
    address: PropTypes.string,
    profile_pic: PropTypes.string,
  }),
  setUser: PropTypes.func.isRequired,
};
export default Profile;

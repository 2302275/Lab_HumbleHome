import { useState, useEffect } from "react";
import toast from "react-hot-toast";
import PropTypes from "prop-types";

export default function Contact({ user }) {
  const [form, setForm] = useState({
    name: user?.username || "",
    email: user?.email || "",
    subject: "",
    message: "",
    product_id: null,
  });

  const [orders, setOrders] = useState([]); // from API
  const [selectedOrderId, setSelectedOrderId] = useState(null); // track user selection

  useEffect(() => {
    const fetchHistory = async () => {
      var token = localStorage.getItem("token");
      try {
        const res = await fetch("/api/purchase-history", {
          method: "GET",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        const data = await res.json();
        setOrders(data);
      } catch (error) {
        console.error("Failed to fetch history:", error);
        toast.error("Could not load purchase history.");
      }
    };

    fetchHistory();
  }, [user]);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const res = await fetch("/api/enquiries", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
        body: JSON.stringify(form),
      });

      const data = await res.json();
      if (res.ok) {
        toast.success("Enquiry submitted successfully!");
        setForm({
          name: user?.username || "",
          email: user?.email || "",
          subject: "",
          message: "",
          product_id: null,
        });
      } else {
        toast.error(data.error || "Submission failed");
      }
    } catch (err) {
      console.error("Enquiry error:", err);
      toast.error("Server error");
    }
  };

  return (
    <div className="max-w-xl mx-auto my-8 p-6 bg-white shadow rounded">
      <h2 className="text-2xl font-semibold mb-4">Send Us an Enquiry</h2>
      <form onSubmit={handleSubmit} className="space-y-4">
        <input
          type="text"
          name="name"
          placeholder="Your Name"
          required
          className="w-full p-2 border rounded"
          value={form.name}
          onChange={handleChange}
          disabled
        />
        <input
          type="email"
          name="email"
          placeholder="Your Email"
          required
          className="w-full p-2 border rounded"
          value={form.email}
          onChange={handleChange}
          disabled
        />
        <input
          type="text"
          name="subject"
          placeholder="Subject"
          required
          className="w-full p-2 border rounded"
          value={form.subject}
          onChange={handleChange}
        />
        <select
          className="w-full border p-2 rounded"
          value={selectedOrderId || ""}
          onChange={(e) => setSelectedOrderId(e.target.value)}
        >
          <option value="">— Select an Order —</option>
          {orders.map((order) => (
            <option key={order.order_id} value={order.order_id}>
              Order #{order.order_id} —{" "}
              {new Date(order.order_date).toLocaleDateString()}
            </option>
          ))}
        </select>

        {selectedOrderId && (
          <div className="mt-6 border p-4 rounded bg-gray-50">
            {orders
              .filter((order) => order.order_id === parseInt(selectedOrderId))
              .map((order) => (
                <div key={order.order_id}>
                  <h3 className="text-xl font-bold mb-2">
                    Order #{order.order_id} —{" "}
                    {new Date(order.order_date).toLocaleString()}
                  </h3>
                  <p>
                    Status: <span className="font-medium">{order.status}</span>
                  </p>
                  <p>
                    Total Amount:{" "}
                    <strong>${order.total_amount.toFixed(2)}</strong>
                  </p>

                  <div className="mt-4">
                    <h4 className="font-semibold mb-1">Items:</h4>
                    <ul className="space-y-2">
                      {order.items.map((item, index) => (
                        <li
                          key={index}
                          className="border p-2 rounded bg-white shadow-sm"
                        >
                          <p className="font-medium">{item.product_name}</p>
                          <p>Quantity: {item.quantity}</p>
                          <p>
                            Unit Price: ${item.price_at_purchase.toFixed(2)}
                          </p>
                          <p>
                            Total: $
                            {(item.quantity * item.price_at_purchase).toFixed(
                              2
                            )}
                          </p>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              ))}
          </div>
        )}
        <textarea
          name="message"
          placeholder="Message"
          required
          className="w-full p-2 border rounded h-32"
          value={form.message}
          onChange={handleChange}
        ></textarea>
        <button
          type="submit"
          className="bg-orange-500 text-white px-4 py-2 rounded hover:bg-orange-600"
        >
          Submit
        </button>
      </form>
    </div>
  );
}

Contact.propTypes = {
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
};

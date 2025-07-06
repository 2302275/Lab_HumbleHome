import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import PropTypes from "prop-types";

export default function Payment({ user }) {
  const [cart, setCart] = useState([]);
  const [form, setForm] = useState({
    name: "",
    cardNumber: "",
    expiry: "",
    cvv: "",
    address: "",
    city: "",
    postalCode: "",
    country: "",
  });
  const navigate = useNavigate();

  useEffect(() => {
    // console.log(user);
    const saved = localStorage.getItem("cart");
    setCart(saved ? JSON.parse(saved) : []);
  }, [user]);

  const total = cart.reduce((sum, item) => sum + item.quantity * item.price, 0);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!form.cardNumber || !form.expiry || !form.cvv) {
      toast.error("Please fill in all fields.");
      return;
    }

    const formData = {
      customer_id: user.user_id,
      cart: cart.map(({ product_id, quantity, price }) => ({
        product_id,
        quantity,
        price,
      })),
      shipping_address: `${form.address}, ${form.city}, ${form.postalCode}`,
      payment_method: "card",
    };

    try {
      const res = await fetch("/api/checkout", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Checkout failed.");
      }

      toast.success("Order placed successfully!");
      localStorage.removeItem("cart");
      window.dispatchEvent(new Event("cartUpdated"));

      setTimeout(() => {
        navigate("/");
      }, 1500);
    } catch (err) {
      console.error("Checkout error:", err);
      toast.error(err.message || "Something went wrong.");
    }
  };

  if (cart.length === 0) {
    return (
      <div className="p-8">
        <h2 className="text-2xl font-bold mb-4">Your cart is empty.</h2>
      </div>
    );
  }

  return (
    <div className="w-full flex justify-center py-8">
      <div className="w-5/6 p-8 flex md:flex-row gap-8">
        {/* Shipping + Payment Form */}
        <form
          id="checkout-form"
          onSubmit={handleSubmit}
          className="md:w-1/2 flex flex-col gap-6"
        >
          {/* Shipping */}
          <div className="bg-white flex flex-col rounded shadow p-5">
            <h2 className="text-xl font-bold mb-4">Shipping Details</h2>
            <input
              type="text"
              name="name"
              value={form.name}
              onChange={handleChange}
              placeholder="Full Name"
              className="border px-3 py-2 rounded mb-2"
              required
            />
            <input
              type="text"
              name="address"
              value={form.address}
              onChange={handleChange}
              placeholder="Street Address"
              className="border px-3 py-2 rounded mb-2"
              required
            />
            <div className="flex gap-2">
              <input
                type="text"
                name="city"
                value={form.city}
                onChange={handleChange}
                placeholder="City"
                className="border px-3 py-2 w-1/2 rounded"
                required
              />
              <input
                type="text"
                name="postalCode"
                value={form.postalCode}
                onChange={handleChange}
                placeholder="Postal Code"
                className="border px-3 py-2 w-1/2 rounded"
                required
              />
            </div>
          </div>
          <div className="bg-white rounded shadow p-5">
            <h2 className="text-xl font-bold mb-4">Payment Details</h2>
            <input
              type="text"
              name="cardNumber"
              value={form.cardNumber}
              onChange={handleChange}
              placeholder="Card Number"
              className="border px-3 w-full mb-2 py-2 rounded"
              required
            />
            <div className="flex gap-2">
              <input
                type="text"
                name="expiry"
                value={form.expiry}
                onChange={handleChange}
                placeholder="MM/YY"
                className="border px-3 py-2 rounded w-1/2"
                required
              />
              <input
                type="text"
                name="cvv"
                value={form.cvv}
                onChange={handleChange}
                placeholder="CVV"
                className="border px-3 py-2 rounded w-1/2"
                required
              />
            </div>
            <input type="hidden" name="payment_method" value="card" />
          </div>
        </form>

        <div className="md:w-1/2 flex flex-col bg-white rounded shadow p-5">
          <h2 className="text-xl font-bold mb-4">Order Summary</h2>

          <ul className="divide-y flex-grow">
            {cart.map((item) => (
              <li key={item.product_id} className="py-2 flex justify-between">
                <div>
                  <p className="font-semibold">{item.name}</p>
                  <p className="text-sm text-gray-600">
                    {item.quantity} × ${item.price.toFixed(2)}
                  </p>
                </div>
                <p className="font-semibold">
                  ${(item.quantity * item.price).toFixed(2)}
                </p>
              </li>
            ))}
          </ul>
          <div className="mt-auto pt-6">
            <div className="text-right text-lg font-bold mb-4">
              Total: ${total.toFixed(2)}
            </div>
            <button
              type="submit"
              form="checkout-form"
              className="w-full bg-accent text-white py-2 px-4 rounded hover:bg-accent_focused"
            >
              Checkout
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}


Payment.propTypes = {
  user: PropTypes.shape({
    user_id: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
    username: PropTypes.string,
    role: PropTypes.string
  }).isRequired,

  setUser: PropTypes.func.isRequired,
}

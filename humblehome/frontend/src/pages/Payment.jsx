import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";

export default function Payment() {
  const [cart, setCart] = useState([]);
  const [form, setForm] = useState({
    name: "",
    cardNumber: "",
    expiry: "",
    cvv: "",
  });
  const navigate = useNavigate();

  useEffect(() => {
    const saved = localStorage.getItem("cart");
    setCart(saved ? JSON.parse(saved) : []);
  }, []);

  const total = cart.reduce((sum, item) => sum + item.quantity * item.price, 0);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    if (!form.name || !form.cardNumber || !form.expiry || !form.cvv) {
      toast.error("Please fill in all fields.");
      return;
    }

    // Simulate a fake payment delay
    toast.success("Payment successful!");

    localStorage.removeItem("cart");
    window.dispatchEvent(new Event("cartUpdated"));

    setTimeout(() => {
      navigate("/"); // or redirect to confirmation page
    }, 1500);
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
      <div className="w-5/6 bg-white shadow p-8 rounded flex flex-col md:flex-row gap-8">
        <div className="md:w-1/2">
          <h2 className="text-xl font-bold mb-4">Payment Details</h2>
          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            <input
              type="text"
              name="name"
              value={form.name}
              onChange={handleChange}
              placeholder="Cardholder Name"
              className="border px-3 py-2 rounded"
              required
            />
            <input
              type="text"
              name="cardNumber"
              value={form.cardNumber}
              onChange={handleChange}
              placeholder="Card Number"
              className="border px-3 py-2 rounded"
              required
            />
            <div className="flex gap-4">
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
            <button
              type="submit"
              className="bg-accent text-white py-2 px-4 rounded hover:bg-green-700"
            >
              Pay ${total.toFixed(2)}
            </button>
          </form>
        </div>

        <div className="md:w-1/2">
          <h2 className="text-xl font-bold mb-4">Order Summary</h2>
          <ul className="divide-y">
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
          <div className="text-right mt-4 text-lg font-bold">
            Total: ${total.toFixed(2)}
          </div>
        </div>
      </div>
    </div>
  );
}

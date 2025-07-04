import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import toast from "react-hot-toast";

export default function Cart() {
  const [cart, setCart] = useState(() => {
    const saved = localStorage.getItem("cart");
    return saved ? JSON.parse(saved) : [];
  });

  useEffect(() => {
    localStorage.setItem("cart", JSON.stringify(cart));
    window.dispatchEvent(new Event("cartUpdated")); // Optional: if something else is listening
  }, [cart]);

  const increment = (productId) => {
    setCart((prevCart) =>
      prevCart.map((item) =>
        item.product_id === productId
          ? { ...item, quantity: item.quantity + 1 }
          : item
      )
    );
  };

  const decrement = (productId) => {
    setCart((prevCart) =>
      prevCart
        .map((item) =>
          item.product_id === productId
            ? { ...item, quantity: item.quantity - 1 }
            : item
        )
        .filter((item) => item.quantity > 0)
    );
  };

  const removeItem = (productId) => {
    setCart((prevCart) =>
      prevCart.filter((item) => item.product_id !== productId)
    );
    toast.success("Item removed from cart");
  };

  const total = cart.reduce((sum, item) => sum + item.quantity * item.price, 0);

  if (cart.length === 0) {
    return (
      <div className="p-8">
        <h2 className="text-2xl font-bold mb-4">Your Cart</h2>
        <p className="mb-4">Your cart is empty.</p>
        <Link to="/">
          <button className="bg-blue-500 text-white px-4 py-2 rounded">
            ← Continue Shopping
          </button>
        </Link>
      </div>
    );
  }

  return (
    <main className="w-full justify-center flex-col items-center">
      <div className="w-full flex justify-center items-center">
        <div className="w-5/6 px-8 py-4">
          <div className="p-4 bg-white mb-4 shadow-sm rounded flex items-center justify-between">
            <h2 className="text-2xl font-bold">Shopping Cart</h2>
            <Link to="/">
              <button className="bg-accent text-white px-4 py-2 rounded">
                ← Continue Shopping
              </button>
            </Link>
          </div>

          {cart.length === 0 ? (
            <div className="p-4 bg-white rounded shadow-sm">
              <p>Your cart is empty.</p>
            </div>
          ) : (
            <div className="overflow-x-auto bg-white shadow-sm rounded p-4">
              <table className="min-w-full table-auto text-left text-sm">
                <thead>
                  <tr className="border-b font-semibold">
                    <th className="px-4 py-2">Image</th>
                    <th className="px-4 py-2">Product</th>
                    <th className="px-4 py-2">Price</th>
                    <th className="px-4 py-2">Quantity</th>
                    <th className="px-4 py-2">Subtotal</th>
                    <th className="px-4 py-2">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {cart.map((item) => (
                    <tr key={item.product_id} className="border-b">
                      <td className="px-4 py-2">
                        <img
                          src={`http://localhost:5000/${item.thumbnail}`}
                          alt={item.name}
                          className="w-16 h-16 object-cover rounded"
                        />
                      </td>
                      <td className="px-4 py-2">{item.name}</td>
                      <td className="px-4 py-2">${item.price.toFixed(2)}</td>
                      <td className="px-4 py-2">
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => decrement(item.product_id)}
                            className="bg-gray-300 px-2 rounded"
                          >
                            −
                          </button>
                          <span>{item.quantity}</span>
                          <button
                            onClick={() => increment(item.product_id)}
                            className="bg-gray-300 px-2 rounded"
                          >
                            +
                          </button>
                        </div>
                      </td>
                      <td className="px-4 py-2">
                        ${(item.quantity * item.price).toFixed(2)}
                      </td>
                      <td className="px-4 py-2">
                        <button
                          onClick={() => removeItem(item.product_id)}
                          className="text-red-500 hover:underline"
                        >
                          Remove
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>

              <div className="text-right mt-6">
                <p className="text-xl font-bold">Total: ${total.toFixed(2)}</p>
                <Link to="/payment">
                  <button className="bg-accent text-white px-6 py-2 mt-4 rounded">
                    Proceed to Checkout
                  </button>
                </Link>
              </div>
            </div>
          )}
        </div>
      </div>
    </main>
  );
}

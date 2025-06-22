import { useEffect, useState } from "react";
import { Link } from "react-router-dom";

const Header = ({ user, onLogout }) => {
  const [cartCount, setCartCount] = useState(0);

  useEffect(() => {
    const updateCartCount = () => {
      const cart = JSON.parse(localStorage.getItem("cart")) || [];
      const count = cart.reduce((sum, item) => sum + item.quantity, 0);
      setCartCount(count);
    };

    updateCartCount();
    window.addEventListener("cartUpdated", updateCartCount);

    return () => {
      window.removeEventListener("cartUpdated", updateCartCount);
    };
  }, []);

  return (
    <header className="flex w-full p-4 justify-center items-center border-b shadow-sm bg-page">
      <div className="w-5/6 flex justify-between items-center">
        <div className="text-xl font-bold text-accent">
          <a href="/">HumbleHome</a>
        </div>
        <form className="flex w-1/2">
          <div className="relative w-full">
            <div className="absolute inset-y-0 start-0 flex items-center ps-3 pointer-events-none">
              <svg
                className="w-4 h-4 text-gray-500 dark:text-gray-400"
                aria-hidden="true"
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 21 21"
              >
                <path
                  stroke="currentColor"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M11.15 5.6h.01m3.337 1.913h.01m-6.979 0h.01M5.541 11h.01M15 15h2.706a1.957 1.957 0 0 0 1.883-1.325A9 9 0 1 0 2.043 11.89 9.1 9.1 0 0 0 7.2 19.1a8.62 8.62 0 0 0 3.769.9A2.013 2.013 0 0 0 13 18v-.857A2.034 2.034 0 0 1 15 15Z"
                />
              </svg>
            </div>
            <input
              type="text"
              className="bg-black-100 border text-gray-900 text-sm rounded-lg block w-full ps-10 p-2.5 dark:bg-white dark:placeholder-gray-400"
              placeholder="Search..."
              required
            />
          </div>
          <button
            type="submit"
            className="inline-flex items-center py-2.5 px-3 ms-2 text-sm font-medium text-white bg-accent rounded-lg hover:bg-blue-800 focus:ring-4 focus:outline-none focus:ring-accent_focused dark:bg-accent dark:hover:bg-accent_focused dark:focus:ring-accent_focused"
          >
            <svg
              className="w-4 h-4 me-2"
              aria-hidden="true"
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 20 20"
            >
              <path
                stroke="currentColor"
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="m19 19-4-4m0-7A7 7 0 1 1 1 8a7 7 0 0 1 14 0Z"
              />
            </svg>
            Search
          </button>
        </form>
        <div className="flex items-center gap-4">
          {user ? (
            <>
              {user.role === "admin" && (
                <Link to="/admin" className="font-bold text-red-600">
                  Admin Dashboard
                </Link>
              )}
              <Link
                to="/profile"
                className="text-accent text-accent hover:underline"
              >
                {user.username}
              </Link>
              <button
                onClick={onLogout}
                className="text-accent hover:underline"
              >
                Logout
              </button>
              <button
                onClick={() => (window.location.href = "/cart")} // or use navigate()
                className="relative text-white bg-accent px-4 py-2 rounded hover:bg-accent_focused"
              >
                🛒 Cart
                {cartCount > 0 && (
                  <span className="absolute -top-2 -right-2 text-xs bg-red-600 text-white rounded-full px-2">
                    {cartCount}
                  </span>
                )}
              </button>
            </>
          ) : (
            <>
              <Link to="/login" className="text-accent hover:underline">
                Login
              </Link>
              <Link to="/register" className="text-accent hover:underline">
                Register
              </Link>
            </>
          )}
        </div>
      </div>
    </header>
  );
};

export default Header;

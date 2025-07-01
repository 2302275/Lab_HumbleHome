import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import SearchBar from "../components/SearchBar";
import { useRef } from "react";

const Header = ({ user, onLogout }) => {
  const [cartCount, setCartCount] = useState(0);
  const [query, setQuery] = useState("");
  const [results, setResults] = useState([]);
  const navigate = useNavigate();
  const typingTimeoutRef = useRef(null);

  useEffect(() => {
    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
    }

    typingTimeoutRef.current = setTimeout(() => {
      if (query.trim() === "") {
        setResults([]);
        return;
      }

      const fetchResults = async () => {
        try {
          const res = await fetch(
            `http://localhost:5000/api/search?q=${encodeURIComponent(query)}`
          );
          const data = await res.json();
          setResults(data);
        } catch (err) {
          console.error("Search failed", err);
        }
      };

      fetchResults();
    }, 300); // you probably meant 300ms, not 50

    return () => {
      clearTimeout(typingTimeoutRef.current);
    };
  }, [query]);

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
        <form className="flex w-1/2" onSubmit={(e) => e.preventDefault()}>
          <SearchBar />
        </form>
        <div className="flex items-center gap-4">
          {user ? (
            user.role === "admin" ? (
              // Admin view
              <>
                <Link to="/admin" className="font-bold text-red-600">
                  Admin Dashboard
                </Link>
                <button
                  onClick={onLogout}
                  className="text-accent hover:underline"
                >
                  Logout
                </button>
              </>
            ) : (
              // Normal user view
              <>
                <Link to="/profile" className="text-accent hover:underline">
                  {user.username}
                </Link>
                <button
                  onClick={onLogout}
                  className="text-accent hover:underline"
                >
                  Logout
                </button>
                <button
                  onClick={() => navigate("/cart")}
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
            )
          ) : (
            // Not logged in
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

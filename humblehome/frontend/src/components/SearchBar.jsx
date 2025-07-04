import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";

const SearchBar = () => {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState([]);
  const [typingTimeout, setTypingTimeout] = useState(null);
  const [loading, setLoading] = useState(false);
  const searchRef = useRef(null);
  const navigate = useNavigate();

  // Debounced search
  useEffect(() => {
    if (typingTimeout) clearTimeout(typingTimeout);

    const timeout = setTimeout(() => {
      if (query.trim() === "") {
        setResults([]);
        setLoading(false);
        return;
      }

      const fetchResults = async () => {
        setLoading(true);
        try {
          const res = await fetch(`http://localhost:5000/api/search?q=${encodeURIComponent(query)}`);
          const data = await res.json();
          console.log(data);
          setResults(data);
        } catch (err) {
          console.error("Search failed", err);
          setResults([]);
        } finally {
          setLoading(false);
        }
      };

      fetchResults();
    }, 300);

    setTypingTimeout(timeout);
    return () => clearTimeout(timeout);
  }, [query]);

  // Close dropdown on outside click
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (searchRef.current && !searchRef.current.contains(event.target)) {
        setResults([]);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Highlight match
  const highlightMatch = (text) => {
    const parts = text.split(new RegExp(`(${query})`, "gi"));
    return parts.map((part, i) =>
      part.toLowerCase() === query.toLowerCase() ? (
        <span key={i} className="font-bold bg-yellow-200 rounded-sm">
          {part}
        </span>
      ) : (
        part
      )
    );
  };

  return (
    <div className="relative w-full" ref={searchRef}>
      <input
        type="text"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        className="bg-black-100 border text-gray-900 text-sm rounded-lg block w-full ps-10 p-2.5 dark:bg-white dark:placeholder-gray-400"
        placeholder="Search..."
      />

      {loading && (
        <div className="absolute right-2 top-2">
          <div className="animate-spin rounded-full h-4 w-4 border-t-2 border-accent border-r-transparent"></div>
        </div>
      )}

      {results.length > 0 && (
        <ul className="absolute z-10 mt-1 bg-white border w-full shadow-lg rounded-md max-h-60 overflow-y-auto">
          {results.map((item) => (
            <li
              key={item.id}
              className="px-4 py-2 hover:bg-gray-100 cursor-pointer"
              onClick={() => {
                navigate(`/product/${item.id}`);
                setQuery("");
                setResults([]);
              }}
            >
              {highlightMatch(item.name)}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default SearchBar;
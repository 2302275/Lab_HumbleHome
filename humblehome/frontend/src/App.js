import { useState, useEffect } from "react";
import Header from "./components/Header";
import ProductCard from "./components/ProductCard";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import ProductDetail from "./pages/ProductDetail";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Profile from "./pages/Profile";
import AdminDashboard from "./pages/AdminDashboard.jsx";

export default function App() {
  const [products, setProducts] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [user, setUser] = useState(null);

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const response = await fetch("http://localhost:5000/api/products");
        const data = await response.json();
        console.log(data);
        setProducts(data);
      } catch (error) {
        console.error("Error fetching products:", error);
      }
    };

    fetchProducts();
  }, []);

  const fetchProfile = async () => {
    const token = localStorage.getItem("token");
    if (!token) return;

    const res = await fetch("http://localhost:5000/me", {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    const data = await res.json();
    if (res.ok) {
      setUser(data.user);
      console.log(data.user);
    } else {
      localStorage.removeItem("token");
    }
  };

  useEffect(() => {
    fetchProfile();
  }, []);

  const filteredProducts = selectedCategory
    ? products.filter((p) => p.tag === selectedCategory)
    : products;

  return (
    <Router>
      <div className="w-full flex items-center flex-col bg-page min-h-screen">
        <Header
          user={user}
          onLogout={() => {
            localStorage.removeItem("token");
            setUser(null);
          }}
        />
        <Routes>
          <Route
            path="/"
            element={
              <main className="w-full">
                <div className="relative w-full h-72 bg-gray-200 flex items-center justify-center text-center">
                  <h1 className="text-5xl font-light">HumbleHome</h1>
                </div>
                <div className="flex w-5/6 px-8 py-4">
                  <aside className="w-1/4 pr-8">
                    <div class="max-w-sm rounded bg-white rounded overflow-hidden shadow-lg">
                      <div class="px-6 py-4">
                        <h2 className="font-bold text-md mb-2">Categories</h2>
                        <div className="flex flex-col gap-2">
                          <button
                            onClick={() => setSelectedCategory(null)}
                            className={`text-left py-2 px-4 rounded shadow ${
                              selectedCategory === null
                                ? "bg-primary font-bold text-page"
                                : "hover:bg-gray-100"
                            }`}
                          >
                            All
                          </button>
                          <button
                            onClick={() => setSelectedCategory("Cups")}
                            className={`text-left py-2 px-4 rounded shadow ${
                              selectedCategory === "Cups"
                                ? "bg-primary font-bold text-page"
                                : "hover:bg-gray-100"
                            }`}
                          >
                            Cups
                          </button>
                          <button
                            onClick={() => setSelectedCategory("Bowls")}
                            className={`text-left py-2 px-4 rounded shadow ${
                              selectedCategory === "Bowls"
                                ? "bg-primary font-bold text-page"
                                : "hover:bg-gray-100"
                            }`}
                          >
                            Bowls
                          </button>
                        </div>
                      </div>
                    </div>
                  </aside>
                  <section className="w-3/4 grid grid-cols-3 gap-6">
                    {filteredProducts.map((product, index) => (
                      <ProductCard
                        key={product.id}
                        product={{ ...product, id: index }}
                      />
                    ))}
                  </section>
                </div>
              </main>
            }
          />
          <Route
            path="/product/:id"
            element={<ProductDetail products={products} />}
          />
          <Route path="/register" element={<Register />} />
          <Route path="/login" element={<Login setUser={setUser} />} />
          <Route
            path="/profile"
            element={<Profile user={user} setUser={setUser} />}
          />
          <Route
            path="/admin"
            element={<AdminDashboard user={user} setUser={setUser} />}
          />
        </Routes>
      </div>
    </Router>
  );
}

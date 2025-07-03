import { useState, useEffect } from "react";
import { Toaster } from "react-hot-toast";
import Header from "./components/Header";
import ProductCard from "./components/ProductCard";
import { Routes, Route } from "react-router-dom";

import AdminRoute from "./components/AdminRoute";
import UserRoute from "./components/UserRoute";

import ProductDetail from "./pages/ProductDetail";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Profile from "./pages/Profile";
import AdminDashboard from "./pages/AdminDashboard.jsx";
import Cart from "./pages/Cart.jsx";
import Payment from "./pages/Payment.jsx";
import AdminLogin from "./pages/AdminLogin.jsx";
import ForgotPassword from "./pages/ForgotPassword.jsx";

export default function App() {
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState(null);

  const [user, setUser] = useState(null);
  const [loadingUser, setLoadingUser] = useState(true);

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const response = await fetch(
          "http://localhost:5000/api/products/active"
        );
        const data = await response.json();
        console.log(data);
        setProducts(data);
      } catch (error) {
        console.error("Error fetching products:", error);
      }
    };

    fetchProducts();
  }, []);

  const fetchCategories = async () => {
    try {
      const response = await fetch("http://localhost:5000/api/categories");
      const data = await response.json();
      // console.log(data);
      setCategories(data);
    } catch (error) {
      console.error("Error fetching categories:", error);
    }
  };

  const fetchProfile = async () => {
    const token = localStorage.getItem("token");
    if (!token) {
      setLoadingUser(false);
      return;
    }

    try {
      const res = await fetch("http://localhost:5000/me", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const data = await res.json();
      if (res.ok) {
        setUser(data.user);
      } else {
        localStorage.removeItem("token");
      }
    } catch (err) {
      console.error("Profile fetch error:", err);
    } finally {
      setLoadingUser(false); // Always run this
    }
  };

  useEffect(() => {
    fetchProfile();
    fetchCategories();
  }, []);

  const filteredProducts = selectedCategory
    ? products.filter((p) => p.category === selectedCategory)
    : products;

  return (
    <>
      <Toaster position="top-right" reverseOrder={false} />
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
              <main className="w-full justify-center flex-col items-center">
                <div className="relative w-full h-72 bg-gray-200 flex items-center justify-center text-center">
                  <h1 className="text-5xl font-light">HumbleHome</h1>
                </div>
                <div className="w-full flex justify-center items-center">
                  <div className="w-5/6 px-8 py-4 flex">
                    <aside className="w-1/4 pr-8">
                      <div className="max-w-sm rounded bg-white rounded overflow-hidden shadow-lg">
                        <div className="px-6 py-4">
                          <h2 className="font-bold text-md mb-2">Categories</h2>
                          <div className="flex flex-col gap-2">
                            {categories.map((category) => (
                              <button
                                key={category.id || category.name} // Use ID if available
                                onClick={() =>
                                  setSelectedCategory(category.name)
                                }
                                className={`text-left py-2 px-4 rounded shadow ${
                                  selectedCategory === category.name
                                    ? "bg-accent font-bold text-page"
                                    : "hover:bg-gray-100"
                                }`}
                              >
                                {category.name}
                              </button>
                            ))}
                          </div>
                        </div>
                      </div>
                    </aside>
                    <section className="w-3/4 grid grid-cols-3 gap-6">
                      {filteredProducts.map((product, index) => (
                        <ProductCard
                          key={product.index}
                          product={{ ...product, id: product.id }}
                        />
                      ))}
                    </section>
                  </div>
                </div>
              </main>
            }
          />
          <Route
            path="/product/:id"
            element={<ProductDetail products={products} user={user} />}
          />
          <Route path="/register" element={<Register />} />
          <Route
            path="/login"
            element={<Login setUser={setUser} fetchProfile={fetchProfile} />}
          />
          <Route
            path="/forgotpassword"
            element={<ForgotPassword setUser={setUser} fetchProfile={fetchProfile} />}
          />
          <Route
            path="/admin"
            element={
              <AdminRoute user={user} loading={loadingUser} >
                <AdminDashboard user={user} setUser={setUser} />
              </AdminRoute>
            }
          />

          <Route
            path="/cart"
            element={
              <UserRoute user={user} loading={loadingUser}>
                <Cart user={user} />
              </UserRoute>
            }
          />

          <Route
            path="/profile"
            element={
              <UserRoute user={user} loading={loadingUser}>
                <Profile user={user} setUser={setUser} />
              </UserRoute>
            }
          />

          <Route
            path="/payment"
            element={
              <UserRoute user={user} loading={loadingUser}>
                <Payment user={user} />
              </UserRoute>
            }
          />

          <Route
            path="/hhpanel"
            element={
              <AdminLogin setUser={setUser} fetchProfile={fetchProfile} />
            }
          />
        </Routes>
      </div>
    </>
  );
}

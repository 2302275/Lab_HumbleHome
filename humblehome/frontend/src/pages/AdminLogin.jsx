import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { validateUsernameOrEmail } from "../components/validator";
import toast from "react-hot-toast";
import PropTypes from "prop-types";

export default function AdminLogin({ setUser, fetchProfile }) {
  const [password, setPassword] = useState("");
  const [login, setLogin] = useState("");
  const navigate = useNavigate();

  const handleAdminLogin = async (e) => {
    e.preventDefault();

    // Validate username or email input
    const validationError = validateUsernameOrEmail(login);
    if (validationError) {
      toast.error(validationError || "Error Logging in.")
      return;
    }

    try {
      const res = await fetch("/api/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ login, password }),
      });

      const data = await res.json();
      if (res.ok) {
        if (data.user.role !== "admin") {
          toast.error("Access denied. Not an admin.");
          return;
        }
        localStorage.setItem("token", data.token);
        setUser(data.user);
        toast.success("Admin logged in successfully");
        await fetchProfile();
        navigate("/"); // Redirect to admin dashboard
      } else {
        toast.error(data.message || "Login failed");
      }
    } catch (err) {
      console.log(err);
      toast.error("Server error. Please try again.");
    }
  };

  return (
    <div className="py-10 flex items-center justify-center px-4">
      <div className="bg-white w-full max-w-xl p-8 rounded-lg shadow-md">
        <h2 className="text-2xl font-semibold text-center mb-6">Admin Login</h2>
        <form className="space-y-4" onSubmit={handleAdminLogin}>
          <input
            type="text"
            placeholder="Username or email"
            value={login}
            className="w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500"
            onChange={(e) => setLogin(e.target.value)}
          />
          <input
            type="password"
            placeholder="Password"
            className="w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500"
            onChange={(e) => setPassword(e.target.value)}
          />

          <button
            type="submit"
            className={`w-full py-2 rounded-md text-white font-semibold transition bg-orange-500 hover:bg-orange-600
                        `}
          >
            Login
          </button>
        </form>
      </div>
    </div>
  );
}

AdminLogin.propTypes = {
  setUser: PropTypes.func.isRequired,
  fetchProfile: PropTypes.func.isRequired,
};


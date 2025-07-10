import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { validateUsername, validateEmail, validatePassword } from "../components/validator"; // Import the validation function
import toast from "react-hot-toast";

function Register() {
  const [accepted, setAccepted] = useState(false);
  const navigate = useNavigate();
  // Form Variables
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [username, setUsername] = useState("");
  const [message, setMessage] = useState("");

  const handleRegister = async (e) => {
    e.preventDefault();

    // Clear previous message to force re-render (flash effect)
    setMessage({ text: "", type: "" });

    //Username validation
    const usernameError = validateUsername(username);
    const emailError = validateEmail(email);
    if (usernameError) {
      setMessage({ text: usernameError, type: "error" });
      setTimeout(() => {
        setMessage({ text: usernameError, type: "error" });
      }, 10); // Short delay to force re-render
      return;
    }

    // Password validation
    const passwordError = validatePassword(password);
    if (passwordError) {
      setTimeout(() => {
        setMessage({ text: passwordError, type: "error" });
      }, 10); // Short delay to force re-render
      return;
    }
    if (emailError) {
      setMessage({ text: emailError, type: "error" });
      return;
    }
    try {
      const response = await fetch("/api/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, email, password }),
      });
      const data = await response.json();

      if (response.ok) {
        toast.success("Successfully registered!");
        navigate("/login");
      } else {
        // setMessage({ text: data.message || 'Registration failed.', type: 'error' });
        toast.error(data.message || "Registration failed.");
      }
    } catch (e) {
      console.error("Fetch error:", e);
      toast.error("Registration failed. Please try again later.");
    }
  };

  return (
    <div className="py-10 flex items-center justify-center px-4">
      <div className="bg-white w-full max-w-xl p-8 rounded-lg shadow-md">
        <h2 className="text-2xl font-semibold text-center mb-6">
          Create an account
        </h2>
        {message.text && (
          <p
            className={`text-center text-sm mt-4 mb-4 ${
              message.type === "success" ? "text-green-600" : "text-red-500"
            }`}
          >
            {message.text}
          </p>
        )}
        <form className="space-y-4" onSubmit={handleRegister}>
          <input
            type="text"
            placeholder="Username"
            value={username}
            className="w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500"
            onChange={(e) => setUsername(e.target.value)}
            required
            name = "username"
          />
          <input
            type="email"
            placeholder="E-mail"
            className="w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500"
            onChange={(e) => setEmail(e.target.value)}
            required
            name = "email"
          />
          <input
            type="password"
            placeholder="Password"
            className="w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500"
            onChange={(e) => setPassword(e.target.value)}
            required
            name="password"
          />

          <button
            type="submit"
            className={`register-btn w-full py-2 rounded-md text-white font-semibold transition bg-orange-500 hover:bg-orange-600`}
          >
            Create an Account
          </button>
        </form>

        <p className="text-center text-sm mt-6">
          Already have an account?{" "}
          <a href="/Login" className="text-black underline">
            Log In
          </a>
        </p>
      </div>
    </div>
  );
}

export default Register;

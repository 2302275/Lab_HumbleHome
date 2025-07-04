// ResetPasswordPage.js
import { useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import toast from "react-hot-toast";

export default function ResetPasswordPage() {
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [searchParams] = useSearchParams();
  const token = searchParams.get("token");
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (newPassword !== confirmPassword) {
      toast.error("Passwords don't match");
      return;
    }
    
    try {
      const response = await fetch("http://localhost:5000/resetpassword", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token, new_password: newPassword }),
      });
      
      const data = await response.json();
      
      if (response.ok) {
        navigate("/reset-password/confirm", { state: { fromReset: true } });
      } else {
        toast.error(data.message || "Password reset failed");
      }
    } catch (error) {
      toast.error("An error occurred. Please try again.");
    }
  };

  return (
    <div className="py-10 flex items-center justify-center px-4">
      <div className="bg-white w-full max-w-xl p-8 rounded-lg shadow-md">
        <h2 className="text-2xl font-semibold text-center mb-6">Reset Password</h2>
        
        <form className="space-y-4" onSubmit={handleSubmit}>
          <input
            type="password"
            placeholder="New Password"
            value={newPassword}
            className="w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500"
            onChange={(e) => setNewPassword(e.target.value)}
            required
          />
          
          <input
            type="password"
            placeholder="Confirm New Password"
            value={confirmPassword}
            className="w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500"
            onChange={(e) => setConfirmPassword(e.target.value)}
            required
          />
          
          <button
            type="submit"
            className="w-full py-2 rounded-md text-white font-semibold transition bg-orange-500 hover:bg-orange-600"
          >
            Reset Password
          </button>
        </form>
      </div>
    </div>
  );
}
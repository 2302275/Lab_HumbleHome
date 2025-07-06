import { useState } from "react";
import { toast } from "react-hot-toast";
import { validateEmail } from "../components/validator";
import { useNavigate } from "react-router-dom";

export default function ForgotPassword() {
  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [emailSent, setEmailSent] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    const error = validateEmail(email);
    if (error) {
      toast.error(error);
      return;
    }

    setIsLoading(true);
    try {
      const response = await fetch('/api/forgotpassword', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email }),
      });

      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.message || 'Something went wrong');
      }

      toast.success(data.message);
      setEmailSent(true);
    } catch (error) {
      toast.error(error.message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="py-10 flex items-center justify-center px-4">
      <div className="bg-white w-full max-w-xl p-8 rounded-lg shadow-md">
        <h2 className="text-2xl font-semibold text-center mb-6">Reset Password</h2>
        
        {emailSent ? (
          <div className="text-center space-y-4">
            <p className="text-green-600">Password reset email sent! Please check your inbox.</p>
            <p className="text-sm">
              Didn&apos;t receive the email? Check your spam folder or{" "}
              <button 
                onClick={() => setEmailSent(false)}
                className="text-orange-500 underline hover:text-orange-600"
              >
                try again
              </button>.
            </p>
            <button
              onClick={() => navigate('/login')}
              className="mt-4 w-full py-2 rounded-md text-white font-semibold transition bg-orange-500 hover:bg-orange-600"
            >
              Back to Login
            </button>
          </div>
        ) : (
          <form className="space-y-4" onSubmit={handleSubmit}>
            <div className="space-y-2">
              <label htmlFor="email" className="block text-sm font-medium">
                Email Address
              </label>
              <input
                type="email"
                id="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500"
                required
              />
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className={`w-full py-2 rounded-md text-white font-semibold transition bg-orange-500 hover:bg-orange-600 ${
                isLoading ? 'opacity-70 cursor-not-allowed' : ''
              }`}
            >
              {isLoading ? 'Sending...' : 'Send Reset Link'}
            </button>

            <div className="text-center pt-4">
              <button
                onClick={() => navigate('/login')}
                className="text-sm text-black underline hover:text-orange-500"
              >
                Remember your password? Login
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
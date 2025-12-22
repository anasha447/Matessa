import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import { useDispatch, useSelector } from "react-redux";
import { registerUser, clearError } from "../../redux/slices/authSlice";

const RegisterPage = () => {
  // Local Form State
  const [username, setUsername] = useState(""); // Mapped to 'username' for Backend DTO
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const navigate = useNavigate();
  const dispatch = useDispatch();

  // Access Redux Store
  const { loading, error, registrationSuccess, isAuthenticated } = useSelector(
    (state) => state.auth
  );

  // 1. Redirect if already logged in
  useEffect(() => {
    if (isAuthenticated) {
      navigate("/profile");
    }
  }, [isAuthenticated, navigate]);

  // 2. Handle Registration Success or Error
  useEffect(() => {
    if (registrationSuccess) {
      toast.success("Registration successful! Please login.");
      dispatch(clearError()); // Reset state flags
      navigate("/login");
    }

    if (error) {
      toast.error(error);
      dispatch(clearError()); // Clear error after showing toast
    }
  }, [registrationSuccess, error, navigate, dispatch]);

  // 3. Form Submit Handler
  const submitHandler = (e) => {
    e.preventDefault();

    // Client-side validation
    if (password !== confirmPassword) {
      toast.error("Passwords do not match");
      return;
    }

    if (password.length < 6) {
      toast.error("Password must be at least 6 characters");
      return;
    }

    // Dispatch Register Action
    // Note: Backend likely expects 'username', not 'name'
    const userData = {
      username, 
      email,
      password,
      role: ["user"] // Optional: Send default role if backend requires it
    };

    dispatch(registerUser(userData));
  };

  return (
    <div className="flex justify-center items-center min-h-screen bg-[var(--color-craemy)]">
      <div className="w-full max-w-md bg-white shadow-2xl rounded-2xl p-10">
        <h1 className="text-4xl font-bold mb-8 text-center text-[var(--color-darkgreen)] font-heading">
          Create Account
        </h1>
        
        <form onSubmit={submitHandler}>
          {/* Username Field */}
          <div className="mb-6">
            <label
              className="block text-[var(--color-darkgreen)] text-lg font-bold mb-2 font-heading"
              htmlFor="name"
            >
              Name
            </label>
            <input
              className="shadow-sm appearance-none border rounded-lg w-full py-3 px-4 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
              id="name"
              type="text"
              placeholder="Your Name"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              required
            />
          </div>

          {/* Email Field */}
          <div className="mb-6">
            <label
              className="block text-[var(--color-darkgreen)] text-lg font-bold mb-2 font-heading"
              htmlFor="email"
            >
              Email
            </label>
            <input
              className="shadow-sm appearance-none border rounded-lg w-full py-3 px-4 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
              id="email"
              type="email"
              placeholder="you@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>

          {/* Password Field */}
          <div className="mb-6">
            <label
              className="block text-[var(--color-darkgreen)] text-lg font-bold mb-2 font-heading"
              htmlFor="password"
            >
              Password
            </label>
            <input
              className="shadow-sm appearance-none border rounded-lg w-full py-3 px-4 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
              id="password"
              type="password"
              placeholder="******************"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>

          {/* Confirm Password Field */}
          <div className="mb-8">
            <label
              className="block text-[var(--color-darkgreen)] text-lg font-bold mb-2 font-heading"
              htmlFor="confirmPassword"
            >
              Confirm Password
            </label>
            <input
              className="shadow-sm appearance-none border rounded-lg w-full py-3 px-4 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
              id="confirmPassword"
              type="password"
              placeholder="******************"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              required
            />
          </div>

          {/* Submit Button */}
          <div className="flex items-center justify-center mb-6">
            <button
              className={`bg-[var(--color-orange)] text-white font-bold py-3 px-8 rounded-full focus:outline-none focus:shadow-outline text-lg transition-all ${
                loading ? "opacity-50 cursor-not-allowed" : "hover:opacity-90"
              }`}
              type="submit"
              disabled={loading}
            >
              {loading ? "Registering..." : "Register"}
            </button>
          </div>

          {/* Login Link */}
          <div className="text-center">
            <Link
              className="inline-block align-baseline font-bold text-lg text-[var(--color-green)] hover:text-[var(--color-lightgreen)]"
              to="/login"
            >
              Already have an account? Login
            </Link>
          </div>
        </form>
      </div>
    </div>
  );
};

export default RegisterPage;
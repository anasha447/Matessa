import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { toast } from "react-toastify";
import { loginUser, clearError } from "../../redux/slices/authSlice";
import { fetchCart, clearCart } from "../../redux/slices/cartSlice";
import { isAdminUser } from "../../utils/authHelper"; 

const LoginPage = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const { user, isAuthenticated, loading, error } = useSelector((state) => state.auth);

  // 1. Handle "Already Logged In" Redirect
  // Only run this if the user lands on /login but is ALREADY authenticated from a previous session
  useEffect(() => {
    if (isAuthenticated && user) {
      if (isAdminUser(user)) {
        navigate("/admin/dashboard", { replace: true });
      } else {
        navigate("/", { replace: true });
      }
    }
    
    // Cleanup errors on unmount
    return () => { dispatch(clearError()); }
  }, [isAuthenticated, user, navigate, dispatch]);

  // 2. Handle Login Submission (Manual Login)
  const submitHandler = async (e) => {
    e.preventDefault();
    
    // Dispatch Login Action
    const resultAction = await dispatch(loginUser({ email, password }));

    if (loginUser.fulfilled.match(resultAction)) {
        const userData = resultAction.payload;
        toast.success(`Welcome back, ${userData.username}!`);

        // ✅ CRITICAL: Check Role Immediately using the Payload (Fresh Data)
        if (isAdminUser(userData)) {
            dispatch(clearCart()); // Admins don't need a shopping cart
            console.log("Admin Logged In -> Going to Dashboard");
            navigate("/admin/dashboard");
        } else {
            dispatch(fetchCart()); // Users get their cart
            console.log("User Logged In -> Going to Home");
            navigate("/"); 
        }
    } else {
        toast.error(resultAction.payload || "Login failed");
    }
  };

  return (
    <div className="flex justify-center items-center min-h-screen bg-[var(--color-craemy)]">
      <div className="w-full max-w-md bg-white shadow-2xl rounded-2xl p-10">
        <h1 className="text-4xl font-bold mb-8 text-center text-[var(--color-darkgreen)] font-heading">
          Welcome Back
        </h1>
        
        {error && <div className="mb-4 bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded text-center">{error}</div>}

        <form onSubmit={submitHandler}>
          <div className="mb-6">
            <label className="block text-[var(--color-darkgreen)] text-lg font-bold mb-2">Email</label>
            <input
              className="shadow-sm border rounded-lg w-full py-3 px-4 focus:outline-none focus:ring-2 focus:ring-[var(--color-green)]"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>
          <div className="mb-6">
            <label className="block text-[var(--color-darkgreen)] text-lg font-bold mb-2">Password</label>
            <input
              className="shadow-sm border rounded-lg w-full py-3 px-4 focus:outline-none focus:ring-2 focus:ring-[var(--color-green)]"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>
          
          <div className="flex items-center justify-center mb-6">
            <button
              className={`bg-[var(--color-orange)] text-white font-bold py-3 px-8 rounded-full transition-all ${loading ? "opacity-50 cursor-not-allowed" : "hover:opacity-90"}`}
              type="submit"
              disabled={loading}
            >
              {loading ? "Signing In..." : "Sign In"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default LoginPage;
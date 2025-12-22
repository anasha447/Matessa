import React, { useState } from "react";
import axios from "axios";
import { useParams, useNavigate } from "react-router-dom";

const API_URL = "http://localhost:5000/api";

const ResetPasswordPage = () => {
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [message, setMessage] = useState("");
  const { token } = useParams();
  const navigate = useNavigate();

  const submitHandler = async (e) => {
    e.preventDefault();
    if (password !== confirmPassword) {
      setMessage("Passwords do not match");
      return;
    }
    setMessage("");
    try {
      const config = {
        headers: {
          "Content-Type": "application/json",
        },
      };
      await axios.put(
        `${API_URL}/users/resetpassword/${token}`,
        { password },
        config
      );
      setMessage("Password has been reset successfully. You can now log in.");
      setTimeout(() => navigate("/login"), 3000);
    } catch (error) {
      const errorMsg =
        error.response && error.response.data.message
          ? error.response.data.message
          : error.message;
      setMessage(`Error: ${errorMsg}`);
    }
  };

  return (
    <div className="flex justify-center items-center min-h-screen bg-[var(--color-craemy)]">
      <div className="w-full max-w-md bg-white shadow-2xl rounded-2xl p-10">
        <h1 className="text-4xl font-bold mb-8 text-center text-[var(--color-darkgreen)] font-heading">
          Reset Password
        </h1>
        <form onSubmit={submitHandler}>
          <div className="mb-6">
            <label
              className="block text-[var(--color-darkgreen)] text-lg font-bold mb-2 font-heading"
              htmlFor="password"
            >
              New Password
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
          <div className="mb-8">
            <label
              className="block text-[var(--color-darkgreen)] text-lg font-bold mb-2 font-heading"
              htmlFor="confirmPassword"
            >
              Confirm New Password
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
          <div className="flex items-center justify-center mb-6">
            <button
              className="bg-[var(--color-orange)] hover:opacity-90 text-white font-bold py-3 px-8 rounded-full focus:outline-none focus:shadow-outline text-lg"
              type="submit"
            >
              Reset Password
            </button>
          </div>
        </form>
        {message && <p className="text-center mt-4">{message}</p>}
      </div>
    </div>
  );
};

export default ResetPasswordPage;

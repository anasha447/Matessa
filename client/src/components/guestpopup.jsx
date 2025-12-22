import { useState, useEffect } from "react";

export default function GuestPopup() {
  const [show, setShow] = useState(false);
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    // Show popup after 5s (only if no registered user exists)
    const timer = setTimeout(() => {
      if (!localStorage.getItem("user")) {
        setShow(true);
      }
    }, 5000);

    return () => clearTimeout(timer);
  }, []);

  // 🔹 Continue as Guest
  const handleGuest = async () => {
    try {
      setLoading(true);
      await fetch("http://localhost:5000/api/users/register-guest", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
      });
      // ❌ Don't save guest in localStorage
      setShow(false); // ✅ just close popup for now
    } catch (err) {
      console.error("Guest registration failed", err);
    } finally {
      setLoading(false);
    }
  };

  // 🔹 Register with Email
  const handleRegister = async () => {
    if (!email) return alert("Please enter your email");

    try {
      setLoading(true);
      const res = await fetch("http://localhost:5000/api/users/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password: "guest1234" }), // ✅ temp password
      });
      const data = await res.json();

      localStorage.setItem("user", JSON.stringify(data)); // ✅ save only real user
      setShow(false); // ✅ close popup after registering
    } catch (err) {
      console.error("User registration failed", err);
    } finally {
      setLoading(false);
    }
  };

  if (!show) return null;

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black/60 z-50">
      <div className="relative bg-[var(--color-white)] p-10 rounded-2xl shadow-2xl w-[500px] h-[400px] text-center border-2 border-[var(--color-green)] flex flex-col justify-between">
        {/* ❌ Close button */}
        <button
          onClick={() => setShow(false)}
          className="absolute top-4 right-4 text-gray-500 hover:text-red-500 text-xl"
        >
          ✖
        </button>

        {/* Header */}
        <div>
          <h2 className="text-3xl font-bold mb-4 text-[var(--color-green)]">
            Welcome to MaTeesa!
          </h2>
          <p className="mb-4 text-[var(--color-darkgreen)]">
            Enter your email to register, or continue as guest.
          </p>
        </div>

        {/* Email input */}
        <input
          type="email"
          placeholder="Enter your email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="w-full p-3 rounded-lg border border-[var(--color-lightgreen)] mb-4 focus:outline-none focus:ring-2 focus:ring-[var(--color-orange)]"
        />

        {/* Buttons */}
        <div className="flex gap-3 justify-between">
          <button
            onClick={handleRegister}
            disabled={loading}
            className="flex-1 bg-[var(--color-green)] hover:bg-[var(--color-lightgreen)] text-white py-3 rounded-lg transition font-semibold"
          >
            {loading ? "Loading..." : "Register"}
          </button>

          <button
            onClick={handleGuest}
            disabled={loading}
            className="flex-1 bg-[var(--color-orange)] hover:bg-[var(--color-darkgreen)] text-white py-3 rounded-lg transition font-semibold"
          >
            {loading ? "Loading..." : "Continue as Guest"}
          </button>
        </div>
      </div>
    </div>
  );
}

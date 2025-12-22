import React, { useState } from "react";
import axios from "axios";
import { toast } from "react-toastify";
import Spinner from "../components/Spinner";

const API_URL = "http://localhost:5000/api";

const TrackOrderPage = () => {
  const [orderId, setOrderId] = useState("");
  const [email, setEmail] = useState("");
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(false);

  const submitHandler = async (e) => {
    e.preventDefault();
    setLoading(true);
    setOrder(null);
    try {
      const config = {
        headers: {
          "Content-Type": "application/json",
        },
      };
      const { data } = await axios.post(
        `${API_URL}/orders/track`,
        { orderId, email },
        config
      );
      setOrder(data);
      toast.success("Order found!");
    } catch (error) {
      const message =
        error.response && error.response.data.message
          ? error.response.data.message
          : "An error occurred.";
      toast.error(message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[var(--color-white)] py-12">
      <div className="container mx-auto px-4">
        <div className="w-full max-w-lg mx-auto text-center">
          <h1 className="text-4xl font-bold mb-8 text-[var(--color-darkgreen)] font-heading">
            Track Your Order
          </h1>
          <form
            onSubmit={submitHandler}
            className="bg-white shadow-2xl rounded-2xl p-8"
          >
            <div className="mb-6">
              <label
                className="block text-[var(--color-darkgreen)] text-lg font-bold mb-2 font-heading"
                htmlFor="orderId"
              >
                Order ID
              </label>
              <input
                className="shadow-sm appearance-none border rounded-lg w-full py-3 px-4 text-gray-700"
                id="orderId"
                type="text"
                placeholder="Enter your order ID"
                value={orderId}
                onChange={(e) => setOrderId(e.target.value)}
                required
              />
            </div>
            <div className="mb-8">
              <label
                className="block text-[var(--color-darkgreen)] text-lg font-bold mb-2 font-heading"
                htmlFor="email"
              >
                Email Address
              </label>
              <input
                className="shadow-sm appearance-none border rounded-lg w-full py-3 px-4 text-gray-700"
                id="email"
                type="email"
                placeholder="Enter the email used for the order"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>
            <div className="flex items-center justify-center">
              <button
                className="bg-[var(--color-orange)] hover:opacity-90 text-white font-bold py-3 px-8 rounded-full text-lg"
                type="submit"
                disabled={loading}
              >
                {loading ? "Searching..." : "Track Order"}
              </button>
            </div>
          </form>
        </div>

        {loading && <Spinner />}

        {order && (
          <div className="w-full max-w-2xl mx-auto bg-white shadow-2xl rounded-2xl p-8 mt-12">
            <h2 className="text-3xl font-bold mb-6 text-[var(--color-darkgreen)] font-heading">
              Order Details
            </h2>
            <div className="space-y-4">
              <p>
                <strong>Tracking ID:</strong> {order.trackingId}
              </p>
              <p>
                <strong>Status:</strong>{" "}
                <span className="font-bold text-blue-600">{order.status}</span>
              </p>
              <p>
                <strong>Date:</strong>{" "}
                {new Date(order.createdAt).toLocaleDateString()}
              </p>
              <p>
                <strong>Total:</strong> ₹{order.totalPrice.toFixed(2)}
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default TrackOrderPage;

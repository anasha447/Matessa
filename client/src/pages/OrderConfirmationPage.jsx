import React, { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import axios from "axios";
import Lottie from "lottie-react";
import successAnimation from "../assets/success-animation.json"; // Assuming you have a lottie json file
import Spinner from "../components/Spinner";

const API_URL = "http://localhost:5000/api";

const OrderConfirmationPage = () => {
  const { id } = useParams();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchOrder = async () => {
      try {
        const { data } = await axios.get(`${API_URL}/orders/${id}`);
        setOrder(data);
      } catch (error) {
        console.error("Failed to fetch order details", error);
      } finally {
        setLoading(false);
      }
    };
    fetchOrder();
  }, [id]);

  if (loading) {
    return <Spinner />;
  }

  if (!order) {
    return (
      <div className="text-center py-20">
        <h1 className="text-2xl text-red-500">Order not found.</h1>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[var(--color-white)] py-12">
      <div className="container mx-auto px-4">
        <div className="w-full max-w-2xl mx-auto text-center">
          <Lottie
            animationData={successAnimation}
            loop={false}
            style={{ height: 150, width: 150, margin: "0 auto" }}
          />
          <h1 className="text-4xl font-bold text-[var(--color-green)] font-heading mt-4">
            Your order is confirmed!
          </h1>
          <p className="text-gray-600 mt-4">
            Thank you for your purchase. An email confirmation has been sent to{" "}
            <strong>{order.shippingAddress.email}</strong>.
          </p>
          <div className="bg-white shadow-lg rounded-lg p-8 mt-8 text-left">
            <h2 className="text-2xl font-bold text-[var(--color-darkgreen)] font-heading mb-6">
              Order Summary
            </h2>
            <div className="space-y-4">
              <p>
                <strong>Tracking ID:</strong> {order.trackingId}
              </p>
              <p>
                <strong>Estimated Delivery:</strong> 3-5 business days
              </p>
              <div className="border-t pt-4 mt-4">
                <h3 className="font-bold text-lg mb-2">Items Ordered:</h3>
                {order.orderItems.map((item) => (
                  <div key={item._id} className="flex justify-between">
                    <span>
                      {item.name} (x{item.qty})
                    </span>
                    <span>${(item.price * item.qty).toFixed(2)}</span>
                  </div>
                ))}
              </div>
              <div className="border-t pt-4 mt-4 text-right">
                <p>
                  <strong>Subtotal:</strong> ${order.itemsPrice.toFixed(2)}
                </p>
                <p>
                  <strong>Shipping:</strong> ${order.shippingPrice.toFixed(2)}
                </p>
                <p>
                  <strong>Tax:</strong> ${order.taxPrice.toFixed(2)}
                </p>
                <p className="font-bold text-xl">
                  <strong>Total:</strong> ${order.totalPrice.toFixed(2)}
                </p>
              </div>
              <div className="border-t pt-4 mt-4">
                <h3 className="font-bold text-lg mb-2">Shipping To:</h3>
                <p>{order.shippingAddress.name}</p>
                <p>{order.shippingAddress.address}</p>
                <p>
                  {order.shippingAddress.city},{" "}
                  {order.shippingAddress.postalCode}
                </p>
                <p>{order.shippingAddress.country}</p>
              </div>
            </div>
          </div>
          <Link
            to="/shop"
            className="inline-block mt-8 bg-[var(--color-orange)] text-white font-bold py-3 px-8 rounded-full text-lg"
          >
            Continue Shopping
          </Link>
        </div>
      </div>
    </div>
  );
};

export default OrderConfirmationPage;

import React, { useState, useEffect, useCallback } from "react";
import { useParams } from "react-router-dom";
import { useSelector } from "react-redux"; // ✅ Redux
import { toast } from "react-toastify";
import api from "../apis/axiosConfig"; // ✅ Use Configured API

const OrderPage = () => {
  const { id: orderId } = useParams();
  
  // ✅ Read User from Redux (for Admin check)
  const { user } = useSelector((state) => state.auth);
  
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [status, setStatus] = useState("");

  const fetchOrder = useCallback(async () => {
    setLoading(true);
    try {
      // ✅ Call Backend (Cookies sent automatically)
      const { data } = await api.get(`/orders/${orderId}`);
      setOrder(data);
      setStatus(data.orderStatus || ""); // Match your Backend DTO field
    } catch (error) {
      console.error(error);
      toast.error("Failed to fetch order details.");
    } finally {
      setLoading(false);
    }
  }, [orderId]);

  useEffect(() => {
    fetchOrder();
  }, [fetchOrder]);

  const handleStatusUpdate = async () => {
    try {
      // ✅ Admin Logic: Update Status
      // Ensure your backend has this endpoint: PUT /api/orders/{id}/status
      await api.put(`/orders/${orderId}/status`, { status }); 
      
      toast.success("Order status updated successfully!");
      fetchOrder(); // Refresh data
    } catch (error) {
      const message = error.response?.data?.message || "Failed to update order status.";
      toast.error(message);
    }
  };

  if (loading) return <div className="text-center py-20 font-heading">Loading...</div>;
  if (!order) return <div className="text-center py-20 font-heading">Order not found</div>;

  return (
    <div className="container mx-auto py-12 px-4">
      <h1 className="text-3xl font-bold mb-8 font-heading text-[var(--color-darkgreen)]">
        Order #{order.orderId || order._id}
      </h1>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        <div className="md:col-span-2">
          {/* Shipping Info */}
          <div className="bg-white shadow-md rounded-lg p-8 mb-8">
            <h2 className="text-2xl font-bold mb-4 font-heading text-[var(--color-green)]">Shipping</h2>
            
            {/* Handle Guest or User */}
            <p><strong>Email: </strong> {order.email}</p>
            
            {order.address && (
              <p className="mt-2">
                <strong>Address: </strong>
                {order.address.addressLine1}, {order.address.city}, {order.address.state} {order.address.pincode}
              </p>
            )}
            
            <div className={`p-4 rounded-lg mt-4 ${order.orderStatus === 'Delivered' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'}`}>
               Status: {order.orderStatus}
            </div>
          </div>

          {/* Payment Info */}
          <div className="bg-white shadow-md rounded-lg p-8 mb-8">
            <h2 className="text-2xl font-bold mb-4 font-heading text-[var(--color-green)]">Payment</h2>
            {order.payment ? (
                <>
                    <p><strong>Method: </strong> {order.payment.paymentMethod}</p>
                    <p><strong>Status: </strong> {order.payment.pgStatus}</p>
                </>
            ) : <p>No Payment Info</p>}
          </div>

          {/* Order Items */}
          <div className="bg-white shadow-md rounded-lg p-8">
            <h2 className="text-2xl font-bold mb-4 font-heading text-[var(--color-green)]">Order Items</h2>
            {order.orderItems?.map((item, index) => (
              <div key={index} className="flex justify-between items-center mb-4 border-b pb-4 last:border-b-0">
                <div className="flex items-center">
                  {item.product && (
                      <div className="mr-4">
                          <p className="font-bold">{item.product.productName}</p>
                          <p className="text-sm text-gray-500">Qty: {item.quantity}</p>
                      </div>
                  )}
                </div>
                <div>
                   {item.quantity} x ₹{item.orderedProductPrice} = <strong>₹{item.quantity * item.orderedProductPrice}</strong>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Summary Sidebar */}
        <div>
          <div className="bg-white shadow-md rounded-lg p-8 sticky top-24">
            <h2 className="text-2xl font-bold mb-4 font-heading">Order Summary</h2>
            <div className="flex justify-between font-bold text-xl mt-4 pt-4 border-t">
              <span>Total</span>
              <span>₹{order.totalAmount}</span>
            </div>

            {/* Admin Controls */}
            {user && user.roles && user.roles.includes("ROLE_ADMIN") && (
              <div className="mt-8 pt-6 border-t">
                <h3 className="text-lg font-bold mb-3">Update Status</h3>
                <select
                  value={status}
                  onChange={(e) => setStatus(e.target.value)}
                  className="w-full p-2 border rounded-md mb-3"
                >
                  <option value="Order Accepted !">Order Accepted</option>
                  <option value="Shipped">Shipped</option>
                  <option value="Delivered">Delivered</option>
                  <option value="Cancelled">Cancelled</option>
                </select>
                <button
                  onClick={handleStatusUpdate}
                  className="w-full bg-[var(--color-orange)] text-white py-2 rounded-md hover:opacity-90 font-bold"
                >
                  Update Status
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default OrderPage;
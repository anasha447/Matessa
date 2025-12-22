import React, { useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import Spinner from "../components/Spinner";

// ✅ Redux Imports
import { useDispatch, useSelector } from "react-redux";
import { fetchMyOrders } from "../redux/slices/orderSlice";

const OrderHistoryPage = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  // 1. Get Auth State
  const { userInfo } = useSelector((state) => state.auth);

  // 2. Get Order State (Notice we use 'myOrders' here)
  const { myOrders: orders, loading } = useSelector((state) => state.orders);

  useEffect(() => {
    if (!userInfo) {
      navigate("/login");
    } else {
      // ✅ Dispatch the action
      dispatch(fetchMyOrders());
    }
  }, [dispatch, userInfo, navigate]);

  return (
    <div className="container mx-auto py-12 px-4 md:px-12 bg-[var(--color-white)]">
      <h1 className="text-4xl font-bold text-center mb-12 text-[var(--color-darkgreen)] font-heading">
        My Orders
      </h1>
      
      {loading ? (
        <Spinner />
      ) : !Array.isArray(orders) || orders.length === 0 ? (
        <div className="text-center text-gray-500">
          You have no orders.{" "}
          <Link to="/shop" className="text-[var(--color-orange)] hover:underline">
            Start Shopping
          </Link>
        </div>
      ) : (
        <div className="bg-white shadow-lg rounded-lg overflow-hidden">
          <table className="min-w-full">
            <thead className="bg-[var(--color-darkgreen)] text-[var(--color-craemy)]">
              <tr>
                <th className="py-3 px-6 text-left font-heading">ID</th>
                <th className="py-3 px-6 text-left font-heading">Date</th>
                <th className="py-3 px-6 text-left font-heading">Total</th>
                <th className="py-3 px-6 text-left font-heading">Paid</th>
                <th className="py-3 px-6 text-left font-heading">Status</th>
                <th className="py-3 px-6 text-left font-heading">
                  Payment Method
                </th>
                <th className="py-3 px-6 text-left font-heading"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {orders.map((order) => (
                <tr key={order._id || order.orderId} className="hover:bg-gray-50">
                  <td className="py-4 px-6 whitespace-nowrap">
                    {order._id || order.orderId}
                  </td>
                  <td className="py-4 px-6 whitespace-nowrap">
                    {new Date(order.createdAt || order.orderDate).toLocaleDateString()}
                  </td>
                  <td className="py-4 px-6 whitespace-nowrap">
                    ${(order.totalPrice || order.totalAmount || 0).toFixed(2)}
                  </td>
                  <td className="py-4 px-6 whitespace-nowrap">
                    {order.isPaid || order.orderStatus !== 'Pending' ? (
                      <span className="text-green-500 font-bold">Yes</span>
                    ) : (
                      <span className="text-red-500 font-bold">No</span>
                    )}
                  </td>
                  <td className="py-4 px-6 whitespace-nowrap">
                    {/* Unified Status Logic */}
                    <span
                      className={`font-bold ${
                        order.isDelivered || order.status === "Delivered"
                          ? "text-green-500"
                          : "text-orange-500"
                      }`}
                    >
                      {order.status || (order.isDelivered ? "Delivered" : "Processing")}
                    </span>
                  </td>
                  <td className="py-4 px-6 whitespace-nowrap">
                    {order.paymentMethod}
                  </td>
                  <td className="py-4 px-6 whitespace-nowrap text-right">
                    <div className="flex flex-col items-end">
                      <Link
                        to={`/order/${order._id || order.orderId}`}
                        className="text-[var(--color-green)] hover:text-[var(--color-lightgreen)] font-bold mb-2"
                      >
                        View Details
                      </Link>
                      
                      {/* Optional: Show items for rating if delivered */}
                      {(order.status === "Delivered" || order.isDelivered) && order.orderItems && (
                        <div className="mt-2 text-right">
                          <h4 className="font-semibold text-xs text-gray-500 mb-1">Rate:</h4>
                          {order.orderItems.map((item) => (
                            <Link
                              key={item.product || item.productId}
                              to={`/product/${item.product || item.productId}`}
                              className="block text-xs text-blue-500 hover:underline"
                            >
                              {item.name || item.productName}
                            </Link>
                          ))}
                        </div>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default OrderHistoryPage;
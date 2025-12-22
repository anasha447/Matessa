import React, { useEffect, useState } from "react";
import { FaEdit, FaTrash, FaUserShield, FaSearch } from "react-icons/fa";
import { toast } from "react-toastify";
import { useDispatch, useSelector } from "react-redux";
import { fetchAllUsers, deleteUser } from "../../redux/slices/adminSlice";

const UserListPage = () => {
  const dispatch = useDispatch();

  // 1. Get State
  const { users, loading, error, successMessage } = useSelector((state) => state.admin);
  const [searchTerm, setSearchTerm] = useState("");

  // ✅ FIX: Just fetch data
  useEffect(() => {
      dispatch(fetchAllUsers());
  }, [dispatch]);

  // 2. Handle Delete
  const handleDelete = async (userId) => {
    if (window.confirm("Are you sure you want to permanently delete this user?")) {
      dispatch(deleteUser(userId)); 
    }
  };

  useEffect(() => {
    if (successMessage) toast.success(successMessage);
  }, [successMessage]);

  const filteredUsers = users?.filter(user => 
    user.username.toLowerCase().includes(searchTerm.toLowerCase()) || 
    user.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        <div className="flex flex-col md:flex-row justify-between items-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 font-heading">User Management</h1>
          <div className="relative mt-4 md:mt-0">
              <input 
              type="text" 
              placeholder="Search users..." 
              className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 outline-none w-72 shadow-sm"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
            <FaSearch className="absolute left-3 top-3 text-gray-400" />
          </div>
        </div>

        {loading ? (
          <div className="text-center py-10">Loading users...</div>
        ) : error ? (
          <div className="text-center text-red-500 py-10">{error}</div>
        ) : (
          <div className="bg-white shadow-sm rounded-xl border border-gray-200 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">ID</th>
                    <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">User Info</th>
                    <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Roles</th>
                    <th className="px-6 py-4 text-right text-xs font-bold text-gray-500 uppercase tracking-wider">Actions</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {filteredUsers && filteredUsers.map((user) => (
                    <tr key={user.userId} className="hover:bg-gray-50 transition-colors">
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">#{user.userId}</td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className="h-10 w-10 rounded-full bg-gradient-to-tr from-green-400 to-green-600 flex items-center justify-center text-white font-bold shadow-md">
                            {user.username.charAt(0).toUpperCase()}
                          </div>
                          <div className="ml-4">
                            <div className="text-sm font-medium text-gray-900">{user.username}</div>
                            <div className="text-sm text-gray-500">{user.email}</div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex gap-1">
                            {user.roles && user.roles.map((role, index) => {
                                // Handle both string roles "ROLE_ADMIN" and object roles {roleName: "ROLE_ADMIN"}
                                const roleName = typeof role === 'string' ? role : role.roleName;
                                const displayRole = roleName.replace('ROLE_', '');
                                
                                return (
                                    <span 
                                        key={index} 
                                        className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${
                                        roleName === 'ROLE_ADMIN' 
                                            ? "bg-red-50 text-red-700 border-red-200" 
                                            : "bg-blue-50 text-blue-700 border-blue-200"
                                        }`}
                                    >
                                        {roleName === 'ROLE_ADMIN' && <FaUserShield className="mr-1" />}
                                        {displayRole}
                                    </span>
                                );
                            })}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <button
                          onClick={() => handleDelete(user.userId)}
                          className="text-red-600 hover:text-red-900 bg-red-50 hover:bg-red-100 p-2 rounded-lg transition-colors"
                          title="Delete User"
                        >
                          <FaTrash size={16} />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default UserListPage;
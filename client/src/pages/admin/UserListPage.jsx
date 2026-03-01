import React, { useEffect, useState } from "react";
import { FaTrash, FaUserShield, FaSearch, FaUser, FaEnvelope, FaIdBadge, FaEnvelopeOpenText } from "react-icons/fa";
import { toast } from "react-toastify";
import { useDispatch, useSelector } from "react-redux";
import { Link } from "react-router-dom"; // ✅ Imported Link
// ✅ IMPORT FROM THE CORRECT SLICE (adminSlice)
import { fetchAllUsers, deleteUser, clearSuccessMessage, clearAdminError } from "../../redux/slices/adminSlice";

const UserListPage = () => {
  const dispatch = useDispatch();

  // 1. Get State from 'admin' slice
  const { users, loading, error, successMessage } = useSelector((state) => state.admin);
  const [searchTerm, setSearchTerm] = useState("");

  // 2. Fetch Data on Mount
  useEffect(() => {
      dispatch(fetchAllUsers());
  }, [dispatch]);

  // 3. Handle Messages
  useEffect(() => {
    if (successMessage) {
      toast.success(successMessage);
      dispatch(clearSuccessMessage());
    }
    if (error) {
      toast.error(error);
      dispatch(clearAdminError());
    }
  }, [successMessage, error, dispatch]);

  // 4. Handle Delete
  const handleDelete = async (userId) => {
    if (window.confirm("Are you sure? This action cannot be undone.")) {
      dispatch(deleteUser(userId)); 
    }
  };

  // 5. Safe Filtering Logic
  // We use optional chaining (?.) and fallback to empty array to prevent crashes
  const filteredUsers = (users || []).filter(user => {
    const term = searchTerm.toLowerCase();
    const nameMatch = user.username?.toLowerCase().includes(term);
    const emailMatch = user.email?.toLowerCase().includes(term);
    const idMatch = user.userId?.toString().includes(term);
    return nameMatch || emailMatch || idMatch;
  });

  // --- Helper: Role Badge ---
  const RoleBadge = ({ role }) => {
    // Handle object roles {roleName: "..."} or string roles "..."
    const roleName = typeof role === 'string' ? role : role?.roleName || "USER";
    const isAdmin = roleName.includes("ADMIN");

    return (
      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold border shadow-sm ${
        isAdmin 
          ? "bg-purple-100 text-purple-700 border-purple-200" 
          : "bg-blue-50 text-blue-700 border-blue-200"
      }`}>
        {isAdmin ? <FaUserShield className="mr-1" /> : <FaUser className="mr-1" />}
        {roleName.replace("ROLE_", "")}
      </span>
    );
  };

  return (
    <div className="min-h-screen bg-gray-50 py-10 px-4 md:px-8">
      <div className="max-w-7xl mx-auto">
        
        {/* --- HEADER & SEARCH --- */}
        <div className="flex flex-col md:flex-row justify-between items-center mb-8 gap-4">
          <div>
             <h1 className="text-3xl font-bold text-gray-800 tracking-tight">User Management</h1>
             <p className="text-sm text-gray-500 mt-1">Manage system access and permissions</p>
          </div>
          
          <div className="flex flex-col md:flex-row gap-3 w-full md:w-auto items-center">
             
             {/* ✅ NEW SUBSCRIBERS BUTTON */}
             <Link 
               to="/admin/subscribers"
               className="flex items-center gap-2 bg-[var(--color-orange)] text-white font-bold py-3 px-5 rounded-xl shadow-sm hover:opacity-90 transition-all w-full md:w-auto justify-center whitespace-nowrap"
             >
               <FaEnvelopeOpenText size={18} /> View Subscribers
             </Link>

             <div className="relative w-full md:w-80">
                 <FaSearch className="absolute left-4 top-3.5 text-gray-400" />
                 <input 
                   type="text" 
                   placeholder="Search..." 
                   className="w-full pl-11 pr-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:outline-none shadow-sm transition-all"
                   value={searchTerm}
                   onChange={(e) => setSearchTerm(e.target.value)}
                 />
             </div>
          </div>
        </div>

        {/* --- CONTENT --- */}
        <div className="bg-white rounded-xl shadow-lg border border-gray-100 overflow-hidden">
          
          {loading ? (
             /* LOADING SKELETON */
             <div className="p-6 space-y-4">
               {[1, 2, 3].map(i => (
                 <div key={i} className="flex justify-between items-center animate-pulse">
                   <div className="flex items-center gap-4">
                     <div className="h-10 w-10 bg-gray-200 rounded-full"></div>
                     <div className="space-y-2">
                       <div className="h-4 w-48 bg-gray-200 rounded"></div>
                       <div className="h-3 w-32 bg-gray-200 rounded"></div>
                     </div>
                   </div>
                   <div className="h-8 w-20 bg-gray-200 rounded"></div>
                 </div>
               ))}
             </div>
          ) : filteredUsers.length === 0 ? (
             /* EMPTY STATE */
             <div className="p-12 text-center flex flex-col items-center">
               <div className="bg-gray-100 p-4 rounded-full mb-4">
                 <FaUser className="text-4xl text-gray-400" />
               </div>
               <h3 className="text-lg font-medium text-gray-900">No users found</h3>
               <p className="text-gray-500">Try adjusting your search terms.</p>
             </div>
          ) : (
             /* DATA TABLE */
             <div className="overflow-x-auto">
               <table className="min-w-full divide-y divide-gray-200">
                 <thead className="bg-gray-50">
                   <tr>
                     <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">User Profile</th>
                     <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Role & Access</th>
                     <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">User ID</th>
                     <th className="px-6 py-4 text-right text-xs font-bold text-gray-500 uppercase tracking-wider">Actions</th>
                   </tr>
                 </thead>
                 <tbody className="bg-white divide-y divide-gray-200">
                   {filteredUsers.map((user) => (
                     <tr key={user.userId} className="hover:bg-indigo-50 transition-colors group">
                       
                       {/* Profile Col */}
                       <td className="px-6 py-4 whitespace-nowrap">
                         <div className="flex items-center">
                           <div className="h-10 w-10 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white font-bold shadow-sm">
                             {user.username?.charAt(0).toUpperCase() || "U"}
                           </div>
                           <div className="ml-4">
                             <div className="text-sm font-semibold text-gray-900">{user.username}</div>
                             <div className="text-sm text-gray-500 flex items-center gap-1">
                               <FaEnvelope size={10} /> {user.email}
                             </div>
                           </div>
                         </div>
                       </td>

                       {/* Roles Col */}
                       <td className="px-6 py-4 whitespace-nowrap">
                         <div className="flex flex-wrap gap-1">
                           {user.roles && user.roles.map((role, idx) => (
                             <RoleBadge key={idx} role={role} />
                           ))}
                         </div>
                       </td>

                       {/* ID Col */}
                       <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 font-mono">
                         <span className="flex items-center gap-1">
                           <FaIdBadge className="text-gray-400" /> #{user.userId}
                         </span>
                       </td>

                       {/* Actions Col */}
                       <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                         <button
                           onClick={() => handleDelete(user.userId)}
                           className="text-gray-400 hover:text-red-600 p-2 rounded-full hover:bg-red-50 transition-all"
                           title="Delete User"
                         >
                           <FaTrash size={18} />
                         </button>
                       </td>

                     </tr>
                   ))}
                 </tbody>
               </table>
             </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default UserListPage;
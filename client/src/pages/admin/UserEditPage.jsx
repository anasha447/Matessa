import React, { useState, useEffect } from "react";
import { Link, useParams, useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import { useDispatch, useSelector } from "react-redux";
import { fetchUserDetails, updateUser, clearUserDetails } from "../../redux/slices/userSlice";

const UserEditPage = () => {
  const { id: userId } = useParams();
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const { userDetails, loading, error } = useSelector((state) => state.users);

  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [isAdmin, setIsAdmin] = useState(false);

  // ✅ FIX: Remove Manual Auth Check.
  useEffect(() => {
    if (userId) {
      dispatch(fetchUserDetails(userId));
    }
    return () => { dispatch(clearUserDetails()); };
  }, [dispatch, userId]);

  useEffect(() => {
    if (userDetails) {
      setUsername(userDetails.username || userDetails.name || "");
      setEmail(userDetails.email || "");
      
      // ✅ Handle Roles Safely
      let checkAdmin = false;
      if (userDetails.roles) {
          checkAdmin = userDetails.roles.some(role => 
              role === "ROLE_ADMIN" || role.roleName === 'ROLE_ADMIN'
          );
      }
      setIsAdmin(!!checkAdmin);
    }
  }, [userDetails]);

  // Submit Handler remains the same...
  const submitHandler = async (e) => {
    e.preventDefault();
    
    // Note: Adjust based on your Backend DTO logic
    // If backend expects role names strings:
    const roles = isAdmin ? ["admin", "user"] : ["user"]; 
    
    const userData = { username, email, roles };

    try {
      await dispatch(updateUser({ userId, userData })).unwrap();
      toast.success("User updated successfully");
      navigate("/admin/users");
    } catch (err) {
      toast.error(err || "Update failed");
    }
  };

  return (
    // ... JSX remains the same (Forms, Inputs, Buttons) ...
    // Just ensure the inputs are wired to state correctly
    <div className="container mx-auto py-12 px-4 md:px-12 bg-[var(--color-white)]">
       {/* ... same UI code ... */}
       <form onSubmit={submitHandler}>
          {/* ... inputs for username, email ... */}
          
          <div className="mb-8">
              <label className="flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  className="form-checkbox h-5 w-5 text-[var(--color-green)]"
                  checked={isAdmin}
                  onChange={(e) => setIsAdmin(e.target.checked)}
                />
                <span className="ml-3 text-lg text-gray-700">Is Admin</span>
              </label>
            </div>
            
            <button className="bg-[var(--color-green)] text-white font-bold py-3 px-8 rounded-full" type="submit" disabled={loading}>
                {loading ? "Updating..." : "Update User"}
            </button>
       </form>
    </div>
  );
};

export default UserEditPage;
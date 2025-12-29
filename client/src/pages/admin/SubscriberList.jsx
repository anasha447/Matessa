import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { fetchSubscribers } from "../../redux/slices/subscriberSlice";
import { FaCopy, FaDownload, FaSearch, FaEnvelope } from "react-icons/fa";
import { toast } from "react-toastify";
import Spinner from "../../components/Spinner"; // Assuming you have a spinner

const SubscriberList = () => {
  const dispatch = useDispatch();
  const { subscribers, loading, error } = useSelector((state) => state.subscriber);
  
  const [searchTerm, setSearchTerm] = useState("");

  // 1. Fetch Data on Mount
  useEffect(() => {
    dispatch(fetchSubscribers());
  }, [dispatch]);

  // 2. Filter Logic
  const filteredList = subscribers.filter((sub) =>
    sub.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // 3. Copy All Emails (Comma Separated)
  const handleCopyEmails = () => {
    const allEmails = filteredList.map(s => s.email).join(", ");
    navigator.clipboard.writeText(allEmails);
    toast.success("All emails copied to clipboard!");
  };

  // 4. Copy Single Email
  const handleCopySingle = (email) => {
    navigator.clipboard.writeText(email);
    toast.success("Email copied!");
  };

  if (loading) return <Spinner />;

  return (
    <div className="p-6 md:p-10 bg-gray-50 min-h-screen font-body">
      
      {/* Header Section */}
      <div className="flex flex-col md:flex-row justify-between items-center mb-8 gap-4">
        <div>
          <h1 className="text-3xl font-bold font-heading text-[var(--color-darkgreen)]">
            Subscribers List
          </h1>
          <p className="text-gray-500 mt-1">
            Manage your newsletter audience ({filteredList.length} total)
          </p>
        </div>

        {/* Actions */}
        <div className="flex gap-3">
          <button 
            onClick={handleCopyEmails}
            className="flex items-center gap-2 bg-[var(--color-darkgreen)] text-white px-5 py-2.5 rounded-lg hover:opacity-90 transition-all shadow-md"
          >
            <FaCopy /> Copy All Emails
          </button>
        </div>
      </div>

      {/* Search Bar */}
      <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 mb-6 flex items-center gap-3">
        <FaSearch className="text-gray-400" />
        <input 
          type="text"
          placeholder="Search by email..."
          className="w-full outline-none text-gray-700 placeholder-gray-400"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>

      {/* Table */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-gray-50 text-gray-600 uppercase text-xs tracking-wider">
                <th className="p-4 border-b">ID</th>
                <th className="p-4 border-b">Email Address</th>
                <th className="p-4 border-b">Subscribed At</th>
                <th className="p-4 border-b text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {filteredList.length > 0 ? (
                filteredList.map((sub, index) => (
                  <tr key={sub.id || index} className="hover:bg-gray-50 transition-colors">
                    <td className="p-4 text-gray-500 font-mono text-sm">#{index + 1}</td>
                    
                    <td className="p-4">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-blue-50 text-blue-600 flex items-center justify-center">
                          <FaEnvelope size={14} />
                        </div>
                        <span className="font-medium text-gray-800">{sub.email}</span>
                      </div>
                    </td>

                    <td className="p-4 text-gray-500 text-sm">
                      {sub.subscribedAt ? new Date(sub.subscribedAt).toLocaleDateString() : "N/A"}
                      <span className="text-xs text-gray-400 ml-2">
                        {sub.subscribedAt ? new Date(sub.subscribedAt).toLocaleTimeString() : ""}
                      </span>
                    </td>

                    <td className="p-4 text-right">
                      <button 
                        onClick={() => handleCopySingle(sub.email)}
                        className="text-gray-400 hover:text-[var(--color-orange)] p-2 rounded-full hover:bg-orange-50 transition-all"
                        title="Copy Email"
                      >
                        <FaCopy />
                      </button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="4" className="p-8 text-center text-gray-400">
                    No subscribers found matching "{searchTerm}"
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
        
        {/* Footer Stats */}
        <div className="bg-gray-50 p-4 border-t border-gray-100 text-xs text-gray-500 text-center">
           Showing {filteredList.length} of {subscribers.length} subscribers
        </div>
      </div>

    </div>
  );
};

export default SubscriberList;
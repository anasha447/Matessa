import React, { useEffect, useState } from "react";
import api from "../../apis/axiosConfig";
import { toast } from "react-toastify";
import { Trash2, MailOpen, Search, RefreshCw } from "lucide-react";

const AdminInbox = () => {
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedMessage, setSelectedMessage] = useState(null);

  // Fetch Messages
  const fetchMessages = async () => {
    try {
      setLoading(true);
      const res = await api.get("/admin/contact/messages");
      setMessages(res.data);
    } catch (error) {
      toast.error("Failed to load messages");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMessages();
  }, []);

  // Handle Reading a Message
  const handleRead = async (msg) => {
    setSelectedMessage(msg);
    if (!msg.read) {
      try {
        await api.put(`/admin/contact/messages/${msg.messageId}/read`);
        // Update UI locally to remove bold effect
        setMessages((prev) =>
          prev.map((m) =>
            m.messageId === msg.messageId ? { ...m, read: true } : m
          )
        );
      } catch (error) {
        console.error("Failed to mark read");
      }
    }
  };

  // Delete Message
  const handleDelete = async (id, e) => {
    e.stopPropagation(); // Stop click from opening the message
    if (window.confirm("Delete this message?")) {
      try {
        await api.delete(`/admin/contact/messages/${id}`);
        setMessages(messages.filter((m) => m.messageId !== id));
        if (selectedMessage?.messageId === id) setSelectedMessage(null);
        toast.success("Message deleted");
      } catch (error) {
        toast.error("Failed to delete");
      }
    }
  };

  // Filter Logic
  const filteredMessages = messages.filter(
    (m) =>
      m.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      m.subject.toLowerCase().includes(searchTerm.toLowerCase()) ||
      m.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="flex h-[calc(100vh-80px)] bg-gray-50 font-body">
      
      {/* --- LEFT SIDE: Message List --- */}
      <div className={`w-full md:w-1/3 bg-white border-r border-gray-200 flex flex-col ${selectedMessage ? "hidden md:flex" : "flex"}`}>
        
        {/* Header */}
        <div className="p-4 border-b border-gray-100">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-bold font-heading text-gray-800">Inbox</h2>
            <button onClick={fetchMessages} className="p-2 hover:bg-gray-100 rounded-full transition-colors" title="Refresh">
              <RefreshCw size={18} className="text-gray-500" />
            </button>
          </div>
          <div className="relative">
            <Search className="absolute left-3 top-2.5 text-gray-400" size={18} />
            <input
              type="text"
              placeholder="Search..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[var(--color-orange)]"
            />
          </div>
        </div>

        {/* List */}
        <div className="flex-1 overflow-y-auto">
          {loading ? (
            <div className="p-8 text-center text-gray-400">Loading...</div>
          ) : filteredMessages.length === 0 ? (
            <div className="p-8 text-center text-gray-400">No messages found.</div>
          ) : (
            filteredMessages.map((msg) => (
              <div
                key={msg.messageId}
                onClick={() => handleRead(msg)}
                className={`p-4 border-b border-gray-100 cursor-pointer transition-colors hover:bg-gray-50 relative group ${
                  selectedMessage?.messageId === msg.messageId ? "bg-orange-50 border-orange-100" : ""
                } ${!msg.read ? "bg-blue-50/30" : ""}`}
              >
                <div className="flex justify-between items-start mb-1">
                  <h4 className={`text-sm ${!msg.read ? "font-bold text-gray-900" : "font-medium text-gray-700"}`}>
                    {msg.name}
                  </h4>
                  <span className="text-xs text-gray-400 whitespace-nowrap ml-2">
                    {new Date(msg.submittedAt).toLocaleDateString()}
                  </span>
                </div>
                <p className={`text-sm mb-1 truncate ${!msg.read ? "text-gray-900 font-semibold" : "text-gray-600"}`}>
                   {msg.subject}
                </p>
                <p className="text-xs text-gray-500 truncate">{msg.message}</p>

                {/* Unread Dot */}
                {!msg.read && (
                  <span className="absolute top-4 right-4 w-2 h-2 bg-blue-500 rounded-full shadow-sm"></span>
                )}

                {/* Delete Button (Visible on Hover) */}
                <button
                  onClick={(e) => handleDelete(msg.messageId, e)}
                  className="absolute bottom-4 right-4 p-1.5 text-gray-400 hover:text-red-500 hover:bg-white rounded shadow-sm opacity-0 group-hover:opacity-100 transition-opacity"
                  title="Delete"
                >
                  <Trash2 size={16} />
                </button>
              </div>
            ))
          )}
        </div>
      </div>

      {/* --- RIGHT SIDE: Message Detail --- */}
      <div className={`w-full md:w-2/3 bg-white flex flex-col ${!selectedMessage ? "hidden md:flex items-center justify-center bg-gray-50" : "flex"}`}>
        {selectedMessage ? (
          <>
            {/* Toolbar */}
            <div className="p-4 border-b border-gray-100 flex justify-between items-center bg-white sticky top-0 z-10 shadow-sm">
              <button 
                onClick={() => setSelectedMessage(null)} 
                className="md:hidden text-gray-500 hover:text-gray-800 text-sm font-medium"
              >
                ← Back
              </button>
              <div className="flex gap-2 ml-auto">
                <button
                  onClick={(e) => handleDelete(selectedMessage.messageId, e)}
                  className="flex items-center gap-2 px-3 py-1.5 text-red-600 hover:bg-red-50 rounded-lg text-sm transition-colors"
                >
                  <Trash2 size={16} /> Delete
                </button>
              </div>
            </div>

            {/* Content */}
            <div className="flex-1 overflow-y-auto p-8">
              <h1 className="text-2xl font-bold font-heading text-gray-800 mb-6">
                {selectedMessage.subject}
              </h1>

              <div className="flex items-center gap-4 mb-8 pb-8 border-b border-gray-100">
                <div className="w-12 h-12 rounded-full bg-[var(--color-green)] flex items-center justify-center text-white font-bold text-lg">
                  {selectedMessage.name.charAt(0).toUpperCase()}
                </div>
                <div>
                  <p className="text-gray-900 font-medium">{selectedMessage.name}</p>
                  <p className="text-gray-500 text-sm">{selectedMessage.email}</p>
                </div>
                <div className="ml-auto text-right">
                   <p className="text-xs text-gray-400">
                     {new Date(selectedMessage.submittedAt).toLocaleString()}
                   </p>
                </div>
              </div>

              <div className="prose max-w-none text-gray-700 leading-relaxed whitespace-pre-wrap">
                {selectedMessage.message}
              </div>
            </div>
          </>
        ) : (
          /* Empty State */
          <div className="text-center text-gray-400">
            <div className="bg-gray-100 p-6 rounded-full inline-flex mb-4">
              <MailOpen size={48} />
            </div>
            <p className="text-lg">Select a message to read</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminInbox;
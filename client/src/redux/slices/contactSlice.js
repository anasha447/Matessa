import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import api from '../../apis/axiosConfig'; // Adjust path to your axios config

// ==========================================
// 1. ASYNC ACTIONS (THUNKS)
// ==========================================

// ✅ User: Send Message
export const sendMessage = createAsyncThunk(
  'contact/sendMessage',
  async (contactData, { rejectWithValue }) => {
    try {
      const response = await api.post('/public/contact', contactData);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || "Failed to send message");
    }
  }
);

// ✅ Admin: Fetch All Messages
export const fetchMessages = createAsyncThunk(
  'contact/fetchMessages',
  async (_, { rejectWithValue }) => {
    try {
      const response = await api.get('/admin/contact/messages');
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || "Failed to load messages");
    }
  }
);

// ✅ Admin: Mark as Read
export const markMessageRead = createAsyncThunk(
  'contact/markRead',
  async (messageId, { rejectWithValue }) => {
    try {
      const response = await api.put(`/admin/contact/messages/${messageId}/read`);
      return response.data; // Returns updated message object
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || "Failed to mark as read");
    }
  }
);

// ✅ Admin: Delete Message
export const deleteMessage = createAsyncThunk(
  'contact/deleteMessage',
  async (messageId, { rejectWithValue }) => {
    try {
      await api.delete(`/admin/contact/messages/${messageId}`);
      return messageId; // Return ID so we can filter it out of state
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || "Failed to delete message");
    }
  }
);

// ==========================================
// 2. THE SLICE
// ==========================================

const contactSlice = createSlice({
  name: 'contact',
  initialState: {
    messages: [],       // Admin: List of inbox messages
    loading: false,     // Global loading state
    sendSuccess: false, // User: To trigger toast notifications
    error: null,
  },
  reducers: {
    // Reset success state after showing toast
    resetContactStatus: (state) => {
      state.sendSuccess = false;
      state.error = null;
    }
  },
  extraReducers: (builder) => {
    builder
      // --- Send Message (User) ---
      .addCase(sendMessage.pending, (state) => {
        state.loading = true;
        state.error = null;
        state.sendSuccess = false;
      })
      .addCase(sendMessage.fulfilled, (state) => {
        state.loading = false;
        state.sendSuccess = true;
      })
      .addCase(sendMessage.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // --- Fetch Messages (Admin) ---
      .addCase(fetchMessages.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchMessages.fulfilled, (state, action) => {
        state.loading = false;
        state.messages = action.payload;
      })
      .addCase(fetchMessages.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // --- Mark Read (Admin) ---
      .addCase(markMessageRead.fulfilled, (state, action) => {
        const index = state.messages.findIndex(m => m.messageId === action.payload.messageId);
        if (index !== -1) {
          state.messages[index] = action.payload; // Update specific message to read=true
        }
      })

      // --- Delete Message (Admin) ---
      .addCase(deleteMessage.fulfilled, (state, action) => {
        state.messages = state.messages.filter(m => m.messageId !== action.payload);
      });
  },
});

export const { resetContactStatus } = contactSlice.actions;
export default contactSlice.reducer;
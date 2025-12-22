import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import api from '../../apis/axiosConfig';

// 1. Subscribe User
// Backend: POST /api/public/subscribe
export const subscribeUser = createAsyncThunk(
  'subscriber/add',
  async (subscriberDTO, { rejectWithValue }) => {
    try {
      const response = await api.post('/public/subscribe', subscriberDTO);
      return response.data; // "Subscribed successfully!" string or object
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || "Subscription failed");
    }
  }
);

const subscriberSlice = createSlice({
  name: 'subscriber',
  initialState: {
    status: 'idle', // idle | loading | succeeded | failed
    message: null,
  },
  reducers: {
    resetSubscriberStatus: (state) => {
      state.status = 'idle';
      state.message = null;
    }
  },
  extraReducers: (builder) => {
    builder
      .addCase(subscribeUser.pending, (state) => {
        state.status = 'loading';
      })
      .addCase(subscribeUser.fulfilled, (state, action) => {
        state.status = 'succeeded';
        // Depending on backend, payload might be entire object or just message
        // Your controller returns the Saved DTO, so we ignore payload data for now
        // unless you want to show "Thanks, [email]!"
      })
      .addCase(subscribeUser.rejected, (state, action) => {
        state.status = 'failed';
        state.message = action.payload;
      });
  },
});

export const { resetSubscriberStatus } = subscriberSlice.actions;
export default subscriberSlice.reducer;
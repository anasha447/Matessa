import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import api from '../../apis/axiosConfig';

// --- ASYNC ACTIONS ---

// 1. Fetch User Addresses
// Backend: GET /api/users/addresses
export const fetchUserAddresses = createAsyncThunk(
  'address/fetchUserAddresses',
  async (_, { rejectWithValue }) => {
    try {
      const response = await api.get('/users/addresses');
      return response.data; // List<AddressDTO>
    } catch (error) {
      return rejectWithValue(error.response?.data?.message);
    }
  }
);

// 2. Create Address
// Backend: POST /api/addresses
export const createAddress = createAsyncThunk(
  'address/create',
  async (addressData, { rejectWithValue }) => {
    try {
      const response = await api.post('/addresses', addressData);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message);
    }
  }
);

// 3. Delete Address
// Backend: DELETE /api/addresses/{addressId}
export const deleteAddress = createAsyncThunk(
  'address/delete',
  async (addressId, { rejectWithValue }) => {
    try {
      await api.delete(`/addresses/${addressId}`);
      return addressId;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message);
    }
  }
);

// --- SLICE ---

const addressSlice = createSlice({
  name: 'address',
  initialState: {
    savedAddresses: [],
    loading: false,
    error: null,
  },
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchUserAddresses.fulfilled, (state, action) => {
        state.savedAddresses = action.payload;
      })
      .addCase(createAddress.fulfilled, (state, action) => {
        state.savedAddresses.push(action.payload); // Add new address to list
      })
      .addCase(deleteAddress.fulfilled, (state, action) => {
        state.savedAddresses = state.savedAddresses.filter(addr => addr.addressId !== action.payload);
      });
  },
});

export default addressSlice.reducer;
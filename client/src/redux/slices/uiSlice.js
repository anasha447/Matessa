import { createSlice } from '@reduxjs/toolkit';

const uiSlice = createSlice({
  name: 'ui',
  initialState: {
    isCartDrawerOpen: false,
  },
  reducers: {
    toggleCartDrawer: (state) => {
      state.isCartDrawerOpen = !state.isCartDrawerOpen;
    },
    openCartDrawer: (state) => {
      state.isCartDrawerOpen = true;
    },
    closeCartDrawer: (state) => {
      state.isCartDrawerOpen = false;
    },
  },
});

export const { toggleCartDrawer, openCartDrawer, closeCartDrawer } = uiSlice.actions;
export default uiSlice.reducer;
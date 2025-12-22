import { configureStore } from '@reduxjs/toolkit';
import authReducer from './slices/authSlice';
import cartReducer from './slices/cartSlice';
import productReducer from './slices/productSlice';   
import orderReducer from './slices/orderSlice';         
import addressReducer from './slices/addressSlice';     
import subscriberReducer from './slices/subscriberSlice'; 
import uiReducer from './slices/uiSlice';
import productImageReducer from './slices/productImageSlice';
import categoryReducer from './slices/categorySlice';
import userReducer from './slices/userSlice';
import adminReducer from './slices/adminSlice'; 



export const store = configureStore({
  reducer: {
    auth: authReducer,
    cart: cartReducer,
    products: productReducer,
    orders: orderReducer,
    address: addressReducer,
    subscriber: subscriberReducer,
    ui: uiReducer,
    productImages: productImageReducer,
    users: userReducer,
    categories: categoryReducer,
    admin: adminReducer,
  },
});
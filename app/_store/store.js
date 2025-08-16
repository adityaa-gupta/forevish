// src/app/store.js
import { configureStore } from "@reduxjs/toolkit";
import userReducer from "./features/userSlice";
import cartReducer from "./features/cartSlice";
import wishlistReducer from "./features/wishlistSlice";

export const store = configureStore({
  reducer: {
    user: userReducer,
    cart: cartReducer,
    wishlist: wishlistReducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        ignoredActions: ["persist/PERSIST"],
      },
    }),
  devTools: process.env.NODE_ENV !== "production",
});

// For use in components (no TypeScript types needed)
export const selectUser = (state) => state.user;
export const selectCart = (state) => state.cart;
export const selectWishlist = (state) => state.wishlist;

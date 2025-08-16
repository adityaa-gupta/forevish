import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  items: [],
};

export const wishlistSlice = createSlice({
  name: "wishlist",
  initialState,
  reducers: {
    addToWishlist: (state, action) => {
      const newItem = action.payload;
      const isAlreadyInWishlist = state.items.some(
        (item) => item.id === newItem.id
      );
      if (!isAlreadyInWishlist) {
        state.items.push(newItem);
      }
    },
    removeFromWishlist: (state, action) => {
      state.items = state.items.filter((item) => item.id !== action.payload.id);
    },
  },
});

export const { addToWishlist, removeFromWishlist } = wishlistSlice.actions;

export default wishlistSlice.reducer;

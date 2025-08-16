import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  selectedSizes: [],
  priceRange: "all",
  sortBy: "featured",
  category: "all",
  searchQuery: "",
  isLoading: false,
};

export const filterSlice = createSlice({
  name: "filters",
  initialState,
  reducers: {
    setSelectedSizes: (state, action) => {
      state.selectedSizes = action.payload;
    },
    addSize: (state, action) => {
      if (!state.selectedSizes.includes(action.payload)) {
        state.selectedSizes.push(action.payload);
      }
    },
    removeSize: (state, action) => {
      state.selectedSizes = state.selectedSizes.filter(
        (size) => size !== action.payload
      );
    },
    setPriceRange: (state, action) => {
      state.priceRange = action.payload;
    },
    setSortBy: (state, action) => {
      state.sortBy = action.payload;
    },
    setCategory: (state, action) => {
      state.category = action.payload;
    },
    setSearchQuery: (state, action) => {
      state.searchQuery = action.payload;
    },
    setFilterLoading: (state, action) => {
      state.isLoading = action.payload;
    },
    resetFilters: (state) => {
      state.selectedSizes = [];
      state.priceRange = "all";
      state.sortBy = "featured";
      state.category = "all";
      state.searchQuery = "";
    },
  },
});

export const {
  setSelectedSizes,
  addSize,
  removeSize,
  setPriceRange,
  setSortBy,
  setCategory,
  setSearchQuery,
  setFilterLoading,
  resetFilters,
} = filterSlice.actions;

export default filterSlice.reducer;

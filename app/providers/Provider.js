"use client";
import { Provider } from "react-redux";
import Navbar from "../components/Navbar";
import { store } from "../_store/store";

export function Providers({ children }) {
  return (
    <Provider store={store}>
      <Navbar />
      {children}
    </Provider>
  );
}

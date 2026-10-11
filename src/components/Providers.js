"use client";

import { createContext, useContext, useEffect, useReducer } from "react";
import { cartReducer, initialCart } from "@/lib/cart";

const CartContext = createContext(null);
const STORAGE_KEY = "addis-eats-cart";

export default function Providers({ children }) {
  const [state, dispatch] = useReducer(cartReducer, initialCart);

  // Read the saved cart once after mount, so server and first client render match.
  useEffect(() => {
    let saved = [];
    try {
      saved = JSON.parse(localStorage.getItem(STORAGE_KEY) || "[]");
    } catch {
      // ignore a corrupted cart
    }
    dispatch({ type: "load", items: saved });
  }, []);

  // Write to localStorage: this is the effect's real job, syncing to an external system.
  useEffect(() => {
    if (state.loaded) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(state.items));
    }
  }, [state.items, state.loaded]);

  return (
    <CartContext.Provider
      value={{ items: state.items, loaded: state.loaded, dispatch }}
    >
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error("useCart must be used inside <Providers>");
  }
  return context;
}
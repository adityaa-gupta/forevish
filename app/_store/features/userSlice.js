import { createSlice } from "@reduxjs/toolkit";

const PERSIST_KEY = "authUser";

function loadPersisted() {
  if (typeof window === "undefined") return null;
  try {
    const raw = localStorage.getItem(PERSIST_KEY);
    if (!raw) return null;
    return JSON.parse(raw);
  } catch {
    return null;
  }
}

const persisted = loadPersisted();

const initialState = {
  isLoggedIn: !!persisted,
  userInfo: persisted,
  loading: true,
};

function persist(user) {
  if (typeof window === "undefined") return;
  try {
    if (user) localStorage.setItem(PERSIST_KEY, JSON.stringify(user));
    else localStorage.removeItem(PERSIST_KEY);
  } catch {}
}

export const userSlice = createSlice({
  name: "user",
  initialState,
  reducers: {
    login: (state, action) => {
      state.isLoggedIn = true;
      state.userInfo = action.payload;
      state.loading = false;
      persist(state.userInfo);
    },
    logout: (state) => {
      state.isLoggedIn = false;
      state.userInfo = null;
      state.loading = false;
      persist(null);
    },
    setAuthLoading: (state, action) => {
      state.loading = action.payload;
    },
    updateUser: (state, action) => {
      if (state.userInfo) {
        state.userInfo = { ...state.userInfo, ...action.payload };
        persist(state.userInfo);
      }
    },
    hydrateUserFromAuth: (state, action) => {
      if (action.payload) {
        state.isLoggedIn = true;
        state.userInfo = { ...state.userInfo, ...action.payload };
        state.loading = false;
        persist(state.userInfo);
      } else {
        state.isLoggedIn = false;
        state.userInfo = null;
        state.loading = false;
        persist(null);
      }
    },
  },
});

export const {
  login,
  logout,
  setAuthLoading,
  updateUser,
  hydrateUserFromAuth,
} = userSlice.actions;

// Logout thunk (dynamic import to avoid circular dependency)
export const performLogout = () => async (dispatch) => {
  try {
    const { getAuth, signOut } = await import("firebase/auth");
    const auth = getAuth();
    await signOut(auth);
  } catch {
    // ignore errors
  } finally {
    dispatch(logout());
  }
};

export default userSlice.reducer;

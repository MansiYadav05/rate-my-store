import { createContext, useContext, useState } from "react";
import api from "../api";

const AuthContext = createContext(null);

// Share the signed-in user and auth actions with the app.
export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => {
    const savedUser = localStorage.getItem("user");
    return savedUser ? JSON.parse(savedUser) : null;
  });

  // Save the API login response so the user stays signed in after refresh.
  function saveLogin(data) {
    localStorage.setItem("token", data.token);
    localStorage.setItem("user", JSON.stringify(data.user));
    setUser(data.user);
    return data.user;
  }

  // Sign in any role through the shared login endpoint.
  async function login(email, password) {
    const response = await api.post("/auth/login", { email, password });
    return saveLogin(response.data);
  }

  // Register a normal user and sign them in immediately.
  async function signup(userDetails) {
    const response = await api.post("/auth/signup", userDetails);
    return saveLogin(response.data);
  }

  // Remove the saved token and user from this browser.
  function logout() {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    setUser(null);
  }

  return (
    <AuthContext.Provider value={{ user, login, signup, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

// Read authentication values from the nearest provider.
export function useAuth() {
  return useContext(AuthContext);
}

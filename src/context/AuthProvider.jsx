import { useState, useEffect } from "react";
import { jwtDecode } from "jwt-decode";
import { AuthContext } from "./AuthContext";
import { loginRequest, registerRequest, refreshAccessTokenRequest } from "../services/authService";

function isTokenExpired(token) {
  try {
    const { exp } = jwtDecode(token);
    return Date.now() >= exp * 1000;
  } catch {
    return true;
  }
}

function getInitialUser() {
  const token = localStorage.getItem("accessToken");
  if (!token || isTokenExpired(token)) return null;

  try {
    const decoded = jwtDecode(token);
    const email = localStorage.getItem("userEmail");
    return { ...decoded, email };
  } catch {
    return null;
  }
}

export function AuthProvider({ children }) {
  const [user, setUser] = useState(getInitialUser);
  const [accessToken, setAccessToken] = useState(() => {
    const token = localStorage.getItem("accessToken");
    return token && !isTokenExpired(token) ? token : null;
  });
  const [refreshToken, setRefreshToken] = useState(() => localStorage.getItem("refreshToken"));
  const [checkingSession, setCheckingSession] = useState(true);

  const logout = () => {
    setUser(null);
    setAccessToken(null);
    setRefreshToken(null);
    localStorage.removeItem("accessToken");
    localStorage.removeItem("refreshToken");
    localStorage.removeItem("userEmail");
  };

  useEffect(() => {
    async function recoverSession() {
      const storedAccess = localStorage.getItem("accessToken");
      const storedRefresh = localStorage.getItem("refreshToken");

      if (storedAccess && !isTokenExpired(storedAccess)) {
        setCheckingSession(false);
        return;
      }

      if (storedRefresh) {
        try {
          const data = await refreshAccessTokenRequest(storedRefresh);
          const decoded = jwtDecode(data.accessToken);
          const email = localStorage.getItem("userEmail");

          setUser({ ...decoded, email });
          setAccessToken(data.accessToken);
          localStorage.setItem("accessToken", data.accessToken);
        } catch {
          logout();
        }
      } else {
        logout();
      }
      setCheckingSession(false);
    }

    recoverSession();
  }, []);

  const login = async (email, password) => {
    const data = await loginRequest(email, password);
    const decoded = jwtDecode(data.access);
    const userWithEmail = { ...decoded, email };

    setUser(userWithEmail);
    setAccessToken(data.access);
    setRefreshToken(data.refresh);

    localStorage.setItem("accessToken", data.access);
    localStorage.setItem("refreshToken", data.refresh);
    localStorage.setItem("userEmail", email);

    return data;
  };

  const register = async (formData) => {
    return registerRequest(formData);
  };

  const refreshSession = async () => {
    if (!refreshToken) throw new Error("No hay refresh token");
    const data = await refreshAccessTokenRequest(refreshToken);

    const decoded = jwtDecode(data.accessToken);
    const email = localStorage.getItem("userEmail");

    setUser({ ...decoded, email });
    setAccessToken(data.accessToken);
    localStorage.setItem("accessToken", data.accessToken);

    return data.accessToken;
  };

  const value = {
    user,
    accessToken,
    isAuthenticated: !!accessToken,
    checkingSession,
    login,
    register,
    logout,
    refreshSession,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
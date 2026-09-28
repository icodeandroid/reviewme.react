import { createContext, useEffect, useState } from "react";
import toast from "react-hot-toast";
import axiosInstance from "../service/axiosInstanse";
import { API_PATHS } from "../service/apiPaths";

export const AuthContext = createContext();

const applyAuthHeader = (token) => {
  if (token) {
    axiosInstance.defaults.headers.common.Authorization = `Bearer ${token}`;
  } else {
    delete axiosInstance.defaults.headers.common.Authorization;
  }
};

const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [tenant, setTenant] = useState("");
  const [loading, setLoading] = useState(false);
  const [needsOnboarding, setNeedsOnboarding] = useState(false);

  const login = async (email, password) => {
    try {
      const response = await axiosInstance.post(API_PATHS.AUTH.LOGIN, { email, password });
      const { accessToken, user: userData } = response.data;
      if (accessToken) {
        localStorage.setItem("accessToken", accessToken);
        applyAuthHeader(accessToken);
        setUser(userData || { email });
        toast.success("Login successful!");
        return { success: true };
      }
      return { success: false, message: "No token received" };
    } catch (error) {
      const message = error.response?.data?.message || "Login failed";
      toast.error(message);
      return { success: false, message };
    }
  };

  const signup = async (dto) => {
    try {
      const response = await axiosInstance.post(API_PATHS.AUTH.REGISTER, dto);
      const { accessToken, user: userData } = response.data;
      if (accessToken) {
        localStorage.setItem("accessToken", accessToken);
        applyAuthHeader(accessToken);
        setUser(userData || { email: dto.email });
        toast.success("Account created!");
        return { success: true };
      }
      return { success: false, message: "No token received" };
    } catch (error) {
      const message = error.response?.data?.message || "Signup failed";
      toast.error(message);
      return { success: false, message };
    }
  };

  const logout = () => {
    localStorage.removeItem("accessToken");
    applyAuthHeader(null);
    setUser(null);
    setTenant("");
    toast.success("Logged out!");
  };

  useEffect(() => {
    const token = localStorage.getItem("accessToken");
    if (token) {
      applyAuthHeader(token);
      axiosInstance.get(API_PATHS.AUTH.ME)
        .then((res) => { setUser(res.data); })
        .catch(() => {
          localStorage.removeItem("accessToken");
          applyAuthHeader(null);
        });
    }
    setLoading(false);
  }, []);

  return (
    <AuthContext.Provider value={{ user, setUser, tenant, setTenant, loading, needsOnboarding, setNeedsOnboarding, login, signup, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export default AuthProvider;



import { useState } from "react";
import { useAuthContext } from "../context/AuthContext";
import axiosIntance from "../config/axios";

export const useLogout = () => {
  const [loading, setLoading] = useState(false);
  const { setAuthUser } = useAuthContext();
  const logout = async () => {
    try {
      await axiosIntance.get("/api/auth/logout")
      localStorage.removeItem("chat-user");
      setAuthUser(null);
    } catch (error) {
    } finally {
      setLoading(false);
    }
  };
  return { loading, logout };
};

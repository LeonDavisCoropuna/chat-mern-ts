import { useState } from "react";
import { useAuthContext } from "../context/AuthContext";

export const useLogout = () => {
  const [loading, setLoading] = useState(false);
  const { setAuthUser } = useAuthContext();
  const logout = async () => {
    try {
      const res = await fetch("/api/auth/logout", {
        method: "GET",
        headers: { "Content-Type": "application/json" },
      });
      await res.json();
      localStorage.removeItem("chat-user");
      setAuthUser(null);
    } catch (error) {
    } finally {
      setLoading(false);
    }
  };
  return { loading, logout };
};

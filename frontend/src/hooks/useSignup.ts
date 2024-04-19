import { useState } from "react";
import { UserSignUp } from "../models/UserSignUp";
import toast from "react-hot-toast";
import { useAuthContext } from "../context/AuthContext";
export interface Response {
  loading: boolean;
  signup: (inputs: UserSignUp) => Promise<void>;
}

export const useSignUp = (): Response => {
  const [loading, setLoading] = useState(false);
  const { setAuthUser } = useAuthContext();
  const signup = async (inputs: UserSignUp): Promise<void> => {
    const success = handleInputErrors(inputs); // Supongo que handleInputErrors es una función definida en otro lugar
    if (!success) return;

    setLoading(true);
    try {
      const res = await fetch("/api/auth/signup", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(inputs),
      });
      const data = await res.json();
      localStorage.setItem("chat-user", JSON.stringify(data));
      setAuthUser(data);
    } catch (error) {
      toast.error("Algo salió mal");
    } finally {
      setLoading(false);
    }
  };

  return { loading, signup };
};

function handleInputErrors(user: UserSignUp) {
  if (
    !user.confirmPassword ||
    !user.fullname ||
    !user.gender ||
    !user.password ||
    !user.username
  ) {
    toast.error("Please fill  in all fields");
    return false;
  }
  if (user.password != user.confirmPassword) {
    toast.error("Passwords do not match");
    return false;
  }
  if (user.password.length < 6) {
    toast.error("Passwords must be at least 6 characters");
    return false;
  }
  return true;
}

import { createContext, useContext, useState } from "react";
import { User } from "../models/User";

// Define el tipo de datos que se utilizará en el contexto
interface AuthContextType {
  authUser: User | null; // Define el tipo correcto para el usuario autenticado
  setAuthUser: React.Dispatch<React.SetStateAction<User | null>>; // Define el tipo correcto para la función que actualiza el usuario autenticado
}

// Crea el contexto con un valor predeterminado inicial
export const AuthContext = createContext<AuthContextType>({
  authUser: {
    _id: "",
    fullname: "",
    gender: "",
    profilePicture: "",
    username: "",
  },
  setAuthUser: () => {},
});

export const useAuthContext = () => {
  return useContext(AuthContext);
};

export const AuthContextProvider = ({
  children,
}: {
  children: React.ReactNode;
}) => {
  const [authUser, setAuthUser] = useState(
    JSON.parse(localStorage.getItem("chat-user")!) || null
  );

  return (
    <AuthContext.Provider value={{ authUser, setAuthUser }}>
      {children}
    </AuthContext.Provider>
  );
};

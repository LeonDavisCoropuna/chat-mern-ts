import { createContext, useContext, useEffect, useState } from "react";
import { useAuthContext } from "./AuthContext";
import { Socket, io } from "socket.io-client";

interface SocketContextType {
  socket: Socket | undefined;
  onlineUsers: string[]; // Define el tipo adecuado para onlineUsers
}

export const SocketConext = createContext<SocketContextType>({
  socket: undefined,
  onlineUsers: [],
});
export const useSocketContext = () => {
    return useContext(SocketConext);
  };
  
export const SocketContextProvider = ({
  children,
}: {
  children: React.ReactNode;
}) => {
  const [socket, setSocket] = useState<Socket | undefined>();
  const [onlineUsers, setOnlineUsers] = useState<string[]>([]); // Define el tipo adecuado para onlineUsers
  const { authUser } = useAuthContext();

  useEffect(() => {
    if (authUser) {
      const socket = io("http://localhost:8000",{
        query:{
            userId: authUser._id
        }
      });
      setSocket(socket);
      socket.on("getOnlineUsers",(users: string[]) => {
        setOnlineUsers(users)
      })
      return () => {
        socket.close();
      };
    } else {
      if (socket) {
        socket.close();
        setSocket(undefined);
      }
    }
  }, [authUser]);

  return (
    <SocketConext.Provider value={{ socket, onlineUsers }}>
      {children}
    </SocketConext.Provider>
  );
};

import { createContext, useContext, useEffect, useState } from "react";
import { useAuthContext } from "./AuthContext";
import { Socket, io } from "socket.io-client";

interface SocketContextType {
  socket: Socket | undefined;
  onlineUsers: string[]; 
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
  const [onlineUsers, setOnlineUsers] = useState<string[]>([]);
  const { authUser } = useAuthContext();

  useEffect(() => {
    if (authUser) {
      const socket = io("http://backend:5000", {
        transports: ["websocket"],
        query: {
          userId: authUser._id,
        },
      });
      setSocket(socket);
      socket.on("getOnlineUsers", (users: string[]) => {
        setOnlineUsers(users);
      });
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

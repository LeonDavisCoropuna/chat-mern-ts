import { useEffect } from "react";
import { useSocketContext } from "../context/SocketContext";
import useConversation from "../zustand/useConversation";

import notificacionSound from "../assets/notification.mp3";
import { IMessage } from "../models/Message";

export const useListenMessage = () => {
  const { socket } = useSocketContext();
  const { messages, setMessages } = useConversation();

  useEffect(() => {
    const handleNewMessage = (newMessage: IMessage) => {
      const sound = new Audio(notificacionSound);
      sound.play();
      setMessages([...messages, newMessage]);
    };

    if (socket) {
      socket.on("newMessage", handleNewMessage);
      return () => {
        socket.off("newMessage", handleNewMessage);
      };
    }
  }, [socket, setMessages, messages]);
};

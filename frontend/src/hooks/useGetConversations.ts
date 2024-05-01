import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import { User } from "../models/User";
import axiosInstance from "../config/axios";

const useGetConversations = () => {
  const [loading, setLoading] = useState(false);
  const [conversations, setConversations] = useState<User[]>([]);

  useEffect(() => {
    const getConversations = async () => {
      setLoading(true);
      try {
        const { data } = await axiosInstance.get("/api/users");
        if (data.error) {
          throw new Error(data.error);
        }
        setConversations(data);
      } catch (error) {
        toast.error("Ocurrio un error");
      } finally {
        setLoading(false);
      }
    };

    getConversations();
  }, []);

  return { loading, conversations };
};
export default useGetConversations;

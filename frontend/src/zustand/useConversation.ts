import { create } from "zustand";
import { User } from "../models/User";
import { IMessage } from "../models/Message";

interface ConversationState {
  selectedConversation: User | null;
  messages: IMessage[];
}
interface ConversationActions {
  setSelectedConversation: (conversation: User | null) => void; 
  setMessages: (messages: IMessage[]) => void; 
}

interface ConversationStore extends ConversationState, ConversationActions {}

const useConversation = create<ConversationStore>((set) => ({
  selectedConversation: null,
  setSelectedConversation: (selectedConversation) =>
    set((state) => ({ ...state, selectedConversation })),
  messages: [],
  setMessages: (messages) => set((state) => ({ ...state, messages })),
}));

export default useConversation;

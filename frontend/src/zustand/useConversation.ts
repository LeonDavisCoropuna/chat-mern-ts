import { create } from "zustand";
import { User } from "../models/User";
import { IMessage } from "../models/Message";

// Define una interfaz para el estado del conversación
interface ConversationState {
  selectedConversation: User | null; // Define el tipo adecuado para selectedConversation
  messages: IMessage[]; // Define el tipo adecuado para messages
}

// Define una interfaz para las funciones que modificarán el estado
interface ConversationActions {
  setSelectedConversation: (conversation: User | null) => void; // Define el tipo adecuado para setSelectedConversation
  setMessages: (messages: IMessage[]) => void; // Define el tipo adecuado para setMessages
}

// Combina ambas interfaces para definir el estado completo y las funciones
interface ConversationStore extends ConversationState, ConversationActions {}

const useConversation = create<ConversationStore>((set) => ({
  selectedConversation: null,
  setSelectedConversation: (selectedConversation) =>
    set((state) => ({ ...state, selectedConversation })),
  messages: [],
  setMessages: (messages) => set((state) => ({ ...state, messages })),
}));

export default useConversation;

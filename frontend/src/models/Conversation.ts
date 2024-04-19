import { IMessage } from "./Message";
import { User } from "./User";

export interface Conversation {
  participants: User[];
  messages: IMessage[];
}

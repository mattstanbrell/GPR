import { Schema } from "../../../amplify/data/resource";
import { Message } from "./models";

// some simplified types for the threads and messages

export type UserType = {
    id: string
    firstName: string
    lastName: string
};

export type FormType = {
    id: string
};

export type UserThreadType = Schema["UserThread"]["type"];
export type ThreadMessages = Message[];
export type ThreadUsers = UserThreadType[];

export type ThreadType = {
    id: string
    messages: Schema["Thread"]["type"]["messages"]
    name?: string 
    lastMessage?: Message
    unreadCount?: number | null
    allUsers?: UserType[]
    formId?: string
    allMessages?: MessageType[]
    users: Schema["Thread"]["type"]["users"]
    form: Schema["Thread"]["type"]["form"]
}

export type MessageType = {
    id: string, 
    userID: Schema["Message"]["type"]["userID"],
    user: Schema["Message"]["type"]["user"], 
    content: string, 
    timeSent?: Schema["Message"]["type"]["timeSent"]
}; 


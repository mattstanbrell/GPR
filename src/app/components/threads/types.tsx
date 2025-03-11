import { Schema } from "../../../../amplify/data/resource";

export type ThreadType = {
    id: string
    messages: Schema["Thread"]["type"]["messages"]
    name?: string 
    lastMessage?: Schema["Message"]["type"]
    unreadCount?: number | null
    allUsers?: UserType[]
    formId?: string
    allMessages?: MessageType[]
    users: Schema["Thread"]["type"]["users"]
    form: Schema["Thread"]["type"]["form"]
}

export type UserType = {
    id: string
    firstName: string
    lastName: string
};

export type FormType = {
    id: string
};

export type UserThreadType = Schema["UserThread"]["type"];
export type ThreadUsers = UserThreadType[];
export type Message = Schema["Message"]["type"];
export type ThreadMessages = Message[];


export type MessageType = {
    id: string, 
    user: Schema["Message"]["type"]["user"], 
    content: string, 
    timeSent?: Schema["Message"]["type"]["timeSent"]
}; 

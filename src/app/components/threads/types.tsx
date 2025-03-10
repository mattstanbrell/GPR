import { Schema } from "../../../../amplify/data/resource";

export type ThreadType = {
    id: string
    messages: Schema["Thread"]["type"]["messages"]
    lastMessage?: Schema["Message"]["type"]
    unreadCount?: number | null
}

type UserType = Schema["User"]["type"];


export type MessageType = {
    id: string, 
    user: Schema["Message"]["type"]["user"], 
    content: string, 
    timeSent: string
}; 

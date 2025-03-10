'use client'

import Message from "./Message"
import { MessageType } from "./types"
import { useAuth } from "@/utils/authHelpers";

interface MessagesContainerProps {
    messages?: MessageType[]
}



const MessagesContainer = ({ messages }: MessagesContainerProps) => {
    const currentUser = useAuth();

    return (
        <div>
            {messages?.map((message, i) => {
                return (
                    <Message
                        message={message}
                        className={
                            `flex flex-col 
                            ${currentUser?.id == message.id ? "bg-(--colour-background-medium)" : "bg-(--colour-background-dark)"} 
                            ${i == messages.length - 1 ? "mb-4" : "mb-2"}`}
                        key={message.id}
                    />
                )
            })}
        </div>
    )
}

export default MessagesContainer

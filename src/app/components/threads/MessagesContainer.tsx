'use client'

import Message from "./Message"
import { MessageType } from "./types"
import { useAuth } from "@/utils/authHelpers";
import { useLayoutEffect, useRef } from "react";

interface MessagesContainerProps {
    messages?: MessageType[]
}



const MessagesContainer = ({ messages }: MessagesContainerProps) => {
    const currentUser = useAuth();
    const containerRef = useRef<HTMLDivElement>(null);

    useLayoutEffect(() => {
        if (containerRef.current) {
            containerRef.current.scrollTop = containerRef.current.scrollHeight;
        }
    }, [messages]);

    return (
        <div ref={containerRef} className="flex flex-col flex-1 gap-5 max-h-100 p-4 overflow-y-auto">
            {messages?.map((message, i) => {
                return (
                    <Message
                        message={message}
                        className={
                            `flex flex-col
                            text-white
                            ${currentUser?.id == message.id ? 
                                "bg-(--color-background-medium) self-end" : 
                                "bg-(--color-background-dark)"} 
                            ${i == messages.length - 1 ? "mb-2" : null}`}
                        key={message.id}
                    />
                )
            })}
        </div>
    )
}

export default MessagesContainer

import { AuthGetCurrentUserServer } from "@/utils/amplifyServerUtils";
import Message from "./Message"
import { MessageType } from "./types"

interface MessagesContainerProps {
    messages: MessageType[]
}



const MessagesContainer = async ({ messages }: MessagesContainerProps) => {
    const currentUser = await AuthGetCurrentUserServer();

    return (
        <div>
            {messages.map((message, i) => {
                return (
                    <Message
                        message={message}
                        className={
                            `flex flex-col 
                            ${currentUser?.userId == message.userID ? "bg-(--colour-background-medium)" : "bg-(--colour-background-dark)"} 
                            ${i == messages.length - 1 ? "mb-4" : "mb-2"}`}
                        key={message.id}
                    />
                )
            })}
        </div>
    )
}

export default MessagesContainer
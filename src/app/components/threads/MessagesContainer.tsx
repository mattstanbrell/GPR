import Message from "./Message"
import { MessageType } from "./types"

interface MessagesContainerProps {
    messages: MessageType[]
}

const currentUser = {
    name: "Alice",
    userID: "1",
    threads: ["1", "2", "3"]
}


const MessagesContainer = ({messages} : MessagesContainerProps) => {
  return (
    <div>
        {messages.map((message, i) => {
            return (
                <Message 
                    message={message} 
                    className={`flex flex-col ${currentUser.userID == message.userID} ${i == messages.length - 1 ? "mb-4" : "mb-2"}`} 
                    key={message.id}
                />
            )
        })}
    </div>
  )
}

export default MessagesContainer
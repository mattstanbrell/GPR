import { MessageType } from "./types"

interface MessagesContainerProps {
    messages: MessageType[]
}


const MessagesContainer = ({messages} : MessagesContainerProps) => {
  return (
    <div>
        {messages.map((message, i) => {
            return (
            <div key={i}>
                <p>{message.userID}</p>
                <p>{message.content}</p>
                <p>{message.createdAt}</p>
            </div>
            )
        })}
    </div>
  )
}

export default MessagesContainer
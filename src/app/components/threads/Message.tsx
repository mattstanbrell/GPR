import { MessageType } from "./types"

interface MessageProps {
    message: MessageType
    className?: string
}


const Message = ({ message, className }: MessageProps) => {
    return (
        <div className={`${className}`}>
            <p>{message.userID}</p>
            <p>{message.content}</p>
            <p>{message.timeSent}</p>
        </div>
    )
}

export default Message
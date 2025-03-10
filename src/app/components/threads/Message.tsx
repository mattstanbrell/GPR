import { getName } from "@/utils/authHelpers"
import { MessageType } from "./types"

interface MessageProps {
    message: MessageType
    className?: string
}


const Message = ({ message, className }: MessageProps) => {
    return (
        <div className={`${className}`}>
            <p>{getName(message.user)}</p>
            <p>{message.content}</p>
            <p>{message.timeSent}</p>
        </div>
    )
}

export default Message
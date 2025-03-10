import { getName } from "@/utils/authHelpers"
import { MessageType } from "./types"
import { formatTimestamp } from "../util/_helpers"

interface MessageProps {
    message: MessageType
    className?: string
}


const Message = ({ message, className }: MessageProps) => {
    return (
        <div className={`w-2/3 rounded-xl p-3 pt-2 gap-1 ${className}`}>
            <div className="flex gap-2  items-center">
                <div className="font-bold">{getName(message.user)}</div>
                <div className="text-xs  text-(--color-text-light-alt)">{formatTimestamp(new Date(message.timeSent))}</div>
            </div>
            <p>{message.content}</p>
            
        </div>
    )
}

export default Message
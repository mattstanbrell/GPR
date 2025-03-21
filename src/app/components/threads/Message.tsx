import { getName } from "@/utils/authenticationUtils";
import { MessageType, UserType } from "../../types/threads"
import { formatTimestamp } from "@/utils/timeUtils";
import { useEffect, useState } from "react"

interface MessageProps {
    message?: MessageType
    className?: string
    loading?: boolean
}


const Message = ({ message, className, loading }: MessageProps) => {
    const [user, setUser] = useState<UserType | null>(null);
    const [timeSent, setTimeSent] = useState<string | null>(null);

    useEffect(() => {        
        async function fetchMessageData() {
            if(!message) return;
            try{
                const [{data: user}, timeSent] = await Promise.all([
                    message.user(),
                    message.timeSent
                ]);

                setUser(user);

                if (timeSent) {
                    setTimeSent(timeSent);
                }
            } catch (error) {
                console.error(error);
            }
        }
        fetchMessageData();
    }, [message])

    if (loading) {
        return (
            <div 
                className={`w-2/5 h-20 rounded-xl animate-pulse ${className}`}>
            </div>) 
    }

    return message && user && timeSent ? (<div className={`max-w-2/3 rounded-xl p-3 pt-2 gap-1 ${className}`}>
                <div className="flex gap-2  items-center">
                    <div className="font-bold">{getName(user)}</div>
                    <div className="text-xs  text-(--color-text-light-alt)">{formatTimestamp(new Date(timeSent))}</div>
                </div>
                <p className="break-words">{message.content}</p>
            </div>
        ) : null
    
}

export default Message
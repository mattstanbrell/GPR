interface MessageProps {
    message: any
    className?: string
}


const Message = ({ message, className }: MessageProps) => {
    return (
        <div className={`${className}`}>
            <p>{message.userID}</p>
            <p>{message.content}</p>
            <p>{message.createdAt}</p>
        </div>
    )
}

export default Message
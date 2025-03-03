import { THREAD } from "@/app/constants/urls"
import Link from "next/link"
import NotificationBadge from "../util/NotificationBadge"

interface ButtonProps {
    name: String
    threadId: String
    message?: String
    unreadCount?: Number
}

const ThreadButton = async ({name, threadId, message, unreadCount}: ButtonProps) => {
    return (
        <Link 
            href={`${THREAD}${threadId}`}
            className="font-bold cursor-pointer p-2 px-5 items-center  flex hover:bg-(--color-background-medium) gap-10 focus:outline-2 focus:outline-offset-2 focus:outline-(--color-accent) active:bg-(--color-background-dark)"
        >
                    <span className="flex-1/2 text-2xl text-left">{name}</span>
                    <span className="flex-2/3 text-(--color-text-light-alt) truncate text-right ">{message}</span>
                    {unreadCount ? <NotificationBadge count={unreadCount} className="shrink-0"/> : null}
        </Link>
    )
}

export default ThreadButton
'use client'
import { THREAD } from "@/app/constants/urls"
import NotificationBadge from "../util/NotificationBadge"
import { redirect } from "next/navigation"

interface ButtonProps {
    name: string
    threadId: string
    message?: string
    unreadCount?: number
    className?: string
}

const ThreadRow = ({ name, threadId, message, unreadCount, className }: ButtonProps) => {
    return (
        <tr
            key={threadId}
            onClick={() => redirect(`${THREAD}${threadId}`)}
            className={`w-full font-bold cursor-pointer focus:outline-2 focus:outline-offset-2 items-center gap-10 flex ${className}`}
        >
            <td className="flex-1/3">
                <span className="text-2xl text-left">{name}</span>
            </td>
            <td className="flex-2/3 truncate alt-text">
                <span className="">{message}</span>
            </td>
            <td className="shrink-0">
                {unreadCount ? <NotificationBadge count={unreadCount}  /> : null}
            </td>
        </tr>
    )
}

export default ThreadRow
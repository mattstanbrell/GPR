'use client'
import { THREAD } from "@/app/constants/urls"
import NotificationBadge from "../util/NotificationBadge"
import Link from "next/link"

interface ButtonProps {
    name: string
    threadId: string
    message?: string
    unreadCount?: number
    className?: string
    selected?: boolean
}

const ThreadRow = ({ name, threadId, message, unreadCount, className, selected }: ButtonProps) => {
    return (
        <tr
            key={threadId}
            className={`
                w-full font-bold cursor-pointer
                ${selected?"preset-light" : "preset-secondary"}
                ${className}`}
        >
            <td 
                tabIndex={0}
                className="flex 
                        items-center 
                        app-hoverable p-2 px-7  
                        gap-2 app-keep 
                        app-background
                        app-hoverable
            ">
                <Link href={`${THREAD}${threadId}`}>
                    <div className="flex-1">
                        <span className="text-2xl text-left">{name}</span>
                    </div>
                    <div className={`flex-1 w-1/2 flex gap-1 app-alt-text`}>
                        <div className={`truncate `}>
                            <span className="text-left">{message}</span>
                        </div>
                        <div className="shrink-0 ">
                            {unreadCount ? <NotificationBadge count={unreadCount} /> : null}
                        </div>
                    </div>
                </Link>
            </td>
        </tr>
    )
}

export default ThreadRow
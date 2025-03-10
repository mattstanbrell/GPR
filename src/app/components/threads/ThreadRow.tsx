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
                flex
                font-bold cursor-pointer
                ${selected?"preset-light" : "preset-secondary"}
                ${className}`}
        >
            <td 
                tabIndex={0}
                className="
                        w-full
                        flex-1
                        app-hoverable p-2 px-7  
                        app-keep 
                        app-background
                        app-hoverable
            ">
                <Link href={`${THREAD}${threadId}`}  className={`gap-3 flex ${selected?"preset-light" : "preset-secondary"} shrink items-center`}>
                    <p className="text-2xl flex-1 truncate text-left" title={name}>{name}</p>
                    <div className={` w-1/2 flex-1 flex gap-1 app-alt-text`}>
                        <div className="flex-1 text-left truncate" title={message}>{message}</div>
                        <div className="">
                            {unreadCount ? <NotificationBadge count={unreadCount} /> : null}
                        </div>
                    </div>
                </Link>
            </td>
        </tr>
    )
}

export default ThreadRow
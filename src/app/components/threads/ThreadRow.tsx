'use client'
import { THREADS } from "@/app/constants/urls"
import NotificationBadge from "../util/NotificationBadge"
import Link from "next/link"

interface ButtonProps {
    loading?: boolean
    name?: string
    threadId?: string
    message?: string
    unreadCount?: number
    className?: string
    selected?: boolean
}

const ThreadRow = ({ name, threadId, message, unreadCount, className, selected, loading }: ButtonProps) => {
    if (loading) {
        return (
            <tr className="flex  font-bold cursor-pointer bg-gray-400 animate-pulse">
                <td className="flex-1 h-40  ">
                </td>
            </tr>
        )
    }

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
                        app-hoverable 
                        app-keep 
                        app-background
                        app-hoverable
            ">
                <Link href={`${THREADS}${threadId}`}  className={`p-2 px-5  gap-2 flex ${selected?"preset-light" : "preset-secondary"} shrink items-center`}>
                    <p className="text-xl flex-1 truncate text-left" title={name}>{name}</p>
                    <div className={` ${message? "md:w-10 lg:w-1/2 w-1/2 md:flex-none flex-1" : "flex-none"}  flex gap-2 app-alt-text justify-end`}>
                        <div className="flex-1 text-left truncate md:hidden lg:block" title={message}>{message}</div>
                        <div className="">
                            {unreadCount ?
                                ((unreadCount > 0) &&
                                <NotificationBadge count={unreadCount} />) : null
                            }
                        </div>
                    </div>
                </Link>
            </td>
        </tr>
    )
}

export default ThreadRow
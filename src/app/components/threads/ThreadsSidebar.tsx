import ThreadRow from "./ThreadRow"
import Image from "next/image"

const threads = [
    {
        name: "Bob",
        threadId: "1",
        message: "I'm unsure why that didn't work",
        unreadCount: 2
    },
    {
        name: "James",
        threadId: "2",
        unreadCount: 0,
    },
    {
        name: "Dave",
        threadId: "3",
        message: "I think we'll need more than that, what else is available?",
        unreadCount: 10
    }
]

const ThreadsSidebar = () => {
    return (
        <div>
            <h1>All Threads</h1>
            <Image 
                src="/menu.svg" 
                alt="menu" 
                width={30} 
                height={30}
                style = {{filter: "var(--hounslow-primary-filter)"}}
            />
            <table className="flex flex-col border-0">
                <thead>
                    <tr className="flex flex-row text-xl bg-(--color-secondary) px-5 p-2 text-(--color-text-light) ">
                        <th className="flex-1/3  text-left">Name</th>
                        <th className="flex-2/3 text-left">Last Message</th>
                        <th className="shrink-0 text-right">Unread</th>
                    </tr>
                </thead>
                <tbody className="flex flex-col">
                    {threads.map((thread) => (
                                <ThreadRow 
                                    name={thread.name} 
                                    threadId={thread.threadId} 
                                    message={thread.message} 
                                    unreadCount={thread.unreadCount} 
                                    key={thread.threadId}
                                    className={"preset-light-background border-t-1 p-2 px-5 hover:!bg-(--color-background-medium) focus:outline-(--color-accent) active:!bg-(--color-background-dark)"}/>

                    ))}
                </tbody>
            </table>
        </div>
    )
}


export default ThreadsSidebar

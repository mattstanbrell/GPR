'use client';
import { useEffect, useState } from "react";
import ThreadsSidebar from "./ThreadsSidebar";
import Thread from "./Thread";


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
        message: "I think we need to add more detail to the requirements"
    },
    {
        name: "Dave",
        threadId: "3",
        message: "I think we'll need more than that, what else is available?",
        unreadCount: 10
    }
]

interface ThreadsContainerProps {
    threadId?: string
}

const ThreadsContainer = ({threadId} : ThreadsContainerProps) => {
    const [isMobile, setIsMobile] = useState(false);
    const [toggleScreen, setToggleScreen] = useState(false); // if isMobile is true: true will show the thread, false will show the threads 

    useEffect(() => {
        const mediumWindowSize = 768;
        const handleResize = () => {
            setIsMobile(window.innerWidth < mediumWindowSize);
        };

        handleResize();
        window.addEventListener("resize", handleResize);
        return () => window.removeEventListener("resize", handleResize);
    }, []);

    return (
        <div className="flex flex-row">
            <ThreadsSidebar threads={threads} selectedId={threadId} isMobile={isMobile} className={`${!isMobile? " w-1/3" : "w-full" } shrink-1 preset-secondary`} />
            {isMobile? null : <Thread threadId={threadId} isMobile={isMobile} className="flex-1 grow border-2" />}
        </div>
    )
}


export default ThreadsContainer

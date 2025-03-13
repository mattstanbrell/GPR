'use client';

import { useState, useEffect, createContext, useContext } from "react";
import { getThreadsWithUser, getUnreadMessageNumber } from "@/utils/apis";
import { AppContext } from "@/app/layout";
import { ThreadType } from "../types/threads";

export const ThreadsContext = createContext<
    { 
        threads: ThreadType[],
        loading: boolean,
    }>({
        threads: [],
        loading: true, 
    });

interface ThreadsLayoutProps {
    children: React.ReactNode;
}

export default function ThreadsLayout({ children } : ThreadsLayoutProps) {
    const { currentUser } = useContext(AppContext);
    const [threads, setThreads] = useState<ThreadType[]>([]);
    const [loading, setLoading] = useState(true);


    useEffect(() => {
        async function fetchThreads() {
            try{
                setLoading(true);

                // If there is no current user, return
                // But keep loading to true as user probably is being fetched
                if (!currentUser) return;

                // First fetch the threads
                const allThreads = await getThreadsWithUser(currentUser.id)

                
                if (allThreads){
                    // Fetch the thread details
                    const newThreads = await Promise.all(allThreads.map(async (thread) => {
                        const [{data: messages}, name, unreadCount, lastMessageTime] = await Promise.all([
                            thread.messages(),
                            thread.form().then((form) => form?.data?.title),
                            getUnreadMessageNumber(thread.id, currentUser.id),
                            thread.lastMessageTime
                        ]);
                        
                        messages.sort((a, b) => {
                            if (!a.timeSent || !b.timeSent) return 0;
                            return new Date(a.timeSent).getTime() - new Date(b.timeSent).getTime();
                        });

                        return {
                            ...thread,
                            lastMessage: messages[messages.length - 1],
                            unreadCount,
                            lastMessageTime,
                            name: name || "No Title"
                        }
                    }));
                    newThreads.sort((a, b) => {
                        if (!a?.lastMessageTime && !b?.lastMessageTime) return 0;
                        if (!a?.lastMessageTime) return 1;
                        if (!b?.lastMessageTime) return -1;
                        return new Date(b.lastMessageTime).getTime() - new Date(a.lastMessageTime).getTime(); 
                    });
                    setThreads(newThreads);
                }
                setLoading(false);

            } catch (error) {
                console.error(error);
            }
        }
        fetchThreads();
    }, [currentUser]);

    return (
        <ThreadsContext.Provider value={{ threads, loading }}>
            {children}
        </ThreadsContext.Provider>
    );
}

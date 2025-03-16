'use client'

import ThreadsContainer from "@/app/components/threads/ThreadsContainer";
import { useContext, useEffect, useState, useRef } from "react";
import { ThreadsContext } from "../layout";
import { ThreadType } from "@/app/types/threads";
import { getThreadbyID, getUsersInThread, subscribeToThreadMessages } from "@/utils/apis";
import { Subscription } from "rxjs/internal/Subscription"
import { AppContext } from "@/app/layout";


const ThreadPage = ({ params }: { params: Promise<{ id: string }> }) => {
	const { threads, loading: loadingThreads } = useContext(ThreadsContext);
	const { currentUser } = useContext(AppContext);
	const [currentThread, setCurrentThread] = useState<ThreadType | null>(null);
	const [loading, setLoading] = useState(true);
	const subscriptionRef = useRef<Subscription | null>(null);

	useEffect(() => {
		let isMounted = true;

		async function fetchThreads() {
			const {id: threadId} = await params;
			setLoading(true);
			if (!currentUser) return;
			if(!threadId) return;

			try {
				// Cleanup: Unsubscribe and prevent updates if component is unmounted
				if (subscriptionRef.current) {
					subscriptionRef.current.unsubscribe();
				}

				// First fetch the threads
				const thread = await getThreadbyID(threadId);

				if (!thread) return;


				// Fetch the thread details
				const [name, allUsers, formId] = await Promise.all([
					thread.form().then((form) => form?.data?.title),
					getUsersInThread(thread.id),
					thread.form().then((form) => form?.data?.id)
				]);

				if (!isMounted) return;
				
				// Fetch the messages
				const sub = subscribeToThreadMessages(thread.id, (m) => {
					if(isMounted){
						m.sort((a, b) => {
							if (!a.timeSent || !b.timeSent) return 0;
							return new Date(a.timeSent).getTime() - new Date(b.timeSent).getTime();
						});
						setCurrentThread((prev) => prev ? { ...prev, allMessages: m } : prev)
					}
				});

				subscriptionRef.current = sub;
				
				setCurrentThread({
					...thread,
					name: name || "No Title",
					allUsers,
					formId
				});
				setLoading(false);
			} catch (error) {
				console.error(error);
			}
		}
		fetchThreads();

		return () => {
			// Cleanup: Unsubscribe and prevent updates if component is unmounted
			isMounted = false;
			if (subscriptionRef.current) {
				subscriptionRef.current.unsubscribe();
				subscriptionRef.current = null;
			}
		};
	}, [currentUser, params]);

	return (
		<ThreadsContainer 
			thread={currentThread} 
			threads={threads} 
			loadingThreads={loadingThreads}
			loadingThread={loading}
			startWithSidebar={false} 
		/>
	)
}

export default ThreadPage
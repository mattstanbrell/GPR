import ThreadsContainer from "@/app/components/threads/ThreadsContainer";

const ThreadPage = async ({params} : {params: Promise<{ id: string }>}) => {
  const { id } = await params;

  return (
    <ThreadsContainer threadId={id} startWithSidebar={false} />
  )
}

export default ThreadPage
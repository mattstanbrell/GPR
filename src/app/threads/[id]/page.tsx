import Thread from "@/app/components/threads/Thread"
import ThreadsSidebar from "@/app/components/threads/ThreadsSidebar"

const ThreadPage = async ({params} : {params: Promise<{ id: string }>}) => {
  const { id } = await params;

  return (
    <div className="flex flex-row">
      <ThreadsSidebar selectedId={id} className="shrink-1 w-1/3 preset-secondary" />
      <Thread threadId={id} className="flex-1 grow border-2" />
    </div>
  )
}

export default ThreadPage
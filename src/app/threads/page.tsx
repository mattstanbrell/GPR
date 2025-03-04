import Thread from "@/app/components/threads/Thread"
import ThreadsSidebar from "@/app/components/threads/ThreadsSidebar"

const ThreadPage = async () => {
  return (
    <div className="flex flex-row">
      <ThreadsSidebar className="shrink-1 w-1/3 preset-secondary" />
      <Thread className="flex-1 grow border-2" />
    </div>
  )
}

export default ThreadPage
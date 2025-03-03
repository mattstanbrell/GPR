import ThreadButton from "./ThreadButton"


const ThreadsContainer = async () => {
    return (
        <div>
            <h1>All Threads</h1>
            <div className="flex flex-col bg-(--color-secondary) text-(--color-text-light) ">
                <ThreadButton name="Bob" threadId="1" message="I'm unsure why that didn't work" unreadCount={2} />
                <ThreadButton name="James" threadId="2" />
                <ThreadButton name="Dave" threadId="3" message="I think we'll need more than that, what else is available?" unreadCount={10} />
            </div>
        </div>
    )
}


export default ThreadsContainer

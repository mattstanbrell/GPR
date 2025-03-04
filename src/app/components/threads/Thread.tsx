interface ThreadProps {
    threadId?: string
    className?: string
    isMobile?: boolean
}

const thread = {
    name: "Bob",
    threadId: "1",
    users: ["Alice", "Bob"],
    formId: "1",
    messages: [
        {
            sender: "Bob",
            message: "I'm unsure why that didn't work",
            timestamp: "2021-09-01T12:00:00Z"
        },
        {
            sender: "Alice",
            message: "I think you need to add more detail to the requirements",
            timestamp: "2021-09-01T12:01:00Z"
        }
    ]
}

const Thread = ({ threadId, className, isMobile }: ThreadProps) => {
    return (
        <div className={`flex flex-col ${className}`}>
            
            <div className="bg-(--color-background-light) pt-7 ps-7">
                {isMobile ? <p className="app-alt-text">text</p> : null}
                {threadId?
                    <h1>{thread.name}</h1>:
                    <h1>No thread selected</h1>
                }
            </div>
            <div>
                Messages
            </div>
            <div>
                Input
            </div>
        </div>
    )
}

export default Thread
export const threads = [
    {
        name: "Bob",
        threadId: "1",
        message: "I'm unsure why that didn't work",
        unreadCount: 2
    },
    {
        name: "James Suit",
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


export const thread = {
    name: "Bob",
    threadId: "1",
    users: [{id: "121313", firstName: "Alice", lastName: "Smith"}, {id: "121314", firstName: "Bob", lastName: "Jones"}],
    formId: "1",
    messages: [
        {
            id: "1", 
            user: {
                id: "121313",
                firstName: "Alice",
                lastName: "Smith"
            },
            content: "Hello, how have you been? It's been a while since we last spoke.",
            timeSent: "2025-02-01T12:00:00Z"
        },
        {
            id: "2", 
            user: {
                id: "121314",
                firstName: "Bob",
                lastName: "Jones"
            },
            content: "Hi Alice! I've been good, thanks for asking. How about you?",
            timeSent: "2025-03-10T12:01:00Z"
        },
        {
            id: "3", 
            user: {
                id: "121313",
                firstName: "Alice",
                lastName: "Smith"
            },
            content: "I'm doing well too, just been busy with work and other things. What have you been up to?",
            timeSent: "2025-03-10T12:02:00Z"
        },
        {
            id: "4", 
            user: {
                id: "121314",
                firstName: "Bob",
                lastName: "Jones"
            },
            content: "I've been working on some new projects at work. It's been quite exciting!",
            timeSent: "2025-03-10T12:03:00Z"
        }
    ]
}
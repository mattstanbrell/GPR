import { generateClient } from "@aws-amplify/api";
import { Schema } from "../../../../amplify/data/resource";
import { assignUserToFormWithThread, assignUserToThread, createFormWithThread, createMessage, createUser } from "@/utils/apis";
import { UserType } from "./types";

const client = generateClient<Schema>();

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

// seed database
export const seed = async (currentUser?: UserType) => {
    console.log("Seeding database");
    
    if (!currentUser) return;
    // create users

    const alice = await createUser("alice.smith@gmail.com", "Alice", "Smith");
    const bob = await createUser("bob.dylan@gmail.com", "Bob", "Dylan");
    const charlie = await createUser("charlie.brown@gmail.com", "Charlie", "Brown");
    const dave = await createUser("dave.jones@gmail.com", "Dave", "Jones");
    
    if (!alice || !bob || !charlie || !dave) return;
    
    // create forms and threads
    const {form: form1, thread: thread1} = await createFormWithThread(
        "11", "Need sauce", 20, 
        {
            day: 1, 
            month: 1, 
            year: 2025
        }, 
        {
            name: {firstName: "Alice", lastName: "Smith"}, 
            address: {lineOne: "1", lineTwo: "2", townOrCity: "London", postcode: "E1 1AA"}
        },
        "COMPLETED", currentUser.id, "1","good", 
        "Hotel for Jim"
    );

    const {form: form2, thread: thread2} = await createFormWithThread(
        "12", "Need more details", 30, 
        {
            day: 2, 
            month: 2, 
            year: 2025
        }, 
        {
            name: {firstName: "Bob", lastName: "Dylan"}, 
            address: {lineOne: "3", lineTwo: "4", townOrCity: "Manchester", postcode: "M1 1AA"}
        },
        "COMPLETED", currentUser.id, "2", "detailed", 
        "Conference for Bob"
    );

    const {form: form3, thread: thread3} = await createFormWithThread(
        "13", "Need approval", 40, 
        {
            day: 3, 
            month: 3, 
            year: 2025
        }, 
        {
            name: {firstName: "Charlie", lastName: "Brown"}, 
            address: {lineOne: "5", lineTwo: "6", townOrCity: "Birmingham", postcode: "B1 1AA"}
        },
        "DRAFT", currentUser.id, "3", "urgent", 
        "Meeting for Charlie"
    );

    // assign users to forms
    assignUserToFormWithThread(form1.id, alice.id);
    assignUserToFormWithThread(form1.id, bob.id);

    assignUserToFormWithThread(form2.id, bob.id);
    assignUserToFormWithThread(form2.id, charlie.id);

    assignUserToFormWithThread(form3.id, charlie.id);
    assignUserToFormWithThread(form3.id, dave.id);

    // assign creater of form to thread
    assignUserToThread(thread1.id, currentUser.id);
    assignUserToThread(thread2.id, currentUser.id);
    assignUserToThread(thread3.id, currentUser.id);


    // add messages to thread 1
    await createMessage(alice.id, thread1.id, "Hello, how have you been? It's been a while since we last spoke.", new Date().toISOString());
    await createMessage(bob.id, thread1.id, "Hi Alice! I've been good, thanks for asking. How about you?", new Date().toISOString());
    await createMessage(alice.id, thread1.id, "I'm doing well too, just been busy with work and other things. What have you been up to?", new Date().toISOString());
    await createMessage(bob.id, thread1.id, "I've been working on some new projects at work. It's been quite exciting!", new Date().toISOString());

    // add messages to thread 2
    await createMessage(bob.id, thread2.id, "I think we need to add more detail to the requirements", new Date().toISOString());
    await createMessage(charlie.id, thread2.id, "Really? I thought we had everything we needed", new Date().toISOString());
    await createMessage(bob.id, thread2.id, "I think we'll need more than that, what else is available?", new Date().toISOString());

    console.log("Seeded database");
}


export const displayBackend = async () => {
    console.log("Displaying backend data");
    const {data: users} = await client.models.User.list();
    const {data: forms} = await client.models.Form.list();
    const {data: formAssignees} = await client.models.FormAssignee.list();
    const {data: threads} = await client.models.Thread.list();
    const {data: messages} = await client.models.Message.list();
    const {data: userMessages} = await client.models.UserMessage.list();
    const {data: userThreads} = await client.models.UserThread.list();

    console.log("Users: ", users);
    console.log("Forms: ", forms);
    console.log("Form Assignees: ", formAssignees);
    console.log("Threads: ", threads);
    console.log("Messages: ", messages);
    console.log("User Messages: ", userMessages);
    console.log("User Threads: ", userThreads);
}

export const deleteModels = async (currentUser: UserType) => {
    console.log("Deleting all models");

    const {data: users} = await client.models.User.list();
    const {data: forms} = await client.models.Form.list();
    const {data: formAssignees} = await client.models.FormAssignee.list();
    const {data: threads} = await client.models.Thread.list();
    const {data: messages} = await client.models.Message.list();
    const {data: userMessages} = await client.models.UserMessage.list();
    const {data: userThreads} = await client.models.UserThread.list();

    for (const user of users) {
        if (user.id === currentUser.id) continue;

        await client.models.User.delete({id: user.id});
    }

    for (const form of forms) {
        await client.models.Form.delete({id: form.id});
    }

    for (const formAssignee of formAssignees) {
        await client.models.FormAssignee.delete({id: formAssignee.id});
    }

    for (const thread of threads) {
        await client.models.Thread.delete({id: thread.id});
    }

    for (const message of messages) {
        await client.models.Message.delete({id: message.id});
    }

    for (const userMessage of userMessages) {
        await client.models.UserMessage.delete({id: userMessage.id});
    }

    for (const userThread of userThreads) {
        await client.models.UserThread.delete({id: userThread.id});
    }

    console.log("Deleted all models");
}
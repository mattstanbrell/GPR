import { generateClient } from "@aws-amplify/api";
import { Schema } from "../../../../amplify/data/resource";
import { 
    assignUserToFormWithThread, 
    assignUserToThread, 
    createFormWithThread, 
    createMessage, 
    createTeam, 
    createUser, 
    addUserToTeam,
    getUserById, 
    assignUserToForm } from "@/utils/apis";
import { UserType } from "../../types/threads";

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
    const eve = await createUser("eve.emilia@gmail.com", "Eve", "Emilia");
    
    if (!alice || !bob || !charlie || !dave || !eve) return;

    // create Teams
    const team1 = await createTeam("Team1", alice.id, bob.id);
    const team2 = await createTeam("Team2", charlie.id, dave.id);

    if (!team1 || !team2) return;

    // add users to teams
    await addUserToTeam(currentUser.id, team1.id);
    await addUserToTeam(alice.id, team1.id);
    await addUserToTeam(bob.id, team1.id);

    await addUserToTeam(charlie.id, team2.id);
    await addUserToTeam(dave.id, team2.id);
    await addUserToTeam(eve.id, team2.id);

    

    // create forms and threads
    const {form: form1, thread: thread1} = await createFormWithThread(
        {
            creatorID: currentUser.id,
            status: "DRAFT",
            title: "Meeting for Alice",
        }
    );

    const {form: form2, thread: thread2} = await createFormWithThread(
        {
            creatorID: currentUser.id,
            status: "DRAFT",
            title: "Meeting for Bob",
        }
    );

    const {form: form3, thread: thread3} = await createFormWithThread(
        {
            creatorID: charlie.id,
            status: "DRAFT",
            title: "Meeting for Charlie",
        }
    );

    const {form: form4} = await createFormWithThread(
        {
            creatorID: currentUser.id,
            status: "SUBMITTED",
            title: "Hotel for Steve",
        }
    );


    // assign users to forms
    assignUserToForm(form1.id, alice.id);
    assignUserToForm(form2.id, bob.id);
    assignUserToForm(form3.id, charlie.id);
    assignUserToForm(form4.id, alice.id);


    // add messages to thread 1
    await createMessage(alice.id, thread1.id, "Hello, how have you been? It's been a while since we last spoke.", new Date().toISOString());
    await createMessage(bob.id, thread1.id, "Hi Alice! I've been good, thanks for asking. How about you?", new Date().toISOString());
    await createMessage(alice.id, thread1.id, "I'm doing well too, just been busy with work and other things. What have you been up to?", new Date().toISOString());
    await createMessage(bob.id, thread1.id, "I've been working on some new projects at work. It's been quite exciting!", new Date().toISOString());

    // add messages to thread 2
    await createMessage(bob.id, thread2.id, "I think we need to add more detail to the requirements", new Date().toISOString());
    await createMessage(currentUser.id, thread2.id, "Really? I thought we had everything we needed", new Date().toISOString());
    await createMessage(bob.id, thread2.id, "I think we'll need more than that, what else is available?", new Date().toISOString());

    // add messages to thread 3
    await createMessage(charlie.id, thread3.id, "I think we need to add more detail to the requirements", new Date().toISOString());
    await createMessage(dave.id, thread3.id, "Really? I thought we had everything we needed", new Date().toISOString());

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
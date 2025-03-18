
'use client'
import { assignUserToForm, createForm, updateUser, assignUserToThread, createThread } from "@/utils/apis";
import { useEffect } from "react";

const emailDomain = "mattstanbrellgmail.onmicrosoft.com"

const updateManager = async (userId: string, managerId: string) => {
    const managers = {
        managerUserId: managerId,
        assistantManagerUserId: managerId,
    }
    // await updateUser(userId, managers)

    return true
}

const createDummyForm = async (userId: string) => {
    return await createForm({
        title: "Charlie's Clothes",
        reason: "His clothes are old",
        amount: 300.00,
        status: "DRAFT",
        creatorID: userId,
    })
} 

const updateFormAssignee = async (formId: string, managerId: string) => {
    await assignUserToForm(formId, managerId)
}

const SetupTest = () => {
    const gregId = "ab697985-b1c2-496c-ac82-39b71ac79277";  // find info manually
    const joyId = "5feef567-cc0b-48f8-8584-6b8da91d12d8";   // find info manually

    // uncomment when ready
    //
    // useEffect(() => {
    //     const createDummy = async () => {
    //         await updateManager(gregId, joyId);
    //         await createDummyForm(gregId);
    //     }
    //     createDummy();
    // }, [])

    // uncomment after form created
    //
    // const formId = "ee14f75f-d0f0-41f1-acc9-8b0314f25db8"; // find manually
    // useEffect(() => {
    //     const updateAssignee = async () => {
    //         await updateFormAssignee(formId, joyId);
    //     }
    //     updateAssignee();
    // }, [])

    // uncomment when creating thread for form
    //
    // useEffect(() => {
    //     const createFormThread = async () => {
    //         await createThread(formId); 
    //     }
    //     createFormThread();
    // }, [])


    // uncomment when thread created
    //
    // useEffect(() => {
    //     const addUsersToThread = async () => {
    //         const thread = await getThreadByFormId(formId);
    //         await assignUserToThread(thread.id, gregId);
    //         await assignUserToThread(thread.id, joyId); 
    //     }
    //     addUsersToThread()
    // }, [])

    return <></>
}

export default SetupTest;
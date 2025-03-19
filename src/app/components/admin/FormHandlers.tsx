'use client'

import React from "react"
import { ADMIN } from "@/app/constants/urls";
import { redirect } from "next/navigation";
import { addUserToTeam, createChild, createTeam, deleteChild, deleteTeam, 
    linkUserToChild, 
    updateChild, updateTeam, updateUser } from "@/utils/apis";

export const handleUserFormSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault(); 
    const formData = new FormData(event.currentTarget); 
    const userId = formData.get('userId') as string;
    const teamId = formData.get('teamid') as string;
    const updatedData = {
        address: {
            lineOne: formData.get('lineone') as string,
            lineTwo: formData.get('linetwo') as string,
            townOrCity: formData.get('towncity') as string, 
            postcode: formData.get('postcode') as string, 
        }, 
    }
    
    // update user details
    await updateUser(userId, updatedData); 
    await addUserToTeam(userId, teamId); 
    
    redirect(ADMIN)
}

export const handleChildFormSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault(); 
    const formData = new FormData(event.currentTarget); 
    const childId = formData.get("childId") as string; 
    const socialWorkerId = formData.get("socialworker") as string; 

    console.log("handler",socialWorkerId)
    
    // construct date of birth
    const day = (formData.get("dd") as string).padStart(2, "0");
    const month = (formData.get("mm") as string).padStart(2, "0");
    const year = formData.get("yyyy") as string;
    const dob = `${year}-${month}-${day}`; 

    const data = {
        caseNumber: formData.get("casenumber") as string, 
        firstName: formData.get("firstname") as string,
        lastName: formData.get("lastname") as string, 
        dateOfBirth: dob, 
        sex: formData.get("sex") as string, 
        gender: formData.get("gender") as string, 
    }
    
    // create or update child form
    let child;
    if (childId) {
        child = await updateChild(childId as string, data); 
    } else {
        child = await createChild(
            data.caseNumber, 
            data.firstName, 
            data.lastName, 
            data.dateOfBirth, 
            data.sex, 
            data.gender
        ); 
    }

    if (child && socialWorkerId) {
        await linkUserToChild(socialWorkerId, child.id);
    }

    redirect(ADMIN);
}

export const handlTeamFormSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const formData = new FormData(event.currentTarget); 
    const teamId = formData.get("teamId") as string;
    const managerId = formData.get("managerid") as string;
    const assistantManagerId = formData.get("assistantmanagerid") as string;
    const data = {
        name: formData.get("teamname") as string,
        managerUserID: managerId, 
        assistantManagerUserID: assistantManagerId,
    }

    // create or update team 
    if (teamId) {
        await updateTeam(teamId, data);
    } else {
        await createTeam(data.name, data.managerUserID, data.assistantManagerUserID); 
    }

    redirect(ADMIN)
}

export const handleDeleteChild = async (childId: string) => {
    await deleteChild(childId);
    redirect(ADMIN);
}

export const handleDeleteTeam = async (teamId: string) => {
    await deleteTeam(teamId);
    redirect(ADMIN)
}
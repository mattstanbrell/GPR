'use client'

import React from "react"
import { ADMIN } from "@/app/constants/urls";
import { redirect } from "next/navigation";
import { createChild, listTeams, updateChild, updateUser } from "@/utils/apis";

export const handleUserFormSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault(); 
    // get form data
    const formData = new FormData(event.currentTarget); 
    const selectedTeam = formData.get('team') as string;
    const userId = formData.get('userId') as string;

    // find team id
    let teamId = null;
    if (selectedTeam) {
        const teams = await listTeams();
        for (const team of teams) {
            if (team.name === selectedTeam) {
                teamId = team.id;
                break
            }
        }
    }

    const updatedData = {
        address: {
            lineOne: formData.get('lineone') as string,
            lineTwo: formData.get('linetwo') as string,
            townOrCity: formData.get('towncity') as string, 
            postcode: formData.get('postcode') as string, 
        },
        teamID: teamId, 
    }
    
    // update user details
    await updateUser(userId, updatedData); 
    redirect(ADMIN)
}

export const handleChildFormSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault(); 
    // get form data
    const formData = new FormData(event.currentTarget); 
    const childId = formData.get("childId"); 
    
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
    if (childId) {
        await updateChild(childId as string, data); 
    } else {
        await createChild(
            data.caseNumber, 
            data.firstName, 
            data.lastName, 
            data.dateOfBirth, 
            data.sex, 
            data.gender
        ); 
    }

    redirect(ADMIN);
}
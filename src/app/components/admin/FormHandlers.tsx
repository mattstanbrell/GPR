'use client'

import React from "react"
import { ADMIN } from "@/app/constants/urls";
import { redirect } from "next/navigation";
import { listTeams, updateUser } from "@/utils/apis";

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
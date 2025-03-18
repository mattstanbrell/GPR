'use client'

import { listUsers, listUsersInTeam, listChildren, listTeams, getTeamByID } from "@/utils/apis"
import { useEffect, useState } from "react"
import { Child, Team, User } from "@/app/types/models"
import { UserTable, ChildTable, TeamTable } from "@/app/components/admin/Table"

const LoadingMessage = () => {
    return <h3 className="text-center">Loading...</h3>
}

const ViewHeading = ({heading} : {heading: string}) => {
    return <h1 className="govuk-heading-l">{heading}</h1>
}

export const AllChildrenView = () => {
    const [isLoading, setIsLoading] = useState<boolean>(true); 
    const [children, setChildren] = useState<Child[]>([]); 
    console.log(children)
    useEffect(() => {
        const fetchChildren = async () => {
            setChildren(await listChildren());
            setIsLoading(false); 
        }
        fetchChildren(); 
    }, [])

    return isLoading ? <LoadingMessage /> : (
        <>
            <ViewHeading heading="Children" />
            <ChildTable children={ children } />
        </>
    )
}

export const AllTeamsView = () => {
    const [isLoading, setIsLoading] = useState<boolean>(true); 
    const [teams, setTeams] = useState<Team[]>([]); 

    useEffect(() => {
        const fetchTeams = async () => {
            setTeams(await listTeams());
            setIsLoading(false); 
        }
        fetchTeams(); 
    }, [])

    return isLoading ? <LoadingMessage /> : (
        <>
            <ViewHeading heading="Teams" />
            <TeamTable teams={ teams } />
        </>
    )
}

export const AllUsersView = () => {
    const [isLoading, setIsLoading] = useState<boolean>(true); 
    const [users, setUsers] = useState<User[]>([]);  
    
    useEffect(() => {
        const fetchAllUsers = async () => {
            setUsers(await listUsers()); 
            setIsLoading(false); 
        }
        fetchAllUsers(); 
    }, [])

    return isLoading ? <LoadingMessage /> : (
        <>
            <ViewHeading heading="Users" />
            <UserTable users={ users } />
        </>
    )
}

export const AllTeamMembersView = ({teamId} : {teamId: string}) => {
    const [teamMembers, setTeamMembers] = useState<User[]>([]); 
    const [isLoading, setIsLoading] = useState<boolean>(true); 
    const [teamName, setTeamName] = useState<string>(""); 

    useEffect(() => {
        const fetchTeamMembers = async () => {
            setTeamMembers(await listUsersInTeam(teamId)); 
            setIsLoading(false);
            const team = await getTeamByID(teamId);
            setTeamName(team?.name ? team?.name : "No Team Name");
        }
        fetchTeamMembers();
    }, [teamId])

    return isLoading ? <LoadingMessage /> : (
        <>  
            <ViewHeading heading={ teamName } />
            <UserTable users={ teamMembers } />
        </>
    ) 
}
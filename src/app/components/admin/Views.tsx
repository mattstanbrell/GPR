'use client'

import { listUsers, listUsersInTeam, listChildren, listTeams } from "@/utils/apis"
import { useEffect, useState } from "react"
import { Child, Team, User } from "@/app/types/models"
import { UserTable, ChildTable, TeamTable } from "@/app/components/admin/Table"

const LoadingMessage = () => {
    return <h3 className="text-center">Loading...</h3>
}

export const AllChildrenView = () => {
    const [isLoading, setIsLoading] = useState<boolean>(true); 
    const [children, setChildren] = useState<Child[]>([]); 

    useEffect(() => {
        const fetchChildren = async () => {
            setChildren(await listChildren());
            setIsLoading(false); 
        }
        fetchChildren(); 
    }, [])

    return isLoading ? <LoadingMessage /> : <ChildTable children={ children } />
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

    return isLoading ? <LoadingMessage /> : <TeamTable teams={ teams } />
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

    return isLoading ? <LoadingMessage /> : <UserTable users={ users } />
}

export const AllTeamMembersView = ({teamId} : {teamId: string}) => {
    const [teamMembers, setTeamMembers] = useState<User[]>([]); 
    const [isLoading, setIsLoading] = useState<boolean>(true); 

    useEffect(() => {
        const fetchTeamMembers = async () => {
            setTeamMembers(await listUsersInTeam(teamId)); 
            setIsLoading(false); 
        }
        fetchTeamMembers();
    }, [teamId])

    return isLoading ? <LoadingMessage /> : <UserTable users={ teamMembers } /> 
}
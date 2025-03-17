'use client'

import { listUsers, listUsersInTeam, listChildren, listTeams } from "@/utils/apis"
import { useEffect, useState } from "react"
import { Child, Team, User } from "@/app/types/models"
import { Table } from "@/app/components/admin/Table"

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

    return isLoading ? <h3 className="text-center">Loading...</h3> : <Table data={ children } />
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

    return isLoading ? <h3 className="text-center">Loading...</h3> : <Table data={ teams } />
}

export const AllUsersView = ({data = []} : {data?: User[]}) => {
    const [isLoading, setIsLoading] = useState<boolean>(true); 
    const [users, setUsers] = useState<User[]>([]); 

    if (data.length > 0) {
        setUsers(data);
        setIsLoading(false); 
    } else {
        useEffect(() => {
            const fetchAllUsers = async () => {
                setUsers(await listUsers()); 
                setIsLoading(false); 
            }
            fetchAllUsers(); 
        }, [])
    }

    return isLoading ? <h3 className="text-center">Loading...</h3> : <Table data={ users } />
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

    return isLoading ? <h3 className="text-center">Loading...</h3> : <AllUsersView data={ teamMembers } /> 
}
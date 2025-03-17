
'use client'

import type { Child, Team, User } from "@/app/types/models"
import { PrimaryButton } from "@/app/components/admin/Buttons"
import { listTeams } from "@/utils/apis"
import { useEffect, useState } from "react"
import { redirect } from "next/navigation"
import { ADMIN } from "@/app/constants/urls"

export const UserForm = ({data} : {data: User | null}) => {
    const handleSubmit = () => {
        redirect(ADMIN)
    }
    
    console.log(data?.children)

    const [teamNames, setTeamNames] = useState<string[]>([]);
    const [defaultTeam, setDefaultTeam] = useState<string>("Select"); 
    useEffect(() => {
        const fetchTeamNames = async () => {
            const teams = await listTeams();
            const names: string[] = [];
            teams.map(({name, id}, index) => {
                names.push(name ? name : "")
                if (id === data?.teamID) {
                    setDefaultTeam(name ? name : ""); 
                }
            })
            setTeamNames(names)
        }
        fetchTeamNames();
    }, [])

    const formElements = (
        <table className="w-100 text-left">
            <thead>
                <tr>
                    <th colSpan={2}>{data?.firstName} {data?.lastName}</th>
                </tr>
            </thead>
            <tbody>
                <tr>
                    <td>Team</td>
                    <td>
                        <select defaultValue={ defaultTeam }>
                            <option disabled>Select</option>
                            <>
                            { 
                                teamNames.map((teamName, index) => {
                                    <option key={ index }>{ teamName }</option>
                                })
                            } 
                            </>
                        </select>
                    </td>
                </tr>
                <tr>
                    <tr className="text-center">
                        <th colSpan={2}>Address</th>
                    </tr>
                    <tr>
                        <td>Line 1:</td>
                        <td><input type="text" defaultValue={ data?.address?.lineOne ? data?.address?.lineOne : "" } /></td>
                    </tr>
                    <tr>
                        <td>Line 2:</td>
                        <td><input name="line2" type="text" defaultValue={ data?.address?.lineTwo ? data?.address?.lineTwo : "" } /></td>
                    </tr>
                    <tr>
                        <td>Town/City:</td>
                        <td><input name="towncity" type="text" defaultValue={ data?.address?.townOrCity ? data?.address?.townOrCity : "" } /></td>
                    </tr>
                    <tr>
                        <td>Postcode:</td>
                        <td><input name="postcode" type="text" defaultValue={ data?.address?.postcode ? data?.address?.postcode : "" } /></td>
                    </tr>
                </tr>
            </tbody>
        </table>
    )

    return <Form components={ formElements } handleSubmit={ handleSubmit } />
}

export const ChildForm = ({data} : {data: Child}) => {
    // build form specifically for editing/creating children
    return <></>
}

export const TeamForm = ({data} : {data: Team}) => {
    // build form specifically for editing/creating a team
    return <></>
}

const Form = (
    {components, handleSubmit} : 
    {components: React.ReactElement, handleSubmit: () => void}
) => {
    return (
        <form onSubmit={ handleSubmit }>
            { components }
            <PrimaryButton name="Submit" /> 
        </form>
    )
}

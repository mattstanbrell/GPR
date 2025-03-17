
'use client'

import type { Child, Team, User } from "@/app/types/models"
import { PrimaryButton, WarningButton } from "@/app/components/admin/Buttons"
import { listTeams, getManagers } from "@/utils/apis"
import { useEffect, useState } from "react"
import { redirect } from "next/navigation"
import { ADMIN } from "@/app/constants/urls"
import { ButtonGroup } from "@/app/components/admin/ButtonContainer"
import { InputTextTableRow, InputDateTableRow, InputSelectTableRow } from "./FormElements"

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
                <InputSelectTableRow fieldName="Team" inputName="team" defaultValue={ defaultTeam } options={ teamNames } />
                <tr className="text-center">
                    <th colSpan={2}>Address</th>
                </tr>
                <InputTextTableRow fieldName="Line 1" inputName="lineone" defaultValue={ data?.address?.lineOne ? data?.address?.lineOne : "" } />
                <InputTextTableRow fieldName="Line 2" inputName="linetwo" defaultValue={ data?.address?.lineTwo ? data?.address?.lineTwo : "" } />
                <InputTextTableRow fieldName="Town/City" inputName="towncity" defaultValue={ data?.address?.townOrCity ? data?.address?.townOrCity : "" } />
                <InputTextTableRow fieldName="Postcode" inputName="postcode" defaultValue={ data?.address?.postcode ? data?.address?.postcode : "" } />
            </tbody>
        </table>
    )

    return <Form components={ formElements } handleSubmit={ handleSubmit } />
}

export const ChildForm = ({data} : {data: Child | null}) => {
    const handleSubmit = () => {
        redirect(ADMIN)
    }

    // build form specifically for editing/creating children
    const formElements = (
        <table className="w-full">
            <tbody>
                <InputTextTableRow fieldName="Case Number" inputName="casenumber" defaultValue={ data?.caseNumber ? data.caseNumber : "" } isRequired={ true } />
                <InputTextTableRow fieldName="First Name" inputName="firstname" defaultValue={ data?.firstName ? data.firstName : "" } isRequired={ true } />
                <InputTextTableRow fieldName="Last Name" inputName="lastname" defaultValue={ data?.lastName ? data.lastName : "" } isRequired={ true } />
                <InputDateTableRow fieldName="DoB" inputName="dob" defaultValue={ data?.dateOfBirth ? new Date(data?.dateOfBirth) : new Date() } isRequired={ true } />
                <InputSelectTableRow fieldName="Sex" inputName="sex" defaultValue={ data?.sex ? data.sex : "Select" } options={["Male", "Female"]} />
                <InputSelectTableRow fieldName="Gender" inputName="gender" defaultValue={ data?.gender ? data.gender : "Select" } options={["Male", "Female"]} />
            </tbody>
        </table>
    )

    return <Form components={ formElements } handleSubmit={ handleSubmit } />
}

export const TeamForm = ({data} : {data: Team | null}) => {
    const handleSubmit = () => {
        redirect(ADMIN)
    }

    const [managers, setManagers] = useState<User[]>([]);
    const [currentManager, setCurrentManager] = useState<string>("");
    const [currentAssistantManager, setCurrentAssistantManager] = useState<string>("");
    const [managerNames, setManagerNames] = useState<string[]>([]);

    useEffect(() => {
        const fetchManagers = async () => {
            setManagers(await getManagers());
        }
        fetchManagers();
    }, [])

    useEffect(() => {
        const names: string[] = [];
        managers && managers.map(({id, firstName, lastName}, index) => {
            const name: string = `${firstName} ${lastName}`;
            names.push(name)
            if (id === data?.assistantManagerUserID) {
                setCurrentAssistantManager(name);
            } else if (id === data?.managerUserID) {
                setCurrentManager(name)
            }
        })
        setManagerNames(names);
    }, [managers])

    const formElements = (
        <table>
            <tbody>
                <InputTextTableRow fieldName="Team Name" inputName="teamname" defaultValue={ data?.name ? data.name : "" } />
                <InputSelectTableRow fieldName="Assistant Manager" inputName="assistmanager" defaultValue={ currentAssistantManager } options={ managerNames } />
                <InputSelectTableRow fieldName="Team Manager" inputName="manager" defaultValue={ currentManager } options={ managerNames } />
            </tbody>
        </table>
    )

    return <Form components={ formElements } handleSubmit={ handleSubmit } />
}

const Form = (
    {components, handleSubmit} : 
    {components: React.ReactElement, handleSubmit: () => void}
) => {
    return (
        <form onSubmit={ handleSubmit }>
            { components }
            <div className="govuk-button-group">
                <PrimaryButton name="Submit" /> 
                <WarningButton name="Cancel" onClick={() => redirect(ADMIN)} />
            </div>
        </form>
    )
}

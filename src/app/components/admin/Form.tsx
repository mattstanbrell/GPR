
'use client'

import type { Child, Team, User } from "@/app/types/models"
import { PrimaryButton, WarningButton } from "@/app/components/admin/Buttons"
import { listTeams, getManagers } from "@/utils/apis"
import { useEffect, useState } from "react"
import { redirect } from "next/navigation"
import { ADMIN } from "@/app/constants/urls"
import { InputTextTableRow, InputDateTableRow, InputSelectTableRow, InputHiddenTableRow } from "@/app/components/admin/FormElements"
import { handleUserFormSubmit, handleChildFormSubmit, handlTeamFormSubmit } from "@/app/components/admin/FormHandlers"

export const UserForm = ({data} : {data: User | null}) => {
    const [teamNames, setTeamNames] = useState<string[]>([]);
    const [defaultTeam, setDefaultTeam] = useState<string>("Select"); 
    useEffect(() => {
        const fetchTeamNames = async () => {
            const teams = await listTeams();
            const names: string[] = [];
            teams.map(({name, id}) => {
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
        <>
            <caption className="govuk-table__caption govuk-table__caption--m">{data?.firstName} {data?.lastName}</caption>
            <tbody className="govuk-table__body">
                <InputHiddenTableRow name="userId" value={data && data.id ? data.id : ""} />
                <InputSelectTableRow fieldName="Team" inputName="team" defaultValue={ defaultTeam } options={ teamNames } />
                <tr className="govuk-table__row text-center">
                    <th colSpan={2}>Address</th>
                </tr>
                <InputTextTableRow fieldName="Line 1" inputName="lineone" defaultValue={ data?.address?.lineOne ? data?.address?.lineOne : "" } />
                <InputTextTableRow fieldName="Line 2" inputName="linetwo" defaultValue={ data?.address?.lineTwo ? data?.address?.lineTwo : "" } />
                <InputTextTableRow fieldName="Town/City" inputName="towncity" defaultValue={ data?.address?.townOrCity ? data?.address?.townOrCity : "" } />
                <InputTextTableRow fieldName="Postcode" inputName="postcode" defaultValue={ data?.address?.postcode ? data?.address?.postcode : "" } />
            </tbody>
        </>
    )

    return <Form components={ formElements } handleSubmit={ handleUserFormSubmit } />
}

export const ChildForm = ({data} : {data: Child | null}) => {
    console.log(data)
    const formElements = (
        <tbody>
            <InputHiddenTableRow name="childId" value={data && data.id ? data.id : ""} />
            <InputTextTableRow fieldName="Case Number" inputName="casenumber" defaultValue={ data?.caseNumber ? data.caseNumber : "" } isRequired={ true } />
            <InputTextTableRow fieldName="First Name" inputName="firstname" defaultValue={ data?.firstName ? data.firstName : "" } isRequired={ true } />
            <InputTextTableRow fieldName="Last Name" inputName="lastname" defaultValue={ data?.lastName ? data.lastName : "" } isRequired={ true } />
            <InputDateTableRow fieldName="Date of Birth" defaultValue={ data?.dateOfBirth ? data?.dateOfBirth : null } />
            <InputSelectTableRow fieldName="Sex" inputName="sex" defaultValue={ data?.sex ? data?.sex : "" } options={["Male", "Female"]} />
            <InputSelectTableRow fieldName="Gender" inputName="gender" defaultValue={ data?.gender ? data?.gender : "" } options={["Male", "Female"]} />
        </tbody>
    )

    return <Form components={ formElements } handleSubmit={ handleChildFormSubmit } />
}

export const TeamForm = ({data} : {data: Team | null}) => {
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
        <tbody>
            <InputHiddenTableRow name="teamId" value={data && data.id ? data.id : ""} />
            <InputTextTableRow fieldName="Team Name" inputName="teamname" defaultValue={ data?.name ? data.name : "" } isRequired={ true } />
            <InputSelectTableRow fieldName="Assistant Manager" inputName="assistmanager" defaultValue={ currentAssistantManager } options={ managerNames } />
            <InputSelectTableRow fieldName="Team Manager" inputName="manager" defaultValue={ currentManager } options={ managerNames } />
        </tbody>
    )

    return <Form components={ formElements } handleSubmit={ handlTeamFormSubmit } />
}

const Form = (
    {components, handleSubmit} : 
    {components: React.ReactElement, handleSubmit: (e: React.FormEvent<HTMLFormElement>) => void}
) => {
    return (
        <form onSubmit={ handleSubmit }>
            <table className="govuk-table">
                { components }
            </table>
            <div className="govuk-button-group">
                <PrimaryButton name="Submit" /> 
                <WarningButton name="Cancel" onClick={() => redirect(ADMIN)} />
            </div>
        </form>
    )
}

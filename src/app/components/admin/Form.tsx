
'use client'

import React, { useEffect, useState } from "react"
import { redirect } from "next/navigation"
import type { Child, Team, User } from "@/app/types/models"
import { SecondaryButton, SubmitButton, WarningButton } from "@/app/components/admin/Buttons"
import { listTeams, getManagers } from "@/utils/apis"
import { ADMIN } from "@/app/constants/urls"
import { InputTextTableRow, InputDateTableRow, 
        InputSelectTableRow, InputHiddenTableRow } from "@/app/components/admin/FormElements"
import { handleUserFormSubmit, handleChildFormSubmit, 
        handlTeamFormSubmit } from "@/app/components/admin/FormHandlers"
import type { SelectNameID } from "@/app/types/input"
import { gendersNameID } from "@/app/constants/global"

export const UserForm = ({data} : {data: User | null}) => {
    const [teamNameIds, setTeamNameIds] = useState<SelectNameID[]>([]);
    const currentTeamId = data?.teamID ? data?.teamID : "";
    useEffect(() => {
        const fetchTeams = async () => {
            const teams = await listTeams();
            const nameIds: SelectNameID[] = [];
            teams.map(({name, id}, ) => {
                const teamName = name ? name : "No Team Name"
                nameIds.push(
                    {name: teamName, id}
                )
            })
            setTeamNameIds(nameIds); 
        }
        fetchTeams();
    }, [data])
    
    const formElements = (
        <>
            <tbody className="govuk-table__body">
                <InputHiddenTableRow name="userId" value={data && data.id ? data.id : ""} />
                <InputSelectTableRow fieldName="Team" inputName="teamid" defaultValue={ currentTeamId } options={ teamNameIds } />
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
    const formElements = (
        <tbody>
            <InputHiddenTableRow name="childId" value={data && data.id ? data.id : ""} />
            <InputTextTableRow fieldName="Case Number" inputName="casenumber" defaultValue={ data?.caseNumber ? data.caseNumber : "" } isRequired={ true } />
            <InputTextTableRow fieldName="First Name" inputName="firstname" defaultValue={ data?.firstName ? data.firstName : "" } isRequired={ true } />
            <InputTextTableRow fieldName="Last Name" inputName="lastname" defaultValue={ data?.lastName ? data.lastName : "" } isRequired={ true } />
            <InputDateTableRow fieldName="Date of Birth" defaultValue={ data?.dateOfBirth ? data?.dateOfBirth : null } />
            <InputSelectTableRow fieldName="Sex" inputName="sex" defaultValue={ data?.sex ? data?.sex : "" } options={gendersNameID} isRequired={ true } />
            <InputSelectTableRow fieldName="Gender" inputName="gender" defaultValue={ data?.gender ? data?.gender : "" } options={gendersNameID} isRequired={ true } />
        </tbody>
    )

    return <Form 
            components={ formElements } 
            handleSubmit={ handleChildFormSubmit }
            button={ <WarningButton name="Delete" onClick={() => console.log("delete user")} /> }  
        />
}

export const TeamForm = ({data} : {data: Team | null}) => {
    const [managers, setManagers] = useState<User[]>([]);
    const [managerNameIds, setManagerNameIds] = useState<SelectNameID[]>([]);
    const managerId = data?.assistantManagerUserID ? data.assistantManagerUserID : "";
    const assistantManagerId = data?.managerUserID ? data.managerUserID : "";

    useEffect(() => {
        const fetchManagers = async () => {
            setManagers(await getManagers());
        }
        fetchManagers();
    }, [])

    useEffect(() => {
        const nameIds: SelectNameID[] = [];
        managers.map(({id, firstName, lastName}) => {
            const name: string = `${firstName} ${lastName}`;
            nameIds.push(
                { name, id }
            )
        })
        setManagerNameIds(nameIds);
    }, [managers])

    const formElements = (
        <tbody>
            <InputHiddenTableRow name="teamId" value={data && data.id ? data.id : ""} />
            <InputTextTableRow fieldName="Team Name" inputName="teamname" defaultValue={ data?.name ? data.name : "" } isRequired={ true } />
            <InputSelectTableRow fieldName="Assistant Manager" inputName="assistantmanagerid" defaultValue={ assistantManagerId } options={ managerNameIds } />
            <InputSelectTableRow fieldName="Team Manager" inputName="managerid" defaultValue={ managerId } options={ managerNameIds } />
        </tbody>
    )

    return <Form 
            components={ formElements } 
            handleSubmit={ handlTeamFormSubmit }
            button={ <WarningButton name="Delete" onClick={() => console.log("delete user")} /> } 
        />
}

const Form = (
    {components, handleSubmit, button} : 
    {
        components: React.ReactElement, 
        handleSubmit: (e: React.FormEvent<HTMLFormElement>) => void,
        button?: React.ReactElement,
    }
) => {
    return (
        <>
            <div className="govuk-button-group">
                <SecondaryButton name="Cancel" onClick={() => redirect(ADMIN)} />
                { button }
            </div>
            <form onSubmit={ handleSubmit }>
                <table className="govuk-table">
                    { components }
                </table>
                <div className="w-full flex justify-center">
                    <SubmitButton />
                </div> 
            </form>
        </>
    )
}

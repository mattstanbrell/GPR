'use client'

import React from "react"
import { Child, User, Team } from "@/app/types/models"
import { redirect } from "next/navigation"
import { HeaderTableData, TableData } from "./TableComponents"
import { PrimaryButton, SecondaryButton } from "@/app/components/admin/Buttons"

const NoDataMessage = ({colspan} : {colspan: number}) => {
    return (
        <tbody className="govuk-table__body">
            <tr className="govuk-table__row">
                <TableData data="No data to show." colspan={ colspan } /> 
            </tr>
        </tbody>
    )
}

export const UserTable = ({users} : { users: User[]}) => {
    const url = "/admin/user";
    
    // build header 
    const header = (
        <thead className="govuk-table__head">
            <tr className="govuk-table__row">
                <HeaderTableData data="Name" /> 
                <HeaderTableData data="Email" /> 
                <HeaderTableData data="Role" /> 
                <HeaderTableData data="Options" /> 
            </tr>
        </thead>
    )

    // build body
    const body = users.length > 0 ? (
        <tbody className="govuk-table__body">
            { users.map(({id, firstName, lastName, email, permissionGroup}, index) => (
                <tr key={ index } className="goveuk-table__row">
                    <TableData data={`${firstName} ${lastName}`} />
                    <TableData data={email} />
                    <TableData data={permissionGroup ? permissionGroup : "No Group"} />
                    <TableData data={<PrimaryButton name="Edit" onClick={() => redirect(`${url}?id=${id}`)} />} /> 
                </tr>
            ))}
        </tbody>
    ) : (<NoDataMessage colspan={ 3 } />) 

    // render table with elements
    return <Table header={ header } body={ body } />
} 

export const ChildTable = ({childrenList} : { childrenList: Child[]}) => {
    const url = "/admin/child";
    // build header 
    const header = (
        <thead className="govuk-table__head">
            <tr className="govuk-table__row">
                <HeaderTableData data="Name" /> 
                <HeaderTableData data="Case Number" /> 
                <HeaderTableData data="DoB" /> 
                <HeaderTableData data="Options" /> 
            </tr>
        </thead>
    )

    // build body
    const body = (
        <tbody className="govuk-table__body">
            { childrenList.map(({id, caseNumber, firstName, lastName, dateOfBirth}, index) => (
                <tr key={ index } className="govuk-table__row">
                    <TableData data={`${firstName} ${lastName}`} />
                    <TableData data={caseNumber} />
                    <TableData data={dateOfBirth} />
                    <TableData data={<PrimaryButton name="Edit" onClick={() => redirect(`${url}?id=${id}`)} />} />
                </tr>
            ))}
        </tbody>
    )

    // render table with elements
    return <Table 
                header={ header } 
                body={ body } 
                buttons={ <SecondaryButton name="Add Child" onClick={() => redirect(url)}/> } 
            />
} 

export const TeamTable = ({teams} : { teams: Team[]}) => {
    const url = "/admin/team";
    // build header 
    const header = (
        <thead className="govuk-table__head">
            <tr className="govuk-table__row">
                <HeaderTableData data="Team Name" />
                <HeaderTableData data="Options" />
            </tr>
        </thead>
    )

    // build body
    const body = (
        <tbody className="govuk-table__body">
            { teams.map(({id, name}, index) => (
                <tr key={ index } className="govuk-table__row">
                    <TableData data={name ? name : "No team name"} />
                    <TableData data={<PrimaryButton name="Edit" onClick={() => redirect(`${url}?id=${id}`)} />} />
                </tr>
            ))}
        </tbody>
    )

    // render table with elements
    return <Table 
                header={ header } 
                body={ body } 
                buttons={ <SecondaryButton name="Add Team" onClick={() => redirect(url)}/> } 
            />
}  

const Table = (
    {header, body, buttons} : 
    {
        header: React.ReactElement, 
        body: React.ReactElement, 
        buttons?: React.ReactElement
    }
) => {
    return (
        <>
            { buttons && (
                <div className="w-full flex justify-left">
                    { buttons }
                </div>
            )}
            <table className="govuk-table">
                { header }
                { body }
            </table>
        </>
    )
}
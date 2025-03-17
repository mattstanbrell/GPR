'use client'

import React from "react"
import { Child, User, Team } from "@/app/types/models"
import { redirect } from "next/navigation"

const NoDataMessage = ({colspan} : {colspan: number}) => {
    return (
        <tbody>
            <tr>
                <td colSpan={ colspan }>No data to show.</td>
            </tr>
        </tbody>
    )
}

export const UserTable = ({users} : { users: User[]}) => {
    const url = "/admin/user";
    console.log(users)
    // build header 
    const header = (
        <thead>
            <tr>
                <th>Name</th>
                <th>Email</th>
                <th>Role</th>
            </tr>
        </thead>
    )

    // build body
    const body = users.length > 0 ? (
        <tbody>
            { users.map(({id, firstName, lastName, email, permissionGroup}, index) => (
                <tr key={ index } onClick={ () => redirect(`${url}?id=${id}`) }>
                    <td>{firstName} {lastName}</td>
                    <td>{email}</td>
                    <td>{permissionGroup}</td>
                </tr>
            ))}
        </tbody>
    ) : (<NoDataMessage colspan={ 3 } />) 

    // render table with elements
    return <Table header={ header } body={ body } />
} 

export const ChildTable = ({children} : { children: Child[]}) => {
    const url = "/admin/child";
    // build header 
    const header = (
        <thead>
            <tr>
                <th>Name</th>
                <th>DoB</th>
                <th>Case Number</th>
            </tr>
        </thead>
    )

    // build body
    const body = (
        <tbody>
            { children.map(({id, caseNumber, firstName, lastName, dateOfBirth}, index) => (
                <tr key={ index } onClick={ () => redirect(`${url}?id=${id}`) }>
                    <td>{firstName} {lastName}</td>
                    <td>{dateOfBirth}</td>
                    <td>{caseNumber}</td>
                </tr>
            ))}
            <tr><td colSpan={3} onClick={() => redirect(url) }>Add Child</td></tr>
        </tbody>
    )

    // render table with elements
    return <Table header={ header } body={ body } />
} 

export const TeamTable = ({teams} : { teams: Team[]}) => {
    const url = "/admin/team";
    // build header 
    const header = (
        <thead>
            <tr>
                <th>Name</th>
            </tr>
        </thead>
    )

    // build body
    const body = (
        <tbody>
            { teams.map(({id, name}, index) => (
                <tr key={ index } onClick={ () => redirect(`${url}?id=${id}`) }>
                    <td>{name}</td>
                </tr>
            ))}
            <tr><td colSpan={1} onClick={() => redirect(url) }>Add Team</td></tr>
        </tbody>
    )

    // render table with elements
    return <Table header={ header } body={ body } />
}  

const Table = ({header, body} : {header: React.ReactElement, body: React.ReactElement}) => {
    return (
        <table className="w-full">
            { header }
            { body }
        </table>
    )
}
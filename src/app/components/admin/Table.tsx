'use client'

import React from "react"
import { Child, User, Team } from "@/app/types/models"
import { redirect } from "next/navigation"

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
    const body = (
        <tbody>
            { users.map(({id, firstName, lastName, email, permissionGroup}, index) => (
                <tr key={ index } onClick={ () => redirect(`${url}?id=${id}`) }>
                    <td>{firstName} {lastName}</td>
                    <td>{email}</td>
                    <td>{permissionGroup}</td>
                </tr>
            ))}
        </tbody>
    )

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
        </tbody>
    )

    // render table with elements
    return <Table header={ header } body={ body } />
} 

export const TeamTable = ({teams} : { teams: Team[]}) => {
    // build header 

    // build body

    // render table with elements
    return <></>
}  

const Table = ({header, body} : {header: React.ReactElement, body: React.ReactElement}) => {
    return (
        <table>
            { header }
            { body }
        </table>
    )
}
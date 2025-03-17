'use client'

import { useContext } from "react"
import { AppContext } from "@/app/layout"
import { PERMISSIONS } from "@/app/constants/models"
import { AllUsersView } from "@/app/components/admin/Views"

const AdministratorPanel = () => {
    // display three panels: list of all users, teams, and children

    return <></>
}

const ManagerPanel = () => {
    // display team with list of all team members

    return <></>
}

export const AdminPanel = () => {
    const { currentUser } = useContext(AppContext)
    const isManager = currentUser?.permissionGroup === PERMISSIONS.MANAGER_GROUP; 

    // load panel depending on user

    return (
        <>
            <AllUsersView />
        </>
    )
}
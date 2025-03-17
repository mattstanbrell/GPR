'use client'

import { useContext } from "react"
import { AppContext } from "@/app/layout"
import { PERMISSIONS } from "@/app/constants/models"
import { AllUsersView, AllChildrenView, AllTeamsView, AllTeamMembersView } from "@/app/components/admin/Views"

const NoTeamMessage = () => {
    return <h3 className="text-center">You are not assigned to a team. Please contact the application administrator.</h3>
}

const AdministratorPanel = () => {
    return (
        <>
            <AllUsersView /> 
            <AllChildrenView />
            <AllTeamsView />
        </>
    )
}

const ManagerPanel = ({teamId}: {teamId: string | null}) => {
    return !(teamId) ? <NoTeamMessage /> : <AllTeamMembersView teamId={ teamId } />  
}

export const AdminPanel = () => {
    const { currentUser, isLoading } = useContext(AppContext)
    const isManager = currentUser?.permissionGroup === PERMISSIONS.MANAGER_GROUP; 

    // load panel depending on user

    // return isManager ? <ManagerPanel teamId={currentUser.teamID ? currentUser.teamID : ""} /> : <AdministratorPanel />  
    return (
        <>
            { isLoading ? (
                <h3 className="text-center">Loading...</h3>
            ) : (
                <>
                    { isManager ? (
                        <ManagerPanel teamId={ currentUser.teamID ? currentUser.teamID : null } />
                    ) : (
                        <AdministratorPanel />
                    )}
                </>
            )}
        </>
    )
}
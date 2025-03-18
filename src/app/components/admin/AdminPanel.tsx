'use client'

import { useContext } from "react"
import { AppContext } from "@/app/layout"
import { PERMISSIONS } from "@/app/constants/models"
import { AllUsersView, AllChildrenView, 
    AllTeamsView, AllTeamMembersView } from "@/app/components/admin/Views"

const NoTeamMessage = () => {
    const message = "You are not assigned to a team. Please contact the application administrator.";
    return <h3 className="text-center">{ message }</h3>
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
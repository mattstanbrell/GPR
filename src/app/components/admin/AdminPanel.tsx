'use client'

import { useContext } from "react"
import { AppContext } from "@/app/layout"
import { PERMISSIONS } from "@/app/constants/models"
import { AllUsersView, AllChildrenView, 
    AllTeamsView, AllTeamMembersView } from "@/app/components/admin/Views"


const panelClassName = "max-h-160 overflow-y-scroll";

const NoTeamMessage = () => {
    const message = "You are not assigned to a team. Please contact the application administrator.";
    return <h3 className="text-center">{ message }</h3>
}

const AdministratorPanel = () => {
    return (
        <>
            <div className={panelClassName}>
                <AllUsersView /> 
            </div>
            <div className="govuk-grid-row">
                <div className={`govuk-grid-column-one-half ${panelClassName}`}>
                    <AllChildrenView />
                </div>
                <div className={`govuk-grid-column-one-half ${panelClassName}`}>
                    <AllTeamsView />
                </div>
            </div>
        </>
    )
}

const ManagerPanel = ({teamId}: {teamId: string | null}) => {
    return !(teamId) ? <NoTeamMessage /> : (
        <div className={panelClassName}>
            <AllTeamMembersView teamId={ teamId } />
        </div>
    )  
}

export const AdminPanel = () => {
    const { currentUser, isLoading } = useContext(AppContext)
    const isManager = currentUser?.permissionGroup === PERMISSIONS.MANAGER_GROUP; 

    return (
        <div className="govuk-width-container">
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
        </div>
    )
}
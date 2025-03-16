import { PERMISSIONS } from "@/app/constants/models";

const makeUserModelFixture = ( options: {
    id: string, 
    fName: string, 
    lName: string, 
    email: string,
    role: string, 
    assistantManagerId?: string, 
    managerId?: string
}) => {
    return {}
}

export const social_worker = makeUserModelFixture({
    id: "1", 
    fName: "Greg", 
    lName: "Green", 
    email: "greg.green@hounslow.gov.uk",
    role: PERMISSIONS.SOCIAL_WORKER_GROUP, 
    assistantManagerId: "2", 
    managerId: "3",
});

export const manager = makeUserModelFixture({
    id: "2", 
    fName: "Joy", 
    lName: "Johnson", 
    email: "joy.johnson@hounslow.gov.uk",
    role: PERMISSIONS.MANAGER_GROUP,  
    managerId: "3",
});

export const admin = makeUserModelFixture({
    id: "3", 
    fName: "William", 
    lName: "Wonker", 
    email: "will.wonka@hounslow.gov.uk",
    role: PERMISSIONS.ADMINISTRATOR_GROUP, 
});
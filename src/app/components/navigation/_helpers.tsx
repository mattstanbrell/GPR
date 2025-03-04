
import React from 'react';
import { HomeButton, UpdatesButton, SettingsButton, 
    TitledHomeButton, TitledUpdatesButton, TitledSettingsButton } from '@/app/components/navigation/Buttons'

const getUntitledMenuItems = (permissionGroup: string) => {
    switch (permissionGroup) {
        case 'SOCIAL_WORKER':
        case 'MANAGER':
        case 'ADMIN':
        default:
            return [
                <HomeButton />, 
                <UpdatesButton />, 
                <SettingsButton />
            ] 
    }
}

const getTitledMenuItems = (permissionGroup: string) => {
    switch (permissionGroup) {
        case 'SOCIAL_WORKER':
        case 'MANAGER':
        case 'ADMIN':
        default:
            return [
                <TitledHomeButton />, 
                <TitledUpdatesButton />, 
                <TitledSettingsButton />
            ] 
    }
}

export const getMenuItems = (permissionGroup: string, isTitled: boolean): React.ReactElement[] => {
    if (isTitled) {
        return getTitledMenuItems(permissionGroup)
    } else {
        return getUntitledMenuItems(permissionGroup)
    }
}

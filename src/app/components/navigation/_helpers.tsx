
import React from 'react';
import { HomeButton, UpdatesButton, SettingsButton, MenuSignOutButton,
    TitledHomeButton, TitledUpdatesButton, TitledSettingsButton } from '@/app/components/navigation/Buttons'

const getUntitledMenuItems = (permissionGroup: string, isTitled: boolean, handleClick: () => void) => {
    switch (permissionGroup) {
        case 'SOCIAL_WORKER':
        case 'MANAGER':
        case 'ADMIN':
        default:
            return [
                <HomeButton />, 
                <UpdatesButton />, 
                <SettingsButton />,
                <MenuSignOutButton isTitled={false} handleSignOut={handleClick} /> 
            ] 
    }
}

const getTitledMenuItems = (permissionGroup: string, isTitled: boolean, handleClick: () => void) => {
    switch (permissionGroup) {
        case 'SOCIAL_WORKER':
        case 'MANAGER':
        case 'ADMIN':
        default:
            return [
                <TitledHomeButton />, 
                <TitledUpdatesButton />, 
                <TitledSettingsButton />, 
                <MenuSignOutButton isTitled={true} handleSignOut={handleClick} /> 
            ] 
    }
}

export const getMenuItems = (permissionGroup: string, isTitled: boolean, handleClick: () => void): React.ReactElement[] => {
    if (isTitled) {
        return getTitledMenuItems(permissionGroup, isTitled, handleClick)
    } else {
        return getUntitledMenuItems(permissionGroup, isTitled, handleClick)
    }
}

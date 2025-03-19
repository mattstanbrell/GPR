
import React from 'react';
import { HomeButton, SettingsButton, MenuSignOutButton } from '@/app/components/navigation/Buttons'

export const getMenuItems = (permissionGroup: string, isTitled: boolean, handleClick: () => void): React.ReactElement[] => {
    switch (permissionGroup) {
        case 'SOCIAL_WORKER':
        case 'MANAGER':
        case 'ADMIN':
        default:
            return [
                <div key={ 0 }><HomeButton isTitled={ isTitled } /></div>, 
                <div key={ 1 }><SettingsButton isTitled={ isTitled } /></div>,
                <div key={ 2 }><MenuSignOutButton isTitled={ isTitled } handleSignOut={handleClick} /></div> 
            ] 
    }
}

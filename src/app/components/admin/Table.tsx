'use client'

import { Child, User, Team } from "@/app/types/models"

export const Table = ({data} : {data: User[] | Child[] | Team[]}) => {
    // if there is not data to load do
        // show no users message
    // else do 
        // if data contais team objects do
            // render team table
        // else if data contains user objects do
            // render user table
        // else if data contains child objects fdo
            // render child table

    return <table></table>
}
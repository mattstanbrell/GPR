'use client'

import { useSearchParams } from "next/navigation";

const Team = () => {
    // url is admin/team?id=....
    const searchParams = useSearchParams(); 
    const teamId = searchParams.get("id"); 

    // display members in the team

    // show buttons to add/remove team members depending on user

    return <></>
}

export default Team;
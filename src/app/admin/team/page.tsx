'use client'

import { useState, useEffect } from "react";
import { TeamForm } from "@/app/components/admin/Form";
import { useSearchParams } from "next/navigation";
import type { Team } from "@/app/types/models";
import { getTeamByID } from "@/utils/apis";

const Team = () => {
    // url is admin/team?id=....
    const searchParams = useSearchParams(); 
    const teamId = searchParams.get("id"); 
    const [team, setTeam] = useState<Team | null>(null); 

    useEffect(() => {
        const fetchTeam = async () => {
            setTeam(await getTeamByID(teamId? teamId : "")); 
        }
        fetchTeam();
    }, [teamId])

    return (
        <>
            <h1 className="govuk-heading-l">{ team ? team.name : "Create New Team" }</h1>
            <TeamForm data={team} />
        </>
    )
}

export default Team;
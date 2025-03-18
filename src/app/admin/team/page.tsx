'use client'

import { useState, useEffect, Suspense } from "react";
import { TeamForm } from "@/app/components/admin/Form";
import { useSearchParams } from "next/navigation";
import type { Team } from "@/app/types/models";
import { getTeamByID } from "@/utils/apis";


const Team = () => {
    const searchParams = useSearchParams(); 
    const teamId = searchParams.get("id"); 
    const [team, setTeam] = useState<Team | null>(null); 

    useEffect(() => {
        if (teamId) {
            const fetchTeam = async () => {
                setTeam(await getTeamByID(teamId? teamId : "")); 
            }
            fetchTeam();
        }
    }, [teamId])

    return (
        <Suspense>
            <h1 className="govuk-heading-l">{ team ? team.name : "Create New Team" }</h1>
            <TeamForm data={team} />
        </Suspense>
    )
}

export default Team;
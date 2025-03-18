'use client'

import { useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import { UserForm } from "@/app/components/admin/Form";
import type { User } from "@/app/types/models";
import { getUserById } from "@/utils/apis";

const Users = () => {
    const searchParams = useSearchParams(); 
    const userId = searchParams.get("id"); 
    const [user, setUser] = useState<User | null>(null);

    useEffect(() => {
        const fetchUser = async () => {
            setUser(await getUserById(userId ? userId : ""));
        }
        fetchUser();
    }, [userId])

    return (
        <>
            <h1 className="govuk-heading-l">{`${user?.firstName} ${user?.lastName}`}</h1>
            <UserForm data={ user } /> 
        </>
    )
}

export default Users;
'use client'

import { useSearchParams } from "next/navigation";

const Users = () => {
    // url is admin/user?id=....
    const searchParams = useSearchParams(); 
    const userId = searchParams.get("id"); 

    // display form to edit user details

    return <></>
}

export default Users;
'use client'

import { useSearchParams } from "next/navigation";

const Child = () => {
    // url is admin/child?id=.... or admin/child
    const searchParams = useSearchParams(); 
    const childId = searchParams.get("id"); 

    // check whether updating a child or creating a new child by see if childId exists
    // display form to add/edit children

    return <></>
}

export default Child;
'use client'

import { ChildForm } from "@/app/components/admin/Form";
import type { Child } from "@/app/types/models";
import { getChildById } from "@/utils/apis";
import { useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";

const Child = () => {
    // url is admin/child?id=.... or admin/child
    const searchParams = useSearchParams(); 
    const childId = searchParams.get("id"); 
    const [child, setChild] = useState<Child | null>(null)

    if (childId) {
        useEffect(() => {
            const fetchChild = async () => {
                setChild(await getChildById(childId));
            }
            fetchChild(); 
        }, [child])
    }
    // check whether updating a child or creating a new child by see if childId exists
    // display form to add/edit children

    return (
        <>
            <h1>Howdy, child</h1>
            <ChildForm data={child} /> 
        </>
    )
}

export default Child;
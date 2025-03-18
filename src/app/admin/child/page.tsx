'use client'

import { ChildForm } from "@/app/components/admin/Form";
import type { Child } from "@/app/types/models";
import { getChildById } from "@/utils/apis";
import { useSearchParams } from "next/navigation";
import { Suspense, useEffect, useState } from "react";

const Child = () => {
    const searchParams = useSearchParams(); 
    const childId = searchParams.get("id"); 
    const [child, setChild] = useState<Child | null>(null)

    useEffect(() => {
        if (childId) {
            const fetchChild = async () => {
                setChild(await getChildById(childId ? childId : ""));
            }
            fetchChild(); 
        }
    }, [childId])

    return (
        <Suspense>
            <h1 className="govuk-heading-l">{ child ? "Edit Child" : "Create New Child"}</h1>
            <ChildForm data={child} /> 
        </Suspense>
    )
}

export default Child;
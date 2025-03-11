
'use client'

import { useState, useEffect } from "react"
import { fetchUserAttributes } from "aws-amplify/auth"
import { getUserByEmail } from "@/utils/apis";
import { type Schema } from "../../amplify/data/resource";

export const useUserModel = () => {
    const [userModel, setUserModel] = useState<Schema["User"]["type"] | null>();

	useEffect(() => {
		const fetchUserModel = async () => {
			const userAttributes = await fetchUserAttributes();
			const data = await getUserByEmail(userAttributes ? userAttributes.email : ""); 
			setUserModel(data)
		}
		fetchUserModel();
	}, [])

    return userModel
}

export const getName = (user: {firstName: string, lastName: string}) => {
	return `${user.firstName} ${user.lastName}`;
}

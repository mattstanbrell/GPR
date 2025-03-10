import { getCurrentUser } from "aws-amplify/auth";
import { useEffect, useState } from "react";
import { getUserById } from "./apis";
import { Schema } from "../../amplify/data/resource";


type User = Schema["User"]["type"];

export const useAuth = (dependencies: [] = []) => {
	const [user, setUser] = useState<User | null>(null);

	useEffect(() => {
		async function getUserObject() {
			const authUser = await getCurrentUser();
			setUser(await getUserById(authUser?.userId))

		}

		getUserObject();
	}, dependencies);

	return user;
}

export const getName = (user: {firstName: string, lastName: string}) => {
	return `${user.firstName} ${user.lastName}`;
}

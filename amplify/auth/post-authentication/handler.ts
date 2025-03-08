import type { PostAuthenticationTriggerHandler } from "aws-lambda";
import { Amplify } from "aws-amplify";
import { generateClient } from "aws-amplify/data";
import { env } from "$amplify/env/norm";
import { getAmplifyDataClientConfig } from "@aws-amplify/backend/function/runtime";
import type { Schema } from "../../data/resource";

const { resourceConfig, libraryOptions } =
	await getAmplifyDataClientConfig(env);
Amplify.configure(resourceConfig, libraryOptions);

const client = generateClient<Schema>();

// Azure AD group IDs
const ADMIN_GROUP = "cab6488b-12e6-4d6e-bdf0-6a2d254b2ec9";
const MANAGER_GROUP = "0989a8d5-c347-4ce1-9d50-c97641a4d3b5";
const SOCIAL_WORKER_GROUP = "2a53f41c-3491-40f2-919c-9500c71029b2";

export const handler: PostAuthenticationTriggerHandler = async (event) => {
	console.log("Post Authentication Event:", JSON.stringify(event, null, 2));

	const userAttributes = event.request.userAttributes;

	if (
		"sub" in userAttributes &&
		"email" in userAttributes &&
		"given_name" in userAttributes &&
		"family_name" in userAttributes &&
		"custom:groups" in userAttributes
	) {
		// Get existing user if they exist
		const { data: users, errors } = await client.models.User.list({
			filter: { email: { eq: userAttributes.email } },
		});

		if (errors) {
			console.error("Error fetching user:", errors);
			throw new Error("Failed to fetch user");
		}

		const existingUser = users?.[0];
		const groupIds = JSON.parse(userAttributes["custom:groups"]) as string[];

		// Get highest permission (ADMIN > MANAGER > SOCIAL_WORKER)
		// Because they may have many in entra, and we only support one
		const permissionGroup = groupIds.includes(ADMIN_GROUP)
			? "ADMIN"
			: groupIds.includes(MANAGER_GROUP)
				? "MANAGER"
				: groupIds.includes(SOCIAL_WORKER_GROUP)
					? "SOCIAL_WORKER"
					: null;

		if (!permissionGroup) {
			console.error("User has no valid permission groups:", groupIds);
			throw new Error("User has no valid permission groups");
		}

		const now = new Date().toISOString();

		if (existingUser) {
			// User exists - check if we need to update any details
			if (
				existingUser.firstName !== userAttributes.given_name ||
				existingUser.lastName !== userAttributes.family_name ||
				existingUser.permissionGroup !== permissionGroup
			) {
				// Details have changed - update the user
				const { data: updatedUser, errors: updateErrors } =
					await client.models.User.update({
						id: existingUser.id,
						firstName: userAttributes.given_name,
						lastName: userAttributes.family_name,
						permissionGroup,
						lastLogin: now,
					});

				if (updateErrors) {
					console.error("Error updating user:", updateErrors);
					throw new Error("Failed to update user");
				}

				console.log("Updated user details:", updatedUser);
			} else {
				// Even if other details haven't changed, we should still update lastLogin
				const { data: updatedUser, errors: updateErrors } =
					await client.models.User.update({
						id: existingUser.id,
						lastLogin: now,
					});

				if (updateErrors) {
					console.error("Error updating lastLogin:", updateErrors);
					throw new Error("Failed to update lastLogin");
				}

				console.log("Updated lastLogin:", updatedUser);
			}
		} else {
			// User doesn't exist - create them
			const { data: newUser, errors: createErrors } =
				await client.models.User.create({
					email: userAttributes.email,
					firstName: userAttributes.given_name,
					lastName: userAttributes.family_name,
					permissionGroup,
					lastLogin: now,
					profileOwner: `${userAttributes.sub}::${event.userName}`,
				});

			if (createErrors) {
				console.error("Error creating user:", createErrors);
				throw new Error("Failed to create user");
			}

			console.log("Created new user:", newUser);
		}
	}

	return event;
};

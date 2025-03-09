import type { PostAuthenticationTriggerHandler } from "aws-lambda";
import { Amplify } from "aws-amplify";
import { generateClient } from "aws-amplify/data";
import { env } from "$amplify/env/norm";
import { getAmplifyDataClientConfig } from "@aws-amplify/backend/function/runtime";
import type { Schema } from "../../data/resource";
import { getPermissionGroup } from "./_helpers";

const { resourceConfig, libraryOptions } = await getAmplifyDataClientConfig(env);
Amplify.configure(resourceConfig, libraryOptions);
const client = generateClient<Schema>();

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
		const OIDCGroupIds = JSON.parse(userAttributes["custom:groups"]) as string[];
		const permissionGroup = getPermissionGroup(OIDCGroupIds)
		const dateTimeNow = new Date().toISOString();

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
						lastLogin: dateTimeNow,
						// profileOwner: `${userAttributes.sub}::${event.userName}`
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
						lastLogin: dateTimeNow,
						// profileOwner: `${userAttributes.sub}::${event.userName}`
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
					lastLogin: dateTimeNow,
					// profileOwner: `${userAttributes.sub}::${event.userName}`,
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

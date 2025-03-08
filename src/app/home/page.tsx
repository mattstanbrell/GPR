import { redirect } from "next/navigation";
import SocialWorkerButtons from "../components/dashboard/SocialWorkerButtons";
import ManagerButtons from "../components/dashboard/ManagerButtons";
import AdminButtons from "../components/dashboard/AdminButtons";
import {
	AuthGetCurrentUserServer,
	AuthGetUserAttributesServer,
	runWithAmplifyServerContext,
} from "@/utils/amplifyServerUtils";
import { cookies } from "next/headers";
import { generateServerClientUsingCookies } from "@aws-amplify/adapter-nextjs/api";
import type { Schema } from "../../../amplify/data/resource";
import outputs from "../../../amplify_outputs.json";

const cookiesClient = generateServerClientUsingCookies<Schema>({
	cookies,
	config: outputs,
});

function renderButtons(permissionGroup: string | null) {
	if (!permissionGroup) return null;

	switch (permissionGroup.toUpperCase()) {
		case "SOCIAL_WORKER":
			return <SocialWorkerButtons />;
		case "MANAGER":
			return <ManagerButtons />;
		case "ADMIN":
			return <AdminButtons />;
		default:
			return <div>This is the default home page, you should not be here</div>;
	}
}

const Home = async () => {
	const authUser = await AuthGetCurrentUserServer();
	if (!authUser) {
		redirect("/");
	}

	// Get user attributes
	const userAttributes = await AuthGetUserAttributesServer();
	if (!userAttributes?.sub) {
		throw new Error("User sub not found in attributes");
	}

	// Construct the profileOwner in the same format as the post-authentication handler
	const profileOwner = `${userAttributes.sub}::${authUser.username}`;

	// Get user details from the database
	const { data: users, errors } = await runWithAmplifyServerContext({
		nextServerContext: { cookies },
		operation: async () => {
			return await cookiesClient.models.User.list({
				filter: { profileOwner: { eq: profileOwner } },
			});
		},
	});

	if (errors) {
		console.error("Error fetching user:", errors);
		throw new Error("Failed to fetch user details");
	}

	const user = users?.[0];
	if (!user) {
		console.error("User not found in database");
		throw new Error("User not found in database");
	}

	const formattedLastLogin = user.lastLogin
		? new Date(user.lastLogin).toLocaleString("en-GB", {
				dateStyle: "full",
				timeStyle: "short",
			})
		: "Never";

	return (
		<div className="govuk-width-container">
			<div className="govuk-grid-row">
				<div className="govuk-grid-column-full">
					<h1 className="govuk-heading-l">Welcome {user.firstName}!</h1>

					<dl className="govuk-summary-list">
						<div className="govuk-summary-list__row">
							<dt className="govuk-summary-list__key">Name</dt>
							<dd className="govuk-summary-list__value">
								{user.firstName} {user.lastName}
							</dd>
						</div>
						<div className="govuk-summary-list__row">
							<dt className="govuk-summary-list__key">Email</dt>
							<dd className="govuk-summary-list__value">{user.email}</dd>
						</div>
						<div className="govuk-summary-list__row">
							<dt className="govuk-summary-list__key">Role</dt>
							<dd className="govuk-summary-list__value">
								{user.permissionGroup}
							</dd>
						</div>
						<div className="govuk-summary-list__row">
							<dt className="govuk-summary-list__key">Last Login</dt>
							<dd className="govuk-summary-list__value">
								{formattedLastLogin}
							</dd>
						</div>
					</dl>

					<h2 className="govuk-heading-m">Available Actions</h2>
					{renderButtons(user.permissionGroup)}
				</div>
			</div>
		</div>
	);
};

export default Home;

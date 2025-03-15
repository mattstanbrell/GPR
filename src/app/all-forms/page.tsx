import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import Link from "next/link";

import {
	AuthGetCurrentUserServer,
	runWithAmplifyServerContext,
	cookiesClient,
	getUserDetailsFromCookiesClient,
} from "@/utils/amplifyServerUtils";
import type { Schema } from "../../../amplify/data/resource";
import DeleteButton from "./DeleteButton";

// Define a type for the form data
type FormData = Pick<
	Schema["Form"]["type"],
	"status" | "caseNumber" | "reason" | "amount" | "title" | "financeCodeID" | "suggestedFinanceCodeID" | "section17"
> & {
	id: string;
	createdAt: string;
	updatedAt: string;
};

// Add dynamic route segment config
export const dynamic = "force-dynamic";

// Function to format date in a smart way
function formatSmartDate(dateString: string) {
	const date = new Date(dateString);
	const now = new Date();
	const diffMs = now.getTime() - date.getTime();
	const diffMinutes = Math.floor(diffMs / (1000 * 60));
	const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
	const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

	// Today - show hours or minutes
	if (diffDays === 0) {
		if (diffHours === 0) {
			if (diffMinutes === 0) {
				return "Just now";
			}
			return `${diffMinutes} min${diffMinutes !== 1 ? "s" : ""} ago`;
		}
		return `${diffHours} hour${diffHours !== 1 ? "s" : ""} ago`;
	}

	// Yesterday
	if (diffDays === 1) {
		return "Yesterday";
	}

	// Within the last week - show day name
	if (diffDays < 7) {
		return date.toLocaleDateString("en-US", { weekday: "long" });
	}

	// Older than a week - show full date
	return date.toLocaleDateString();
}

export default async function AllFormsPage() {
	// Get the current user
	const user = await AuthGetCurrentUserServer();

	if (!user) {
		// Redirect to home if not authenticated
		redirect("/");
	}

	try {
		// Get the user model from the database using server utilities
		const userModel = await getUserDetailsFromCookiesClient();

		if (!userModel || !userModel.id) {
			throw new Error("User not found in database");
		}

		// Fetch all forms using pagination
		let allForms: FormData[] = [];
		let paginationToken: string | undefined;

		do {
			// Fetch all forms for this user
			const { data: userForms, errors } = await runWithAmplifyServerContext({
				nextServerContext: { cookies },
				operation: async () => {
					const client = cookiesClient;
					// Now get the filtered forms with pagination
					const result = await client.models.Form.list({
						filter: { creatorID: { eq: userModel.id } },
						limit: 1000, // Increase limit to get more forms
						nextToken: paginationToken,
					});
					return result;
				},
			});

			if (errors) {
				throw new Error(`Failed to fetch forms: ${JSON.stringify(errors)}`);
			}

			if (userForms) {
				allForms = [...allForms, ...userForms];
				// The response includes a nextToken property for pagination
				paginationToken = (userForms as { nextToken?: string }[])[0]?.nextToken;
			}
		} while (paginationToken);

		// Sort forms by updatedAt date (most recent first)
		const sortedForms = allForms.sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime());

		return (
			<div className="govuk-width-container">
				<div className="govuk-grid-row">
					<div className="govuk-grid-column-full">
						<h1 className="govuk-heading-xl">All Forms</h1>

						{sortedForms.length === 0 ? (
							<p className="govuk-body">You don&apos;t have any forms yet.</p>
						) : (
							<table className="govuk-table">
								<thead className="govuk-table__head">
									<tr className="govuk-table__row">
										<th scope="col" className="govuk-table__header">
											Title
										</th>
										<th scope="col" className="govuk-table__header">
											Case Number
										</th>
										<th scope="col" className="govuk-table__header">
											Status
										</th>
										<th scope="col" className="govuk-table__header">
											Amount
										</th>
										<th scope="col" className="govuk-table__header">
											Section 17
										</th>
										<th scope="col" className="govuk-table__header">
											Suggested Code
										</th>
										<th scope="col" className="govuk-table__header">
											Finance Code
										</th>
										<th scope="col" className="govuk-table__header">
											Created
										</th>
										<th scope="col" className="govuk-table__header">
											Last Updated
										</th>
										<th scope="col" className="govuk-table__header">
											Actions
										</th>
									</tr>
								</thead>
								<tbody className="govuk-table__body">
									{sortedForms.map((form: FormData) => (
										<tr key={form.id} className="govuk-table__row">
											<td className="govuk-table__cell">
												<Link href={`/form?id=${form.id}`} className="govuk-link" style={{ cursor: "pointer" }}>
													{form.title || "Untitled Form"}
												</Link>
											</td>
											<td className="govuk-table__cell">{form.caseNumber || ""}</td>
											<td className="govuk-table__cell">
												<strong
													className={`govuk-tag govuk-tag--${form.status === "DRAFT" ? "blue" : form.status === "SUBMITTED" ? "yellow" : form.status === "AUTHORISED" ? "green" : form.status === "VALIDATED" ? "purple" : "pink"}`}
												>
													{form.status}
												</strong>
											</td>
											<td className="govuk-table__cell">£{form.amount}</td>
											<td className="govuk-table__cell">
												{form.section17 ? (
													<strong className="govuk-tag govuk-tag--turquoise">Yes</strong>
												) : (
													<strong className="govuk-tag govuk-tag--grey">No</strong>
												)}
											</td>
											<td className="govuk-table__cell">{form.suggestedFinanceCodeID || "Not suggested"}</td>
											<td className="govuk-table__cell">{form.financeCodeID || "Not assigned"}</td>
											<td className="govuk-table__cell">{formatSmartDate(form.createdAt)}</td>
											<td className="govuk-table__cell">{formatSmartDate(form.updatedAt)}</td>
											<td className="govuk-table__cell">
												<DeleteButton formId={form.id} />
											</td>
										</tr>
									))}
								</tbody>
							</table>
						)}
					</div>
				</div>
			</div>
		);
	} catch (error) {
		// Handle errors
		return (
			<div className="govuk-width-container">
				<div className="govuk-grid-row">
					<div className="govuk-grid-column-two-thirds">
						<div className="govuk-error-summary" data-module="govuk-error-summary">
							<div role="alert">
								<h2 className="govuk-error-summary__title">There is a problem</h2>
								<div className="govuk-error-summary__body">
									<p>{error instanceof Error ? error.message : String(error)}</p>
								</div>
							</div>
						</div>
					</div>
				</div>
			</div>
		);
	}
}

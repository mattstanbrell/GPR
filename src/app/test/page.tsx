"use client";

import { generateClient } from "aws-amplify/api";
import type { Schema } from "../../../amplify/data/resource";
import { useState, useEffect, useRef } from "react";
import { getCurrentUser } from "aws-amplify/auth";

export default function NewFormPage() {
	const [result, setResult] = useState<string | null>(null);
	const [userId, setUserId] = useState<string | null>(null);
	const [children, setChildren] = useState<Array<Schema["Child"]["type"]>>([]);
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState<string | null>(null);
	const [creatingChild, setCreatingChild] = useState(false);
	const [childCreationResult, setChildCreationResult] = useState<string | null>(
		null,
	);

	// Use a ref for the client to avoid dependency issues
	const clientRef = useRef(generateClient<Schema>());

	// Fetch current user and their associated children
	useEffect(() => {
		const client = clientRef.current;

		async function fetchUserAndChildren() {
			try {
				// Get current user
				const user = await getCurrentUser();
				const currentUserId = user.userId;
				setUserId(currentUserId);

				// Get UserChild records for the current user
				const { data: userChildren, errors: userChildErrors } =
					await client.models.UserChild.list({
						filter: { userID: { eq: currentUserId } },
					});

				if (userChildErrors) {
					console.error("Error fetching user's children:", userChildErrors);

					// Check if it's an authorization error
					const isAuthError = userChildErrors.some(
						(err) =>
							err.errorType === "Unauthorized" ||
							err.message?.includes("Not Authorized"),
					);

					if (isAuthError) {
						throw new Error(
							"You don't have permission to view children records. Please contact your administrator.",
						);
					}

					throw new Error(
						`Error fetching user's children: ${JSON.stringify(userChildErrors)}`,
					);
				}

				if (!userChildren || userChildren.length === 0) {
					setChildren([]);
					setLoading(false);
					return;
				}

				// Get all child IDs associated with this user
				const childIDs = userChildren.map((uc) => uc.childID);

				// Fetch each child's details
				const childrenDetails = [];
				for (const childID of childIDs) {
					const { data: child, errors: childErrors } =
						await client.models.Child.get({
							id: childID,
						});

					if (!childErrors && child) {
						childrenDetails.push(child);
					}
				}

				setChildren(childrenDetails);
			} catch (err) {
				console.error("Error fetching user or children:", err);
				setError(err instanceof Error ? err.message : String(err));
			} finally {
				setLoading(false);
			}
		}

		fetchUserAndChildren();
	}, []);

	// Function to create a test child and associate with current user
	const createTestChild = async () => {
		if (!userId) {
			setChildCreationResult("Error: User not logged in");
			return;
		}

		setCreatingChild(true);
		setChildCreationResult(null);
		const client = clientRef.current;

		try {
			// Step 1: Create a new Child record
			const { data: newChild, errors: childErrors } =
				await client.models.Child.create({
					firstName: "Charlie",
					lastName: "Bucket",
					caseNumber: "12345",
					dateOfBirth: "2015-01-01", // January 1, 2015
					sex: "Male",
					gender: "Male",
				});

			if (childErrors) {
				throw new Error(`Error creating child: ${JSON.stringify(childErrors)}`);
			}

			if (!newChild) {
				throw new Error("Failed to create child record");
			}

			// Step 2: Create UserChild association
			const { data: userChild, errors: userChildErrors } =
				await client.models.UserChild.create({
					childID: newChild.id,
					userID: userId,
				});

			if (userChildErrors) {
				throw new Error(
					`Error associating child with user: ${JSON.stringify(userChildErrors)}`,
				);
			}

			// Step 3: Refresh the children list
			const { data: userChildren } = await client.models.UserChild.list({
				filter: { userID: { eq: userId } },
			});

			if (userChildren) {
				const childIDs = userChildren.map((uc) => uc.childID);
				const childrenDetails = [];

				for (const childID of childIDs) {
					const { data: child } = await client.models.Child.get({
						id: childID,
					});

					if (child) {
						childrenDetails.push(child);
					}
				}

				setChildren(childrenDetails);
			}

			setChildCreationResult(
				`Successfully created child: Charlie Bucket (ID: ${newChild.id})`,
			);
		} catch (err) {
			console.error("Error creating test child:", err);
			setChildCreationResult(err instanceof Error ? err.message : String(err));
		} finally {
			setCreatingChild(false);
		}
	};

	const handleClick = async () => {
		const client = clientRef.current;

		try {
			// Dummy data that matches the expected schema
			const { data, errors } = await client.queries.Norm({
				// conversationID: undefined, // Not required for first message
				messages: JSON.stringify([
					{
						role: "user",
						content: "I need to create a new form for John Smith",
					},
				]),
				formID: "dummy-form-id",
				currentFormState: JSON.stringify({
					caseNumber: "",
					amount: 0,
					reason: "",
					dateRequired: {
						day: 1,
						month: 1,
						year: 2024,
					},
					recipientDetails: {
						name: {
							firstName: "",
							lastName: "",
						},
						address: {
							lineOne: "",
							lineTwo: "",
							townOrCity: "",
							postcode: "",
						},
					},
				}),
			});

			if (errors) {
				console.error("Errors:", errors);
				setResult(`Error: ${JSON.stringify(errors, null, 2)}`);
				return;
			}

			setResult(JSON.stringify(data, null, 2));
		} catch (error) {
			console.error("Error calling norm function:", error);
			setResult(
				`Error: ${error instanceof Error ? error.message : String(error)}`,
			);
		}
	};

	return (
		<div className="govuk-width-container">
			<main className="govuk-main-wrapper">
				<h1 className="govuk-heading-l">New Form Test</h1>

				{/* Display current user ID */}
				<div className="govuk-panel govuk-panel--confirmation">
					<h2 className="govuk-panel__title">Current User</h2>
					<div className="govuk-panel__body">
						{loading
							? "Loading user information..."
							: userId
								? `User ID: ${userId}`
								: "Not signed in"}
					</div>
				</div>

				{/* Create Test Child Button */}
				<div className="govuk-form-group">
					<button
						type="button"
						className="govuk-button govuk-button--secondary"
						data-module="govuk-button"
						onClick={createTestChild}
						disabled={creatingChild || !userId}
					>
						{creatingChild
							? "Creating..."
							: "Create Test Child (Charlie Bucket)"}
					</button>

					{childCreationResult && (
						<div
							className={
								childCreationResult.includes("Error")
									? "govuk-error-summary"
									: "govuk-inset-text"
							}
						>
							{childCreationResult}
						</div>
					)}
				</div>

				{/* Display children associated with the user */}
				<div className="govuk-form-group">
					<fieldset className="govuk-fieldset">
						<legend className="govuk-fieldset__legend govuk-fieldset__legend--m">
							<h2 className="govuk-fieldset__heading">
								Children Associated with Your Account
							</h2>
						</legend>

						{loading ? (
							<p className="govuk-body">Loading children...</p>
						) : error ? (
							<p className="govuk-body govuk-error-message">{error}</p>
						) : children.length === 0 ? (
							<p className="govuk-body">
								No children associated with your account.
							</p>
						) : (
							<table className="govuk-table">
								<caption className="govuk-table__caption govuk-table__caption--m">
									Select a child for this form
								</caption>
								<thead className="govuk-table__head">
									<tr className="govuk-table__row">
										<th scope="col" className="govuk-table__header">
											Name
										</th>
										<th scope="col" className="govuk-table__header">
											Date of Birth
										</th>
										<th scope="col" className="govuk-table__header">
											Case Number
										</th>
									</tr>
								</thead>
								<tbody className="govuk-table__body">
									{children.map((child) => (
										<tr key={child.id} className="govuk-table__row">
											<td className="govuk-table__cell">
												{child.firstName} {child.lastName}
											</td>
											<td className="govuk-table__cell">
												{new Date(child.dateOfBirth).toLocaleDateString()}
											</td>
											<td className="govuk-table__cell">{child.caseNumber}</td>
										</tr>
									))}
								</tbody>
							</table>
						)}
					</fieldset>
				</div>

				<button
					type="button"
					className="govuk-button"
					data-module="govuk-button"
					onClick={handleClick}
				>
					Call Norm Function
				</button>
				{result && (
					<div className="govuk-panel govuk-panel--confirmation">
						<pre className="govuk-body">{result}</pre>
					</div>
				)}
			</main>
		</div>
	);
}

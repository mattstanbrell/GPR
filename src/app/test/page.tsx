"use client";

import { generateClient } from "aws-amplify/api";
import type { Schema } from "../../../amplify/data/resource";
import { useState, useEffect, useRef, useCallback } from "react";
import { createForm } from "../../utils/apis";
import { useUserModel } from "../../utils/authenticationUtils";
import financeCodesData from "../../../finance-codes.json";
import { getCurrentUser } from "aws-amplify/auth";

interface BenchmarkResult {
	method: "API" | "Direct";
	duration: number;
	success: boolean;
	error?: string;
	id: string;
}

// Type for a single finance code item from the JSON file
interface FinanceCodeItem {
	typeDescription: string;
	accountCode: string;
	accountCodeDescription: string;
	areasCovered: string;
}

export default function NewFormPage() {
	const [result, setResult] = useState<string | null>(null);
	const [cognitoUserId, setCognitoUserId] = useState<string | null>(null);
	const userModel = useUserModel();
	const [children, setChildren] = useState<Array<Schema["Child"]["type"]>>([]);
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState<string | null>(null);
	const [creatingChild, setCreatingChild] = useState(false);
	const [childCreationResult, setChildCreationResult] = useState<string | null>(null);
	const [benchmarkResults, setBenchmarkResults] = useState<BenchmarkResult[]>([]);
	const [runningBenchmark, setRunningBenchmark] = useState(false);
	const [seedingFinanceCodes, setSeedingFinanceCodes] = useState(false);
	const [seedFinanceCodesResult, setSeedFinanceCodesResult] = useState<string | null>(null);
	const [financeCodes, setFinanceCodes] = useState<Array<Schema["FinanceCode"]["type"]>>([]);
	const [loadingFinanceCodes, setLoadingFinanceCodes] = useState(false);
	const [deletingFinanceCodes, setDeletingFinanceCodes] = useState(false);
	const [deleteFinanceCodesResult, setDeleteFinanceCodesResult] = useState<string | null>(null);
	const [teams, setTeams] = useState<Array<Schema["Team"]["type"]>>([]);
	const [loadingTeams, setLoadingTeams] = useState(false);
	const [creatingTeam, setCreatingTeam] = useState(false);
	const [teamCreationResult, setTeamCreationResult] = useState<string | null>(null);
	const [assigningToTeam, setAssigningToTeam] = useState(false);
	const [teamAssignmentResult, setTeamAssignmentResult] = useState<string | null>(null);

	// Use a ref for the client to avoid dependency issues
	const clientRef = useRef(generateClient<Schema>());

	// Fetch current user and their associated children
	useEffect(() => {
		const client = clientRef.current;

		async function fetchUserAndChildren() {
			try {
				// Check if we have the user model
				if (!userModel || !userModel.id) {
					return;
				}

				// Get UserChild records for the current user
				const { data: userChildren, errors: userChildErrors } = await client.models.UserChild.list({
					filter: { userID: { eq: userModel.id } },
				});

				if (userChildErrors) {
					console.error("Error fetching user's children:", userChildErrors);

					// Check if it's an authorization error
					const isAuthError = userChildErrors.some(
						(err) => err.errorType === "Unauthorized" || err.message?.includes("Not Authorized"),
					);

					if (isAuthError) {
						throw new Error("You don't have permission to view children records. Please contact your administrator.");
					}

					throw new Error(`Error fetching user's children: ${JSON.stringify(userChildErrors)}`);
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
					const { data: child, errors: childErrors } = await client.models.Child.get({
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

		if (userModel) {
			fetchUserAndChildren();
		}
	}, [userModel]);

	// Fetch Cognito user ID
	useEffect(() => {
		const fetchCognitoUser = async () => {
			try {
				const currentUser = await getCurrentUser();
				setCognitoUserId(currentUser.userId);
			} catch (err) {
				console.error("Error fetching Cognito user:", err);
				setCognitoUserId(null);
			}
		};

		fetchCognitoUser();
	}, []);

	// Function to create a test child and associate with current user
	const createTestChild = async () => {
		if (!userModel?.id) {
			setChildCreationResult("Error: User not logged in");
			return;
		}

		setCreatingChild(true);
		setChildCreationResult(null);
		const client = clientRef.current;

		try {
			// Step 1: Create a new Child record
			const childData = {
				firstName: "Charlie",
				lastName: "Bucket",
				caseNumber: "12345",
				dateOfBirth: "2015-01-01", // January 1, 2015
				sex: "Male",
				gender: "Male",
			};
			console.log("📝 Attempting to create child with data:", childData);

			const { data: newChild, errors: childErrors } = await client.models.Child.create(childData);

			console.log("🔍 Create child response:", {
				data: newChild,
				errors: childErrors,
			});

			if (childErrors) {
				console.error("❌ Child creation errors:", childErrors);
				throw new Error(`Error creating child: ${JSON.stringify(childErrors)}`);
			}

			if (!newChild) {
				throw new Error("Failed to create child record");
			}

			// Step 2: Create UserChild association
			const { errors: userChildErrors } = await client.models.UserChild.create({
				childID: newChild.id,
				userID: userModel.id,
			});

			if (userChildErrors) {
				throw new Error(`Error associating child with user: ${JSON.stringify(userChildErrors)}`);
			}

			// Step 3: Refresh the children list
			const { data: userChildren } = await client.models.UserChild.list({
				filter: { userID: { eq: userModel.id } },
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

			setChildCreationResult(`Successfully created child: Charlie Bucket (ID: ${newChild.id})`);
		} catch (err) {
			console.error("Error creating test child:", err);
			setChildCreationResult(err instanceof Error ? err.message : String(err));
		} finally {
			setCreatingChild(false);
		}
	};

	// Function to create a test form using direct client
	const createFormDirect = async () => {
		if (!userModel?.id) return null;

		const client = clientRef.current;
		const formData: Partial<Schema["Form"]["type"]> & { creatorID: string } = {
			status: "DRAFT",
			creatorID: userModel.id,
			caseNumber: "",
			reason: "Test form",
			amount: 100,
			dateRequired: {
				day: 1,
				month: 1,
				year: 2024,
			},
			recipientDetails: {
				name: {
					firstName: "Test",
					lastName: "User",
				},
				address: {
					lineOne: "123 Test St",
					lineTwo: "",
					townOrCity: "London",
					postcode: "SW1A 1AA",
				},
			},
		};

		const { data, errors } = await client.models.Form.create(formData);
		if (errors) {
			throw new Error(errors[0].message);
		}
		return data;
	};

	// Function to run the benchmark
	const runBenchmark = async () => {
		if (!userModel?.id || runningBenchmark) return;

		setRunningBenchmark(true);
		const results: BenchmarkResult[] = [];
		const iterations = 5;

		try {
			// Test API method
			for (let i = 0; i < iterations; i++) {
				const start = performance.now();
				try {
					const form = await createForm({
						status: "DRAFT",
						creatorID: userModel.id,
						caseNumber: "",
						reason: "Test form",
						amount: 100,
						dateRequired: {
							day: 1,
							month: 1,
							year: 2024,
						},
						recipientDetails: {
							name: {
								firstName: "Test",
								lastName: "User",
							},
							address: {
								lineOne: "123 Test St",
								lineTwo: "",
								townOrCity: "London",
								postcode: "SW1A 1AA",
							},
						},
					});
					results.push({
						method: "API",
						duration: performance.now() - start,
						success: true,
						id: form?.id || "unknown",
					});
				} catch (error) {
					results.push({
						method: "API",
						duration: performance.now() - start,
						success: false,
						error: error instanceof Error ? error.message : String(error),
						id: "failed",
					});
				}
			}

			// Test direct client method
			for (let i = 0; i < iterations; i++) {
				const start = performance.now();
				try {
					const form = await createFormDirect();
					results.push({
						method: "Direct",
						duration: performance.now() - start,
						success: true,
						id: form?.id || "unknown",
					});
				} catch (error) {
					results.push({
						method: "Direct",
						duration: performance.now() - start,
						success: false,
						error: error instanceof Error ? error.message : String(error),
						id: "failed",
					});
				}
			}

			setBenchmarkResults(results);
		} finally {
			setRunningBenchmark(false);
		}
	};

	// Calculate average durations
	const getAverages = () => {
		const apiResults = benchmarkResults.filter((r) => r.method === "API" && r.success);
		const directResults = benchmarkResults.filter((r) => r.method === "Direct" && r.success);

		const apiAvg = apiResults.length > 0 ? apiResults.reduce((acc, r) => acc + r.duration, 0) / apiResults.length : 0;
		const directAvg =
			directResults.length > 0 ? directResults.reduce((acc, r) => acc + r.duration, 0) / directResults.length : 0;

		return { apiAvg, directAvg };
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
			setResult(`Error: ${error instanceof Error ? error.message : String(error)}`);
		}
	};

	// Function to fetch finance codes
	const fetchFinanceCodes = useCallback(async () => {
		setLoadingFinanceCodes(true);
		try {
			const client = clientRef.current;
			const { data: codes, errors } = await client.models.FinanceCode.list({
				limit: 100, // Adjust as needed
			});

			if (errors) {
				console.error("Error fetching finance codes:", errors);
				return;
			}

			setFinanceCodes(codes || []);
			console.log(`Fetched ${codes?.length || 0} finance codes`);
		} catch (err) {
			console.error("Error fetching finance codes:", err);
		} finally {
			setLoadingFinanceCodes(false);
		}
	}, []);

	// Fetch finance codes on initial load
	useEffect(() => {
		if (userModel?.id) {
			fetchFinanceCodes();
		}
	}, [userModel, fetchFinanceCodes]);

	// Function to seed finance codes from the JSON file
	const seedFinanceCodes = async () => {
		if (!userModel?.id) {
			setSeedFinanceCodesResult("Error: User not logged in");
			return;
		}

		setSeedingFinanceCodes(true);
		setSeedFinanceCodesResult(null);
		const client = clientRef.current;

		try {
			console.log("Starting finance code seeding process...");
			// Use the typed finance codes data - now it's a simple array
			const codes = financeCodesData as FinanceCodeItem[];
			console.log(`Found ${codes.length} finance codes in JSON file`);

			let successCount = 0;
			let errorCount = 0;
			let updateCount = 0;
			let createCount = 0;

			// Process each finance code
			for (const code of codes) {
				try {
					const financeCodeData = {
						accountCode: code.accountCode || "",
						typeDescription: code.typeDescription || "",
						accountCodeDescriptions: code.accountCodeDescription || "",
						areasCovered: code.areasCovered || "",
					};

					console.log(`Processing finance code: ${financeCodeData.accountCode} - ${financeCodeData.typeDescription}`);

					// Check if this code already exists
					const { data: existingCodes } = await client.models.FinanceCode.list({
						filter: { accountCode: { eq: financeCodeData.accountCode } },
					});

					if (existingCodes && existingCodes.length > 0) {
						// Update existing code
						console.log(`Updating existing finance code: ${financeCodeData.accountCode}`);
						await client.models.FinanceCode.update({
							id: existingCodes[0].id,
							...financeCodeData,
						});
						updateCount++;
					} else {
						// Create new code
						console.log(`Creating new finance code: ${financeCodeData.accountCode}`);
						await client.models.FinanceCode.create(financeCodeData);
						createCount++;
					}
					successCount++;
				} catch (err) {
					const accountCode = code.accountCode || "unknown";
					console.error(`Error processing finance code ${accountCode}:`, err);
					errorCount++;
				}
			}

			console.log(`Finance code seeding completed. Success: ${successCount}, Errors: ${errorCount}`);
			console.log(`Created: ${createCount}, Updated: ${updateCount}`);

			setSeedFinanceCodesResult(
				`Successfully processed ${successCount} finance codes (${createCount} created, ${updateCount} updated). Errors: ${errorCount}.`,
			);

			// Refresh the finance codes list
			await fetchFinanceCodes();
		} catch (err) {
			console.error("Error seeding finance codes:", err);
			setSeedFinanceCodesResult(err instanceof Error ? err.message : String(err));
		} finally {
			setSeedingFinanceCodes(false);
		}
	};

	// Function to delete all finance codes
	const deleteAllFinanceCodes = async () => {
		if (!userModel?.id) {
			setDeleteFinanceCodesResult("Error: User not logged in");
			return;
		}

		if (!window.confirm("Are you sure you want to delete ALL finance codes? This action cannot be undone.")) {
			return;
		}

		setDeletingFinanceCodes(true);
		setDeleteFinanceCodesResult(null);
		const client = clientRef.current;

		try {
			console.log("Starting finance code deletion process...");

			// First, get all finance codes
			const { data: codes, errors } = await client.models.FinanceCode.list({
				limit: 1000, // Adjust as needed
			});

			if (errors) {
				console.error("Error fetching finance codes for deletion:", errors);
				throw new Error(`Error fetching finance codes: ${JSON.stringify(errors)}`);
			}

			if (!codes || codes.length === 0) {
				setDeleteFinanceCodesResult("No finance codes found to delete.");
				setDeletingFinanceCodes(false);
				return;
			}

			console.log(`Found ${codes.length} finance codes to delete`);

			let successCount = 0;
			let errorCount = 0;

			// Delete each finance code
			for (const code of codes) {
				try {
					console.log(`Deleting finance code: ${code.accountCode} (ID: ${code.id})`);

					const { errors: deleteErrors } = await client.models.FinanceCode.delete({
						id: code.id,
					});

					if (deleteErrors) {
						console.error(`Error deleting finance code ${code.id}:`, deleteErrors);
						errorCount++;
					} else {
						successCount++;
					}
				} catch (err) {
					console.error(`Error deleting finance code ${code.id}:`, err);
					errorCount++;
				}
			}

			console.log(`Finance code deletion completed. Success: ${successCount}, Errors: ${errorCount}`);

			setDeleteFinanceCodesResult(`Successfully deleted ${successCount} finance codes. Errors: ${errorCount}.`);

			// Refresh the finance codes list
			await fetchFinanceCodes();
		} catch (err) {
			console.error("Error deleting finance codes:", err);
			setDeleteFinanceCodesResult(err instanceof Error ? err.message : String(err));
		} finally {
			setDeletingFinanceCodes(false);
		}
	};

	// Fetch teams
	useEffect(() => {
		const fetchTeams = async () => {
			setLoadingTeams(true);
			try {
				const client = clientRef.current;
				const { data: teamsData, errors } = await client.models.Team.list();
				if (errors) {
					throw new Error(errors[0].message);
				}
				setTeams(teamsData || []);
			} catch (err) {
				console.error("Error fetching teams:", err);
				setError(err instanceof Error ? err.message : String(err));
			} finally {
				setLoadingTeams(false);
			}
		};

		fetchTeams();
	}, []);

	// Function to create a new team
	const createTeam = async (managerUserID: string, assistantManagerUserID: string) => {
		if (!userModel?.id) {
			setTeamCreationResult("Error: User not logged in");
			return;
		}

		setCreatingTeam(true);
		setTeamCreationResult(null);
		const client = clientRef.current;

		try {
			const { data: newTeam, errors } = await client.models.Team.create({
				managerUserID,
				assistantManagerUserID,
			});

			if (errors) {
				throw new Error(errors[0].message);
			}

			if (!newTeam) {
				throw new Error("Failed to create team record");
			}

			// Refresh teams list
			const { data: teamsData } = await client.models.Team.list();
			setTeams(teamsData || []);

			setTeamCreationResult(`Successfully created team (ID: ${newTeam.id})`);
		} catch (err) {
			console.error("Error creating team:", err);
			setTeamCreationResult(err instanceof Error ? err.message : String(err));
		} finally {
			setCreatingTeam(false);
		}
	};

	// Function to assign current user to a team
	const assignToTeam = async (teamID: string) => {
		if (!userModel?.id) {
			setTeamAssignmentResult("Error: User not logged in");
			return;
		}

		setAssigningToTeam(true);
		setTeamAssignmentResult(null);
		const client = clientRef.current;

		try {
			// Update user with new teamID
			const { errors } = await client.models.User.update({
				id: userModel.id,
				teamID,
			});

			if (errors) {
				throw new Error(errors[0].message);
			}

			setTeamAssignmentResult(`Successfully assigned to team (ID: ${teamID})`);
		} catch (err) {
			console.error("Error assigning to team:", err);
			setTeamAssignmentResult(err instanceof Error ? err.message : String(err));
		} finally {
			setAssigningToTeam(false);
		}
	};

	return (
		<div className="govuk-width-container">
			<main className="govuk-main-wrapper">
				<div className="govuk-grid-row">
					<div className="govuk-grid-column-full">
						<h1 className="govuk-heading-l">Test Page</h1>

						{/* Team Management Section */}
						<div className="govuk-grid-row">
							<div className="govuk-grid-column-full">
								<h2 className="govuk-heading-m">Team Management</h2>

								{/* Current Team Status */}
								<div className="govuk-inset-text">
									{userModel?.teamID ? (
										<p>Current Team ID: {userModel.teamID}</p>
									) : (
										<p>You are not assigned to any team</p>
									)}
								</div>

								{/* Create Team Form */}
								<form
									onSubmit={(e) => {
										e.preventDefault();
										const formData = new FormData(e.currentTarget);
										createTeam(
											formData.get("managerUserID") as string,
											formData.get("assistantManagerUserID") as string,
										);
									}}
								>
									<div className="govuk-form-group">
										<label className="govuk-label" htmlFor="managerUserID">
											Manager User ID
										</label>
										<input
											className="govuk-input govuk-input--width-20"
											id="managerUserID"
											name="managerUserID"
											type="text"
											required
										/>
									</div>

									<div className="govuk-form-group">
										<label className="govuk-label" htmlFor="assistantManagerUserID">
											Assistant Manager User ID
										</label>
										<input
											className="govuk-input govuk-input--width-20"
											id="assistantManagerUserID"
											name="assistantManagerUserID"
											type="text"
											required
										/>
									</div>

									<button type="submit" className="govuk-button" disabled={creatingTeam}>
										{creatingTeam ? "Creating..." : "Create Team"}
									</button>
								</form>

								{teamCreationResult && (
									<div
										className={`govuk-inset-text ${teamCreationResult.includes("Error") ? "govuk-error-message" : ""}`}
									>
										{teamCreationResult}
									</div>
								)}

								{/* Teams List */}
								<h3 className="govuk-heading-s">Available Teams</h3>
								{loadingTeams ? (
									<p>Loading teams...</p>
								) : teams.length > 0 ? (
									<table className="govuk-table">
										<thead className="govuk-table__head">
											<tr className="govuk-table__row">
												<th className="govuk-table__header">Team ID</th>
												<th className="govuk-table__header">Manager ID</th>
												<th className="govuk-table__header">Assistant Manager ID</th>
												<th className="govuk-table__header">Actions</th>
											</tr>
										</thead>
										<tbody className="govuk-table__body">
											{teams.map((team) => (
												<tr key={team.id} className="govuk-table__row">
													<td className="govuk-table__cell">{team.id}</td>
													<td className="govuk-table__cell">{team.managerUserID}</td>
													<td className="govuk-table__cell">{team.assistantManagerUserID}</td>
													<td className="govuk-table__cell">
														<button
															type="button"
															className="govuk-button govuk-button--secondary"
															onClick={() => assignToTeam(team.id)}
															disabled={assigningToTeam || userModel?.teamID === team.id}
														>
															{userModel?.teamID === team.id ? "Current Team" : "Join Team"}
														</button>
													</td>
												</tr>
											))}
										</tbody>
									</table>
								) : (
									<p>No teams found</p>
								)}

								{teamAssignmentResult && (
									<div
										className={`govuk-inset-text ${teamAssignmentResult.includes("Error") ? "govuk-error-message" : ""}`}
									>
										{teamAssignmentResult}
									</div>
								)}
							</div>
						</div>

						{/* Existing content */}
						<div className="govuk-grid-row">
							<div className="govuk-grid-column-full">
								{/* Benchmark Section */}
								<div className="govuk-form-group">
									<fieldset className="govuk-fieldset">
										<legend className="govuk-fieldset__legend govuk-fieldset__legend--m">
											<h2 className="govuk-fieldset__heading">Form Creation Benchmark</h2>
										</legend>

										<button
											type="button"
											className="govuk-button"
											data-module="govuk-button"
											onClick={runBenchmark}
											disabled={runningBenchmark || !userModel}
										>
											{runningBenchmark ? "Running Benchmark..." : "Run Benchmark"}
										</button>

										{benchmarkResults.length > 0 && (
											<div className="govuk-inset-text">
												<h3 className="govuk-heading-s">Results</h3>
												<p className="govuk-body">
													API Average: {getAverages().apiAvg.toFixed(2)}ms
													<br />
													Direct Average: {getAverages().directAvg.toFixed(2)}ms
												</p>
												<details className="govuk-details" data-module="govuk-details">
													<summary className="govuk-details__summary">
														<span className="govuk-details__summary-text">View all results</span>
													</summary>
													<div className="govuk-details__text">
														<table className="govuk-table">
															<thead className="govuk-table__head">
																<tr className="govuk-table__row">
																	<th scope="col" className="govuk-table__header">
																		Method
																	</th>
																	<th scope="col" className="govuk-table__header">
																		Duration (ms)
																	</th>
																	<th scope="col" className="govuk-table__header">
																		Status
																	</th>
																</tr>
															</thead>
															<tbody className="govuk-table__body">
																{benchmarkResults.map((result) => (
																	<tr key={result.id} className="govuk-table__row">
																		<td className="govuk-table__cell">{result.method}</td>
																		<td className="govuk-table__cell">{result.duration.toFixed(2)}</td>
																		<td className="govuk-table__cell">
																			{result.success ? "✅" : `❌ ${result.error}`}
																		</td>
																	</tr>
																))}
															</tbody>
														</table>
													</div>
												</details>
											</div>
										)}
									</fieldset>
								</div>

								{/* Seed Finance Codes Button */}
								<div className="govuk-form-group">
									<fieldset className="govuk-fieldset">
										<legend className="govuk-fieldset__legend govuk-fieldset__legend--m">
											<h2 className="govuk-fieldset__heading">Finance Codes</h2>
										</legend>

										<div className="govuk-button-group">
											<button
												type="button"
												className="govuk-button govuk-button--secondary"
												data-module="govuk-button"
												onClick={seedFinanceCodes}
												disabled={seedingFinanceCodes || deletingFinanceCodes || !userModel}
											>
												{seedingFinanceCodes ? "Seeding Finance Codes..." : "Seed Finance Codes"}
											</button>

											<button
												type="button"
												className="govuk-button govuk-button--warning"
												data-module="govuk-button"
												onClick={deleteAllFinanceCodes}
												disabled={deletingFinanceCodes || seedingFinanceCodes || !userModel}
											>
												{deletingFinanceCodes ? "Deleting Finance Codes..." : "Delete All Finance Codes"}
											</button>
										</div>

										{seedFinanceCodesResult && (
											<div
												className={
													seedFinanceCodesResult.includes("Error") ? "govuk-error-summary" : "govuk-inset-text"
												}
											>
												{seedFinanceCodesResult}
											</div>
										)}

										{deleteFinanceCodesResult && (
											<div
												className={
													deleteFinanceCodesResult.includes("Error") ? "govuk-error-summary" : "govuk-inset-text"
												}
											>
												{deleteFinanceCodesResult}
											</div>
										)}

										{/* Display Finance Codes */}
										<div className="govuk-!-margin-top-6">
											<h3 className="govuk-heading-s">Finance Codes ({financeCodes.length})</h3>
											{loadingFinanceCodes ? (
												<p className="govuk-body">Loading finance codes...</p>
											) : financeCodes.length === 0 ? (
												<p className="govuk-body">
													No finance codes found. Click the button above to seed finance codes.
												</p>
											) : (
												<details className="govuk-details" data-module="govuk-details">
													<summary className="govuk-details__summary">
														<span className="govuk-details__summary-text">View all finance codes</span>
													</summary>
													<div className="govuk-details__text">
														<table className="govuk-table">
															<thead className="govuk-table__head">
																<tr className="govuk-table__row">
																	<th scope="col" className="govuk-table__header">
																		Account Code
																	</th>
																	<th scope="col" className="govuk-table__header">
																		Type Description
																	</th>
																	<th scope="col" className="govuk-table__header">
																		Description
																	</th>
																	<th scope="col" className="govuk-table__header">
																		Areas Covered
																	</th>
																</tr>
															</thead>
															<tbody className="govuk-table__body">
																{financeCodes.map((code) => (
																	<tr key={code.id} className="govuk-table__row">
																		<td className="govuk-table__cell">{code.accountCode}</td>
																		<td className="govuk-table__cell">{code.typeDescription}</td>
																		<td className="govuk-table__cell">{code.accountCodeDescriptions}</td>
																		<td className="govuk-table__cell">{code.areasCovered}</td>
																	</tr>
																))}
															</tbody>
														</table>
													</div>
												</details>
											)}
											<button
												type="button"
												className="govuk-button govuk-button--secondary govuk-!-margin-top-2"
												data-module="govuk-button"
												onClick={fetchFinanceCodes}
												disabled={loadingFinanceCodes || !userModel}
											>
												{loadingFinanceCodes ? "Refreshing..." : "Refresh Finance Codes"}
											</button>
										</div>
									</fieldset>
								</div>

								{/* Display user IDs */}
								<div className="govuk-panel govuk-panel--confirmation">
									<h2 className="govuk-panel__title">Current User</h2>
									<div className="govuk-panel__body">
										{loading ? (
											"Loading user information..."
										) : (
											<>
												<p>Cognito User ID: {cognitoUserId || "Not signed in"}</p>
												<p>Database User ID: {userModel?.id || "Not signed in"}</p>
											</>
										)}
									</div>
								</div>

								{/* Create Test Child Button */}
								<div className="govuk-form-group">
									<button
										type="button"
										className="govuk-button govuk-button--secondary"
										data-module="govuk-button"
										onClick={createTestChild}
										disabled={creatingChild || !userModel}
									>
										{creatingChild ? "Creating..." : "Create Test Child (Charlie Bucket)"}
									</button>

									{childCreationResult && (
										<div className={childCreationResult.includes("Error") ? "govuk-error-summary" : "govuk-inset-text"}>
											{childCreationResult}
										</div>
									)}
								</div>

								{/* Display children associated with the user */}
								<div className="govuk-form-group">
									<fieldset className="govuk-fieldset">
										<legend className="govuk-fieldset__legend govuk-fieldset__legend--m">
											<h2 className="govuk-fieldset__heading">Children Associated with Your Account</h2>
										</legend>

										{loading ? (
											<p className="govuk-body">Loading children...</p>
										) : error ? (
											<p className="govuk-body govuk-error-message">{error}</p>
										) : children.length === 0 ? (
											<p className="govuk-body">No children associated with your account.</p>
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
															<td className="govuk-table__cell">{new Date(child.dateOfBirth).toLocaleDateString()}</td>
															<td className="govuk-table__cell">{child.caseNumber}</td>
														</tr>
													))}
												</tbody>
											</table>
										)}
									</fieldset>
								</div>

								<button type="button" className="govuk-button" data-module="govuk-button" onClick={handleClick}>
									Call Norm Function
								</button>
								{result && (
									<div className="govuk-panel govuk-panel--confirmation">
										<pre className="govuk-body">{result}</pre>
									</div>
								)}
							</div>
						</div>
					</div>
				</div>
			</main>
		</div>
	);
}

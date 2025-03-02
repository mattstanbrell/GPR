"use client";

import { generateClient } from "aws-amplify/api";
import type { Schema } from "../../../amplify/data/resource";
import { useState } from "react";
import { Amplify } from "aws-amplify";
import outputs from "../../../amplify_outputs.json";

// Configure Amplify
Amplify.configure(outputs);

export default function NewFormPage() {
	const [result, setResult] = useState<string | null>(null);
	const client = generateClient<Schema>();

	const handleClick = async () => {
		try {
			// Dummy data that matches the expected schema
			const { data, errors } = await client.queries.Norm({
				conversationID: undefined, // Not required for first message
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

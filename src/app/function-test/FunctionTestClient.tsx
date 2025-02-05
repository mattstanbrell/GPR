"use client";

import { useState } from "react";
import { generateClient } from "aws-amplify/api";
import type { Schema } from "../../../amplify/data/resource";

const client = generateClient<Schema>();

export default function FunctionTestClient() {
	const [result, setResult] = useState<string>("");
	const [name, setName] = useState<string>("");
	const [loading, setLoading] = useState(false);

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault();
		setLoading(true);
		try {
			const response = await client.queries.sayHello({
				name: name || "World",
			});
			setResult(response.data || "No response data");
		} catch (error) {
			console.error("Error calling function:", error);
			setResult("Error calling function. Check console for details.");
		} finally {
			setLoading(false);
		}
	};

	return (
		<div>
			<h1 className="govuk-heading-xl">Function Test</h1>
			<form onSubmit={handleSubmit} className="govuk-form-group">
				<label className="govuk-label" htmlFor="name">
					Enter a name
				</label>
				<input
					className="govuk-input"
					id="name"
					type="text"
					value={name}
					onChange={(e) => setName(e.target.value)}
					placeholder="Enter a name"
				/>
				<button
					type="submit"
					className="govuk-button"
					data-module="govuk-button"
					disabled={loading}
				>
					{loading ? "Calling function..." : "Call Function"}
				</button>
			</form>
			{result && <div className="govuk-inset-text">Result: {result}</div>}
		</div>
	);
}

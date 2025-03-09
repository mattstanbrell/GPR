"use client";

import { Suspense } from "react";
import { FormContent } from "../components/form/FormContent";

export default function NewFormPage() {
	return (
		<Suspense
			fallback={<div className="govuk-width-container">Loading...</div>}
		>
			<FormContent />
		</Suspense>
	);
}

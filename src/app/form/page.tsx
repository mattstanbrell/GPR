"use client";

import { FormContent } from "../components/form/FormContent";
import { Suspense } from "react";

export default function NewFormPage() {
	return (
		<Suspense fallback={<div>Loading...</div>}>
			<FormContent />
		</Suspense>
	);
}

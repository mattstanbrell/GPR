"use client";

import { useState } from "react";
import { generateClient } from "aws-amplify/api";
import type { Schema } from "../../../amplify/data/resource";
import { useRouter } from "next/navigation";

interface DeleteButtonProps {
	formId: string;
}

export default function DeleteButton({ formId }: DeleteButtonProps) {
	const [isDeleting, setIsDeleting] = useState(false);
	const router = useRouter();

	const handleDelete = async () => {
		if (isDeleting) return;

		try {
			setIsDeleting(true);
			const client = generateClient<Schema>();

			await client.models.Form.delete({
				id: formId,
			});

			// Refresh the page data
			router.refresh();
		} catch (err) {
			console.error("Error deleting form:", err);
			alert("Failed to delete form. Please try again.");
		} finally {
			setIsDeleting(false);
		}
	};

	return (
		<button
			className="govuk-button govuk-button--warning"
			data-module="govuk-button"
			onClick={handleDelete}
			disabled={isDeleting}
			type="button"
		>
			Delete
		</button>
	);
}

import type { ReactNode } from "react";
import { useRouter } from "next/navigation";
import { HOME } from "../../constants/urls";

interface FormErrorSummaryProps {
	error: ReactNode;
}

export function FormErrorSummary({ error }: FormErrorSummaryProps) {
	const router = useRouter();

	return (
		<div className="govuk-width-container">
			<main className="govuk-main-wrapper">
				<div className="govuk-error-summary" aria-labelledby="error-summary-title" role="alert" tabIndex={-1}>
					<h2 className="govuk-error-summary__title" id="error-summary-title">
						There was a problem with your form
					</h2>
					<div className="govuk-error-summary__body">
						<p>{error}</p>
						<button className="govuk-button" data-module="govuk-button" onClick={() => router.push(HOME)} type="button">
							Return to Home
						</button>
					</div>
				</div>
			</main>
		</div>
	);
}

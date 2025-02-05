import FunctionTestClient from "./FunctionTestClient";

export default function FunctionTestPage() {
	return (
		<main className="govuk-main-wrapper">
			<div className="govuk-width-container">
				<div className="govuk-grid-row">
					<div className="govuk-grid-column-two-thirds">
						<FunctionTestClient />
					</div>
				</div>
			</div>
		</main>
	);
}

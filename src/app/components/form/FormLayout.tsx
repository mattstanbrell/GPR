import type { FormData } from "./types";

interface FormLayoutProps {
	form: FormData;
	loading: boolean;
	handleFormChange: (field: string, value: unknown, updateDb?: boolean) => void;
	handleSubmit: (e: React.FormEvent) => void;
	isFormValid: (form: FormData | null) => boolean;
}

export function FormLayout({
	form,
	loading,
	handleFormChange,
	handleSubmit,
	isFormValid,
}: FormLayoutProps) {
	return (
		<>
			<style jsx>{`
				.button-container {
					position: relative;
					display: flex;
					justify-content: center;
					padding: 15px 0;
				}
				
				.button-container::before {
					content: "";
					position: absolute;
					top: -30px;
					left: 0;
					right: 0;
					height: 30px;
					background: linear-gradient(to bottom, rgba(255, 255, 255, 0), rgba(255, 255, 255, 0.9));
					pointer-events: none;
				}
				
				.button-container::after {
					content: "";
					position: absolute;
					bottom: 0;
					left: 0;
					right: 0;
					height: 100%;
					background: rgba(255, 255, 255, 0.8);
					backdrop-filter: blur(5px);
					z-index: -1;
					border-top: 1px solid rgba(177, 180, 182, 0.3);
				}
			`}</style>
			<div
				style={{
					width: "60%",
					borderRight: "1px solid #b1b4b6",
					paddingRight: "0",
					paddingLeft: "15px",
					height: "100%",
					display: "flex",
					flexDirection: "column",
					float: "left",
					boxSizing: "border-box",
				}}
			>
				<h1 className="govuk-heading-l" style={{ marginLeft: "3px" }}>
					Form
				</h1>
				<div style={{ flexGrow: 1, overflowY: "auto", paddingRight: "0" }}>
					<form
						onSubmit={handleSubmit}
						style={{ paddingRight: "20px", paddingLeft: "3px" }}
					>
						<fieldset className="govuk-fieldset">
							<legend className="govuk-fieldset__legend govuk-fieldset__legend--m">
								<h2 className="govuk-fieldset__heading">Expense details</h2>
							</legend>

							<div className="govuk-form-group">
								<label className="govuk-label" htmlFor="caseNumber">
									Case number
								</label>
								<input
									className="govuk-input govuk-input--width-20"
									id="caseNumber"
									name="caseNumber"
									type="text"
									value={form.caseNumber || ""}
									onChange={(e) =>
										handleFormChange("caseNumber", e.target.value)
									}
									onBlur={() =>
										handleFormChange("caseNumber", form.caseNumber || "", true)
									}
								/>
							</div>

							<div className="govuk-form-group">
								<label className="govuk-label" htmlFor="reason">
									Reason for expense
								</label>
								<textarea
									className="govuk-textarea"
									id="reason"
									name="reason"
									rows={3}
									value={form.reason || ""}
									onChange={(e) => handleFormChange("reason", e.target.value)}
									onBlur={() =>
										handleFormChange("reason", form.reason || "", true)
									}
								/>
							</div>

							<div className="govuk-form-group">
								<label className="govuk-label" htmlFor="amount">
									Amount
								</label>
								<div className="govuk-input__wrapper">
									<div className="govuk-input__prefix" aria-hidden="true">
										£
									</div>
									<input
										className="govuk-input govuk-input--width-5"
										id="amount"
										name="amount"
										type="text"
										spellCheck="false"
										value={form.amount?.toString() || ""}
										onChange={(e) => {
											const value = e.target.value;
											const numericValue = value ? Number.parseFloat(value) : 0;
											handleFormChange("amount", numericValue);
										}}
										onBlur={() =>
											handleFormChange("amount", form.amount || "", true)
										}
									/>
								</div>
							</div>

							<div className="govuk-form-group">
								<fieldset
									className="govuk-fieldset"
									aria-describedby="date-required-hint"
								>
									<legend className="govuk-fieldset__legend">
										Date prepaid card is needed by
									</legend>
									<div className="govuk-date-input" id="date-required">
										<div className="govuk-date-input__item">
											<div className="govuk-form-group">
												<label
													className="govuk-label govuk-date-input__label"
													htmlFor="date-required-day"
												>
													Day
												</label>
												<input
													className="govuk-input govuk-date-input__input govuk-input--width-2"
													id="date-required-day"
													name="date-required-day"
													type="text"
													inputMode="numeric"
													value={
														form.dateRequired?.day
															? form.dateRequired.day.toString()
															: ""
													}
													onChange={(e) => {
														const value = e.target.value.trim();
														const day = value
															? Number.parseInt(value, 10)
															: null;
														handleFormChange("dateRequired", {
															...form.dateRequired,
															day,
														});
													}}
													onBlur={() =>
														handleFormChange(
															"dateRequired",
															form.dateRequired || {},
															true,
														)
													}
												/>
											</div>
										</div>
										<div className="govuk-date-input__item">
											<div className="govuk-form-group">
												<label
													className="govuk-label govuk-date-input__label"
													htmlFor="date-required-month"
												>
													Month
												</label>
												<input
													className="govuk-input govuk-date-input__input govuk-input--width-2"
													id="date-required-month"
													name="date-required-month"
													type="text"
													inputMode="numeric"
													value={
														form.dateRequired?.month
															? form.dateRequired.month.toString()
															: ""
													}
													onChange={(e) => {
														const value = e.target.value.trim();
														const month = value
															? Number.parseInt(value, 10)
															: null;
														handleFormChange("dateRequired", {
															...form.dateRequired,
															month,
														});
													}}
													onBlur={() =>
														handleFormChange(
															"dateRequired",
															form.dateRequired || {},
															true,
														)
													}
												/>
											</div>
										</div>
										<div className="govuk-date-input__item">
											<div className="govuk-form-group">
												<label
													className="govuk-label govuk-date-input__label"
													htmlFor="date-required-year"
												>
													Year
												</label>
												<input
													className="govuk-input govuk-date-input__input govuk-input--width-4"
													id="date-required-year"
													name="date-required-year"
													type="text"
													inputMode="numeric"
													value={
														form.dateRequired?.year
															? form.dateRequired.year.toString()
															: ""
													}
													onChange={(e) => {
														const value = e.target.value.trim();
														const year = value
															? Number.parseInt(value, 10)
															: null;
														handleFormChange("dateRequired", {
															...form.dateRequired,
															year,
														});
													}}
													onBlur={() =>
														handleFormChange(
															"dateRequired",
															form.dateRequired || {},
															true,
														)
													}
												/>
											</div>
										</div>
									</div>
								</fieldset>
							</div>
						</fieldset>

						<fieldset className="govuk-fieldset">
							<legend className="govuk-fieldset__legend govuk-fieldset__legend--m">
								<h2 className="govuk-fieldset__heading">
									Card recipient details
								</h2>
							</legend>
							<div className="govuk-hint">
								Details of the person receiving the prepaid card.
							</div>

							<div className="govuk-form-group">
								<label className="govuk-label" htmlFor="firstName">
									First name
								</label>
								<input
									className="govuk-input"
									id="firstName"
									name="firstName"
									type="text"
									value={form.recipientDetails?.name?.firstName || ""}
									onChange={(e) =>
										handleFormChange("recipientDetails", {
											...form.recipientDetails,
											name: {
												...form.recipientDetails?.name,
												firstName: e.target.value,
											},
										})
									}
									onBlur={() =>
										handleFormChange(
											"recipientDetails",
											form.recipientDetails || {},
											true,
										)
									}
								/>
							</div>

							<div className="govuk-form-group">
								<label className="govuk-label" htmlFor="lastName">
									Last name
								</label>
								<input
									className="govuk-input"
									id="lastName"
									name="lastName"
									type="text"
									value={form.recipientDetails?.name?.lastName || ""}
									onChange={(e) =>
										handleFormChange("recipientDetails", {
											...form.recipientDetails,
											name: {
												...form.recipientDetails?.name,
												lastName: e.target.value,
											},
										})
									}
									onBlur={() =>
										handleFormChange(
											"recipientDetails",
											form.recipientDetails || {},
											true,
										)
									}
								/>
							</div>

							<div className="govuk-form-group">
								<label className="govuk-label" htmlFor="address-line-1">
									Address line 1
								</label>
								<input
									className="govuk-input"
									id="address-line-1"
									name="address-line-1"
									type="text"
									value={form.recipientDetails?.address?.lineOne || ""}
									onChange={(e) =>
										handleFormChange("recipientDetails", {
											...form.recipientDetails,
											address: {
												...form.recipientDetails?.address,
												lineOne: e.target.value,
											},
										})
									}
									onBlur={() =>
										handleFormChange(
											"recipientDetails",
											form.recipientDetails || {},
											true,
										)
									}
									autoComplete="address-line1"
								/>
							</div>

							<div className="govuk-form-group">
								<label className="govuk-label" htmlFor="address-line-2">
									Address line 2 (optional)
								</label>
								<input
									className="govuk-input"
									id="address-line-2"
									name="address-line-2"
									type="text"
									value={form.recipientDetails?.address?.lineTwo || ""}
									onChange={(e) =>
										handleFormChange("recipientDetails", {
											...form.recipientDetails,
											address: {
												...form.recipientDetails?.address,
												lineTwo: e.target.value,
											},
										})
									}
									onBlur={() =>
										handleFormChange(
											"recipientDetails",
											form.recipientDetails || {},
											true,
										)
									}
									autoComplete="address-line2"
								/>
							</div>

							<div className="govuk-form-group">
								<label className="govuk-label" htmlFor="address-town">
									Town or city
								</label>
								<input
									className="govuk-input govuk-input--width-20"
									id="address-town"
									name="address-town"
									type="text"
									value={form.recipientDetails?.address?.townOrCity || ""}
									onChange={(e) =>
										handleFormChange("recipientDetails", {
											...form.recipientDetails,
											address: {
												...form.recipientDetails?.address,
												townOrCity: e.target.value,
											},
										})
									}
									onBlur={() =>
										handleFormChange(
											"recipientDetails",
											form.recipientDetails || {},
											true,
										)
									}
									autoComplete="address-level2"
								/>
							</div>

							<div className="govuk-form-group">
								<label className="govuk-label" htmlFor="address-postcode">
									Postcode
								</label>
								<input
									className="govuk-input govuk-input--width-10"
									id="address-postcode"
									name="address-postcode"
									type="text"
									value={form.recipientDetails?.address?.postcode || ""}
									onChange={(e) =>
										handleFormChange("recipientDetails", {
											...form.recipientDetails,
											address: {
												...form.recipientDetails?.address,
												postcode: e.target.value,
											},
										})
									}
									onBlur={() =>
										handleFormChange(
											"recipientDetails",
											form.recipientDetails || {},
											true,
										)
									}
									autoComplete="postal-code"
								/>
							</div>
						</fieldset>
					</form>
				</div>
				<div className="button-container">
					<button
						type="submit"
						className="govuk-button"
						onClick={handleSubmit}
						disabled={!isFormValid(form) || loading}
						style={{
							marginBottom: 0,
							position: "relative",
							zIndex: 1,
							opacity: isFormValid(form) ? 1 : 0.5,
							cursor: isFormValid(form) ? "pointer" : "not-allowed",
						}}
					>
						{loading ? "Submitting..." : "Submit"}
					</button>
				</div>
			</div>
		</>
	);
}

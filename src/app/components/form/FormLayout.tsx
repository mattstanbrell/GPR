import type { Schema } from "../../../../amplify/data/resource";
import { RecurringPaymentSection } from "./RecurringPaymentSection";

interface FormLayoutProps {
	form: Partial<Schema["Form"]["type"]>;
	loading: boolean;
	handleFormChange: (field: string, value: unknown, updateDb?: boolean) => void;
	handleSubmit: (e: React.FormEvent) => void;
	isFormValid: (form: Partial<Schema["Form"]["type"]> | null) => boolean;
	disabled: boolean;
	updatedFields: Set<string>;
}

export function FormLayout({
	form,
	loading,
	handleFormChange,
	handleSubmit,
	isFormValid,
	disabled,
	updatedFields,
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

				.form-title {
					cursor: text;
					outline: none;
					width: fit-content;
					padding: 0 2px;
					margin-right: 10px;
				}

				.form-title:hover, .form-title:focus {
					background: transparent;
				}

				@keyframes flash-update {
					0% {
						background-color: transparent;
					}
					50% {
						background-color: var(--color-background-light);
					}
					100% {
						background-color: transparent;
					}
				}

				.field-updated {
					animation: flash-update 0.8s ease;
				}

				.form-title.field-updated {
					animation: flash-update 0.8s ease;
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
				<h1
					className={`govuk-heading-l form-title ${updatedFields.has("title") ? "field-updated" : ""}`}
					style={{ marginLeft: "3px" }}
					contentEditable
					suppressContentEditableWarning
					onBlur={(e) => {
						const newTitle = e.currentTarget.textContent?.trim();
						if (newTitle && newTitle !== form.title) {
							handleFormChange("title", newTitle, true);
						} else {
							// Reset to current title if empty or unchanged
							e.currentTarget.textContent = form.title || "Form";
						}
					}}
					onKeyDown={(e) => {
						if (e.key === "Enter") {
							e.preventDefault();
							e.currentTarget.blur();
						}
						if (e.key === "Escape") {
							e.preventDefault();
							e.currentTarget.textContent = form.title || "Form";
							e.currentTarget.blur();
						}
					}}
				>
					{form.title || "Form"}
				</h1>
				<div style={{ flexGrow: 1, overflowY: "auto", paddingRight: "0" }}>
					<form onSubmit={handleSubmit} style={{ paddingRight: "20px", paddingLeft: "3px" }}>
						<fieldset className="govuk-fieldset">
							<legend className="govuk-fieldset__legend govuk-fieldset__legend--m">
								<h2 className="govuk-fieldset__heading">Payment Method</h2>
							</legend>
							<div className={`govuk-form-group ${updatedFields.has("paymentMethod") ? "form-group-updated" : ""}`}>
								<div className="govuk-radios">
									<div className="govuk-radios__item">
										<input
											className={`govuk-radios__input ${updatedFields.has("paymentMethod") ? "field-updated" : ""}`}
											id="payment-method-prepaid"
											name="payment-method"
											type="radio"
											value="PREPAID_CARD"
											checked={form.paymentMethod === "PREPAID_CARD" || !form.paymentMethod}
											onChange={() => handleFormChange("paymentMethod", "PREPAID_CARD", true)}
											disabled={disabled}
										/>
										<label className="govuk-label govuk-radios__label" htmlFor="payment-method-prepaid">
											Prepaid Card
										</label>
									</div>
									<div className="govuk-radios__item">
										<input
											className={`govuk-radios__input ${updatedFields.has("paymentMethod") ? "field-updated" : ""}`}
											id="payment-method-purchase-order"
											name="payment-method"
											type="radio"
											value="PURCHASE_ORDER"
											checked={form.paymentMethod === "PURCHASE_ORDER"}
											onChange={() => handleFormChange("paymentMethod", "PURCHASE_ORDER", true)}
											disabled={disabled}
										/>
										<label className="govuk-label govuk-radios__label" htmlFor="payment-method-purchase-order">
											Purchase Order
										</label>
									</div>
								</div>
							</div>
						</fieldset>

						<fieldset className="govuk-fieldset">
							<legend className="govuk-fieldset__legend govuk-fieldset__legend--m">
								<h2 className="govuk-fieldset__heading">Expense details</h2>
							</legend>

							<div className={`govuk-form-group ${updatedFields.has("caseNumber") ? "form-group-updated" : ""}`}>
								<label className="govuk-label" htmlFor="caseNumber">
									Case number
								</label>
								<input
									className={`govuk-input govuk-input--width-20 ${
										updatedFields.has("caseNumber") ? "field-updated" : ""
									}`}
									id="caseNumber"
									name="caseNumber"
									type="text"
									defaultValue={form.caseNumber || ""}
									onChange={(e) => handleFormChange("caseNumber", e.target.value)}
									onBlur={(e) => handleFormChange("caseNumber", e.target.value, true)}
									disabled={disabled}
								/>
							</div>

							<div className={`govuk-form-group ${updatedFields.has("reason") ? "form-group-updated" : ""}`}>
								<label className="govuk-label" htmlFor="reason">
									Reason for expense
								</label>
								<textarea
									className={`govuk-textarea ${updatedFields.has("reason") ? "field-updated" : ""}`}
									id="reason"
									name="reason"
									rows={3}
									defaultValue={form.reason || ""}
									onChange={(e) => handleFormChange("reason", e.target.value)}
									onBlur={(e) => handleFormChange("reason", e.target.value, true)}
									disabled={disabled}
								/>
							</div>

							<div className={`govuk-form-group ${updatedFields.has("section17") ? "form-group-updated" : ""}`}>
								<div className="govuk-checkboxes">
									<div className="govuk-checkboxes__item">
										<input
											className={`govuk-checkboxes__input ${updatedFields.has("section17") ? "field-updated" : ""}`}
											id="section17"
											name="section17"
											type="checkbox"
											checked={form.section17 || false}
											onChange={(e) => handleFormChange("section17", e.target.checked, true)}
											disabled={disabled}
										/>
										<label className="govuk-label govuk-checkboxes__label" htmlFor="section17">
											Section 17
										</label>
									</div>
								</div>
							</div>

							<div className={`govuk-form-group ${updatedFields.has("amount") ? "form-group-updated" : ""}`}>
								<label className="govuk-label" htmlFor="amount">
									Amount
								</label>
								<div className="govuk-input__wrapper">
									<div className="govuk-input__prefix" aria-hidden="true">
										£
									</div>
									<input
										className={`govuk-input govuk-input--width-5 ${updatedFields.has("amount") ? "field-updated" : ""}`}
										id="amount"
										name="amount"
										type="text"
										spellCheck="false"
										defaultValue={form.amount?.toString() ?? ""}
										onChange={(e) =>
											handleFormChange("amount", e.target.value ? Number.parseFloat(e.target.value) : null)
										}
										onBlur={(e) =>
											handleFormChange("amount", e.target.value ? Number.parseFloat(e.target.value) : null, true)
										}
										disabled={disabled}
									/>
								</div>
							</div>

							<div className={`govuk-form-group ${updatedFields.has("dateRequired") ? "form-group-updated" : ""}`}>
								<fieldset className="govuk-fieldset" aria-describedby="date-required-hint">
									<legend className="govuk-fieldset__legend">
										{form.paymentMethod === "PURCHASE_ORDER"
											? "Date purchase order is needed by"
											: "Date prepaid card is needed by"}
									</legend>
									<div className="govuk-date-input" id="date-required">
										<div className="govuk-date-input__item">
											<div className="govuk-form-group">
												<label className="govuk-label govuk-date-input__label" htmlFor="date-required-day">
													Day
												</label>
												<input
													className={`govuk-input govuk-date-input__input govuk-input--width-2 ${
														updatedFields.has("dateRequired") ? "field-updated" : ""
													}`}
													id="date-required-day"
													name="date-required-day"
													type="text"
													inputMode="numeric"
													defaultValue={form.dateRequired?.day ? form.dateRequired.day.toString() : ""}
													onChange={(e) => {
														const value = e.target.value.trim();
														const day = value ? Number.parseInt(value, 10) : null;
														handleFormChange("dateRequired", {
															...form.dateRequired,
															day,
														});
													}}
													onBlur={(e) => {
														const value = e.target.value.trim();
														const day = value ? Number.parseInt(value, 10) : null;
														handleFormChange(
															"dateRequired",
															{
																...form.dateRequired,
																day,
															},
															true,
														);
													}}
													disabled={disabled}
												/>
											</div>
										</div>
										<div className="govuk-date-input__item">
											<div className="govuk-form-group">
												<label className="govuk-label govuk-date-input__label" htmlFor="date-required-month">
													Month
												</label>
												<input
													className={`govuk-input govuk-date-input__input govuk-input--width-2 ${
														updatedFields.has("dateRequired") ? "field-updated" : ""
													}`}
													id="date-required-month"
													name="date-required-month"
													type="text"
													inputMode="numeric"
													defaultValue={form.dateRequired?.month ? form.dateRequired.month.toString() : ""}
													onChange={(e) => {
														const value = e.target.value.trim();
														const month = value ? Number.parseInt(value, 10) : null;
														handleFormChange("dateRequired", {
															...form.dateRequired,
															month,
														});
													}}
													onBlur={(e) => {
														const value = e.target.value.trim();
														const month = value ? Number.parseInt(value, 10) : null;
														handleFormChange(
															"dateRequired",
															{
																...form.dateRequired,
																month,
															},
															true,
														);
													}}
													disabled={disabled}
												/>
											</div>
										</div>
										<div className="govuk-date-input__item">
											<div className="govuk-form-group">
												<label className="govuk-label govuk-date-input__label" htmlFor="date-required-year">
													Year
												</label>
												<input
													className={`govuk-input govuk-date-input__input govuk-input--width-4 ${
														updatedFields.has("dateRequired") ? "field-updated" : ""
													}`}
													id="date-required-year"
													name="date-required-year"
													type="text"
													inputMode="numeric"
													defaultValue={form.dateRequired?.year ? form.dateRequired.year.toString() : ""}
													onChange={(e) => {
														const value = e.target.value.trim();
														const year = value ? Number.parseInt(value, 10) : null;
														handleFormChange("dateRequired", {
															...form.dateRequired,
															year,
														});
													}}
													onBlur={(e) => {
														const value = e.target.value.trim();
														const year = value ? Number.parseInt(value, 10) : null;
														handleFormChange(
															"dateRequired",
															{
																...form.dateRequired,
																year,
															},
															true,
														);
													}}
													disabled={disabled}
												/>
											</div>
										</div>
									</div>
								</fieldset>
							</div>
						</fieldset>

						{/* Conditional rendering based on payment method */}
						{form.paymentMethod !== "PURCHASE_ORDER" && (
							<fieldset className="govuk-fieldset">
								<legend className="govuk-fieldset__legend govuk-fieldset__legend--m">
									<h2 className="govuk-fieldset__heading">Card recipient details</h2>
								</legend>
								<div className="govuk-hint">Details of the person receiving the prepaid card.</div>

								<div
									className={`govuk-form-group ${updatedFields.has("recipientDetails") ? "form-group-updated" : ""}`}
								>
									<label className="govuk-label" htmlFor="firstName">
										First name
									</label>
									<input
										className={`govuk-input ${updatedFields.has("recipientDetails") ? "field-updated" : ""}`}
										id="firstName"
										name="firstName"
										type="text"
										defaultValue={form.recipientDetails?.name?.firstName || ""}
										onChange={(e) =>
											handleFormChange("recipientDetails", {
												...form.recipientDetails,
												name: {
													...form.recipientDetails?.name,
													firstName: e.target.value,
												},
											})
										}
										onBlur={(e) =>
											handleFormChange(
												"recipientDetails",
												{
													...form.recipientDetails,
													name: {
														...form.recipientDetails?.name,
														firstName: e.target.value,
													},
												},
												true,
											)
										}
										disabled={disabled}
									/>
								</div>

								<div
									className={`govuk-form-group ${updatedFields.has("recipientDetails") ? "form-group-updated" : ""}`}
								>
									<label className="govuk-label" htmlFor="lastName">
										Last name
									</label>
									<input
										className={`govuk-input ${updatedFields.has("recipientDetails") ? "field-updated" : ""}`}
										id="lastName"
										name="lastName"
										type="text"
										defaultValue={form.recipientDetails?.name?.lastName || ""}
										onChange={(e) =>
											handleFormChange("recipientDetails", {
												...form.recipientDetails,
												name: {
													...form.recipientDetails?.name,
													lastName: e.target.value,
												},
											})
										}
										onBlur={(e) =>
											handleFormChange(
												"recipientDetails",
												{
													...form.recipientDetails,
													name: {
														...form.recipientDetails?.name,
														lastName: e.target.value,
													},
												},
												true,
											)
										}
										disabled={disabled}
									/>
								</div>

								<div
									className={`govuk-form-group ${updatedFields.has("recipientDetails") ? "form-group-updated" : ""}`}
								>
									<label className="govuk-label" htmlFor="address-line-1">
										Address line 1
									</label>
									<input
										className={`govuk-input ${updatedFields.has("recipientDetails") ? "field-updated" : ""}`}
										id="address-line-1"
										name="address-line-1"
										type="text"
										defaultValue={form.recipientDetails?.address?.lineOne || ""}
										onChange={(e) =>
											handleFormChange("recipientDetails", {
												...form.recipientDetails,
												address: {
													...form.recipientDetails?.address,
													lineOne: e.target.value,
												},
											})
										}
										onBlur={(e) =>
											handleFormChange(
												"recipientDetails",
												{
													...form.recipientDetails,
													address: {
														...form.recipientDetails?.address,
														lineOne: e.target.value,
													},
												},
												true,
											)
										}
										disabled={disabled}
										autoComplete="address-line1"
									/>
								</div>

								<div
									className={`govuk-form-group ${updatedFields.has("recipientDetails") ? "form-group-updated" : ""}`}
								>
									<label className="govuk-label" htmlFor="address-line-2">
										Address line 2 (optional)
									</label>
									<input
										className={`govuk-input ${updatedFields.has("recipientDetails") ? "field-updated" : ""}`}
										id="address-line-2"
										name="address-line-2"
										type="text"
										defaultValue={form.recipientDetails?.address?.lineTwo || ""}
										onChange={(e) =>
											handleFormChange("recipientDetails", {
												...form.recipientDetails,
												address: {
													...form.recipientDetails?.address,
													lineTwo: e.target.value,
												},
											})
										}
										onBlur={(e) =>
											handleFormChange(
												"recipientDetails",
												{
													...form.recipientDetails,
													address: {
														...form.recipientDetails?.address,
														lineTwo: e.target.value,
													},
												},
												true,
											)
										}
										disabled={disabled}
										autoComplete="address-line2"
									/>
								</div>

								<div
									className={`govuk-form-group ${updatedFields.has("recipientDetails") ? "form-group-updated" : ""}`}
								>
									<label className="govuk-label" htmlFor="address-town">
										Town or city
									</label>
									<input
										className={`govuk-input govuk-input--width-20 ${
											updatedFields.has("recipientDetails") ? "field-updated" : ""
										}`}
										id="address-town"
										name="address-town"
										type="text"
										defaultValue={form.recipientDetails?.address?.townOrCity || ""}
										onChange={(e) =>
											handleFormChange("recipientDetails", {
												...form.recipientDetails,
												address: {
													...form.recipientDetails?.address,
													townOrCity: e.target.value,
												},
											})
										}
										onBlur={(e) =>
											handleFormChange(
												"recipientDetails",
												{
													...form.recipientDetails,
													address: {
														...form.recipientDetails?.address,
														townOrCity: e.target.value,
													},
												},
												true,
											)
										}
										disabled={disabled}
										autoComplete="address-level2"
									/>
								</div>

								<div
									className={`govuk-form-group ${updatedFields.has("recipientDetails") ? "form-group-updated" : ""}`}
								>
									<label className="govuk-label" htmlFor="address-postcode">
										Postcode
									</label>
									<input
										className={`govuk-input govuk-input--width-10 ${
											updatedFields.has("recipientDetails") ? "field-updated" : ""
										}`}
										id="address-postcode"
										name="address-postcode"
										type="text"
										defaultValue={form.recipientDetails?.address?.postcode || ""}
										onChange={(e) =>
											handleFormChange("recipientDetails", {
												...form.recipientDetails,
												address: {
													...form.recipientDetails?.address,
													postcode: e.target.value,
												},
											})
										}
										onBlur={(e) =>
											handleFormChange(
												"recipientDetails",
												{
													...form.recipientDetails,
													address: {
														...form.recipientDetails?.address,
														postcode: e.target.value,
													},
												},
												true,
											)
										}
										disabled={disabled}
										autoComplete="postal-code"
									/>
								</div>
							</fieldset>
						)}

						{/* Business details section for purchase orders */}
						{form.paymentMethod === "PURCHASE_ORDER" && (
							<fieldset className="govuk-fieldset">
								<legend className="govuk-fieldset__legend govuk-fieldset__legend--m">
									<h2 className="govuk-fieldset__heading">Business details</h2>
								</legend>
								<div className="govuk-hint">Details of the business receiving the purchase order.</div>

								<div className={`govuk-form-group ${updatedFields.has("businessDetails") ? "form-group-updated" : ""}`}>
									<label className="govuk-label" htmlFor="business-name">
										Business name
									</label>
									<input
										className={`govuk-input ${updatedFields.has("businessDetails") ? "field-updated" : ""}`}
										id="business-name"
										name="business-name"
										type="text"
										defaultValue={form.businessDetails?.name || ""}
										onChange={(e) =>
											handleFormChange("businessDetails", {
												...form.businessDetails,
												name: e.target.value,
											})
										}
										onBlur={(e) =>
											handleFormChange(
												"businessDetails",
												{
													...form.businessDetails,
													name: e.target.value,
												},
												true,
											)
										}
										disabled={disabled}
									/>
								</div>

								<div className={`govuk-form-group ${updatedFields.has("businessDetails") ? "form-group-updated" : ""}`}>
									<label className="govuk-label" htmlFor="business-address-line-1">
										Address line 1
									</label>
									<input
										className={`govuk-input ${updatedFields.has("businessDetails") ? "field-updated" : ""}`}
										id="business-address-line-1"
										name="business-address-line-1"
										type="text"
										defaultValue={form.businessDetails?.address?.lineOne || ""}
										onChange={(e) =>
											handleFormChange("businessDetails", {
												...form.businessDetails,
												address: {
													...form.businessDetails?.address,
													lineOne: e.target.value,
												},
											})
										}
										onBlur={(e) =>
											handleFormChange(
												"businessDetails",
												{
													...form.businessDetails,
													address: {
														...form.businessDetails?.address,
														lineOne: e.target.value,
													},
												},
												true,
											)
										}
										disabled={disabled}
										autoComplete="address-line1"
									/>
								</div>

								<div className={`govuk-form-group ${updatedFields.has("businessDetails") ? "form-group-updated" : ""}`}>
									<label className="govuk-label" htmlFor="business-address-line-2">
										Address line 2 (optional)
									</label>
									<input
										className={`govuk-input ${updatedFields.has("businessDetails") ? "field-updated" : ""}`}
										id="business-address-line-2"
										name="business-address-line-2"
										type="text"
										defaultValue={form.businessDetails?.address?.lineTwo || ""}
										onChange={(e) =>
											handleFormChange("businessDetails", {
												...form.businessDetails,
												address: {
													...form.businessDetails?.address,
													lineTwo: e.target.value,
												},
											})
										}
										onBlur={(e) =>
											handleFormChange(
												"businessDetails",
												{
													...form.businessDetails,
													address: {
														...form.businessDetails?.address,
														lineTwo: e.target.value,
													},
												},
												true,
											)
										}
										disabled={disabled}
										autoComplete="address-line2"
									/>
								</div>

								<div className={`govuk-form-group ${updatedFields.has("businessDetails") ? "form-group-updated" : ""}`}>
									<label className="govuk-label" htmlFor="business-address-town">
										Town or city
									</label>
									<input
										className={`govuk-input govuk-input--width-20 ${
											updatedFields.has("businessDetails") ? "field-updated" : ""
										}`}
										id="business-address-town"
										name="business-address-town"
										type="text"
										defaultValue={form.businessDetails?.address?.townOrCity || ""}
										onChange={(e) =>
											handleFormChange("businessDetails", {
												...form.businessDetails,
												address: {
													...form.businessDetails?.address,
													townOrCity: e.target.value,
												},
											})
										}
										onBlur={(e) =>
											handleFormChange(
												"businessDetails",
												{
													...form.businessDetails,
													address: {
														...form.businessDetails?.address,
														townOrCity: e.target.value,
													},
												},
												true,
											)
										}
										disabled={disabled}
										autoComplete="address-level2"
									/>
								</div>

								<div className={`govuk-form-group ${updatedFields.has("businessDetails") ? "form-group-updated" : ""}`}>
									<label className="govuk-label" htmlFor="business-address-postcode">
										Postcode
									</label>
									<input
										className={`govuk-input govuk-input--width-10 ${
											updatedFields.has("businessDetails") ? "field-updated" : ""
										}`}
										id="business-address-postcode"
										name="business-address-postcode"
										type="text"
										defaultValue={form.businessDetails?.address?.postcode || ""}
										onChange={(e) =>
											handleFormChange("businessDetails", {
												...form.businessDetails,
												address: {
													...form.businessDetails?.address,
													postcode: e.target.value,
												},
											})
										}
										onBlur={(e) =>
											handleFormChange(
												"businessDetails",
												{
													...form.businessDetails,
													address: {
														...form.businessDetails?.address,
														postcode: e.target.value,
													},
												},
												true,
											)
										}
										disabled={disabled}
										autoComplete="postal-code"
									/>
								</div>
							</fieldset>
						)}

						{/* Add the RecurringPaymentSection component here */}
						<RecurringPaymentSection form={form} handleFormChange={handleFormChange} disabled={disabled} />
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

"use client";

import Link from "next/link";

export default function SchemaProposalPage() {
	return (
		<div className="govuk-template__body">
			<header className="govuk-header" data-module="govuk-header">
				<div className="govuk-header__container govuk-width-container">
					<div className="govuk-header__logo">
						<Link href="/" className="govuk-header__link govuk-header__link--homepage">
							<span className="govuk-header__logotype">
								<span className="govuk-header__logotype-text">GOV.UK</span>
							</span>
						</Link>
					</div>
					<div className="govuk-header__content">
						<Link href="/" className="govuk-header__link govuk-header__service-name">
							Recurring Payments Schema Proposal
						</Link>
					</div>
				</div>
			</header>

			<main className="govuk-main-wrapper" id="main-content">
				<div className="govuk-grid-row">
					<div className="govuk-grid-column-two-thirds">
						<h1 className="govuk-heading-xl">Recurring Payments Schema Proposal</h1>

						<div className="govuk-inset-text">
							This document outlines the proposed schema changes to support recurring payments in the application.
						</div>

						<section className="govuk-!-margin-bottom-8">
							<h2 className="govuk-heading-l">Current Form Schema</h2>
							<p>
								The current Form model does not include fields for recurring payments. Forms are currently processed as
								one-time payments without recurrence patterns.
							</p>
							<pre className="govuk-inset-text" style={{ whiteSpace: "pre-wrap" }}>
								{`{
  id: string;
  title: string;
  description: string;
  fields: Field[];
  created_at: string;
  updated_at: string;
  // No recurrence pattern fields
}`}
							</pre>
						</section>

						<section className="govuk-!-margin-bottom-8">
							<h2 className="govuk-heading-l">Proposed Schema Changes</h2>
							<p>
								We propose adding the following fields to the Form model to support recurring payments. These fields
								follow the snake_case naming convention used throughout the application.
							</p>

							<h3 className="govuk-heading-m">New Fields</h3>
							<pre className="govuk-inset-text" style={{ whiteSpace: "pre-wrap" }}>
								{`{
  // Existing fields
  id: string;
  title: string;
  description: string;
  fields: Field[];
  created_at: string;
  updated_at: string;
  
  // New fields for recurring payments
  recurring: boolean;
  pattern: {
    // REQUIRED FIELDS
    frequency: "daily" | "weekly" | "monthly" | "yearly";
    interval: number;
    start_date: string; // ISO date string

    // OPTIONAL END CONDITIONS (choose one or none)
    end_date?: string; // ISO date string
    max_occurrences?: number;
    never_ends?: boolean;

    // WEEKLY RECURRENCE SPECIFIERS
    days_of_week?: string[]; // "monday", "tuesday", etc.

    // MONTHLY RECURRENCE SPECIFIERS
    day_of_month?: number[]; // 1-31, supports multiple days like [1, 15]
    month_end?: boolean;
    month_position?: {
      position: "first" | "second" | "third" | "fourth" | "last";
      day_of_week: string; // "monday", "tuesday", etc.
    };

    // YEARLY RECURRENCE SPECIFIERS
    months?: number[]; // 1-12
    day_of_year?: number; // 1-366
    year_position?: {
      position: "first" | "second" | "third" | "fourth" | "last";
      day_of_week: string; // "monday", "tuesday", etc.
      month: number; // 1-12
    };

    // EXCLUDED DATES
    excluded_dates?: string[]; // ISO date strings

    // METADATA
    description?: string;
  };
  
  // Additional metadata for recurring payments
  created_by?: string;
}`}
							</pre>
						</section>

						<section className="govuk-!-margin-bottom-8">
							<h2 className="govuk-heading-l">Implementation Considerations</h2>

							<h3 className="govuk-heading-m">Database Impact</h3>
							<p>
								The proposed changes will require updates to the database schema. We'll need to add new fields to the
								Form model in the Amplify data model.
							</p>

							<h3 className="govuk-heading-m">UI Components</h3>
							<p>
								We'll need to create new UI components for configuring recurring payments. The mock UI demonstrates how
								these components might look and function.
							</p>
							<p>Key UI components include:</p>
							<ul className="govuk-list govuk-list--bullet">
								<li>Frequency selector (daily, weekly, monthly, yearly)</li>
								<li>Interval input for specifying the recurrence interval</li>
								<li>Calendar-style grid for selecting multiple days of month (1-31)</li>
								<li>Weekday selector for weekly patterns</li>
								<li>Month selector for yearly and specific monthly patterns</li>
								<li>End condition options (never, by date, after occurrences)</li>
								<li>Excluded dates manager</li>
								<li>Human-readable pattern description and occurrence preview</li>
							</ul>

							<h3 className="govuk-heading-m">Processing Logic</h3>
							<p>The application will need new logic to:</p>
							<ul className="govuk-list govuk-list--bullet">
								<li>Calculate the next occurrence dates based on the recurrence pattern</li>
								<li>Generate human-readable descriptions of recurrence patterns</li>
								<li>Handle excluded dates and end conditions</li>
								<li>Process recurring payments on their scheduled dates</li>
							</ul>

							<h3 className="govuk-heading-m">Validation Rules</h3>
							<p>We'll need to implement validation rules to ensure:</p>
							<ul className="govuk-list govuk-list--bullet">
								<li>Required fields are provided (frequency, interval, start_date)</li>
								<li>End conditions are valid (only one of end_date, max_occurrences, or never_ends is set)</li>
								<li>Frequency-specific fields are provided (e.g., days_of_week for weekly patterns)</li>
								<li>Date values are valid ISO date strings</li>
							</ul>

							<h3 className="govuk-heading-m">Norm Assistant Integration</h3>
							<p>
								The Norm assistant will need to be updated to understand and process requests for recurring payments.
								This includes:
							</p>
							<ul className="govuk-list govuk-list--bullet">
								<li>Recognizing recurring payment requests</li>
								<li>Extracting recurrence pattern details from user input</li>
								<li>Generating appropriate form configurations with recurrence patterns</li>
							</ul>
						</section>

						<section className="govuk-!-margin-bottom-8">
							<h2 className="govuk-heading-l">Example Recurrence Patterns</h2>
							<p>
								Here are some examples of common recurrence patterns and how they would be represented in the proposed
								schema:
							</p>

							<h3 className="govuk-heading-m">Monthly Rent Payment</h3>
							<pre className="govuk-inset-text" style={{ whiteSpace: "pre-wrap" }}>
								{`{
  recurring: true,
  pattern: {
    frequency: "monthly",
    interval: 1,
    start_date: "2023-06-01",
    day_of_month: [1],
    never_ends: true
  }
}`}
							</pre>

							<h3 className="govuk-heading-m">Semi-Monthly Payment (1st and 15th)</h3>
							<pre className="govuk-inset-text" style={{ whiteSpace: "pre-wrap" }}>
								{`{
  recurring: true,
  pattern: {
    frequency: "monthly",
    interval: 1,
    start_date: "2023-06-01",
    day_of_month: [1, 15],
    never_ends: true
  }
}`}
							</pre>

							<h3 className="govuk-heading-m">Bi-weekly Payroll</h3>
							<pre className="govuk-inset-text" style={{ whiteSpace: "pre-wrap" }}>
								{`{
  recurring: true,
  pattern: {
    frequency: "weekly",
    interval: 2,
    start_date: "2023-06-02",
    days_of_week: ["friday"],
    never_ends: true
  }
}`}
							</pre>

							<h3 className="govuk-heading-m">Quarterly Tax Payment</h3>
							<pre className="govuk-inset-text" style={{ whiteSpace: "pre-wrap" }}>
								{`{
  recurring: true,
  pattern: {
    frequency: "monthly",
    interval: 3,
    start_date: "2023-04-15",
    day_of_month: [15],
    months: [1, 4, 7, 10],
    never_ends: true
  }
}`}
							</pre>

							<h3 className="govuk-heading-m">Annual Subscription with End Date</h3>
							<pre className="govuk-inset-text" style={{ whiteSpace: "pre-wrap" }}>
								{`{
  recurring: true,
  pattern: {
    frequency: "yearly",
    interval: 1,
    start_date: "2023-01-01",
    end_date: "2025-01-01",
    months: [1],
    day_of_month: 1
  }
}`}
							</pre>

							<h3 className="govuk-heading-m">Monthly Payment on Last Day of Month</h3>
							<pre className="govuk-inset-text" style={{ whiteSpace: "pre-wrap" }}>
								{`{
  recurring: true,
  pattern: {
    frequency: "monthly",
    interval: 1,
    start_date: "2023-05-31",
    month_end: true,
    never_ends: true
  }
}`}
							</pre>

							<h3 className="govuk-heading-m">Payment on First Monday of Each Month</h3>
							<pre className="govuk-inset-text" style={{ whiteSpace: "pre-wrap" }}>
								{`{
  recurring: true,
  pattern: {
    frequency: "monthly",
    interval: 1,
    start_date: "2023-06-05",
    month_position: {
      position: "first",
      day_of_week: "monday"
    },
    never_ends: true
  }
}`}
							</pre>
						</section>

						<section className="govuk-!-margin-bottom-8">
							<h2 className="govuk-heading-l">Next Steps</h2>
							<ol className="govuk-list govuk-list--number">
								<li>Finalize the schema design based on feedback</li>
								<li>Update the Amplify data model to include the new fields</li>
								<li>Implement the UI components for configuring recurring payments</li>
								<li>Develop the processing logic for recurring payments</li>
								<li>Update the Norm assistant to handle recurring payment requests</li>
								<li>Test the implementation with various recurrence patterns</li>
								<li>Deploy the changes to production</li>
							</ol>
						</section>

						<div className="govuk-button-group">
							<Link href="/mock" className="govuk-button">
								View Mock UI
							</Link>
							<Link href="/" className="govuk-button govuk-button--secondary">
								Back to Home
							</Link>
						</div>
					</div>
				</div>
			</main>
		</div>
	);
}

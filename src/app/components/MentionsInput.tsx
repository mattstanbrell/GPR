import { useState, useRef, useEffect } from "react";
import React from "react";

type Case = {
	id: string;
	number: string;
	name: string;
	matchType?: "number" | "name";
};

export type StructuredMention = {
	type: "case";
	id: string;
	display: string;
	start: number;
	end: number;
};

type ActiveMention = {
	caseNumber: string;
	start: number;
	end: number;
};

type MentionsInputProps = {
	value: string;
	onChange: (value: string, mentions: StructuredMention[]) => void;
	onKeyDown?: (e: React.KeyboardEvent) => void;
	onSubmit?: () => void;
	placeholder?: string;
	rows?: number;
};

// Mock data from handler.ts - moved outside component
export const dummyChildData = [
	{
		name: "Charles Bucket",
		caseNumber: "12350",
		age: 8,
	},
	{
		name: "Charlie Bucket",
		caseNumber: "12345",
		age: 10,
	},
	{
		name: "Violet Beauregarde",
		caseNumber: "12346",
		age: 11,
	},
	{
		name: "Augustus Gloop",
		caseNumber: "12347",
		age: 9,
	},
	{
		name: "Veruca Salt",
		caseNumber: "12348",
		age: 12,
	},
	{
		name: "Mike Teavee",
		caseNumber: "12349",
		age: 10,
	},
] as const;

// Social worker data from handler.ts - moved outside component
const socialWorker = {
	name: "Matt Stanbrell",
	email: "matt@critcal.com",
	cases: ["12345", "12346", "12347", "12348", "12349"] as const,
	address: {
		line1: "123 Fake Street",
		town: "London",
		postcode: "SW1A 1AA",
	},
} as const;

export default function MentionsInput({
	value,
	onChange,
	onKeyDown,
	onSubmit,
	placeholder = "Type your message here...",
	rows = 3,
}: MentionsInputProps) {
	const [showSuggestions, setShowSuggestions] = useState(false);
	const [suggestionIndex, setSuggestionIndex] = useState(0);
	const [searchTerm, setSearchTerm] = useState("");
	const textareaRef = useRef<HTMLTextAreaElement>(null);
	const suggestionsRef = useRef<HTMLDivElement>(null);
	const [activeMentions, setActiveMentions] = useState<ActiveMention[]>([]);

	// Convert dummy data to Case type - memoized with no dependencies since data is constant
	const mockCases = React.useMemo(
		() =>
			dummyChildData
				.filter((child) => socialWorker.cases.includes(child.caseNumber))
				.map((child) => ({
					id: child.caseNumber,
					number: child.caseNumber,
					name: `${child.name}, Age ${child.age}`,
				})),
		[],
	);

	const [suggestions, setSuggestions] = useState<Case[]>([]);

	const filterSuggestions = React.useCallback(
		(term: string) => {
			if (!term) return [];
			return mockCases
				.filter((c) => {
					const matchesNumber = c.number
						.toLowerCase()
						.includes(term.toLowerCase());
					const matchesName = c.name.toLowerCase().includes(term.toLowerCase());
					return matchesNumber || matchesName;
				})
				.map(
					(c): Case => ({
						...c,
						matchType: c.number.toLowerCase().includes(term.toLowerCase())
							? ("number" as const)
							: ("name" as const),
					}),
				);
		},
		[mockCases],
	);

	useEffect(() => {
		setSuggestions(filterSuggestions(searchTerm));
	}, [searchTerm, filterSuggestions]);

	const handleInputChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
		const newValue = e.target.value;
		const lastAtIndex = newValue.lastIndexOf("@");

		// Update active mentions when text is deleted
		const updatedMentions = activeMentions.filter((mention) => {
			// If text was deleted within or at the boundaries of a mention, remove it
			if (newValue.length < value.length) {
				const deletionStart = Math.min(value.length - 1, newValue.length);
				const deletionEnd = Math.max(value.length - 1, newValue.length);
				if (deletionStart <= mention.end && deletionEnd >= mention.start) {
					return false;
				}
			}
			return true;
		});
		setActiveMentions(updatedMentions);

		if (lastAtIndex !== -1) {
			const searchStr = newValue.slice(lastAtIndex + 1).split(" ")[0];
			setSearchTerm(searchStr);
			setShowSuggestions(true);
			setSuggestionIndex(0);
		} else {
			setShowSuggestions(false);
			setSearchTerm("");
		}

		onChange(
			newValue,
			updatedMentions.map((mention) => ({
				type: "case",
				id: mention.caseNumber,
				display:
					mockCases
						.find((c) => c.number === mention.caseNumber)
						?.name.split(", Age ")[0] || "",
				start: mention.start,
				end: mention.end,
			})),
		);
	};

	const handleSuggestionClick = (suggestion: Case) => {
		if (textareaRef.current) {
			const currentValue = textareaRef.current.value;
			const lastAtIndex = currentValue.lastIndexOf("@");
			const beforeMention = currentValue.slice(0, lastAtIndex);
			const afterMention = currentValue.slice(
				lastAtIndex + searchTerm.length + 1,
			);
			const displayName = suggestion.name.split(", Age ")[0];

			// Create new mention
			const newMention: ActiveMention = {
				caseNumber: suggestion.number,
				start: lastAtIndex,
				end: lastAtIndex + displayName.length,
			};

			// Create the new value with just the display name
			const newValue = `${beforeMention}${displayName} ${afterMention}`;

			const updatedMentions = [...activeMentions, newMention];
			setActiveMentions(updatedMentions);
			onChange(
				newValue,
				updatedMentions.map((mention) => ({
					type: "case",
					id: mention.caseNumber,
					display:
						mockCases
							.find((c) => c.number === mention.caseNumber)
							?.name.split(", Age ")[0] || "",
					start: mention.start,
					end: mention.end,
				})),
			);
			setShowSuggestions(false);
			setSearchTerm("");
			textareaRef.current.focus();
		}
	};

	const handleKeyDown = (e: React.KeyboardEvent) => {
		if (showSuggestions && suggestions.length > 0) {
			if (e.key === "ArrowDown") {
				e.preventDefault();
				setSuggestionIndex((prev) =>
					prev < suggestions.length - 1 ? prev + 1 : prev,
				);
			} else if (e.key === "ArrowUp") {
				e.preventDefault();
				setSuggestionIndex((prev) => (prev > 0 ? prev - 1 : prev));
			} else if (e.key === "Enter" && !e.shiftKey) {
				e.preventDefault();
				handleSuggestionClick(suggestions[suggestionIndex]);
			} else if (e.key === "Escape") {
				setShowSuggestions(false);
			}
		} else if (e.key === "Enter" && !e.shiftKey) {
			e.preventDefault();
			onSubmit?.();
		}

		onKeyDown?.(e);
	};

	// Close suggestions when clicking outside
	useEffect(() => {
		const handleClickOutside = (event: MouseEvent) => {
			if (
				suggestionsRef.current &&
				!suggestionsRef.current.contains(event.target as Node) &&
				!textareaRef.current?.contains(event.target as Node)
			) {
				setShowSuggestions(false);
			}
		};

		document.addEventListener("mousedown", handleClickOutside);
		return () => document.removeEventListener("mousedown", handleClickOutside);
	}, []);

	// Function to convert the internal format to display format
	const getDisplayValue = () => {
		const displayValue = value;
		const mentionRegex = /\[\[CASE:(\d+):([^\]]+)\]\]/g;
		return displayValue.replace(mentionRegex, (_, _id, display) => display);
	};

	return (
		<div
			className="govuk-form-group"
			style={{ position: "relative", width: "100%" }}
		>
			<div style={{ position: "relative" }}>
				<textarea
					ref={textareaRef}
					className="govuk-textarea"
					rows={rows}
					aria-label="Message input"
					placeholder={placeholder}
					value={value}
					onChange={handleInputChange}
					onKeyDown={handleKeyDown}
					style={{
						width: "100%",
						position: "absolute",
						top: 0,
						left: 0,
						right: 0,
						bottom: 0,
						color: "transparent",
						caretColor: "black",
						background: "none",
						backgroundColor: "transparent",
						zIndex: 2,
						minHeight: `${rows * 1.5}em`,
						WebkitBackgroundClip: "text",
					}}
				/>
				<div
					className="govuk-textarea"
					style={{
						width: "100%",
						minHeight: `${rows * 1.5}em`,
						padding: "5px 4px 4px",
						whiteSpace: "pre-wrap",
						overflowWrap: "break-word",
						pointerEvents: "none",
						background: "white",
						WebkitBackgroundClip: "padding-box",
					}}
				>
					{(() => {
						let result = [];
						let lastIndex = 0;

						// Sort mentions by start position
						const sortedMentions = [...activeMentions].sort(
							(a, b) => a.start - b.start,
						);

						for (const mention of sortedMentions) {
							// Add text before mention
							if (mention.start > lastIndex) {
								result.push(
									<span key={`text-${lastIndex}`}>
										{value.slice(lastIndex, mention.start)}
									</span>,
								);
							}

							// Add highlighted mention
							result.push(
								<span
									key={`mention-${mention.start}`}
									style={{
										backgroundColor: "rgba(111, 0, 176, 0.1)",
										padding: "0 2px",
										borderRadius: "2px",
									}}
								>
									{value.slice(mention.start, mention.end)}
								</span>,
							);

							lastIndex = mention.end;
						}

						// Add remaining text
						if (lastIndex < value.length) {
							result.push(
								<span key={`text-${lastIndex}`}>{value.slice(lastIndex)}</span>,
							);
						}

						return result;
					})()}
				</div>
			</div>
			{showSuggestions && suggestions.length > 0 && (
				<div
					ref={suggestionsRef}
					className="govuk-!-margin-0"
					style={{
						position: "absolute",
						bottom: "100%",
						left: 0,
						right: 0,
						backgroundColor: "white",
						border: "2px solid #0b0c0c",
						borderRadius: "0",
						maxHeight: "200px",
						overflowY: "auto",
						zIndex: 1000,
					}}
				>
					{suggestions.map((suggestion, index) => (
						<button
							key={suggestion.id}
							type="button"
							className="govuk-button govuk-button--secondary govuk-!-margin-0"
							style={{
								width: "100%",
								textAlign: "left",
								borderRadius: 0,
								borderBottom: "1px solid #b1b4b6",
								backgroundColor:
									index === suggestionIndex ? "#f3f2f1" : "white",
								boxShadow: "none",
							}}
							onClick={() => handleSuggestionClick(suggestion)}
						>
							{suggestion.matchType === "number" ? (
								<>
									{(() => {
										const number = suggestion.number;
										const searchTermLower = searchTerm.toLowerCase();
										const matchStart = number
											.toLowerCase()
											.indexOf(searchTermLower);
										if (matchStart === -1) return <span>{number}</span>;

										return (
											<>
												<span>{number.slice(0, matchStart)}</span>
												<span style={{ fontWeight: "bold" }}>
													{number.slice(
														matchStart,
														matchStart + searchTerm.length,
													)}
												</span>
												<span>
													{number.slice(matchStart + searchTerm.length)}
												</span>
											</>
										);
									})()}
								</>
							) : (
								<span>{suggestion.number}</span>
							)}
							{": "}
							{suggestion.matchType === "name" ? (
								<>
									{(() => {
										const name = suggestion.name.split(", Age ")[0];
										const searchTermLower = searchTerm.toLowerCase();
										const matchStart = name
											.toLowerCase()
											.indexOf(searchTermLower);
										if (matchStart === -1) return <span>{name}</span>;

										return (
											<>
												<span>{name.slice(0, matchStart)}</span>
												<span style={{ fontWeight: "bold" }}>
													{name.slice(
														matchStart,
														matchStart + searchTerm.length,
													)}
												</span>
												<span>
													{name.slice(matchStart + searchTerm.length)}
												</span>
											</>
										);
									})()}
									{", Age "}
									<span>{suggestion.name.split(", Age ")[1]}</span>
								</>
							) : (
								<span>{suggestion.name}</span>
							)}
						</button>
					))}
				</div>
			)}
		</div>
	);
}

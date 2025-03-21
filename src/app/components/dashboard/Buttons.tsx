import {
	ALL_FORMS,
	FORM_BOARD,
	FORM,
	UPDATES,
	ADMIN,
	ACTION_LOG,
	THREADS,
} from "@/app/constants/urls";
import Link from "next/link";
import Image from "next/image";

const Button = ({
	text,
	link,
	src,
	alt,
}: { text: string; link: string; src: string; alt: string }) => {
	const textList = text.split(" ");
	const firstLine = textList[0];
	let secondLine = null;

	if (textList.length > 1) {
		secondLine = textList[1];
	} else {
		secondLine = null;
	}

	return (
		<Link
			href={link}
			className="text-3xl font-bold md:flex-none w-full flex-1 min-w-35 max-w-40 
				border-4 border-(--color-secondary) grid h-47 hover:border-(--color-accent) 
				transition duration-300 delay-100 ease-in-out hover:-translate-y-1 hover:scale-110"
		>
			<button
				type="button"
				className="cursor-pointer flex flex-col place-content-center"
			>
				<Image
					className="flex-1/2 w-13 pb-2 self-center object-bottom object-contain"
					src={src}
					alt={alt}
					width={24}
					height={24}
					priority
					style={{ filter: "var(--hounslow-primary-filter)" }}
				/>
				<div className="flex-1/2 grid self-center place-items-center text-3xl/10 text-(--hounslow-primary)">
					{firstLine}
					{secondLine ? (
						<>
							<br />
							{secondLine}
						</>
					) : null}
				</div>
			</button>
		</Link>
	);
};

const NewFormButton = () => {
	return (
		<Button
			text="New Form"
			link={FORM}
			src="/file-plus.svg"
			alt="picture of a file with plus sign"
		/>
	);
};

const FormBoardButton = () => {
	return (
		<Button
			text="Form Board"
			link={FORM_BOARD}
			src="/formboard.svg"
			alt="picture of a bar graph with various bar heights"
		/>
	);
};

const AllFormsButton = () => {
	return (
		<Button
			text="All Forms"
			link={ALL_FORMS}
			src="/file.svg"
			alt="picture of a file with lines to represent text"
		/>
	);
};

const UpdatesButton = () => {
	return (
		<Button
			text="Updates"
			link={UPDATES}
			src="/updates.svg"
			alt="A filled cirle with an unfilled exclaimation mark in the middle"
		/>
	);
};

const AdminButton = () => {
	return (
		<Button
			text="Admin"
			link={ADMIN}
			src="/admin.svg"
			alt="A filled outline of a person with a cog symbol"
		/>
	);
};

const ActionLogsButton = () => {
	return (
		<Button
			text="Action Log"
			link={ACTION_LOG}
			src="/action-log.svg"
			alt="A picture of a filled shield."
		/>
	);
};

const ThreadsButton = () => {
	return (
		<Button
			text="Threads"
			link={THREADS}
			src="/threads.svg"
			alt="A picture of a speech bubble."
		/>
	);
}

export {
	Button,
	NewFormButton,
	FormBoardButton,
	AllFormsButton,
	UpdatesButton,
	AdminButton,
	ActionLogsButton,
	ThreadsButton,
};

import { ALL_FORMS, FORM_BOARD, NEW_FORM, UPDATES, ADMIN } from "@/app/constants/urls";
import Image from "next/image"
import Link from "next/link"

const Button = ({ text, link, src, alt }: { text: string, link: string, src: string, alt: string }) => {
	const textList = text.split(" ");
	const firstLine = textList[0];
	let secondLine = null;
	if (textList.length > 1) {
		secondLine = textList[1];
	} else {
		secondLine = null;
	}
	return (
		<Link href={link} className="text-3xl font-bold md:flex-none w-full flex-1 min-w-35 max-w-40 border-4 border-(--color-secondary) grid  h-47">
			<button className="cursor-pointer flex flex-col place-content-center">
				<Image
					className="flex-1/2 w-13 pb-2 self-center object-bottom object-contain"
					src={src}
					alt={alt}
					width={24}
					height={24}
					style={{filter: "var(--hounslow-primary-filter"}}
				/>
				<div className="flex-1/2 grid self-center place-items-center text-3xl/10 text-(--hounslow-primary)">
					{firstLine}
					{secondLine ? (<><br />{secondLine}</>) : null}
				</div>
			</button>
		</Link>
	)
}

const NewFormButton = () => {
	return (
		<Button text='New Form' link={NEW_FORM} src='/file-plus.svg' alt='picture of a file with plus sign' />
	)
}

const FormBoardButton = () => {
	return (
		<Button text='Form Board' link={FORM_BOARD} src='/formboard.svg' alt='picture of a bar graph with various bar heights' />
	)
}

const AllFormsButton = () => {
	return (
		<Button text='All Forms' link={ALL_FORMS} src='/file.svg' alt='picture of a file with lines to represent text' />
	)
}

const UpdatesButton = () => {
	return (
		<Button text='Updates' link={UPDATES} src='/updates.svg' alt='A filled cirle with an unfilled exclaimation mark in the middle' />
	)
}

const AdminButton = () => {
	return (
		<Button text='Admin' link={ADMIN} src='/admin.svg' alt="A filled outline of a person with a cog symbol"/> 
	)
}

const ActionLogsButton = () => {
	return (
		<Button text='Action Log' link={ADMIN} src='/action-log.svg' alt="A picture of a filled shield."/> 
	)
}

export { Button, NewFormButton, FormBoardButton, AllFormsButton, UpdatesButton, AdminButton, ActionLogsButton }

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
		<Link href={link} className="text-3xl font-bold md:flex-none w-full flex-1 min-w-35 max-w-40 border-4 grid  h-50">
			<button className="cursor-pointer flex flex-col">
				<Image
					className="flex-1/2 w-15 self-center place-self-center"
					src={src}
					alt={alt}
					width={24}
					height={24}
					style={{filter: "brightness(0) saturate(100%) invert(22%) sepia(9%) saturate(5876%) hue-rotate(253deg) brightness(93%) contrast(89%)"}}
				/>
				<div className="grid flex-1/3 self-center place-items-center text-3xl text-(--hounslow-primary)">
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
		<Button text='Action Log' link={ADMIN} src='/shield.svg' alt="A picture of a filled shield."/> 
	)
}

export { Button, NewFormButton, FormBoardButton, AllFormsButton, UpdatesButton, AdminButton, ActionLogsButton }

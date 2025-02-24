import { ALL_FORMS, FORM_BOARD, NEW_FORM, UPDATES, ADMIN } from "@/app/constants/urls";
import Image from "next/image"
import Link from "next/link"

const Button = ({ text, link }: { text: string, link: string }) => {
	const textList = text.split(" ");
	const firstLine = textList[0];
	let secondLine = null;
	if (textList.length > 1) {
		secondLine = textList[1];
	} else {
		secondLine = null;
	}
	return (
		<Link href={link} className="text-3xl font-bold md:flex-none w-full flex-1 min-w-35 max-w-40 border-2 grid  h-50  bg-blue-200">
			<button className="flex flex-col">
				<Image
					className="bg-red-500 flex-1/2 w-20 self-center place-self-center"
					src="/file.svg"
					alt="picture of a file with plus sign"
					width={24}
					height={24}
				/>
				<div className="grid flex-1/3 self-center place-items-center text-3xl">
					{firstLine}
					{secondLine ? (<><br />{secondLine}</>) : null}
				</div>
			</button>
		</Link>
	)
}

const NewFormButton = () => {
	return (
		<Button text='New Form' link={NEW_FORM} />
	)
}

const FormBoardButton = () => {
	return (
		<Button text='Form Board' link={FORM_BOARD} />
	)
}

const AllFormsButton = () => {
	return (
		<Button text='All Forms' link={ALL_FORMS} />
	)
}

const UpdatesButton = () => {
	return (
		<Button text='Updates' link={UPDATES} />
	)
}

const AdminButton = () => {
	return (
		<Button text='Admin' link={ADMIN} /> 
	)
}

export { Button, NewFormButton, FormBoardButton, AllFormsButton, UpdatesButton, AdminButton }

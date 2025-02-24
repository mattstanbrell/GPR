import { ALL_FORMS, FORM_BOARD, NEW_FORM, UPDATES } from "@/app/constants/urls";
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
		<Link href={link} className="text-3xl font-bold md:flex-none w-full flex-1 min-w-35 max-w-40 border-2 grid  h-50  bg-blue-200">
			<button className="cursor-pointer flex flex-col">
				<Image
					className="bg-red-500 flex-1/2 w-20 self-center place-self-center"
					src={src}
					alt={alt}
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
		<Button text='New Form' link={NEW_FORM} src='/file.svg' alt='picture of a file with plus sign' />
	)
}

const FormBoardButton = () => {
	return (
		<Button text='Form Board' link={FORM_BOARD} src='/file.svg' alt='picture of a file with plus sign' />
	)
}

const AllFormsButton = () => {
	return (
		<Button text='All Forms' link={ALL_FORMS} src='/file.svg' alt='picture of a file with plus sign' />
	)
}

const UpdatesButton = () => {
	return (
		<Button text='Updates' link={UPDATES} src='/file.svg' alt='picture of a file with plus sign' />
	)
}

export { Button, NewFormButton, FormBoardButton, AllFormsButton, UpdatesButton }

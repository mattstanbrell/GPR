import Image from "next/image"
import Link from "next/link"

const Button = ({ text }: { text: string }) => {
	const textList = text.split(" ");
	const firstLine = textList[0];
	let secondLine = null;
	if (textList.length > 1) {
		secondLine = textList[1];
	} else {
		secondLine = null;
	}
	return (
		<Link href="/new-form" className="text-3xl font-bold md:flex-none w-full flex-1 min-w-35 max-w-40 border-2 grid  h-50  bg-blue-200">
			<button className="grid justify-items-center ">
				<Image
					className="bg-red-500 w-20 self-center"
					src="/file.svg"
					alt="picture of a file with plus sign"
					width={24}
					height={24}
				/>
				<div className="grid place-items-center h-full">
					{firstLine}
					{secondLine?<span>{secondLine}</span>:null}
				</div>
			</button>
		</Link>
	)
}

const NewFormButton = () => {
	return (
		<Button text='New Form' />
	)
}

const FormBoardButton = () => {
	return (
		<Button text='Form Board' />
	)
}

const AllFormsButton = () => {
	return (
		<Button text='All Forms' />
	)
}

const UpdatesButton = () => {
	return (
		<Button text='Updates' />
	)
}

export { Button, NewFormButton, FormBoardButton, AllFormsButton, UpdatesButton }

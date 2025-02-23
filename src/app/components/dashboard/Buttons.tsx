import Image from "next/image"
import Link from "next/link"

const Button = ({text}: {text: string}) => {
	return (
		<Link href="/new-form">
			<button 
				className="text-xl font-bold  border-2 grid max-w-20 h-30  bg-blue-50 justify-items-center content-center"
			>
				<Image
					className="bg-red-500"
					src="/file.svg"
					alt="picture of a file with plus sign"
					width={24}
					height={24}
				/>
				{text}
			</button>
		</Link>
	)
}

const NewFormButton = () => {
	return (
		<Button text='New Form'/>
	)
}

const FormBoardButton = () => {
	return (
		<Button text='Form Board'/>
	)
}

const AllFormsButton = () => {
	return (
		<Button text='All Forms'/>
	)
}

const UpdatesButton = () => {
	return (
		<Button text='Updates'/>
	)
}

export { Button, NewFormButton, FormBoardButton, AllFormsButton, UpdatesButton }

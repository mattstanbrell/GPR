"use client";

import { redirect } from "next/navigation";
import StatusIcon from "@/app/components/form/Icons";
import type { Form } from "@/app/types/models";

const TableHeader = ({ title }: { title: string }) => {
	return (
		<div className="flex h-1/10 bg-[var(--color-background-medium)] text-white font-bold rounded-t-[8px]">
			<h3 className="w-1/4 p-2 pr-0">Form</h3>
			<h3 className="w-3/4 p-2 pl-0 text-right">{title}</h3>
		</div>
	);
};

const FormTable = ({ forms }: { forms: Array<Form> }) => {
	const handleRedirect = (uri: string) => {
		redirect(uri);
	};

	return (
		<>
			{forms.map((form) => {
				const id = form.id;
				const title = form.title;
				const status = form.status;
				const createdDate = form.createdAt;
				const redirectURI = `/form?id=${id}`;

				return (
					<tr
						key={id}
						title={title || ""}
						onClick={() => handleRedirect(redirectURI)}
						onKeyUp={(e) => e.key === "Enter" && handleRedirect(redirectURI)}
						tabIndex={0}
						className="h-8 border-2 border-dotted border-transparent border-b-black cursor-pointer hover:bg-[var(--color-background-light)]"
					>
						<td className="flex p-2 text-clip text-nowrap overflow-hidden">
							<StatusIcon status={status} />
							<p className="pl-1">{title}</p>
						</td>
						<td className="p-2 text-right">{createdDate}</td>
					</tr>
				);
			})}
		</>
	);
};

const NoFormsMessage = () => {
	return (
		<tr className="text-center">
			<td colSpan={2} className="p-2">
				No forms to display.
			</td>
		</tr>
	);
};

const FormboardTable = ({ boardTitle, boardForms }: { boardTitle: string; boardForms: Array<Form> }) => {
	const hasForms = boardForms ? boardForms.length > 0 : false;

	return (
		<>
			<TableHeader title={boardTitle} />
			<div className="h-9/10 bg-white overflow-scroll rounded-b-[8px]">
				<table className="w-full text-left">
					<tbody>{!hasForms ? <NoFormsMessage /> : <FormTable forms={boardForms} />}</tbody>
				</table>
			</div>
		</>
	);
};

export default FormboardTable;

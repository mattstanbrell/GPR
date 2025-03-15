
import Image from "next/image";

const iconSize = 30

const IconDecoractor = (
    {src, alt, onClick, className} : 
    {src: string, alt: string, onClick?: () => void, className?: string}
) => {
    return (
        <div className={ className } onClick={ onClick }>
            <Image 
                src={ src }
                alt={ alt }
                width={ iconSize }
                height={ iconSize }
            />
        </div>
    )
}

export const DeleteIcon = () => {
    return <button title="Delete" type="button" className="govuk-button govuk-button--warning">Delete</button>
}

export const DownloadIcon = () => {
    return <button title="Download" type="button" className="govuk-button">Download</button>
}

export const UploadIcon = ({onClick} : {onClick: () => void}) => {
    return (
        <div title="upload" className="w-full flex justify-center" onClick={ onClick }>
            <button title="upload" type="button" className="govuk-button govuk-button--secondary">Upload</button>
        </div>
    )
}

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

export const AttachmentIcon = () => {
    return <IconDecoractor 
        src="/attachment-icon.svg"
        alt="Three vertically aligned dots with spacing."
    />
}

export const OptionsIcon = ({onClick} : {onClick: () => void}) => {
    return <IconDecoractor 
        src="/more-options.svg"
        alt="Three vertically aligned dots with spacing."
        onClick={ onClick }
    />
}

export const UploadIcon = ({onClick} : {onClick: () => void}) => {
    return (
        <div className="w-full flex justify-center">
            <IconDecoractor 
                src="/upload-circle.svg"
                alt="A circle with a plus button in the middle."
                onClick={ onClick }
                className="hover:cursor-pointer"
            /> 
        </div>
    )
}
import { Tooltip } from "./Tooltip"

interface AvatarProps {
    text: string
    colour: string
    className?: string
    style?: React.CSSProperties
    onClick?: () => void
    tooltipText?: string
}

// Grab Initials from name
// Cap at 2 characters
export function getInitials(name: string){
    return name.split(" ").map((word) => word[0]).join("").slice(0, 2).toUpperCase()
}

export const Avatar = ({ text, colour, className, style, onClick, tooltipText }: AvatarProps) => {
    return (
        <Tooltip content={tooltipText}>
            <div 
                style={style} 
                className={`rounded-[50%] flex items-center justify-center font-bold ${colour} ${className}`}
                onClick={onClick}
            >
                <p className="text-white text-[2em] font-bold  leading-none">{text}</p>
            </div>
        </Tooltip>
    )
}

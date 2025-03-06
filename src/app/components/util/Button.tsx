interface ButtonProps {
    children?: React.ReactNode
    onClick?: () => void
    className?: string
    type?: "button" | "submit" | "reset"
}

export const Button = ({ children, onClick, className, type="button" }: ButtonProps) => {
    return (
        <button
            className={`${className}`}
            onClick={onClick}
            data-module="govuk-button" 
            type={type}
        >
            {children}
        </button>
    )
}

export const PrimaryButton = ({ children, onClick, className, type="button" }: ButtonProps) => {
    return (
        <button
            className={`app-primary-button text-2xl px-3 text-center font-bold ${className}`}
            onClick={onClick}
            data-module="govuk-button" 
            type={type}
        >
            {children}
        </button>
    )
}

export const SecondaryButton = ({ children, onClick, className, type="button" }: ButtonProps) => {
    return (
        <button
            className={`app-secondary-button font-bold ${className}`}
            onClick={onClick}
            data-module="govuk-button" 
            type={type}
        >
            {children}
        </button>
    )
}
interface ButtonProps {
    children?: React.ReactNode
    onClick?: () => void
    className?: string
    type?: "button" | "submit" | "reset"
}


// Button is a generic button component that can be used throughout the application
export const Button = ({ children, onClick, className, type="button" }: ButtonProps) => {
    return (
        <button
            className={`cursor-pointer ${className}`}
            onClick={onClick}
            data-module="govuk-button" 
            type={type}
        >
            {children}
        </button>
    )
}


// App buttons are styled buttons that are used throughout the application
export const AppButtonBase = ({ children, onClick, className, type="button" }: ButtonProps) => {
    return (
        <Button
            className={`text-2xl px-3 text-center font-bold ${className}`}
            onClick={onClick}
            type={type}
        >
            {children}
        </Button>
    )
}

export const PrimaryButton = ({ children, onClick, className, type="button" }: ButtonProps) => {
    return (
        <AppButtonBase
            className={`app-primary-button ${className}`}
            onClick={onClick}
            type={type}
        >
            {children}
        </AppButtonBase>
    )
}

export const SecondaryButton = ({ children, onClick, className, type="button" }: ButtonProps) => {
    return (
        <AppButtonBase
            className={`app-secondary-button ${className}`}
            onClick={onClick}
            type={type}
        >
            {children}
        </AppButtonBase>
    )
}
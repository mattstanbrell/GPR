interface ButtonProps {
    title?: string
    children?: React.ReactNode
    onClick?: () => void
    className?: string
    type?: "button" | "submit" | "reset"
}


// Button is a generic button component that can be used throughout the application
export const Button = ({ children, onClick, className, title, type="button" }: ButtonProps) => {
    return (
        <button
            className={`cursor-pointer ${className}`}
            onClick={onClick}
            data-module="govuk-button" 
            type={type}
            title={title}
        >
            {children}
        </button>
    )
}


// App buttons are styled buttons that are used throughout the application
export const AppButtonBase = ({ children, onClick, title, className, type="button" }: ButtonProps) => {
    return (
        <Button
            className={`text-2xl px-3 text-center font-bold ${className}`}
            onClick={onClick}
            type={type}
            title={title}
        >
            {children}
        </Button>
    )
}

export const PrimaryButton = ({ children, onClick, title, className, type="button" }: ButtonProps) => {
    return (
        <AppButtonBase
            className={`app-primary-button ${className}`}
            onClick={onClick}
            type={type}
            title={title}
        >
            {children}
        </AppButtonBase>
    )
}

export const SecondaryButton = ({ children, onClick, title, className, type="button" }: ButtonProps) => {
    return (
        <AppButtonBase
            className={`app-secondary-button ${className}`}
            onClick={onClick}
            type={type}
            title={title}
        >
            {children}
        </AppButtonBase>
    )
}
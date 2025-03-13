

const ButtonsContainer = ({
    children, className,
}: Readonly<{ children: React.ReactNode, className?: string }
>) => {
    return (
        <div className={`flex flex-wrap gap-4 place-content-center ${className}`}>
            {children}
        </div>
    )
}

export default ButtonsContainer
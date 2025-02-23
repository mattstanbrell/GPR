

const ButtonsContainer = async ({
    children, className,
}: Readonly<{ children: React.ReactNode, className?: string }
>) => {
    return (
        <div className={`flex flex-wrap flex-row gap-4 place-content-center ${className}`}>
            {children}
        </div>
    )
}

export default ButtonsContainer
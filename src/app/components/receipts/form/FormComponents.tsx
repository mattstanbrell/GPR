
const InputString = ({name, defaultValue} : {name: string, defaultValue: string}) => {
    return (
        <div className="hover:bg-[var(--color-background-light)]">
            <input name={ name } type="text" defaultValue={ defaultValue } style={{ width: "100%", padding: "8px" }} />
        </div>
    )
}

const InputNumber = (
    {name, defaultValue, step = 1} : 
    {name: string, defaultValue: number, step?: number}
) => {
    return (
        <div className="hover:bg-[var(--color-background-light)]">
            <input 
                name={ name } 
                type="number" 
                defaultValue={ defaultValue } 
                min="0" 
                step={ step } 
                style={{ width: "100%", padding: "8px" }}
            />
        </div>
    )
}

export { InputString, InputNumber }
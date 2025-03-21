
'use client'

export const PrimaryButton = (
    {name, onClick} : 
    {name: string, onClick?: () => void}
) => {
    return <button type="button" className="govuk-button" onClick={ onClick }>{ name }</button>
}

export const SecondaryButton = (
    {name, onClick} : 
    {name: string, onClick: () => void}
) => {
    return <button type="button" className="govuk-button govuk-button--secondary" onClick={ onClick }>{ name }</button>
}

export const WarningButton = (
    {name, onClick} : 
    {name: string, onClick: () => void}
) => {
    return <button type="button" className="govuk-button govuk-button--warning" onClick={ onClick }>{ name }</button>
}

export const SubmitButton = (
    {name = "Submit", onClick} : 
    {name?: string, onClick?: () => void}
) => {
    return <button type="submit" className="govuk-button" onClick={ onClick }>{ name }</button>
}

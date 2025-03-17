
'use client'

const PrimaryButton = (
    {name, onClick} : 
    {name: string, onClick: () => void}
) => {
    return <button className="govuk-button" onClick={ onClick }>{ name }</button>
}

const SecondaryButton = (
    {name, onClick} : 
    {name: string, onClick: () => void}
) => {
    return <button className="govuk-button govuk-button--secondary" onClick={ onClick }>{ name }</button>
}

const WarningButton = (
    {name, onClick} : 
    {name: string, onClick: () => void}
) => {
    return <button className="govuk-button govuk-button--warning" onClick={ onClick }>{ name }</button>
}


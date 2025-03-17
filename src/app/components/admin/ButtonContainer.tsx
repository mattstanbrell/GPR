'use client'

export const ButtonGroup = ({buttons} : {buttons: React.ReactElement[]}) => {
    return (
    <div className="govuk-button-group">
        { buttons }
    </div>)
}
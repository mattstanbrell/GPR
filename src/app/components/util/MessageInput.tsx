import React, { useState } from 'react';

interface MessageInputProps {
    placeholder?: string;
    onChange?: (event: React.ChangeEvent<HTMLTextAreaElement>) => void;
    onKeyDown?: (event: React.KeyboardEvent<HTMLTextAreaElement>) => void;
    onSubmit?: (event: React.FormEvent<HTMLTextAreaElement>) => void;
    className?: string;
}


const MessageInput = (
    {
        placeholder="Type your message here...",
        onChange,
        onKeyDown,
        onSubmit,
        className
    } : MessageInputProps) => {
    const [rows, setRows] = useState(1);
    const currentRowsMax = 3;

    const handleInput = (event: React.ChangeEvent<HTMLTextAreaElement>) => {
        const textareaLineHeight = 30;
        const previousRows = event.target.rows;
        event.target.rows = 1; // reset number of rows in textarea 

        const currentRows = Math.min(Math.floor(event.target.scrollHeight / textareaLineHeight), currentRowsMax);
        
        if (currentRows === previousRows) {
            event.target.rows = currentRows;
        }

        setRows(currentRows);
    };

    return (
        <textarea
            className={`govuk-textarea !py-3 !ps-3 !w-auto bg-(--color-background-light) !resize-none ${className}`}
            id="message"
            name="message"
            rows={rows}
            placeholder={placeholder}
            onChange={handleInput}
            onKeyDown={onKeyDown}
            onSubmit={onSubmit}
        ></textarea>
    );
};

export default MessageInput;

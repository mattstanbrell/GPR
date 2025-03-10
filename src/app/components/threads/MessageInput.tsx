import React, { useState } from 'react';
import Image from "next/image";


interface MessageInputProps {
    placeholder?: string;
    onChange?: (event: React.ChangeEvent<HTMLTextAreaElement>) => void;
    onKeyDown?: (event: React.KeyboardEvent<HTMLTextAreaElement>) => void;
    onSubmit?: (event: React.FormEvent<HTMLTextAreaElement>) => void;
    onClick?: (event: React.MouseEvent<HTMLImageElement>) => void;
    className?: string;
}

const MessageInput = (
    {
        placeholder="Type your message here...",
        onChange,
        onKeyDown,
        onSubmit,
        className,
        onClick
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
        if (onChange) {
            onChange(event);
        }
    };

    return (
        <div className={`relative  justify-items-center bg-(--color-background-light)  ${className}`}>
            <textarea
                className={`!py-3  flex-1 !ps-3 !pe-15 govuk-focusable !border-0 govuk-textarea !mb-0 pointer-events-auto  !resize-none `}
                id="message"
                name="message"
                rows={rows}
                placeholder={placeholder}
                onChange={handleInput}
                onKeyDown={onKeyDown}
                onSubmit={onSubmit}
            ></textarea>
            <Image
                src="/send.svg"
                alt="Send"
                width={24}
                height={24}
                className="absolute top-[50%] translate-y-[-50%] right-4 cursor-pointer w-7"
                onClick={onClick}
            />
        </div>
    );
};

export default MessageInput;

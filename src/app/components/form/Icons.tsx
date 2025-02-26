
import Image from 'next/image';

const StatusIcon = ({ formStatus }: { formStatus: string }) => {
    let src, alt;     
    switch (formStatus) {
        case 'draft':
        case 'submitted':
            src = '/file.svg';
            alt = 'picture of a file with lines as text';
            break;
        case 'authorised':
        case 'validated':
            src = '/incomplete.svg';
            alt = 'picture of a filled circle with an exclaimation mark in the middle';
            break;
        case 'completed':
            src = '/check.svg';
            alt = 'picture of a filled circle with a tick in the middle';
            break;
        default:
            src = '/file.svg';
            alt = 'Error finding form status';
            break;
    }

    return (
        <Image
            src = { src }
            alt = { alt }
            width = { 20 }
            height = { 20 }
        />
    )
}

export default StatusIcon;
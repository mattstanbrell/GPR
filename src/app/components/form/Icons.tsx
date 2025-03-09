
import Image from 'next/image';
import { type FormStatus } from '@/app/types/models';
import { FORM_STATUS } from '@/app/constants/models';

const StatusIcon = ({ status }: { status: FormStatus }) => {
    let src, alt;     
    switch (status) {
        case FORM_STATUS.DRAFT:
        case FORM_STATUS.SUBMITTED:
            src = '/file.svg';
            alt = 'picture of a file with lines as text';
            break;
        case FORM_STATUS.AUTHORISED:
        case FORM_STATUS.VALIDATED:
            src = '/incomplete.svg';
            alt = 'picture of a filled circle with an exclaimation mark in the middle';
            break;
        case FORM_STATUS.COMPLETED:
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
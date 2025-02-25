
import Formboard from '@/app/components/formboard/Formboard';

const SocialWorkerFormboard = () => {
    // retrieve the outstanding forms to show
    const form = {
        id: 1,
        status: "submitted",
        firstName: "Charlie",
        lastName: "Bucket",
        date: "25/02/25"
    };

    const forms = [form];

    return (
        <div className="md:min-w-4xl md:flex overflow-clip">
            <Formboard boardTitle="Draft" boardForms={ forms } />
            <Formboard boardTitle="Submitted" boardForms={ forms } />
            <Formboard boardTitle="Authorised" boardForms={ forms } />
            <Formboard boardTitle="Validated" boardForms={ forms } />
        </div>
    )
}

export default SocialWorkerFormboard;
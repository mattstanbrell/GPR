
const updateIndexHelper = ({isIncrement, index, setIndex, TOTAL_BOARDS} : {isIncrement: boolean, index: number, setIndex: (index: number) => void, TOTAL_BOARDS: number}) => {
    if (isIncrement) {
        setIndex((index + 1) % TOTAL_BOARDS);
    } else {
        setIndex((index + TOTAL_BOARDS - 1) % TOTAL_BOARDS);
    }
}

// retrieve the outstanding forms to show
const form1 = {
    id: 1,
    status: "submitted",
    firstName: "Charlie",
    lastName: "Bucket",
    date: "25/02/25"
};

const form2 = {
    id: 2,
    status: "authorised",
    firstName: "Jill",
    lastName: "Doe",
    date: "21/02/25"
};

const form3 = {
    id: 3,
    status: "validated",
    firstName: "John",
    lastName: "Doe",
    date: "15/02/25"
};

// will need updating with real queries
const getUserDraftForms = () => {
    return []
}

const getUserSubmittedForms = () => {
    return [form1]
}

const getUserAuthorisedForms = () => {
    return [form2]
}

const getUserValidatedForms = () => {
    return [form3]
}

const getUserAssignedForms = () => {
    return [form1]
}

export { 
    updateIndexHelper, 
    getUserDraftForms, 
    getUserSubmittedForms, 
    getUserAuthorisedForms, 
    getUserValidatedForms, 
    getUserAssignedForms
}
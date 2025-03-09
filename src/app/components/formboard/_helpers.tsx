
export const getNewIndex = (isIncrement: boolean, index: number, TOTAL_BOARDS: number) => {
    if (isIncrement) {
        return (index + 1) % TOTAL_BOARDS;
    } else {
        return (index - 1 + TOTAL_BOARDS) % TOTAL_BOARDS;
    }
}
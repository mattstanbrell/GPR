export function formatTimestamp(timestamp: Date) {
    const now = new Date();
    const date = new Date(timestamp);

    const isToday = now.toDateString() === date.toDateString();
    const yesterday = new Date(now);
    yesterday.setDate(now.getDate() - 1);
    const isYesterday = yesterday.toDateString() === date.toDateString();

    const timeFormatter = new Intl.DateTimeFormat('en-UK', {
        hour: 'numeric',
        minute: '2-digit',
        hour12: true
    });

    if (isToday) {
        return `Today at ${timeFormatter.format(date)}`;
    } else if (isYesterday) {
        return `Yesterday at ${timeFormatter.format(date)}`;
    } else {
        const dateFormatter = new Intl.DateTimeFormat('en-UK', {
            day: '2-digit',
            month: '2-digit',
            year: 'numeric',

        });
        return `${dateFormatter.format(date)} ${timeFormatter.format(date)}`;
    }
}

// Example usage
console.log(formatTimestamp(new Date())); // Today 12:30 PM
console.log(formatTimestamp(new Date((new Date().getTime() - 86400000)))); // Yesterday 12:30 PM
console.log(formatTimestamp(new Date('2024-01-01T15:30:00'))); // January 1 3:30 PM    
export function formatDate(dateString) {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
        year: 'numeric', 
        month: 'short', 
        day: 'numeric' 
    });
}

export function formatDateTime(dateString) {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    return date.toLocaleString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
    });
}

export function getInitials(firstName, lastName) {
    if (!firstName && !lastName) return '??';
    return `${firstName?.[0] || ''}${lastName?.[0] || ''}`.toUpperCase();
}

export function calculateProgress(total, completed) {
    if (total === 0) return 0;
    return Math.round((completed / total) * 100);
}

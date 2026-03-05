export const STATUS_LABELS = {
    NEW: "New",
    TRIAGE: "Triage",
    TODO: "To Do",
    IN_PROGRESS: "In Progress",
    WAITING_FOR_TEAM: "Waiting for Team",
    CODE_REVIEW: "Code Review",
    DONE: "Done",
    CANCELED: "Canceled",
};

export const PRIORITY_LABELS = {
    LOW: "Low",
    NORMAL: "Normal",
    HIGH: "High",
    CRITICAL: "Critical",
};

export const ALL_STATUSES = ["NEW", "TRIAGE", "TODO", "IN_PROGRESS", "WAITING_FOR_TEAM", "CODE_REVIEW", "DONE", "CANCELED"];
export const ALL_PRIORITIES = ["LOW", "NORMAL", "HIGH", "CRITICAL"];

export const getStatusBadgeClass = (status) => {
    switch (status) {
        case "DONE": return "bg-green-500 text-white";
        case "IN_PROGRESS": return "bg-blue-500 text-white";
        case "CODE_REVIEW": return "bg-purple-500 text-white";
        case "WAITING_FOR_TEAM": return "bg-orange-500 text-white";
        case "TRIAGE": return "bg-yellow-500 text-white";
        case "TODO": return "bg-slate-500 text-white";
        case "CANCELED": return "bg-red-400 text-white";
        case "NEW": return "bg-gray-500 text-white";
        default: return "bg-gray-400 text-white";
    }
};

export const getPriorityBadgeVariant = (priority) => {
    switch (priority) {
        case "CRITICAL": return "destructive";
        case "HIGH": return "destructive";
        case "NORMAL": return "secondary";
        case "LOW": return "outline";
        default: return "secondary";
    }
};

export const getPriorityBadgeClass = (priority) => {
    if (priority === "CRITICAL") return "ring-2 ring-red-600";
    if (priority === "HIGH") return "";
    return "";
};

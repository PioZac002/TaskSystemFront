import { useEffect, useState } from "react";
import apiClient from "@/services/apiClient";
import { useUserStore } from "@/store/userStore";
import { GitBranch, MessageCircle, User, ArrowUpDown } from "lucide-react";

const PRIORITY_MAP = {
    "0": "LOW", "1": "NORMAL", "2": "HIGH",
    "LOW": "Low", "NORMAL": "Normal", "HIGH": "High",
};

const STATUS_MAP = {
    "0": "To Do", "1": "In Progress", "3": "Done",
    "NEW": "To Do", "IN_PROGRESS": "In Progress", "DONE": "Done",
};

function formatLabel(map, val) {
    return map[String(val)] ?? val ?? "—";
}

function getActivityDescription(activity, users) {
    const { activityType, oldValue, newValue, authorUserId } = activity;
    const author = users.find(u => u.id === authorUserId || String(u.id) === String(authorUserId));
    const authorName = author ? `${author.firstName || ''} ${author.lastName || ''}`.trim() || author.email : `User #${authorUserId}`;

    switch (activityType) {
        case "CREATED_ISSUE":
            return { text: "Created this issue", authorName, icon: GitBranch, color: "bg-green-500" };
        case "CREATED_COMMENT":
            return { text: "Added a comment", authorName, icon: MessageCircle, color: "bg-blue-500" };
        case "UPDATED_ASSIGNEE": {
            const oldUser = users.find(u => u.id === Number(oldValue) || String(u.id) === String(oldValue));
            const newUser = users.find(u => u.id === Number(newValue) || String(u.id) === String(newValue));
            const oldName = oldUser ? `${oldUser.firstName || ''} ${oldUser.lastName || ''}`.trim() : (oldValue || "Unassigned");
            const newName = newUser ? `${newUser.firstName || ''} ${newUser.lastName || ''}`.trim() : (newValue || "Unassigned");
            return { text: `Changed assignee: ${oldName} → ${newName}`, authorName, icon: User, color: "bg-purple-500" };
        }
        case "UPDATED_PRIORITY":
            return {
                text: `Changed priority: ${formatLabel(PRIORITY_MAP, oldValue)} → ${formatLabel(PRIORITY_MAP, newValue)}`,
                authorName, icon: ArrowUpDown, color: "bg-orange-500"
            };
        case "UPDATED_STATUS":
            return {
                text: `Changed status: ${formatLabel(STATUS_MAP, oldValue)} → ${formatLabel(STATUS_MAP, newValue)}`,
                authorName, icon: ArrowUpDown, color: "bg-cyan-500"
            };
        default:
            return { text: activityType, authorName, icon: GitBranch, color: "bg-muted-foreground" };
    }
}

export function ActivityLog({ issueId }) {
    const [activities, setActivities] = useState([]);
    const [loading, setLoading] = useState(true);
    const { users, fetchUsers } = useUserStore();

    useEffect(() => {
        fetchUsers();
        apiClient.get(`/api/v1/issue/${issueId}/activities`)
            .then(r => setActivities(r.data))
            .catch(() => {})
            .finally(() => setLoading(false));
    }, [issueId]);

    if (loading) {
        return <p className="text-sm text-muted-foreground py-4">Loading activity...</p>;
    }

    if (!activities.length) {
        return <p className="text-sm text-muted-foreground py-4">No activity recorded yet.</p>;
    }

    return (
        <div className="relative ml-3 border-l-2 border-border space-y-0">
            {activities.map((activity, i) => {
                const { text, authorName, icon: Icon, color } = getActivityDescription(activity, users);
                const timestamp = activity.timestamp
                    ? new Date(activity.timestamp).toLocaleString('en-US', {
                        month: 'short', day: 'numeric', year: 'numeric',
                        hour: '2-digit', minute: '2-digit'
                    })
                    : "";

                return (
                    <div key={i} className="relative pl-6 pb-4">
                        {/* Dot */}
                        <span className={`absolute -left-[9px] top-1 h-4 w-4 rounded-full ${color} flex items-center justify-center`}>
                            <Icon className="h-2.5 w-2.5 text-white" />
                        </span>
                        <div className="flex flex-col gap-0.5">
                            <p className="text-sm">
                                <span className="font-medium">{authorName}</span>{" "}
                                <span className="text-muted-foreground">{text}</span>
                            </p>
                            {timestamp && (
                                <p className="text-xs text-muted-foreground">{timestamp}</p>
                            )}
                        </div>
                    </div>
                );
            })}
        </div>
    );
}

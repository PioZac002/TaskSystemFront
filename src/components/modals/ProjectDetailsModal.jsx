import { useEffect, useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import apiClient from "@/services/apiClient";
import { Badge } from "@/components/ui/badge";

function formatDate(dateString) {
    if (!dateString) return "";
    const d = new Date(dateString);
    return d.toLocaleString("pl-PL", { year: "numeric", month: "2-digit", day: "2-digit", hour: "2-digit", minute: "2-digit" });
}

export function ProjectDetailsModal({ open, onOpenChange, projectId }) {
    const [project, setProject] = useState(null);

    useEffect(() => {
        if (open && projectId) {
            apiClient.get(`/api/v1/project/${projectId}`)
                .then(res => setProject(res.data));
        }
    }, [open, projectId]);

    if (!project) return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent>
                <div className="text-muted-foreground">Loading...</div>
            </DialogContent>
        </Dialog>
    );

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-[600px] animate-scale-in overflow-y-auto max-h-[90vh]">
                <DialogHeader>
                    <DialogTitle>{project.shortName}</DialogTitle>
                    <DialogDescription>
                        {project.description}
                    </DialogDescription>
                </DialogHeader>
                <div className="space-y-2">
                    <div>
                        <span className="font-medium">Created at: </span>
                        {formatDate(project.createdAt)}
                    </div>
                    <div className="mt-4">
                        <h3 className="font-semibold mb-2">Issues in this project:</h3>
                        {project.issues && project.issues.length ? (
                            <div className="space-y-2">
                                {project.issues.map(issue => (
                                    <div key={issue.id} className="flex gap-2 items-center p-2 rounded-md border border-border">
                                        <div>{issue.key}</div>
                                        <span className="font-medium">{issue.title}</span>
                                        <Badge variant={issue.status === "DONE" ? "done" : "inprogress"}>{issue.status}</Badge>
                                        <span>| {formatDate(issue.createdAt)}</span>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <div className="text-muted-foreground">No issues assigned to this project.</div>
                        )}
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    );
}

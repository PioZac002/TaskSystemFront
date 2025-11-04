import { useState,useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import apiClient from "@/services/apiClient"; // Upewnij się, że ten plik istnieje

function ProjectDetailsModal({ open, onOpenChange, projectId }) {
    const [project, setProject] = useState(null);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (open && projectId != null) {
            setLoading(true);
            apiClient
                .get(`/api/v1/project/${projectId}`)
                .then((res) => setProject(res.data))
                .finally(() => setLoading(false));
        }
    }, [open, projectId]);

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-[500px] animate-scale-in">
                <DialogHeader>
                    <DialogTitle className="text-2xl">Project Details</DialogTitle>
                </DialogHeader>
                {loading ? (
                    <div className="text-muted-foreground">Loading...</div>
                ) : project ? (
                    <div className="space-y-2">
                        <div>
                            <span className="font-semibold text-lg">{project.shortName}</span>
                            <div className="text-sm text-muted-foreground">{project.description}</div>
                        </div>
                        <div>
                            <span className="font-medium">Created at: </span>
                            {project.createdAt}
                        </div>
                        {/* Możesz tu dodatkowo dodać inne szczegóły: issues, status, itd. */}
                    </div>
                ) : (
                    <div className="text-destructive">No data.</div>
                )}
            </DialogContent>
        </Dialog>
    );

}
export { ProjectDetailsModal };

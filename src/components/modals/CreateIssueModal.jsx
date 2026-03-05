import { useState, useEffect, useRef, useCallback } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/Dialog";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Label } from "@/components/ui/Label";
import { Textarea } from "@/components/ui/Textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/Select";
import { useIssueStore } from "@/store/issueStore";
import { useProjectStore } from "@/store/projectStore";
import { useUserStore } from "@/store/userStore";
import { useTeamStore } from "@/store/teamStore";
import { useAuthStore } from "@/store/authStore";
import { storageService } from "@/services/storageService";
import apiClient from "@/services/apiClient";
import { toast } from "sonner";
import { Image, X, Upload } from "lucide-react";

/**
 * CreateIssueModal component for creating new issues
 *
 * @param {Object} props
 * @param {boolean} props.open - Whether the modal is open
 * @param {Function} props.onOpenChange - Callback when modal open state changes
 * @param {number|null} props.preSelectedProjectId - Optional project ID to pre-select
 * @param {Function} props.onIssueCreated - Optional callback called after issue is successfully created
 */
export function CreateIssueModal({ open, onOpenChange, preSelectedProjectId = null, onIssueCreated }) {
    const [title, setTitle] = useState("");
    const [description, setDescription] = useState("");
    const [priority, setPriority] = useState("NORMAL");
    const [projectId, setProjectId] = useState(preSelectedProjectId ? String(preSelectedProjectId) : "");
    const [assigneeId, setAssigneeId] = useState("unassigned");
    const [teamId, setTeamId] = useState("none");
    const [dueDate, setDueDate] = useState("");
    const [loading, setLoading] = useState(false);
    const [attachedImages, setAttachedImages] = useState([]);
    const fileInputRef = useRef(null);

    const { createIssue, fetchIssues } = useIssueStore();
    const { projects, fetchProjects } = useProjectStore();
    const { users, fetchUsers } = useUserStore();
    const { teams, fetchTeams } = useTeamStore();
    const user = useAuthStore((state) => state.user);

    useEffect(() => {
        if (open) {
            fetchProjects();
            fetchUsers();
            fetchTeams();
            if (preSelectedProjectId) {
                setProjectId(String(preSelectedProjectId));
            }
        } else {
            // Reset images when modal closes
            setAttachedImages([]);
        }
    }, [open, preSelectedProjectId]);

    // Global paste handler for clipboard images
    const handleGlobalPaste = useCallback((e) => {
        if (!open) return;
        const items = e.clipboardData?.items;
        if (!items) return;
        for (const item of items) {
            if (item.type.startsWith("image/")) {
                const file = item.getAsFile();
                if (file) addImage(file);
            }
        }
    }, [open]);

    useEffect(() => {
        window.addEventListener("paste", handleGlobalPaste);
        return () => window.removeEventListener("paste", handleGlobalPaste);
    }, [handleGlobalPaste]);

    const addImage = (file) => {
        const reader = new FileReader();
        reader.onload = (e) => {
            setAttachedImages(prev => [
                ...prev,
                { file, url: e.target.result, name: file.name || `image-${Date.now()}.png` }
            ]);
        };
        reader.readAsDataURL(file);
    };

    const removeImage = (index) => {
        setAttachedImages(prev => prev.filter((_, i) => i !== index));
    };

    const handleFileUpload = (e) => {
        const files = Array.from(e.target.files).filter(f => f.type.startsWith("image/"));
        files.forEach(addImage);
        e.target.value = "";
    };

    const handleDrop = (e) => {
        e.preventDefault();
        const files = Array.from(e.dataTransfer.files).filter(f => f.type.startsWith("image/"));
        files.forEach(addImage);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!title.trim()) {
            toast.error("Title is required");
            return;
        }

        if (!projectId || projectId === "") {
            toast.error("Please select a project");
            return;
        }

        let authorId = null;
        if (user?.id) {
            authorId = user.id;
        } else if (storageService.getItem("userId")) {
            authorId = Number(storageService.getItem("userId"));
        } else if (storageService.getItem("user")) {
            try {
                const userObj = JSON.parse(storageService.getItem("user"));
                authorId = userObj?.id;
            } catch (e) {
                console.error("Failed to parse user:", e);
            }
        }

        if (!authorId) {
            toast.error("You must be logged in to create an issue");
            return;
        }

        setLoading(true);

        try {
            const payload = {
                title: title.trim(),
                description: description.trim() || null,
                priority: priority || null,
                authorId: authorId,
                assigneeId: null,
                dueDate: null,
                projectId: Number(projectId),
            };

            if (assigneeId && assigneeId !== "unassigned") {
                const assigneeIdNum = Number(assigneeId);
                if (!isNaN(assigneeIdNum) && assigneeIdNum > 0) {
                    payload.assigneeId = assigneeIdNum;
                }
            }

            if (dueDate) {
                payload.dueDate = dueDate;
            }

            const createdIssue = await createIssue(payload);

            // Assign team if selected
            if (teamId && teamId !== "none") {
                const teamIdNum = Number(teamId);
                if (!isNaN(teamIdNum) && teamIdNum > 0) {
                    try {
                        await apiClient.put("/api/v1/issue/assign-team", {
                            issueId: createdIssue.id,
                            teamId: teamIdNum,
                        });
                    } catch (teamError) {
                        toast.warning("Issue created, but failed to assign team");
                    }
                }
            }

            // Upload images as attachments
            if (attachedImages.length > 0 && createdIssue.id) {
                let uploadedCount = 0;
                for (const img of attachedImages) {
                    try {
                        const formData = new FormData();
                        formData.append("file", img.file);
                        await apiClient.post(`/api/v1/issue/${createdIssue.id}/attachments`, formData, {
                            headers: { "Content-Type": "multipart/form-data" },
                        });
                        uploadedCount++;
                    } catch (e) {
                        console.warn("Image upload failed:", e);
                    }
                }
                if (uploadedCount > 0) {
                    toast.success(`Issue created with ${uploadedCount} attachment(s)!`);
                } else {
                    toast.success("Issue created successfully!");
                    if (attachedImages.length > 0) {
                        toast.warning("Image attachments could not be uploaded");
                    }
                }
            } else {
                toast.success("Issue created successfully!");
            }

            // Reset form
            setTitle("");
            setDescription("");
            setPriority("NORMAL");
            setProjectId(preSelectedProjectId ? String(preSelectedProjectId) : "");
            setAssigneeId("unassigned");
            setTeamId("none");
            setDueDate("");
            setAttachedImages([]);

            await fetchIssues();

            if (onIssueCreated) {
                onIssueCreated();
            }

            onOpenChange(false);
        } catch (error) {
            const errorMessage = error.response?.data?.Message || error.message || "Failed to create issue";
            toast.error(errorMessage);
            console.error("Create issue error:", error);
        } finally {
            setLoading(false);
        }
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-[95vw] md:max-w-[600px] max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                    <DialogTitle>Create New Issue</DialogTitle>
                    <DialogDescription>Add a new task or bug to track</DialogDescription>
                </DialogHeader>

                <form onSubmit={handleSubmit} className="space-y-4">
                    {/* Title */}
                    <div className="space-y-2">
                        <Label htmlFor="title">Title *</Label>
                        <Input
                            id="title"
                            placeholder="Fix login bug"
                            value={title}
                            onChange={(e) => setTitle(e.target.value)}
                            required
                        />
                    </div>

                    {/* Description */}
                    <div className="space-y-2">
                        <Label htmlFor="description">Description</Label>
                        <Textarea
                            id="description"
                            placeholder="Describe the issue..."
                            value={description}
                            onChange={(e) => setDescription(e.target.value)}
                            rows={4}
                        />
                    </div>

                    {/* Image Attachments */}
                    <div className="space-y-2">
                        <Label>
                            Attachments
                            <span className="ml-1 text-xs text-muted-foreground">(optional)</span>
                        </Label>

                        {/* Drop zone */}
                        <div
                            className="border-2 border-dashed border-border rounded-lg p-4 text-center cursor-pointer hover:border-primary/60 hover:bg-accent/30 transition-colors"
                            onClick={() => fileInputRef.current?.click()}
                            onDragOver={(e) => e.preventDefault()}
                            onDrop={handleDrop}
                        >
                            <Image className="mx-auto h-7 w-7 text-muted-foreground mb-2" />
                            <p className="text-sm text-muted-foreground">
                                Drop images here or{" "}
                                <span className="text-primary font-medium">click to upload</span>
                            </p>
                            <p className="text-xs text-muted-foreground mt-1">
                                You can also paste screenshots with <kbd className="px-1 py-0.5 rounded border text-xs font-mono bg-muted">Ctrl+V</kbd>
                            </p>
                        </div>

                        <input
                            ref={fileInputRef}
                            type="file"
                            accept="image/*"
                            multiple
                            className="hidden"
                            onChange={handleFileUpload}
                        />

                        {/* Thumbnails */}
                        {attachedImages.length > 0 && (
                            <div className="flex flex-wrap gap-2">
                                {attachedImages.map((img, i) => (
                                    <div key={i} className="relative group">
                                        <img
                                            src={img.url}
                                            alt={img.name}
                                            className="h-16 w-16 object-cover rounded-md border border-border"
                                        />
                                        <button
                                            type="button"
                                            className="absolute -top-1.5 -right-1.5 h-5 w-5 bg-destructive text-destructive-foreground rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity shadow-sm"
                                            onClick={() => removeImage(i)}
                                        >
                                            <X className="h-3 w-3" />
                                        </button>
                                        <p className="text-[10px] text-muted-foreground mt-0.5 w-16 truncate" title={img.name}>
                                            {img.name}
                                        </p>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>

                    {/* Project */}
                    <div className="space-y-2">
                        <Label htmlFor="project">Project *</Label>
                        <Select
                            value={projectId}
                            onValueChange={setProjectId}
                            required
                        >
                            <SelectTrigger>
                                <SelectValue placeholder="Select project" />
                            </SelectTrigger>
                            <SelectContent>
                                {projects.map((project) => (
                                    <SelectItem key={project.id} value={String(project.id)}>
                                        {project.shortName}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>

                    {/* Priority */}
                    <div className="space-y-2">
                        <Label htmlFor="priority">Priority</Label>
                        <Select value={priority} onValueChange={setPriority}>
                            <SelectTrigger>
                                <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="CRITICAL">🔴 Critical</SelectItem>
                                <SelectItem value="HIGH">🟠 High</SelectItem>
                                <SelectItem value="NORMAL">🟡 Normal</SelectItem>
                                <SelectItem value="LOW">🟢 Low</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>

                    {/* Assignee & Team */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label htmlFor="assignee">Assignee (optional)</Label>
                            <Select value={assigneeId} onValueChange={setAssigneeId}>
                                <SelectTrigger>
                                    <SelectValue placeholder="Unassigned" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="unassigned">Unassigned</SelectItem>
                                    {users.map((user) => (
                                        <SelectItem key={user.id} value={String(user.id)}>
                                            {user.firstName} {user.lastName}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="team">Team (optional)</Label>
                            <Select value={teamId} onValueChange={setTeamId}>
                                <SelectTrigger>
                                    <SelectValue placeholder="No team" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="none">No team</SelectItem>
                                    {teams.map((team) => (
                                        <SelectItem key={team.id} value={String(team.id)}>
                                            {team.name}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                    </div>

                    {/* Due Date */}
                    <div className="space-y-2">
                        <Label htmlFor="dueDate">Due Date (optional)</Label>
                        <Input
                            id="dueDate"
                            type="date"
                            value={dueDate}
                            onChange={(e) => setDueDate(e.target.value)}
                        />
                    </div>

                    {/* Actions */}
                    <div className="flex justify-end gap-3 pt-4">
                        <Button
                            type="button"
                            variant="outline"
                            onClick={() => onOpenChange(false)}
                            disabled={loading}
                        >
                            Cancel
                        </Button>
                        <Button type="submit" disabled={loading || !projectId || projectId === ""}>
                            {loading ? "Creating..." : "Create Issue"}
                        </Button>
                    </div>
                </form>
            </DialogContent>
        </Dialog>
    );
}

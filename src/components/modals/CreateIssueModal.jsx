import { useEffect, useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useIssueStore } from "@/store/issueStore";
import { useProjectStore } from "@/store/projectStore";
import { useUserStore } from "@/store/userStore";
import { useTeamStore } from "@/store/teamStore";
import { toast } from "sonner";

export function CreateIssueModal({ open, onOpenChange, preSelectedProjectId, onIssueCreated }) {
    const [title, setTitle] = useState("");
    const [description, setDescription] = useState("");
    const [projectId, setProjectId] = useState("");
    const [assigneeId, setAssigneeId] = useState("unassigned");
    const [teamId, setTeamId] = useState("none");
    const [priority, setPriority] = useState("NORMAL");
    const [dueDate, setDueDate] = useState("");
    const [loading, setLoading] = useState(false);

    const createIssue = useIssueStore((state) => state.createIssue);
    const { projects, fetchProjects } = useProjectStore();
    const { users, fetchUsers } = useUserStore();
    const { teams, fetchTeams } = useTeamStore();

    useEffect(() => {
        if (open) {
            fetchProjects();
            fetchUsers();
            fetchTeams();

            // Set pre-selected project if provided
            if (preSelectedProjectId) {
                setProjectId(String(preSelectedProjectId));
            }

            // Ustaw obecnego użytkownika jako domyślnego assignee
            const currentUserId = localStorage.getItem('userId');
            if (currentUserId) {
                setAssigneeId(currentUserId);
            }
        }
    }, [open, preSelectedProjectId]);

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!title.trim() || !projectId) {
            toast.error("Title and Project are required");
            return;
        }

        // Sprawdź czy użytkownik jest zalogowany
        const currentUserId = localStorage.getItem('userId');
        if (!currentUserId) {
            toast.error("You must be logged in to create an issue");
            return;
        }

        setLoading(true);

        try {

            const issueData = {
                title:  title.trim(),
                description: description.trim() || null,  // ← null jeśli pusty
                projectId: projectId ? Number(projectId) : null,  // ← nullable
                assigneeId: assigneeId && assigneeId !== "unassigned" ? Number(assigneeId) : null,
                teamId: teamId && teamId !== "none" ? Number(teamId) : null,
                priority: priority || "NORMAL",  // ← default NORMAL
                dueDate: dueDate || null,
                authorId: Number(currentUserId)
            };


            console.log('Creating issue with data:', issueData);

            await createIssue(issueData);
            toast.success("Issue created successfully!");

            // Reset form
            setTitle("");
            setDescription("");
            setProjectId("");
            setAssigneeId("unassigned");
            setTeamId("none");
            setPriority("NORMAL");
            setDueDate("");

            onOpenChange(false);
            
            // Callback for parent to refresh
            if (onIssueCreated) {
                onIssueCreated();
            }
        } catch (error) {
            const errorMessage = error.response?.data?.Message || error.message || "Failed to create issue";
            toast. error(errorMessage);
            console.error('Create issue error:', error);
        } finally {
            setLoading(false);
        }
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                    <DialogTitle>Create New Issue</DialogTitle>
                </DialogHeader>
                <form onSubmit={handleSubmit} className="space-y-4">
                    {/* Title */}
                    <div className="space-y-2">
                        <Label htmlFor="title">
                            Title <span className="text-destructive">*</span>
                        </Label>
                        <Input
                            id="title"
                            placeholder="Enter issue title..."
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
                            onChange={(e) => setDescription(e. target.value)}
                            rows={4}
                        />
                    </div>

                    {/* Project & Priority */}
                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label htmlFor="project">
                                Project <span className="text-destructive">*</span>
                            </Label>
                            <Select 
                                value={projectId} 
                                onValueChange={setProjectId} 
                                required
                                disabled={!!preSelectedProjectId}
                            >
                                <SelectTrigger>
                                    <SelectValue placeholder="Select project" />
                                </SelectTrigger>
                                <SelectContent>
                                    {projects.map((project) => (
                                        <SelectItem key={project.id} value={String(project.id)}>
                                            {project.shortName} - {project.description?. substring(0, 30) || 'No description'}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                            {preSelectedProjectId && (
                                <p className="text-xs text-muted-foreground">
                                    Project is pre-selected for this modal
                                </p>
                            )}
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="priority">Priority</Label>
                            <Select value={priority} onValueChange={setPriority}>
                                <SelectTrigger>
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="HIGH">High</SelectItem>
                                    <SelectItem value="NORMAL">Normal</SelectItem>
                                    <SelectItem value="LOW">Low</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                    </div>

                    {/* Assignee & Team */}
                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label htmlFor="assignee">Assignee</Label>
                            <Select value={assigneeId} onValueChange={setAssigneeId}>
                                <SelectTrigger>
                                    <SelectValue placeholder="Unassigned" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="unassigned">Unassigned</SelectItem>
                                    {users.map((user) => (
                                        <SelectItem key={user. id} value={String(user. id)}>
                                            {user.firstName} {user.lastName} ({user.email})
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
                                            {team. name}
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
                    <div className="flex justify-end gap-3">
                        <Button
                            type="button"
                            variant="outline"
                            onClick={() => onOpenChange(false)}
                            disabled={loading}
                        >
                            Cancel
                        </Button>
                        <Button type="submit" disabled={loading || !title.trim() || !projectId}>
                            {loading ? "Creating..." : "Create Issue"}
                        </Button>
                    </div>
                </form>
            </DialogContent>
        </Dialog>
    );
}
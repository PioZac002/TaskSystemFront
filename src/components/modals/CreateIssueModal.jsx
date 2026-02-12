import { useState, useEffect } from "react";
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
import apiClient from "@/services/apiClient";
import { toast } from "sonner";

export function CreateIssueModal({ open, onOpenChange, preSelectedProjectId = null }) {
    const [title, setTitle] = useState("");
    const [description, setDescription] = useState("");
    const [priority, setPriority] = useState("NORMAL");
    const [projectId, setProjectId] = useState(preSelectedProjectId ?  String(preSelectedProjectId) : "");
    const [assigneeId, setAssigneeId] = useState("unassigned");
    const [teamId, setTeamId] = useState("none");
    const [dueDate, setDueDate] = useState("");
    const [loading, setLoading] = useState(false);

    const { createIssue, fetchIssues } = useIssueStore();
    const { projects, fetchProjects } = useProjectStore();
    const { users, fetchUsers } = useUserStore();
    const { teams, fetchTeams } = useTeamStore();
    const user = useAuthStore((state) => state.user);  // ✅ Pobierz user z authStore

    useEffect(() => {
        if (open) {
            fetchProjects();
            fetchUsers();
            fetchTeams();
            if (preSelectedProjectId) {
                setProjectId(String(preSelectedProjectId));
            }
        }
    }, [open, preSelectedProjectId]);

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

        // ✅ DEBUG - sprawdź wszystkie możliwe źródła userId
        console.log("🔍 Checking for userId.. .");
        console.log("1️⃣ localStorage. userId:", localStorage.getItem('userId'));
        console.log("2️⃣ localStorage.user:", localStorage.getItem('user'));
        console.log("3️⃣ authStore.user:", user);
        console.log("4️⃣ All localStorage keys:", Object.keys(localStorage));

        // ✅ Spróbuj pobrać userId z wielu źródeł
        let authorId = null;

        // Opcja 1: z authStore
        if (user?. id) {
            authorId = user.id;
            console.log("✅ Got userId from authStore:", authorId);
        }
        // Opcja 2: z localStorage 'userId'
        else if (localStorage. getItem('userId')) {
            authorId = Number(localStorage.getItem('userId'));
            console.log("✅ Got userId from localStorage. userId:", authorId);
        }
        // Opcja 3: z localStorage 'user' (sparsowany JSON)
        else if (localStorage. getItem('user')) {
            try {
                const userObj = JSON.parse(localStorage.getItem('user'));
                authorId = userObj?. id;
                console.log("✅ Got userId from localStorage. user:", authorId);
            } catch (e) {
                console.error("❌ Failed to parse localStorage.user:", e);
            }
        }

        if (!authorId) {
            toast.error("You must be logged in to create an issue");
            console.error('❌ No userId found anywhere!  Check localStorage and authStore');
            return;
        }

        setLoading(true);

        try {
            // ✅ KROK 1: Utwórz issue
            const payload = {
                title:  title.trim(),
                description: description.trim() || null,
                priority: priority || null,
                authorId: authorId,
                assigneeId: null,
                dueDate: null,
                projectId: Number(projectId),
            };

            // Dodaj assigneeId jeśli wybrano
            if (assigneeId && assigneeId !== "unassigned") {
                const assigneeIdNum = Number(assigneeId);
                if (!isNaN(assigneeIdNum) && assigneeIdNum > 0) {
                    payload.assigneeId = assigneeIdNum;
                }
            }

            // Dodaj dueDate jeśli wybrano
            if (dueDate) {
                payload.dueDate = dueDate;
            }

            console.log("📤 Creating issue with payload:", JSON.stringify(payload, null, 2));

            const createdIssue = await createIssue(payload);

            console.log("✅ Issue created:", createdIssue);

            // ✅ KROK 2: Przypisz team (jeśli wybrano)
            if (teamId && teamId !== "none") {
                const teamIdNum = Number(teamId);
                if (!isNaN(teamIdNum) && teamIdNum > 0) {
                    try {
                        console.log(`📤 Assigning team ${teamIdNum} to issue ${createdIssue.id}`);

                        await apiClient.put("/api/v1/issue/assign-team", {
                            issueId: createdIssue.id,
                            teamId: teamIdNum,
                        });

                        console.log("✅ Team assigned successfully");
                    } catch (teamError) {
                        console. error("⚠️ Failed to assign team:", teamError);
                        toast.warning("Issue created, but failed to assign team");
                    }
                }
            }

            toast.success("Issue created successfully!");

            // Reset form
            setTitle("");
            setDescription("");
            setPriority("NORMAL");
            setProjectId(preSelectedProjectId ?  String(preSelectedProjectId) : "");
            setAssigneeId("unassigned");
            setTeamId("none");
            setDueDate("");

            await fetchIssues();
            onOpenChange(false);
        } catch (error) {
            const errorMessage = error.response?.data?.Message || error.message || "Failed to create issue";
            toast.error(errorMessage);
            console.error("❌ Create issue error:", error);
            console.error("❌ Error response:", error.response?.data);
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
                                <SelectItem value="HIGH">High</SelectItem>
                                <SelectItem value="NORMAL">Normal</SelectItem>
                                <SelectItem value="LOW">Low</SelectItem>
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
                                        <SelectItem key={user. id} value={String(user. id)}>
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
                                    {teams. map((team) => (
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
                            {loading ?  "Creating..." : "Create Issue"}
                        </Button>
                    </div>
                </form>
            </DialogContent>
        </Dialog>
    );
}
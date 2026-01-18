import { useEffect, useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { CommentSection } from "@/components/comments/CommentSection";
import apiClient from "@/services/apiClient";
import { toast } from "sonner";
import { Edit, Save, X, Trash2 } from "lucide-react";

export function IssueDetailsModal({ open, onOpenChange, issueId, onIssueDeleted }) {
    const [issue, setIssue] = useState(null);
    const [users, setUsers] = useState([]);
    const [teams, setTeams] = useState([]);
    const [edit, setEdit] = useState(false);
    const [loading, setLoading] = useState(false);
    const [form, setForm] = useState({
        title: "",
        description: "",
        status: "",
        priority: "",
        dueDate: "",
        assigneeId: "",
        teamId:  "",
    });

    useEffect(() => {
        if (open && issueId) {
            loadData();
            setEdit(false);
        }
    }, [open, issueId]);

    const loadData = async () => {
        try {
            setLoading(true);
            const [issueRes, usersRes, teamsRes] = await Promise.all([
                apiClient.get(`/api/v1/issue/id/${issueId}`),
                apiClient.get("/api/v1/user/all"),
                apiClient.get("/api/v1/team/all"),
            ]);

            const issueData = issueRes.data;
            setIssue(issueData);
            setUsers(usersRes.data);
            setTeams(teamsRes.data);

            setForm({
                title: issueData.title || "",
                description: issueData.description || "",
                status: issueData. status || "NEW",
                priority: issueData.priority || "NORMAL",
                dueDate: issueData.dueDate ?  issueData.dueDate. slice(0, 10) : "",
                assigneeId: issueData.assigneeId ?  String(issueData.assigneeId) : "unassigned",  // ← FIX
                teamId: issueData. team?.id ? String(issueData.team.id) : "none",  // ← FIX
            });
        } catch (error) {
            toast.error("Failed to load issue details");
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    const handleChange = (key, value) => {
        setForm((prev) => ({ ...prev, [key]: value }));
    };

    const handleSave = async () => {
        try {
            if (!issue) return;

            setLoading(true);

            // Zmiana tytułu
            if (form.title !== issue.title) {
                await apiClient.put("/api/v1/issue/rename", {
                    id: Number(issue.id),
                    newTitle: form.title,
                });
            }

            // Zmiana statusu
            if (form.status !== issue.status) {
                await apiClient. put("/api/v1/issue/update-status", {
                    issueId: Number(issue.id),
                    newStatus: form.status,
                });
            }

            // Zmiana priorytetu
            if (form.priority !== issue.priority) {
                await apiClient.put("/api/v1/issue/update-priority", {
                    issueId: Number(issue.id),
                    newPriority: form.priority,
                });
            }

            // Zmiana due date
            if (form.dueDate && form.dueDate !== issue. dueDate?. slice(0, 10)) {
                await apiClient.put("/api/v1/issue/update-due-date", {
                    issueId: Number(issue.id),
                    dueDate: form.dueDate,
                });
            }

            // Zmiana assignee (TYLKO jeśli wybrano użytkownika i wartość się zmieniła)
            if (form.assigneeId &&
                form.assigneeId !== "unassigned" &&  // ← FIX
                String(form.assigneeId) !== String(issue.assigneeId)) {
                await apiClient.put("/api/v1/issue/assign", {
                    issueId: Number(issue.id),
                    assigneeId: Number(form.assigneeId),
                });
            }

            // Zmiana team (TYLKO jeśli wybrano team i wartość się zmieniła)
            const currentTeamId = issue.team?. id ? String(issue.team. id) : "none";  // ← FIX
            if (form.teamId &&
                form.teamId !== "none" &&  // ← FIX
                form.teamId !== currentTeamId) {
                await apiClient.put("/api/v1/issue/assign-team", {
                    issueId: Number(issue.id),
                    teamId: Number(form.teamId),
                });
            }

            toast.success("Issue updated successfully!");
            setEdit(false);

            // Odśwież dane
            await loadData();
        } catch (error) {
            const errorMessage = error.response?.data?.Message || error.message || "Failed to update issue";
            toast. error(errorMessage);
            console.error('Update error:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleDeleteIssue = async () => {
        if (! window.confirm("Are you sure you want to delete this issue?  This action cannot be undone.")) {
            return;
        }

        try {
            await apiClient.delete(`/api/v1/issue/${issue.id}`);
            toast.success("Issue deleted successfully!");
            onOpenChange(false);
            if (onIssueDeleted) {
                onIssueDeleted(issue.id);
            }
        } catch (error) {
            const errorMessage = error.response?.data?.Message || error.message || "Failed to delete issue";
            toast.error(errorMessage);
        }
    };

    if (!issue && !loading) return null;

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-[700px] max-h-[90vh] overflow-y-auto">
                {loading && ! issue ? (
                    <div className="py-12 text-center text-muted-foreground">
                        Loading...
                    </div>
                ) : (
                    <>
                        <DialogHeader>
                            <div className="flex items-center justify-between">
                                <div>
                                    <DialogTitle className="text-2xl">
                                        {edit ? (
                                            <Input
                                                value={form.title}
                                                onChange={(e) => handleChange("title", e.target.value)}
                                                className="text-2xl font-bold"
                                            />
                                        ) : (
                                            issue.title
                                        )}
                                    </DialogTitle>
                                    <p className="text-sm text-muted-foreground font-mono mt-1">
                                        {issue.key}
                                    </p>
                                </div>
                                <div className="flex gap-2">
                                    {! edit ?  (
                                        <Button size="sm" onClick={() => setEdit(true)}>
                                            <Edit className="mr-2 h-4 w-4" />
                                            Edit
                                        </Button>
                                    ) : (
                                        <>
                                            <Button size="sm" onClick={handleSave} disabled={loading}>
                                                <Save className="mr-2 h-4 w-4" />
                                                Save
                                            </Button>
                                            <Button size="sm" variant="outline" onClick={() => setEdit(false)}>
                                                <X className="mr-2 h-4 w-4" />
                                                Cancel
                                            </Button>
                                        </>
                                    )}
                                </div>
                            </div>
                        </DialogHeader>

                        <div className="space-y-6">
                            {/* Description */}
                            <div>
                                <Label>Description</Label>
                                <Textarea
                                    rows={4}
                                    disabled={!edit}
                                    value={form.description}
                                    onChange={(e) => handleChange("description", e.target. value)}
                                    className="mt-2"
                                    placeholder="No description provided"
                                />
                            </div>

                            <Separator />

                            {/* Status & Priority */}
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <Label>Status</Label>
                                    <Select
                                        disabled={!edit}
                                        value={form.status}
                                        onValueChange={(v) => handleChange("status", v)}
                                    >
                                        <SelectTrigger className="mt-2">
                                            <SelectValue />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="NEW">To Do</SelectItem>
                                            <SelectItem value="IN_PROGRESS">In Progress</SelectItem>
                                            <SelectItem value="REVIEW">Review</SelectItem>
                                            <SelectItem value="DONE">Done</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>

                                <div>
                                    <Label>Priority</Label>
                                    <Select
                                        disabled={!edit}
                                        value={form.priority}
                                        onValueChange={(v) => handleChange("priority", v)}
                                    >
                                        <SelectTrigger className="mt-2">
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
                                <div>
                                    <Label>Assignee</Label>
                                    <Select
                                        disabled={!edit}
                                        value={form.assigneeId}
                                        onValueChange={(v) => handleChange("assigneeId", v)}
                                    >
                                        <SelectTrigger className="mt-2">
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

                                <div>
                                    <Label>Team</Label>
                                    <Select
                                        disabled={!edit}
                                        value={form.teamId}
                                        onValueChange={(v) => handleChange("teamId", v)}
                                    >
                                        <SelectTrigger className="mt-2">
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
                            <div>
                                <Label>Due Date</Label>
                                <Input
                                    type="date"
                                    disabled={!edit}
                                    value={form.dueDate}
                                    onChange={(e) => handleChange("dueDate", e.target.value)}
                                    className="mt-2"
                                />
                            </div>

                            <Separator />

                            {/* Comments Section */}
                            <div>
                                <h3 className="font-semibold mb-3">Comments</h3>
                                <CommentSection issueId={issue.id} />
                            </div>

                            <Separator />

                            {/* Delete Button */}
                            <div className="flex justify-between items-center">
                                <p className="text-sm text-muted-foreground">
                                    Created: {new Date(issue.createdAt).toLocaleString()}
                                </p>
                                <Button
                                    variant="destructive"
                                    size="sm"
                                    onClick={handleDeleteIssue}
                                >
                                    <Trash2 className="mr-2 h-4 w-4" />
                                    Delete Issue
                                </Button>
                            </div>
                        </div>
                    </>
                )}
            </DialogContent>
        </Dialog>
    );
}
import { useEffect, useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/Dialog";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Label } from "@/components/ui/Label";
import { Textarea } from "@/components/ui/Textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/Select";
import { Badge } from "@/components/ui/Badge";
import { Separator } from "@/components/ui/Separator";
import { Card, CardContent } from "@/components/ui/Card";
import { CommentSection } from "@/components/comments/CommentSection";
import apiClient from "@/services/apiClient";
import { toast } from "sonner";
import { Edit, Save, X, Trash2, Calendar, User as UserIcon, Users, Tag } from "lucide-react";

export function IssueDetailsModal({ open, onOpenChange, issueId, onIssueDeleted, onIssueUpdated }) {
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
        teamId: "",
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
                status: issueData.status || "NEW",
                priority: issueData.priority || "NORMAL",
                dueDate: issueData.dueDate ? issueData.dueDate.slice(0, 10) : "",
                assigneeId: issueData.assigneeId ? String(issueData.assigneeId) : "unassigned",
                teamId: issueData.team?.id ? String(issueData.team.id) : "none",
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

            if (form.title !== issue.title) {
                await apiClient.put("/api/v1/issue/rename", {
                    id: Number(issue.id),
                    newTitle: form.title,
                });
            }

            if (form.status !== issue.status) {
                await apiClient.put("/api/v1/issue/update-status", {
                    issueId: Number(issue.id),
                    newStatus: form.status,
                });
            }

            if (form.priority !== issue.priority) {
                await apiClient.put("/api/v1/issue/update-priority", {
                    issueId: Number(issue.id),
                    newPriority: form.priority,
                });
            }

            if (form.dueDate && form.dueDate !== issue.dueDate?.slice(0, 10)) {
                await apiClient.put("/api/v1/issue/update-due-date", {
                    issueId: Number(issue.id),
                    dueDate: form.dueDate,
                });
            }

            if (form.assigneeId &&
                form.assigneeId !== "unassigned" &&
                String(form.assigneeId) !== String(issue.assigneeId)) {
                await apiClient.put("/api/v1/issue/assign", {
                    issueId: Number(issue.id),
                    assigneeId: Number(form.assigneeId),
                });
            }

            const currentTeamId = issue.team?.id ? String(issue.team.id) : "none";
            if (form.teamId &&
                form.teamId !== "none" &&
                form.teamId !== currentTeamId) {
                await apiClient.put("/api/v1/issue/assign-team", {
                    issueId: Number(issue.id),
                    teamId: Number(form.teamId),
                });
            }

            toast.success("Issue updated successfully!");
            setEdit(false);

            await loadData();

            if (onIssueUpdated) {
                onIssueUpdated();
            }
        } catch (error) {
            const errorMessage = error.response?.data?.Message || error.message || "Failed to update issue";
            toast.error(errorMessage);
            console.error('Update error:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleDeleteIssue = async () => {
        if (!window.confirm("Are you sure you want to delete this issue? This action cannot be undone.")) {
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

    const assignedUser = users.find(u => u.id === issue?.assigneeId);

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="max-w-[95vw] w-full md:max-w-[1400px] h-[95vh] overflow-hidden p-0 flex flex-col">
                {loading && !issue ? (
                    <div className="py-12 text-center text-muted-foreground">
                        Loading...
                    </div>
                ) : (
                    <>
                        {/* Header - Sticky */}
                        <div className="shrink-0 bg-background border-b px-4 md:px-6 py-3 md:py-4">
                            <div className="flex items-start justify-between gap-4">
                                <div className="flex-1 min-w-0">
                                    <div className="flex items-center gap-2 md:gap-3 mb-2 flex-wrap">
                                        <span className="text-xs md:text-sm font-mono text-muted-foreground">
                                            {issue.key}
                                        </span>
                                        <Badge variant={
                                            issue.status === 'DONE' ? 'default' :
                                                issue.status === 'IN_PROGRESS' ? 'secondary' :
                                                    'outline'
                                        } className="text-xs">
                                            {issue.status === 'NEW' ? 'To Do' :
                                                issue.status === 'IN_PROGRESS' ? 'In Progress' :
                                                    'Done'}
                                        </Badge>
                                    </div>
                                    {edit ? (
                                        <Input
                                            value={form.title}
                                            onChange={(e) => handleChange("title", e.target.value)}
                                            className="text-lg md:text-xl font-semibold h-auto py-1"
                                        />
                                    ) : (
                                        <DialogTitle className="text-lg md:text-2xl font-bold pr-4 md:pr-8">
                                            {issue.title}
                                        </DialogTitle>
                                    )}
                                </div>
                                <div className="flex gap-1 md:gap-2 shrink-0">
                                    {!edit ? (
                                        <>
                                            <Button size="sm" variant="outline" onClick={() => setEdit(true)} className="hidden md:flex">
                                                <Edit className="mr-2 h-4 w-4" />
                                                Edit
                                            </Button>
                                            <Button size="sm" variant="outline" onClick={() => setEdit(true)} className="md:hidden">
                                                <Edit className="h-4 w-4" />
                                            </Button>
                                            <Button size="sm" variant="outline" className="text-destructive" onClick={handleDeleteIssue}>
                                                <Trash2 className="h-4 w-4" />
                                            </Button>
                                        </>
                                    ) : (
                                        <>
                                            <Button size="sm" onClick={handleSave} disabled={loading}>
                                                <Save className="h-4 w-4 md:mr-2" />
                                                <span className="hidden md:inline">Save</span>
                                            </Button>
                                            <Button size="sm" variant="outline" onClick={() => setEdit(false)}>
                                                <X className="h-4 w-4 md:mr-2" />
                                                <span className="hidden md:inline">Cancel</span>
                                            </Button>
                                        </>
                                    )}
                                </div>
                            </div>
                        </div>

                        {/* Content - Scrollable */}
                        <div className="flex-1 overflow-y-auto">
                            {/* Mobile: Single Column, Desktop: Two Columns */}
                            <div className="md:flex md:min-h-full">
                                {/* Main Content */}
                                <div className="flex-1 px-4 md:px-6 py-4 md:py-6 space-y-6">
                                    {/* Mobile: Details First (Compact Cards) */}
                                    <div className="md:hidden space-y-4">
                                        <Card>
                                            <CardContent className="p-4">
                                                <div className="grid grid-cols-2 gap-4">
                                                    {/* Status */}
                                                    <div>
                                                        <Label className="text-xs text-muted-foreground mb-2 block">
                                                            Status
                                                        </Label>
                                                        {edit ? (
                                                            <Select
                                                                value={form.status}
                                                                onValueChange={(v) => handleChange("status", v)}
                                                            >
                                                                <SelectTrigger className="h-9">
                                                                    <SelectValue />
                                                                </SelectTrigger>
                                                                <SelectContent>
                                                                    <SelectItem value="NEW">To Do</SelectItem>
                                                                    <SelectItem value="IN_PROGRESS">In Progress</SelectItem>
                                                                    <SelectItem value="DONE">Done</SelectItem>
                                                                </SelectContent>
                                                            </Select>
                                                        ) : (
                                                            <Badge variant={
                                                                issue.status === 'DONE' ? 'default' :
                                                                    issue.status === 'IN_PROGRESS' ? 'secondary' :
                                                                        'outline'
                                                            } className="text-xs">
                                                                {issue.status === 'NEW' ? 'To Do' :
                                                                    issue.status === 'IN_PROGRESS' ? 'In Progress' :
                                                                        'Done'}
                                                            </Badge>
                                                        )}
                                                    </div>

                                                    {/* Priority */}
                                                    <div>
                                                        <Label className="text-xs text-muted-foreground mb-2 block">
                                                            Priority
                                                        </Label>
                                                        {edit ? (
                                                            <Select
                                                                value={form.priority}
                                                                onValueChange={(v) => handleChange("priority", v)}
                                                            >
                                                                <SelectTrigger className="h-9">
                                                                    <SelectValue />
                                                                </SelectTrigger>
                                                                <SelectContent>
                                                                    <SelectItem value="HIGH">High</SelectItem>
                                                                    <SelectItem value="NORMAL">Normal</SelectItem>
                                                                    <SelectItem value="LOW">Low</SelectItem>
                                                                </SelectContent>
                                                            </Select>
                                                        ) : (
                                                            <Badge variant={
                                                                issue.priority === 'HIGH' ? 'destructive' :
                                                                    issue.priority === 'NORMAL' ? 'secondary' :
                                                                        'outline'
                                                            } className="text-xs">
                                                                {issue.priority}
                                                            </Badge>
                                                        )}
                                                    </div>
                                                </div>

                                                <Separator className="my-4" />

                                                {/* Assignee */}
                                                <div className="mb-4">
                                                    <Label className="text-xs text-muted-foreground mb-2 flex items-center gap-1">
                                                        <UserIcon className="h-3 w-3" />
                                                        Assignee
                                                    </Label>
                                                    {edit ? (
                                                        <Select
                                                            value={form.assigneeId}
                                                            onValueChange={(v) => handleChange("assigneeId", v)}
                                                        >
                                                            <SelectTrigger className="h-9">
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
                                                    ) : (
                                                        <p className="text-sm">
                                                            {assignedUser
                                                                ? `${assignedUser.firstName} ${assignedUser.lastName}`
                                                                : 'Unassigned'}
                                                        </p>
                                                    )}
                                                </div>

                                                {/* Team */}
                                                <div className="mb-4">
                                                    <Label className="text-xs text-muted-foreground mb-2 flex items-center gap-1">
                                                        <Users className="h-3 w-3" />
                                                        Team
                                                    </Label>
                                                    {edit ? (
                                                        <Select
                                                            value={form.teamId}
                                                            onValueChange={(v) => handleChange("teamId", v)}
                                                        >
                                                            <SelectTrigger className="h-9">
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
                                                    ) : (
                                                        <p className="text-sm">
                                                            {issue.team?.name || 'No team'}
                                                        </p>
                                                    )}
                                                </div>

                                                {/* Due Date */}
                                                <div>
                                                    <Label className="text-xs text-muted-foreground mb-2 flex items-center gap-1">
                                                        <Calendar className="h-3 w-3" />
                                                        Due Date
                                                    </Label>
                                                    {edit ? (
                                                        <Input
                                                            type="date"
                                                            value={form.dueDate}
                                                            onChange={(e) => handleChange("dueDate", e.target.value)}
                                                            className="h-9"
                                                        />
                                                    ) : (
                                                        <p className="text-sm">
                                                            {issue.dueDate
                                                                ? new Date(issue.dueDate).toLocaleDateString('en-US', {
                                                                    month: 'short',
                                                                    day: 'numeric',
                                                                    year: 'numeric'
                                                                })
                                                                : 'No due date'}
                                                        </p>
                                                    )}
                                                </div>
                                            </CardContent>
                                        </Card>
                                    </div>

                                    {/* Description */}
                                    <div>
                                        <Label className="text-base font-semibold mb-3 block">Description</Label>
                                        <Textarea
                                            rows={6}
                                            disabled={!edit}
                                            value={form.description}
                                            onChange={(e) => handleChange("description", e.target.value)}
                                            className={`min-h-[120px] md:min-h-[150px] ${!edit ? 'bg-muted/30' : ''}`}
                                            placeholder="Add a description..."
                                        />
                                    </div>

                                    <Separator />

                                    {/* Comments */}
                                    <div>
                                        <Label className="text-base font-semibold mb-4 block">Activity</Label>
                                        <CommentSection issueId={issue.id} />
                                    </div>
                                </div>

                                {/* Desktop Sidebar - Hidden on Mobile */}
                                <div className="hidden md:block w-[380px] border-l bg-muted/20 px-6 py-6">
                                    <div className="space-y-6">
                                        {/* Status */}
                                        <div>
                                            <Label className="text-sm font-medium text-muted-foreground mb-2 block">
                                                Status
                                            </Label>
                                            {edit ? (
                                                <Select
                                                    value={form.status}
                                                    onValueChange={(v) => handleChange("status", v)}
                                                >
                                                    <SelectTrigger>
                                                        <SelectValue />
                                                    </SelectTrigger>
                                                    <SelectContent>
                                                        <SelectItem value="NEW">To Do</SelectItem>
                                                        <SelectItem value="IN_PROGRESS">In Progress</SelectItem>
                                                        <SelectItem value="DONE">Done</SelectItem>
                                                    </SelectContent>
                                                </Select>
                                            ) : (
                                                <Badge variant={
                                                    issue.status === 'DONE' ? 'default' :
                                                        issue.status === 'IN_PROGRESS' ? 'secondary' :
                                                            'outline'
                                                } className="text-sm">
                                                    {issue.status === 'NEW' ? 'To Do' :
                                                        issue.status === 'IN_PROGRESS' ? 'In Progress' :
                                                            'Done'}
                                                </Badge>
                                            )}
                                        </div>

                                        <Separator />

                                        {/* Priority */}
                                        <div>
                                            <Label className="text-sm font-medium text-muted-foreground mb-2 flex items-center gap-2">
                                                <Tag className="h-4 w-4" />
                                                Priority
                                            </Label>
                                            {edit ? (
                                                <Select
                                                    value={form.priority}
                                                    onValueChange={(v) => handleChange("priority", v)}
                                                >
                                                    <SelectTrigger>
                                                        <SelectValue />
                                                    </SelectTrigger>
                                                    <SelectContent>
                                                        <SelectItem value="HIGH">High</SelectItem>
                                                        <SelectItem value="NORMAL">Normal</SelectItem>
                                                        <SelectItem value="LOW">Low</SelectItem>
                                                    </SelectContent>
                                                </Select>
                                            ) : (
                                                <Badge variant={
                                                    issue.priority === 'HIGH' ? 'destructive' :
                                                        issue.priority === 'NORMAL' ? 'secondary' :
                                                            'outline'
                                                }>
                                                    {issue.priority}
                                                </Badge>
                                            )}
                                        </div>

                                        <Separator />

                                        {/* Assignee */}
                                        <div>
                                            <Label className="text-sm font-medium text-muted-foreground mb-2 flex items-center gap-2">
                                                <UserIcon className="h-4 w-4" />
                                                Assignee
                                            </Label>
                                            {edit ? (
                                                <Select
                                                    value={form.assigneeId}
                                                    onValueChange={(v) => handleChange("assigneeId", v)}
                                                >
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
                                            ) : (
                                                <p className="text-sm">
                                                    {assignedUser
                                                        ? `${assignedUser.firstName} ${assignedUser.lastName}`
                                                        : 'Unassigned'}
                                                </p>
                                            )}
                                        </div>

                                        <Separator />

                                        {/* Team */}
                                        <div>
                                            <Label className="text-sm font-medium text-muted-foreground mb-2 flex items-center gap-2">
                                                <Users className="h-4 w-4" />
                                                Team
                                            </Label>
                                            {edit ? (
                                                <Select
                                                    value={form.teamId}
                                                    onValueChange={(v) => handleChange("teamId", v)}
                                                >
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
                                            ) : (
                                                <p className="text-sm">
                                                    {issue.team?.name || 'No team'}
                                                </p>
                                            )}
                                        </div>

                                        <Separator />

                                        {/* Due Date */}
                                        <div>
                                            <Label className="text-sm font-medium text-muted-foreground mb-2 flex items-center gap-2">
                                                <Calendar className="h-4 w-4" />
                                                Due Date
                                            </Label>
                                            {edit ? (
                                                <Input
                                                    type="date"
                                                    value={form.dueDate}
                                                    onChange={(e) => handleChange("dueDate", e.target.value)}
                                                />
                                            ) : (
                                                <p className="text-sm">
                                                    {issue.dueDate
                                                        ? new Date(issue.dueDate).toLocaleDateString('en-US', {
                                                            month: 'short',
                                                            day: 'numeric',
                                                            year: 'numeric'
                                                        })
                                                        : 'No due date'}
                                                </p>
                                            )}
                                        </div>

                                        <Separator />

                                        {/* Metadata */}
                                        <div className="pt-4">
                                            <p className="text-xs text-muted-foreground mb-1">
                                                Created {new Date(issue.createdAt).toLocaleDateString('en-US', {
                                                month: 'short',
                                                day: 'numeric',
                                                year: 'numeric',
                                                hour: '2-digit',
                                                minute: '2-digit'
                                            })}
                                            </p>
                                            {issue.updatedAt && (
                                                <p className="text-xs text-muted-foreground">
                                                    Updated {new Date(issue.updatedAt).toLocaleDateString('en-US', {
                                                    month: 'short',
                                                    day: 'numeric',
                                                    year: 'numeric',
                                                    hour: '2-digit',
                                                    minute: '2-digit'
                                                })}
                                                </p>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </>
                )}
            </DialogContent>
        </Dialog>
    );
}
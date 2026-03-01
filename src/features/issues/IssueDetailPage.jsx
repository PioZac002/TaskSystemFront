import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { AppLayout } from "@/components/layout/AppLayout";
import { Card, CardContent } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Label } from "@/components/ui/Label";
import { Textarea } from "@/components/ui/Textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/Select";
import { Badge } from "@/components/ui/Badge";
import { Separator } from "@/components/ui/Separator";
import { CommentSection } from "@/components/comments/CommentSection";
import { ActivityLog } from "@/components/activity/ActivityLog";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/Tabs";
import apiClient from "@/services/apiClient";
import { toast } from "sonner";
import {
    Edit, Save, X, Trash2, Calendar, User as UserIcon,
    Users, Tag
} from "lucide-react";
import { useIsMobile } from "@/hooks/use-mobile";

export default function IssueDetailPage() {
    const { id } = useParams();
    const navigate = useNavigate();
    const isMobile = useIsMobile();
    const [issue, setIssue] = useState(null);
    const [users, setUsers] = useState([]);
    const [teams, setTeams] = useState([]);
    const [edit, setEdit] = useState(false);
    const [loading, setLoading] = useState(false);
    const [inlineSaving, setInlineSaving] = useState(false);
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
        if (id) {
            loadData();
            setEdit(false);
        }
    }, [id]);

    const loadData = async () => {
        try {
            setLoading(true);
            const [issueRes, usersRes, teamsRes] = await Promise.all([
                apiClient.get(`/api/v1/issue/id/${id}`),
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
        } catch (error) {
            const errorMessage = error.response?.data?.Message || error.message || "Failed to update issue";
            toast.error(errorMessage);
            console.error('Update error:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async () => {
        if (!window.confirm("Are you sure you want to delete this issue? This action cannot be undone.")) {
            return;
        }
        try {
            await apiClient.delete(`/api/v1/issue/${issue.id}`);
            toast.success("Issue deleted successfully!");
            navigate('/issues');
        } catch (error) {
            const errorMessage = error.response?.data?.Message || error.message || "Failed to delete issue";
            toast.error(errorMessage);
        }
    };

    const handleInlineStatusChange = async (newStatus) => {
        if (newStatus === issue.status) return;
        setInlineSaving(true);
        try {
            await apiClient.put("/api/v1/issue/update-status", { issueId: Number(issue.id), newStatus });
            setIssue(prev => ({ ...prev, status: newStatus }));
            setForm(prev => ({ ...prev, status: newStatus }));
            toast.success("Status updated");
        } catch (e) {
            toast.error("Failed to update status");
        } finally {
            setInlineSaving(false);
        }
    };

    const handleInlinePriorityChange = async (newPriority) => {
        if (newPriority === issue.priority) return;
        setInlineSaving(true);
        try {
            await apiClient.put("/api/v1/issue/update-priority", { issueId: Number(issue.id), newPriority });
            setIssue(prev => ({ ...prev, priority: newPriority }));
            setForm(prev => ({ ...prev, priority: newPriority }));
            toast.success("Priority updated");
        } catch (e) {
            toast.error("Failed to update priority");
        } finally {
            setInlineSaving(false);
        }
    };

    if (loading && !issue) {
        return (
            <AppLayout>
                <div className="py-12 text-center text-muted-foreground">Loading...</div>
            </AppLayout>
        );
    }

    if (!issue) return null;

    const assignedUser = users.find(u => u.id === issue?.assigneeId);

    return (
        <AppLayout>
            <div className="space-y-6">
                {/* Header */}
                <div className="flex items-start justify-between gap-4">
                    <div className="flex items-start gap-3 flex-1 min-w-0">
                        <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 mb-1 flex-wrap">
                                <span className="text-sm font-mono text-muted-foreground">{issue.key}</span>
                                <Badge variant={
                                    issue.status === 'DONE' ? 'default' :
                                        issue.status === 'IN_PROGRESS' ? 'secondary' : 'outline'
                                } className="text-xs">
                                    {issue.status === 'NEW' ? 'To Do' :
                                        issue.status === 'IN_PROGRESS' ? 'In Progress' : 'Done'}
                                </Badge>
                            </div>
                            {edit ? (
                                <Input
                                    value={form.title}
                                    onChange={(e) => handleChange("title", e.target.value)}
                                    className="text-xl font-semibold h-auto py-1"
                                />
                            ) : (
                                <h1 className="text-2xl md:text-3xl font-bold" title={issue.title}>
                                    {issue.title.length > 70 ? issue.title.slice(0, 70) + '…' : issue.title}
                                </h1>
                            )}
                        </div>
                    </div>
                    <div className="flex gap-2 shrink-0">
                        {!edit ? (
                            <>
                                <Button size="sm" variant="outline" onClick={() => setEdit(true)}>
                                    <Edit className="mr-2 h-4 w-4" />
                                    Edit
                                </Button>
                                <Button size="sm" variant="outline" className="text-destructive" onClick={handleDelete}>
                                    <Trash2 className="h-4 w-4" />
                                </Button>
                            </>
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

                <div className="md:flex gap-6">
                    {/* Main Content */}
                    <div className="flex-1 space-y-6">
                        {/* Description */}
                        <div>
                            <Label className="text-base font-semibold mb-3 block">Description</Label>
                            <Textarea
                                rows={6}
                                disabled={!edit}
                                value={form.description}
                                onChange={(e) => handleChange("description", e.target.value)}
                                className={`min-h-[150px] ${!edit ? 'bg-muted/30' : ''}`}
                                placeholder="Add a description..."
                            />
                        </div>

                        <Separator />

                        {/* Activity Tabs */}
                        <Tabs defaultValue="comments">
                            <TabsList className="mb-4">
                                <TabsTrigger value="comments">Comments</TabsTrigger>
                                <TabsTrigger value="activity">Activity Log</TabsTrigger>
                            </TabsList>
                            <TabsContent value="comments">
                                <CommentSection issueId={issue.id} />
                            </TabsContent>
                            <TabsContent value="activity">
                                <ActivityLog issueId={issue.id} />
                            </TabsContent>
                        </Tabs>
                    </div>

                    {/* Sidebar */}
                    <div className="hidden md:block w-[320px] space-y-4">
                        <Card>
                            <CardContent className="pt-6 space-y-4">
                                {/* Status */}
                                <div>
                                    <Label className="text-sm font-medium text-muted-foreground mb-2 block">Status</Label>
                                    {edit ? (
                                        <Select value={form.status} onValueChange={(v) => handleChange("status", v)}>
                                            <SelectTrigger>
                                                <SelectValue />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="NEW">To Do</SelectItem>
                                                <SelectItem value="IN_PROGRESS">In Progress</SelectItem>
                                                <SelectItem value="DONE">Done</SelectItem>
                                            </SelectContent>
                                        </Select>
                                    ) : !isMobile ? (
                                        <Select value={issue.status} onValueChange={handleInlineStatusChange} disabled={inlineSaving}>
                                            <SelectTrigger className="w-full">
                                                <SelectValue>
                                                    {issue.status === 'NEW' ? 'To Do' :
                                                        issue.status === 'IN_PROGRESS' ? 'In Progress' : 'Done'}
                                                </SelectValue>
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
                                                issue.status === 'IN_PROGRESS' ? 'secondary' : 'outline'
                                        }>
                                            {issue.status === 'NEW' ? 'To Do' :
                                                issue.status === 'IN_PROGRESS' ? 'In Progress' : 'Done'}
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
                                        <Select value={form.priority} onValueChange={(v) => handleChange("priority", v)}>
                                            <SelectTrigger>
                                                <SelectValue />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="HIGH">High</SelectItem>
                                                <SelectItem value="NORMAL">Normal</SelectItem>
                                                <SelectItem value="LOW">Low</SelectItem>
                                            </SelectContent>
                                        </Select>
                                    ) : !isMobile ? (
                                        <Select value={issue.priority} onValueChange={handleInlinePriorityChange} disabled={inlineSaving}>
                                            <SelectTrigger className="w-full">
                                                <SelectValue>{issue.priority}</SelectValue>
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
                                                issue.priority === 'NORMAL' ? 'secondary' : 'outline'
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
                                        <Select value={form.assigneeId} onValueChange={(v) => handleChange("assigneeId", v)}>
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
                                        <Select value={form.teamId} onValueChange={(v) => handleChange("teamId", v)}>
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
                                        <p className="text-sm">{issue.team?.name || 'No team'}</p>
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
                                <div>
                                    <p className="text-xs text-muted-foreground mb-1">
                                        Created {new Date(issue.createdAt).toLocaleDateString('en-US', {
                                            month: 'short',
                                            day: 'numeric',
                                            year: 'numeric'
                                        })}
                                    </p>
                                    {issue.updatedAt && (
                                        <p className="text-xs text-muted-foreground">
                                            Updated {new Date(issue.updatedAt).toLocaleDateString('en-US', {
                                                month: 'short',
                                                day: 'numeric',
                                                year: 'numeric'
                                            })}
                                        </p>
                                    )}
                                </div>
                            </CardContent>
                        </Card>
                    </div>
                </div>
            </div>
        </AppLayout>
    );
}

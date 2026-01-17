import { useEffect, useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/Dialog";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Label } from "@/components/ui/Label";
import { Textarea } from "@/components/ui/Textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/Select";
import apiClient from "@/services/apiClient";
import { toast } from "@/hooks/use-toast";

export function IssueDetailsModal({ open, onOpenChange, issueId }) {
    const [issue, setIssue] = useState(null);
    const [users, setUsers] = useState([]);
    const [edit, setEdit] = useState(false);
    const [form, setForm] = useState({
        title: "",
        description: "",
        status: "",
        priority: "",
        dueDate: "",
        assigneeId: "",
    });

    useEffect(() => {
        if (open && issueId) {
            const getData = async () => {
                const [issueRes, usersRes] = await Promise.all([
                    apiClient.get(`/api/v1/issue/id/${issueId}`),
                    apiClient.get("/api/v1/user/all"),
                ]);
                setIssue(issueRes.data);
                setForm({
                    title: issueRes.data.title || "",
                    description: issueRes.data.description || "",
                    status: issueRes.data.status || "NEW",
                    priority: issueRes.data.priority || "NORMAL",
                    dueDate: issueRes.data.dueDate ? issueRes.data.dueDate.slice(0, 10) : "",
                    assigneeId: issueRes.data.assigneeId ? String(issueRes.data.assigneeId) : "",
                });
            };
            getData();
            setEdit(false);
        }
    }, [open, issueId]);

    const handleChange = (k, v) => setForm((f) => ({ ...f, [k]: v }));

    const handleSave = async () => {
        try {
            if (!issue) return;
            // Zmiana tytułu
            if (form.title !== issue.title) {
                await apiClient.put("/api/v1/issue/rename", {
                    issueId: Number(issue.id),
                    newTitle: form.title,
                });
            }
            // Zmiana statusu (Uwaga: pole musi być "NewStatus")
            if (form.status !== issue.status) {
                await apiClient.put("/api/v1/issue/update-status", {
                    issueId: Number(issue.id),
                    NewStatus: form.status,
                });
            }
            // Zmiana priorytetu
            if (form.priority !== issue.priority) {
                await apiClient.put("/api/v1/issue/update-priority", {
                    issueId: Number(issue.id),
                    NewPriority: form.priority,
                });
            }
            // Zmiana due date
            if (
                form.dueDate &&
                (!issue.dueDate || form.dueDate.slice(0, 10) !== issue.dueDate.slice(0, 10))
            ) {
                await apiClient.put("/api/v1/issue/update-due-date", {
                    issueId: Number(issue.id),
                    dueDate: form.dueDate,
                });
            }
            // Asignee (int)
            if (form.assigneeId && String(form.assigneeId) !== String(issue.assigneeId)) {
                await apiClient.put("/api/v1/issue/assign-team", {
                    issueId: Number(issue.id),
                    assigneeId: Number(form.assigneeId),
                });
            }
            // TODO: Jeśli masz endpoint do opisu – dodaj
            toast({ title: "Success", description: "Issue updated" });
            setEdit(false);
            // Odśwież dane po update
            const refreshed = await apiClient.get(`/api/v1/issue/id/${issue.id}`);
            setIssue(refreshed.data);
            setForm({
                title: refreshed.data.title || "",
                description: refreshed.data.description || "",
                status: refreshed.data.status || "NEW",
                priority: refreshed.data.priority || "NORMAL",
                dueDate: refreshed.data.dueDate ? refreshed.data.dueDate.slice(0, 10) : "",
                assigneeId: refreshed.data.assigneeId ? String(refreshed.data.assigneeId) : "",
            });
        } catch (e) {
            toast({ title: "Error", description: "Failed to save changes", variant: "destructive" });
        }
    };

    if (!issue) {
        return (
            <Dialog open={open} onOpenChange={onOpenChange}>
                <DialogContent><div className="text-muted-foreground">Loading...</div></DialogContent>
            </Dialog>
        );
    }

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-[600px] animate-scale-in overflow-y-auto max-h-[90vh]">
                <DialogHeader>
                    <DialogTitle>Issue Details</DialogTitle>
                </DialogHeader>
                <div className="space-y-4">
                    <Label>Title</Label>
                    <Input
                        disabled={!edit}
                        value={form.title}
                        onChange={e => handleChange("title", e.target.value)}
                    />
                    <Label>Description</Label>
                    <Textarea
                        rows={3}
                        disabled={!edit}
                        value={form.description}
                        onChange={e => handleChange("description", e.target.value)}
                    />
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <Label>Status</Label>
                            <Select
                                disabled={!edit}
                                value={form.status}
                                onValueChange={v => handleChange("status", v)}
                            >
                                <SelectTrigger>
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
                                onValueChange={v => handleChange("priority", v)}
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
                        </div>
                        <div>
                            <Label>Due Date</Label>
                            <Input
                                disabled={!edit}
                                type="date"
                                value={form.dueDate || ""}
                                onChange={e => handleChange("dueDate", e.target.value)}
                            />
                        </div>
                        <div>
                            <Label>Assignee</Label>
                            <Select
                                disabled={!edit}
                                value={form.assigneeId}
                                onValueChange={v => handleChange("assigneeId", v)}
                            >
                                <SelectTrigger>
                                    <SelectValue placeholder="Select user" />
                                </SelectTrigger>
                                <SelectContent>
                                    {users.map(user => (
                                        <SelectItem key={user.id} value={String(user.id)}>
                                            {user.firstName} {user.lastName}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                    </div>
                    <div>
                        <Button
                            variant="outline"
                            onClick={() => setEdit(e => !e)}
                            className="mr-2"
                        >{edit ? "Cancel" : "Edit"}</Button>
                        {edit && (
                            <Button
                                variant="gradient"
                                onClick={handleSave}
                            >Save</Button>
                        )}
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    );
}

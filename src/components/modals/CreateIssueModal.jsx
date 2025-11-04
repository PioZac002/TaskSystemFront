import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useIssueStore } from "@/store/issueStore";
import { useProjectStore } from "@/store/projectStore";
import { toast } from "@/hooks/use-toast";
import apiClient from "@/services/apiClient";

export function CreateIssueModal({ open, onOpenChange }) {
    const [title, setTitle] = useState("");
    const [description, setDescription] = useState("");
    const [priority, setPriority] = useState("medium");
    const [status, setStatus] = useState("todo");
    const [projectId, setProjectId] = useState("");
    const [assigneeId, setAssigneeId] = useState("");
    const [dueDate, setDueDate] = useState("");
    const [users, setUsers] = useState([]);

    const addIssue = useIssueStore((state) => state.addIssue);
    const projects = useProjectStore((state) => state.projects);

    // Fetch users (assignees)
    useEffect(() => {
        if (open) {
            apiClient.get("/api/v1/user/all").then(res => setUsers(res.data)).catch(() => setUsers([]));
        }
    }, [open]);

    // Optionally also fetch projects if nie masz gwarancji, że są w zustandzie
    // useEffect(() => { /* fetch projects if needed */ }, [open]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!title.trim()) {
            toast({ title: "Error", description: "Issue title is required", variant: "destructive" });
            return;
        }
        if (!projectId) {
            toast({ title: "Error", description: "Please select a project", variant: "destructive" });
            return;
        }
        await addIssue({
            title,
            description,
            status,
            priority,
            assigneeId,     // to jest id usera, nie string
            projectId,
            dueDate,
            labels: [],
        });

        toast({ title: "Success", description: "Issue created successfully" });
        setTitle("");
        setDescription("");
        setPriority("medium");
        setStatus("todo");
        setProjectId("");
        setAssigneeId("");
        setDueDate("");
        onOpenChange(false);
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-[550px] animate-scale-in max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                    <DialogTitle className="text-2xl">Create New Issue</DialogTitle>
                    <DialogDescription>Add a new task or issue to track</DialogDescription>
                </DialogHeader>
                <form onSubmit={handleSubmit} className="space-y-4 mt-4">
                    <div className="space-y-2">
                        <Label htmlFor="title">Title *</Label>
                        <Input id="title" placeholder="Fix login bug" value={title} onChange={e => setTitle(e.target.value)} />
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="description">Description</Label>
                        <Textarea id="description" placeholder="Describe the issue..." value={description} onChange={e => setDescription(e.target.value)} rows={3} />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label htmlFor="project">Project *</Label>
                            <Select value={projectId} onValueChange={setProjectId}>
                                <SelectTrigger>
                                    <SelectValue placeholder="Select project" />
                                </SelectTrigger>
                                <SelectContent>
                                    {projects.map((project) => (
                                        <SelectItem key={project.id} value={String(project.id)}>
                                            {project.shortName || project.name}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="priority">Priority</Label>
                            <Select value={priority} onValueChange={setPriority}>
                                <SelectTrigger>
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="low">Low</SelectItem>
                                    <SelectItem value="medium">Medium</SelectItem>
                                    <SelectItem value="high">High</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label htmlFor="status">Status</Label>
                            <Select value={status} onValueChange={setStatus}>
                                <SelectTrigger>
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="todo">To Do</SelectItem>
                                    <SelectItem value="inprogress">In Progress</SelectItem>
                                    <SelectItem value="review">Review</SelectItem>
                                    <SelectItem value="done">Done</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="assignee">Assignee</Label>
                            <Select value={assigneeId} onValueChange={setAssigneeId}>
                                <SelectTrigger>
                                    <SelectValue placeholder="Select user" />
                                </SelectTrigger>
                                <SelectContent>
                                    {users.map((user) => (
                                        <SelectItem key={user.id} value={String(user.id)}>
                                            {user.firstName} {user.lastName}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="dueDate">Due Date</Label>
                        <Input id="dueDate" type="date" value={dueDate} onChange={e => setDueDate(e.target.value)} />
                    </div>
                    <div className="flex gap-3 pt-4">
                        <Button type="button" variant="outline" onClick={() => onOpenChange(false)} className="flex-1">
                            Cancel
                        </Button>
                        <Button type="submit" variant="gradient" className="flex-1">
                            Create Issue
                        </Button>
                    </div>
                </form>
            </DialogContent>
        </Dialog>
    );
}

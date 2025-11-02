import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useProjectStore } from "@/store/projectStore";
import { toast } from "@/hooks/use-toast";

export function CreateProjectModal({ open, onOpenChange }) {
    const [name, setName] = useState("");
    const [description, setDescription] = useState("");
    const [dueDate, setDueDate] = useState("");
    const addProject = useProjectStore((state) => state.addProject);

    const handleSubmit = (e) => {
        e.preventDefault();
        if (!name.trim()) {
            toast({ title: "Error", description: "Project name is required", variant: "destructive" });
            return;
        }
        addProject({
            name,
            description,
            status: 'active',
            progress: 0,
            team: [],
            dueDate,
        });
        toast({ title: "Success", description: "Project created successfully" });
        setName("");
        setDescription("");
        setDueDate("");
        onOpenChange(false);
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-[500px] animate-scale-in">
                <DialogHeader>
                    <DialogTitle className="text-2xl">Create New Project</DialogTitle>
                    <DialogDescription>
                        Add a new project to your workspace
                    </DialogDescription>
                </DialogHeader>
                <form onSubmit={handleSubmit} className="space-y-4 mt-4">
                    <div className="space-y-2">
                        <Label htmlFor="name">Project Name *</Label>
                        <Input
                            id="name"
                            placeholder="Website Redesign"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                        />
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="description">Description</Label>
                        <Textarea
                            id="description"
                            placeholder="Describe your project..."
                            value={description}
                            onChange={(e) => setDescription(e.target.value)}
                            rows={4}
                        />
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="dueDate">Due Date</Label>
                        <Input
                            id="dueDate"
                            type="date"
                            value={dueDate}
                            onChange={(e) => setDueDate(e.target.value)}
                        />
                    </div>
                    <div className="flex gap-3 pt-4">
                        <Button
                            type="button"
                            variant="outline"
                            onClick={() => onOpenChange(false)}
                            className="flex-1"
                        >
                            Cancel
                        </Button>
                        <Button type="submit" variant="gradient" className="flex-1">
                            Create Project
                        </Button>
                    </div>
                </form>
            </DialogContent>
        </Dialog>
    );
}

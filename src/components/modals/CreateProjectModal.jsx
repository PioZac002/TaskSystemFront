import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/Dialog";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Label } from "@/components/ui/Label";
import { Textarea } from "@/components/ui/Textarea";
import { useProjectStore } from "@/store/projectStore";
import { toast } from "sonner";

export function CreateProjectModal({ open, onOpenChange }) {
    const [shortName, setShortName] = useState("");
    const [description, setDescription] = useState("");
    const [loading, setLoading] = useState(false);
    const createProject = useProjectStore((state) => state.createProject);

    const handleSubmit = async (e) => {
        e.preventDefault();

        // Walidacja
        if (!shortName. trim()) {
            toast.error("Project short name is required");
            return;
        }

        if (shortName.length > 6) {
            toast.error("Short name must be max 6 characters");
            return;
        }

        setLoading(true);

        try {
            await createProject({
                shortName:  shortName.trim().toUpperCase(),
                description:  description.trim() || null
            });

            toast. success("Project created successfully!");

            // Reset form
            setShortName("");
            setDescription("");
            onOpenChange(false);
        } catch (error) {
            const errorMessage = error.response?.data?.Message || error.message || "Failed to create project";
            toast.error(errorMessage);
        } finally {
            setLoading(false);
        }
    };

    const handleShortNameChange = (e) => {
        const value = e.target.value. toUpperCase();
        if (value.length <= 6) {
            setShortName(value);
        }
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-[500px]">
                <DialogHeader>
                    <DialogTitle>Create New Project</DialogTitle>
                </DialogHeader>
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="space-y-2">
                        <Label htmlFor="shortName">
                            Short Name <span className="text-destructive">*</span>
                        </Label>
                        <Input
                            id="shortName"
                            placeholder="e.g., PROJ, APP, WEB"
                            value={shortName}
                            onChange={handleShortNameChange}
                            maxLength={6}
                            required
                            className="font-mono uppercase"
                        />
                        <p className="text-xs text-muted-foreground">
                            {shortName.length}/6 characters • Used in issue keys (e.g., {shortName || 'PROJ'}-1, {shortName || 'PROJ'}-2)
                        </p>
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="description">Description (optional)</Label>
                        <Textarea
                            id="description"
                            placeholder="Describe your project..."
                            value={description}
                            onChange={(e) => setDescription(e. target.value)}
                            rows={4}
                        />
                    </div>

                    <div className="flex justify-end gap-3">
                        <Button
                            type="button"
                            variant="outline"
                            onClick={() => onOpenChange(false)}
                            disabled={loading}
                        >
                            Cancel
                        </Button>
                        <Button type="submit" disabled={loading || !shortName.trim()}>
                            {loading ? "Creating..." : "Create Project"}
                        </Button>
                    </div>
                </form>
            </DialogContent>
        </Dialog>
    );
}
import { useState, useEffect } from "react";
import { DragDropContext, Droppable, Draggable } from "@hello-pangea/dnd";
import { AppLayout } from "@/components/layout/AppLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Plus, ChevronLeft, ChevronRight } from "lucide-react";
import { useIssueStore } from "@/store/issueStore";
import { useProjectStore } from "@/store/projectStore";
import { CreateIssueModal } from "@/components/modals/CreateIssueModal";
import { IssueDetailsModal } from "@/components/modals/IssueDetailsModal";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/Select";
import apiClient from "@/services/apiClient";
import { toast } from "sonner";

const columns = [
    { id: "NEW", title: "To Do", color: "border-l-4 border-l-slate-400" },
    { id: "IN_PROGRESS", title: "In Progress", color: "border-l-4 border-l-blue-500" },
    { id: "DONE", title:  "Done", color: "border-l-4 border-l-green-500" },
];

export default function Board() {
    const { issues, fetchIssues } = useIssueStore();
    const { projects, fetchProjects } = useProjectStore();
    const [selectedProjectId, setSelectedProjectId] = useState("all");
    const [createModalOpen, setCreateModalOpen] = useState(false);
    const [selectedIssueId, setSelectedIssueId] = useState(null);
    const [activeColumnIndex, setActiveColumnIndex] = useState(0);

    useEffect(() => {
        fetchIssues();
        fetchProjects();
    }, []);

    const filteredIssues = selectedProjectId === "all"
        ? issues
        :  issues.filter(i => i.projectId === Number(selectedProjectId));

    const handleDragEnd = async (result) => {
        const { destination, source, draggableId } = result;

        if (!destination) return;
        if (destination.droppableId === source.droppableId) return;

        const issueId = Number(draggableId);
        const newStatus = destination.droppableId;

        try {
            await apiClient.put("/api/v1/issue/update-status", {
                issueId,
                newStatus,
            });
            toast.success("Status updated!");
            fetchIssues();
        } catch (error) {
            toast.error("Failed to update status");
            console.error(error);
        }
    };

    return (
        <AppLayout>
            <div className="space-y-4 sm:space-y-6">
                {/* Header */}
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 sm:gap-4">
                    <div>
                        <h1 className="text-2xl sm:text-3xl font-bold">Board</h1>
                        <p className="text-sm sm:text-base text-muted-foreground">Kanban board with drag & drop</p>
                    </div>
                    <div className="flex flex-col sm:flex-row gap-2 sm:gap-3">
                        <Select value={selectedProjectId} onValueChange={setSelectedProjectId}>
                            <SelectTrigger className="w-full sm:w-[200px]">
                                <SelectValue placeholder="Select project" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="all">All Projects</SelectItem>
                                {projects.map((project) => (
                                    <SelectItem key={project.id} value={String(project.id)}>
                                        {project.shortName}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                        <Button onClick={() => setCreateModalOpen(true)} className="w-full sm: w-auto">
                            <Plus className="mr-2 h-4 w-4" />
                            <span className="sm:hidden">Issue</span>
                            <span className="hidden sm:inline">New Issue</span>
                        </Button>
                    </div>
                </div>

                {/* Mobile - Karuzela */}
                <div className="md:hidden">
                    <div className="flex items-center justify-between mb-4">
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={() => setActiveColumnIndex(prev => Math.max(0, prev - 1))}
                            disabled={activeColumnIndex === 0}
                        >
                            <ChevronLeft className="h-4 w-4" />
                        </Button>
                        <div className="text-center">
                            <h2 className="font-semibold">{columns[activeColumnIndex].title}</h2>
                            <p className="text-xs text-muted-foreground">
                                {activeColumnIndex + 1} / {columns.length}
                            </p>
                        </div>
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={() => setActiveColumnIndex(prev => Math.min(columns.length - 1, prev + 1))}
                            disabled={activeColumnIndex === columns.length - 1}
                        >
                            <ChevronRight className="h-4 w-4" />
                        </Button>
                    </div>

                    {/* Render tylko aktywną kolumnę */}
                    <Card className={columns[activeColumnIndex].color}>
                        <CardHeader className="border-b">
                            <div className="flex items-center justify-between">
                                <CardTitle className="text-lg">{columns[activeColumnIndex].title}</CardTitle>
                                <Badge variant="secondary">
                                    {filteredIssues.filter(i => i.status === columns[activeColumnIndex].id).length}
                                </Badge>
                            </div>
                        </CardHeader>
                        <CardContent className="p-3 space-y-2 min-h-[400px]">
                            {filteredIssues
                                .filter(issue => issue.status === columns[activeColumnIndex].id)
                                .map((issue) => (
                                    <Card
                                        key={issue.id}
                                        className="cursor-pointer hover:shadow-lg transition-shadow bg-card"
                                        onClick={() => setSelectedIssueId(issue.id)}
                                    >
                                        <CardContent className="p-3">
                                            <p className="font-mono text-xs text-muted-foreground mb-1">
                                                {issue.key}
                                            </p>
                                            <h3 className="font-semibold text-sm mb-2 line-clamp-2">
                                                {issue.title}
                                            </h3>
                                            <Badge
                                                variant={
                                                    issue.priority === "HIGH" ? "destructive" :
                                                        issue.priority === "NORMAL" ? "secondary" :  "outline"
                                                }
                                                className="text-xs"
                                            >
                                                {issue.priority}
                                            </Badge>
                                        </CardContent>
                                    </Card>
                                ))}
                        </CardContent>
                    </Card>
                </div>

                {/* Desktop - Drag & Drop */}
                <DragDropContext onDragEnd={handleDragEnd}>
                    <div className="hidden md:grid md:grid-cols-3 gap-4">
                        {columns.map((column) => {
                            const columnIssues = filteredIssues. filter(i => i.status === column.id);

                            return (
                                <Card key={column.id} className={column.color}>
                                    <CardHeader className="border-b">
                                        <div className="flex items-center justify-between">
                                            <CardTitle className="text-lg">{column.title}</CardTitle>
                                            <Badge variant="secondary">{columnIssues.length}</Badge>
                                        </div>
                                    </CardHeader>
                                    <Droppable droppableId={column.id}>
                                        {(provided, snapshot) => (
                                            <CardContent
                                                ref={provided.innerRef}
                                                {... provided.droppableProps}
                                                className={`p-3 space-y-2 min-h-[500px] transition-colors ${
                                                    snapshot. isDraggingOver ? "bg-accent/30" : ""
                                                }`}
                                            >
                                                {columnIssues.map((issue, index) => (
                                                    <Draggable
                                                        key={issue.id}
                                                        draggableId={String(issue.id)}
                                                        index={index}
                                                    >
                                                        {(provided, snapshot) => (
                                                            <Card
                                                                ref={provided.innerRef}
                                                                {...provided.draggableProps}
                                                                {...provided.dragHandleProps}
                                                                className={`cursor-pointer hover:shadow-lg transition-all bg-card ${
                                                                    snapshot.isDragging ? "shadow-2xl rotate-2" : ""
                                                                }`}
                                                                onClick={() => setSelectedIssueId(issue.id)}
                                                            >
                                                                <CardContent className="p-3">
                                                                    <p className="font-mono text-xs text-muted-foreground mb-1">
                                                                        {issue.key}
                                                                    </p>
                                                                    <h3 className="font-semibold text-sm mb-2 line-clamp-2">
                                                                        {issue.title}
                                                                    </h3>
                                                                    <Badge
                                                                        variant={
                                                                            issue.priority === "HIGH" ? "destructive" :
                                                                                issue. priority === "NORMAL" ? "secondary" : "outline"
                                                                        }
                                                                        className="text-xs"
                                                                    >
                                                                        {issue.priority}
                                                                    </Badge>
                                                                </CardContent>
                                                            </Card>
                                                        )}
                                                    </Draggable>
                                                ))}
                                                {provided.placeholder}
                                            </CardContent>
                                        )}
                                    </Droppable>
                                </Card>
                            );
                        })}
                    </div>
                </DragDropContext>
            </div>

            <CreateIssueModal open={createModalOpen} onOpenChange={setCreateModalOpen} />
            <IssueDetailsModal
                open={!! selectedIssueId}
                onOpenChange={() => setSelectedIssueId(null)}
                issueId={selectedIssueId}
                onIssueDeleted={() => {
                    setSelectedIssueId(null);
                    fetchIssues();
                }}
            />
        </AppLayout>
    );
}
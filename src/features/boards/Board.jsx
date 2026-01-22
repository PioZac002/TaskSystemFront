import { useState, useEffect } from "react";
import { AppLayout } from "@/components/layout/AppLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/Select";
import { Plus, MoreHorizontal } from "lucide-react";
import {
    DndContext,
    DragOverlay,
    PointerSensor,
    useSensor,
    useSensors,
    closestCorners,
} from "@dnd-kit/core";

import { SortableContext, verticalListSortingStrategy } from "@dnd-kit/sortable";
import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { useIssueStore } from "@/store/issueStore";
import { useProjectStore } from "@/store/projectStore";
import { CreateIssueModal } from "@/components/modals/CreateIssueModal";
import { IssueDetailsModal } from "@/components/modals/IssueDetailsModal";
import { toast } from "sonner";

// Kolumny Kanban (usunięto Review)
const columns = [
    { id: "NEW", title: "To Do", variant: "todo" },
    { id: "IN_PROGRESS", title: "In Progress", variant: "inprogress" },
    { id: "DONE", title: "Done", variant: "done" },
];

// POJEDYNCZY TASK z Drag & Sort
function TaskCard({ task, onClick }) {
    const {
        attributes,
        listeners,
        setNodeRef,
        transform,
        transition,
        isDragging,
    } = useSortable({ id: task.id });

    const style = {
        transform: CSS.Transform.toString(transform),
        transition,
        opacity: isDragging ? 0.5 : 1,
    };

    const priorityColors = {
        HIGH: "destructive",
        NORMAL: "secondary",
        LOW: "outline"
    };

    return (
        <div ref={setNodeRef} style={style} {...attributes} {...listeners}>
            <Card 
                className="group hover:shadow-lg transition-all duration-200 cursor-grab active:cursor-grabbing hover:scale-105 bg-gradient-to-br from-card to-card/80"
                onClick={() => {
                    // Only trigger onClick if not dragging
                    if (!isDragging && onClick) {
                        onClick();
                    }
                }}
            >
                <CardContent className="p-4 space-y-3">
                    <div className="flex items-start justify-between gap-2">
                        <h3 className="font-semibold text-sm leading-tight group-hover:text-primary transition-colors">
                            {task.title}
                        </h3>
                        <Badge
                            variant={priorityColors[task.priority] || "secondary"}
                            className="text-xs shrink-0"
                        >
                            {task.priority}
                        </Badge>
                    </div>
                    {task.description && (
                        <p className="text-xs text-muted-foreground line-clamp-2">{task.description}</p>
                    )}
                    <div className="flex items-center justify-between pt-2 border-t border-border">
                        <div className="flex items-center gap-3 text-xs text-muted-foreground">
                            <span className="font-mono">{task.key}</span>
                            {task.assigneeId && (
                                <div className="flex items-center gap-1">
                                    <span>User #{task.assigneeId}</span>
                                </div>
                            )}
                        </div>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}

export default function Board() {
    const [createModalOpen, setCreateModalOpen] = useState(false);
    const [activeTask, setActiveTask] = useState(null);
    const [selectedProjectId, setSelectedProjectId] = useState("");
    const [selectedIssueId, setSelectedIssueId] = useState(null);
    const [activeColumnIndex, setActiveColumnIndex] = useState(0);
    
    const { issues, fetchIssues, updateIssueStatus } = useIssueStore();
    const { projects, fetchProjects } = useProjectStore();

    useEffect(() => {
        fetchProjects();
        fetchIssues();
    }, []);

    const sensors = useSensors(
        useSensor(PointerSensor, {
            activationConstraint: {
                distance: 8,
            },
        })
    );

    // Filter issues by selected project
    const projectIssues = selectedProjectId
        ? issues.filter(issue => String(issue.projectId) === selectedProjectId)
        : [];

    const handleDragStart = (event) => {
        const task = projectIssues.find((t) => t.id === event.active.id);
        setActiveTask(task || null);
    };

    const handleDragEnd = async (event) => {
        const { active, over } = event;

        if (!over) {
            setActiveTask(null);
            return;
        }

        const taskId = active.id;
        const newStatus = over.id;

        // Find the task being moved
        const task = projectIssues.find(t => t.id === taskId);
        
        if (task && task.status !== newStatus) {
            try {
                await updateIssueStatus(taskId, newStatus);
                toast.success("Issue status updated!");
                await fetchIssues(); // Refresh to get updated data
            } catch (error) {
                toast.error("Failed to update issue status");
                console.error(error);
            }
        }

        setActiveTask(null);
    };
    return (
        <AppLayout>
            <div className="space-y-6 animate-fade-in h-[calc(100vh-8rem)]">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                    <div>
                        <h1 className="text-3xl sm:text-4xl font-bold tracking-tight">Board</h1>
                        <p className="text-muted-foreground mt-2">Visualize your workflow with Kanban board.</p>
                    </div>
                    <Button
                        variant="gradient"
                        onClick={() => setCreateModalOpen(true)}
                        className="w-full sm:w-auto"
                        disabled={!selectedProjectId}
                    >
                        <Plus className="mr-2 h-4 w-4" />
                        New Task
                    </Button>
                </div>

                {/* Project Selector */}
                <Card>
                    <CardContent className="pt-6">
                        <div className="flex items-center gap-4">
                            <label className="text-sm font-medium">Select Project:</label>
                            <Select value={selectedProjectId} onValueChange={setSelectedProjectId}>
                                <SelectTrigger className="w-full sm:w-[300px]">
                                    <SelectValue placeholder="Choose a project to view its board" />
                                </SelectTrigger>
                                <SelectContent>
                                    {projects.map((project) => (
                                        <SelectItem key={project.id} value={String(project.id)}>
                                            {project.shortName} - {project.description?.substring(0, 30) || 'No description'}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                    </CardContent>
                </Card>

                {!selectedProjectId ? (
                    <Card>
                        <CardContent className="py-12 text-center">
                            <p className="text-muted-foreground">
                                Please select a project to view its Kanban board
                            </p>
                        </CardContent>
                    </Card>
                ) : (
                    <DndContext 
                        sensors={sensors} 
                        onDragStart={handleDragStart} 
                        onDragEnd={handleDragEnd}
                        collisionDetection={closestCorners}
                    >
                        {/* Mobile - Carousel */}
                        <div className="md:hidden space-y-4">
                            <div className="flex items-center justify-between">
                                <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => setActiveColumnIndex(prev => Math.max(0, prev - 1))}
                                    disabled={activeColumnIndex === 0}
                                >
                                    ← Prev
                                </Button>
                                <h2 className="text-lg font-semibold">{columns[activeColumnIndex].title}</h2>
                                <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => setActiveColumnIndex(prev => Math.min(columns.length - 1, prev + 1))}
                                    disabled={activeColumnIndex === columns.length - 1}
                                >
                                    Next →
                                </Button>
                            </div>
                            {(() => {
                                const column = columns[activeColumnIndex];
                                const columnIssues = projectIssues.filter((issue) => issue.status === column.id);
                                
                                return (
                                    <Card className="h-full flex flex-col border-border/50">
                                        <CardHeader className="border-b border-border">
                                            <div className="flex items-center justify-between">
                                                <div className="flex items-center gap-2">
                                                    <Badge variant={column.variant} className="rounded-full">
                                                        {columnIssues.length}
                                                    </Badge>
                                                    <CardTitle className="text-base font-semibold">{column.title}</CardTitle>
                                                </div>
                                            </div>
                                        </CardHeader>
                                        <CardContent className="flex-1 overflow-y-auto p-3 space-y-3 max-h-[calc(100vh-20rem)]">
                                            {columnIssues.map((task) => (
                                                <Card 
                                                    key={task.id}
                                                    className="group hover:shadow-lg transition-all duration-200 cursor-pointer hover:scale-105 bg-gradient-to-br from-card to-card/80"
                                                    onClick={() => setSelectedIssueId(task.id)}
                                                >
                                                    <CardContent className="p-4 space-y-3">
                                                        <div className="flex items-start justify-between gap-2">
                                                            <h3 className="font-semibold text-sm leading-tight group-hover:text-primary transition-colors">
                                                                {task.title}
                                                            </h3>
                                                            <Badge
                                                                variant={
                                                                    task.priority === 'HIGH' ? 'destructive' :
                                                                    task.priority === 'NORMAL' ? 'secondary' :
                                                                    'outline'
                                                                }
                                                                className="text-xs shrink-0"
                                                            >
                                                                {task.priority}
                                                            </Badge>
                                                        </div>
                                                        {task.description && (
                                                            <p className="text-xs text-muted-foreground line-clamp-2">{task.description}</p>
                                                        )}
                                                        <div className="flex items-center justify-between pt-2 border-t border-border">
                                                            <div className="flex items-center gap-3 text-xs text-muted-foreground">
                                                                <span className="font-mono">{task.key}</span>
                                                                {task.assigneeId && (
                                                                    <div className="flex items-center gap-1">
                                                                        <span>User #{task.assigneeId}</span>
                                                                    </div>
                                                                )}
                                                            </div>
                                                        </div>
                                                    </CardContent>
                                                </Card>
                                            ))}
                                            {columnIssues.length === 0 && (
                                                <div className="text-center py-8 text-muted-foreground text-sm">
                                                    No issues
                                                </div>
                                            )}
                                        </CardContent>
                                    </Card>
                                );
                            })()}
                        </div>

                        {/* Desktop - Grid with Drag & Drop */}
                        <div className="hidden md:flex gap-4 md:gap-6 overflow-x-auto pb-4 h-full">
                            {columns.map((column) => {
                                const columnIssues = projectIssues.filter((issue) => issue.status === column.id);

                                return (
                                    <div key={column.id} className="flex-shrink-0 w-72 md:w-80">
                                        <Card className="h-full flex flex-col border-border/50">
                                            <CardHeader className="border-b border-border">
                                                <div className="flex items-center justify-between">
                                                    <div className="flex items-center gap-2">
                                                        <Badge variant={column.variant} className="rounded-full">
                                                            {columnIssues.length}
                                                        </Badge>
                                                        <CardTitle className="text-base font-semibold">{column.title}</CardTitle>
                                                    </div>
                                                    <Button variant="ghost" size="icon" className="h-8 w-8">
                                                        <MoreHorizontal className="h-4 w-4" />
                                                    </Button>
                                                </div>
                                            </CardHeader>
                                            <SortableContext items={columnIssues.map((t) => t.id)} strategy={verticalListSortingStrategy}>
                                                <CardContent className="flex-1 overflow-y-auto p-3 space-y-3" id={column.id}>
                                                    {columnIssues.map((task) => (
                                                        <TaskCard 
                                                            key={task.id} 
                                                            task={task} 
                                                            onClick={() => setSelectedIssueId(task.id)}
                                                        />
                                                    ))}
                                                    {columnIssues.length === 0 && (
                                                        <div className="text-center py-8 text-muted-foreground text-sm">
                                                            No issues
                                                        </div>
                                                    )}
                                                </CardContent>
                                            </SortableContext>
                                        </Card>
                                    </div>
                                );
                            })}
                        </div>
                        <DragOverlay>
                            {activeTask ? (
                                <div className="w-72 md:w-80 opacity-90">
                                    <TaskCard task={activeTask} />
                                </div>
                            ) : null}
                        </DragOverlay>
                    </DndContext>
                )}
            </div>
            
            <CreateIssueModal 
                open={createModalOpen} 
                onOpenChange={setCreateModalOpen} 
                preSelectedProjectId={selectedProjectId ? Number(selectedProjectId) : null}
                onIssueCreated={() => fetchIssues()}
            />
            
            <IssueDetailsModal
                open={!!selectedIssueId}
                onOpenChange={() => setSelectedIssueId(null)}
                issueId={selectedIssueId}
                onIssueDeleted={() => {
                    setSelectedIssueId(null);
                    fetchIssues();
                }}
                onIssueUpdated={() => {
                    fetchIssues();
                }}
            />
        </AppLayout>
    );
}

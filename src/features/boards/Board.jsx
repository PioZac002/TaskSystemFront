import { useState } from "react";
import { AppLayout } from "@/components/layout/AppLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { Avatar, AvatarFallback } from "@/components/ui/Avatar";
import { Button } from "@/components/ui/Button";
import { Plus, MoreHorizontal, Clock, MessageSquare } from "lucide-react";
import { cn } from "@/lib/utils";
import {
    DndContext,
    DragOverlay,
    PointerSensor,
    useSensor,
    useSensors,
} from "@dnd-kit/core";

import { SortableContext, verticalListSortingStrategy } from "@dnd-kit/sortable";
import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { useIssueStore } from "@/store/issueStore";
import { CreateIssueModal } from "@/components/modals/CreateIssueModal";

// Kolumny Kanban
const columns = [
    { id: "todo", title: "To Do", variant: "todo" },
    { id: "inprogress", title: "In Progress", variant: "inprogress" },
    { id: "review", title: "Review", variant: "warning" },
    { id: "done", title: "Done", variant: "done" },
];

// POJEDYNCZY TASK z Drag & Sort
function TaskCard({ task }) {
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

    return (
        <div ref={setNodeRef} style={style} {...attributes} {...listeners}>
            <Card className="group hover:shadow-lg transition-all duration-200 cursor-grab active:cursor-grabbing hover:scale-105 bg-gradient-to-br from-card to-card/80">
                <CardContent className="p-4 space-y-3">
                    <div className="flex items-start justify-between gap-2">
                        <h3 className="font-semibold text-sm leading-tight group-hover:text-primary transition-colors">
                            {task.title}
                        </h3>
                        <Badge
                            variant={
                                task.priority === "high"
                                    ? "destructive"
                                    : task.priority === "medium"
                                        ? "warning"
                                        : "secondary"
                            }
                            className="text-xs shrink-0"
                        >
                            {task.priority}
                        </Badge>
                    </div>
                    <p className="text-xs text-muted-foreground line-clamp-2">{task.description}</p>
                    <div className="flex flex-wrap gap-1">
                        {task.labels.map((label, idx) => (
                            <Badge key={idx} variant="outline" className="text-xs px-2 py-0">
                                {label}
                            </Badge>
                        ))}
                    </div>
                    <div className="flex items-center justify-between pt-2 border-t border-border">
                        <div className="flex items-center gap-3 text-xs text-muted-foreground">
                            <div className="flex items-center gap-1">
                                <Clock className="h-3 w-3" />
                                {task.dueDate}
                            </div>
                            <div className="flex items-center gap-1">
                                <MessageSquare className="h-3 w-3" />
                                {task.comments}
                            </div>
                        </div>
                        <Avatar className="h-6 w-6">
                            <AvatarFallback className="bg-primary text-primary-foreground text-xs">
                                {task.assignee}
                            </AvatarFallback>
                        </Avatar>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}

export default function Board() {
    const [createModalOpen, setCreateModalOpen] = useState(false);
    const [activeTask, setActiveTask] = useState(null);
    const issues = useIssueStore((state) => state.issues);
    const moveIssue = useIssueStore((state) => state.moveIssue);

    const sensors = useSensors(
        useSensor(PointerSensor, {
            activationConstraint: {
                distance: 8,
            },
        })
    );

    const handleDragStart = (event) => {
        const task = issues.find((t) => t.id === event.active.id);
        setActiveTask(task || null);
    };

    const handleDragEnd = (event) => {
        const { active, over } = event;

        if (!over) return;

        const taskId = active.id;
        const newStatus = over.id;

        moveIssue(taskId, newStatus);
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
                    >
                        <Plus className="mr-2 h-4 w-4" />
                        New Task
                    </Button>
                </div>

                <DndContext sensors={sensors} onDragStart={handleDragStart} onDragEnd={handleDragEnd}>
                    <div className="flex gap-4 md:gap-6 overflow-x-auto pb-4 h-full">
                        {columns.map((column) => {
                            const columnIssues = issues.filter((issue) => issue.status === column.id);

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
                                                    <TaskCard key={task.id} task={task} />
                                                ))}
                                                <Button
                                                    variant="ghost"
                                                    onClick={() => setCreateModalOpen(true)}
                                                    className="w-full border-2 border-dashed border-border hover:border-primary hover:bg-accent/50 transition-all duration-200"
                                                >
                                                    <Plus className="mr-2 h-4 w-4" />
                                                    Add Task
                                                </Button>
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
            </div>
            <CreateIssueModal open={createModalOpen} onOpenChange={setCreateModalOpen} />
        </AppLayout>
    );
}

import React from "react";
import { AppLayout } from "@/components/layout/AppLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Plus, MoreHorizontal, Clock, MessageSquare } from "lucide-react";
import { cn } from "@/lib/utils";

const columns = [
    { id: "todo", title: "To Do", variant: "todo", count: 5 },
    { id: "inprogress", title: "In Progress", variant: "inprogress", count: 8 },
    { id: "review", title: "Review", variant: "warning", count: 3 },
    { id: "done", title: "Done", variant: "done", count: 12 },
];

const tasks = {
    todo: [
        {
            id: 1,
            title: "Design new landing page",
            description: "Create wireframes and mockups for the new landing page",
            priority: "high",
            assignee: "JD",
            comments: 3,
            dueDate: "2 days",
            labels: ["design", "frontend"],
        },
        {
            id: 2,
            title: "Setup CI/CD pipeline",
            description: "Configure automated deployment workflow",
            priority: "medium",
            assignee: "MT",
            comments: 1,
            dueDate: "5 days",
            labels: ["devops"],
        },
    ],
    inprogress: [
        {
            id: 3,
            title: "Implement authentication",
            description: "Add JWT-based authentication system",
            priority: "high",
            assignee: "SM",
            comments: 7,
            dueDate: "Today",
            labels: ["backend", "security"],
        },
        {
            id: 4,
            title: "Create API documentation",
            description: "Document all REST API endpoints",
            priority: "medium",
            assignee: "AK",
            comments: 2,
            dueDate: "3 days",
            labels: ["documentation"],
        },
        {
            id: 5,
            title: "Optimize database queries",
            description: "Improve query performance and add indexes",
            priority: "low",
            assignee: "LK",
            comments: 0,
            dueDate: "1 week",
            labels: ["backend", "performance"],
        },
    ],
    review: [
        {
            id: 6,
            title: "Mobile responsive fixes",
            description: "Fix responsive layout issues on mobile devices",
            priority: "high",
            assignee: "RB",
            comments: 5,
            dueDate: "Today",
            labels: ["frontend", "bug"],
        },
    ],
    done: [
        {
            id: 7,
            title: "User profile page",
            description: "Complete user profile management interface",
            priority: "medium",
            assignee: "JD",
            comments: 8,
            dueDate: "Completed",
            labels: ["frontend"],
        },
        {
            id: 8,
            title: "Payment gateway integration",
            description: "Integrate Stripe payment processing",
            priority: "high",
            assignee: "MT",
            comments: 12,
            dueDate: "Completed",
            labels: ["backend", "payment"],
        },
    ],
};

export default function Board() {
    return (
        <AppLayout>
            <div className="space-y-6 animate-fade-in h-[calc(100vh-8rem)]">
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-4xl font-bold tracking-tight">Board</h1>
                        <p className="text-muted-foreground mt-2">Visualize your workflow with Kanban board.</p>
                    </div>
                    <Button variant="gradient">
                        <Plus className="mr-2 h-4 w-4" />
                        New Task
                    </Button>
                </div>

                <div className="flex gap-6 overflow-x-auto pb-4 h-full">
                    {columns.map((column) => (
                        <div key={column.id} className="flex-shrink-0 w-80">
                            <Card className="h-full flex flex-col border-border/50">
                                <CardHeader className="border-b border-border">
                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center gap-2">
                                            <Badge variant={column.variant} className="rounded-full">
                                                {column.count}
                                            </Badge>
                                            <CardTitle className="text-base font-semibold">{column.title}</CardTitle>
                                        </div>
                                        <Button variant="ghost" size="icon" className="h-8 w-8">
                                            <MoreHorizontal className="h-4 w-4" />
                                        </Button>
                                    </div>
                                </CardHeader>

                                <CardContent className="flex-1 overflow-y-auto p-3 space-y-3">
                                    {tasks[column.id].map((task) => (
                                        <Card
                                            key={task.id}
                                            className="group hover:shadow-lg transition-all duration-200 cursor-grab active:cursor-grabbing hover:scale-105 bg-gradient-to-br from-card to-card/80"
                                        >
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
                                    ))}

                                    <Button
                                        variant="ghost"
                                        className="w-full border-2 border-dashed border-border hover:border-primary hover:bg-accent/50"
                                    >
                                        <Plus className="mr-2 h-4 w-4" />
                                        Add Task
                                    </Button>
                                </CardContent>
                            </Card>
                        </div>
                    ))}
                </div>
            </div>
        </AppLayout>
    );
}

import { useState } from "react";
import { AppLayout } from "@/components/layout/AppLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { Avatar, AvatarFallback } from "@/components/ui/Avatar";
import { FolderKanban, CheckSquare, Users, TrendingUp, Plus, Clock } from "lucide-react";
import { CreateProjectModal } from "@/components/modals/CreateProjectModal";
import { CreateIssueModal } from "@/components/modals/CreateIssueModal";
import { useProjectStore } from "@/store/projectStore";
import { useIssueStore } from "@/store/issueStore";

// Statystyki
const stats = [
    { title: "Total Projects", value: "12", icon: FolderKanban, change: "+2 this month", trend: "up" },
    { title: "Active Issues", value: "48", icon: CheckSquare, change: "+8 this week", trend: "up" },
    { title: "Team Members", value: "24", icon: Users, change: "+3 new", trend: "up" },
    { title: "Completion Rate", value: "87%", icon: TrendingUp, change: "+5%", trend: "up" },
];

// Recent projects mock (może być zamieniony na dane z Zustand/store/API)
const recentProjects = [
    {
        id: 1,
        name: "Website Redesign",
        description: "Complete overhaul of the company website",
        progress: 75,
        team: ["JD", "SM", "AK"],
        status: "inprogress",
    },
    {
        id: 2,
        name: "Mobile App",
        description: "Native mobile application development",
        progress: 45,
        team: ["MT", "LK", "RB"],
        status: "inprogress",
    },
    {
        id: 3,
        name: "API Integration",
        description: "Third-party API integration project",
        progress: 90,
        team: ["JD", "SM"],
        status: "done",
    },
];

// Recent issues mock (tak samo - można później podpiąć pod store/API)
const recentIssues = [
    { id: 1, title: "Fix login bug", priority: "high", status: "todo", assignee: "JD", dueDate: "Today" },
    { id: 2, title: "Update documentation", priority: "medium", status: "inprogress", assignee: "SM", dueDate: "Tomorrow" },
    { id: 3, title: "Implement dark mode", priority: "low", status: "todo", assignee: "AK", dueDate: "Next week" },
    { id: 4, title: "Performance optimization", priority: "high", status: "inprogress", assignee: "MT", dueDate: "2 days" },
];

export default function Dashboard() {
    const [createProjectOpen, setCreateProjectOpen] = useState(false);
    const [createIssueOpen, setCreateIssueOpen] = useState(false);
    const projects = useProjectStore((state) => state.projects); // Dla prawdziwych danych
    const issues = useIssueStore((state) => state.issues);

    return (
        <AppLayout>
            <div className="space-y-8 animate-fade-in">
                {/* Nagłówek */}
                <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                    <div>
                        <h1 className="text-4xl font-bold tracking-tight">Dashboard</h1>
                        <p className="text-muted-foreground mt-2">
                            Welcome back! Here's what's happening today.
                        </p>
                    </div>
                    <div className="flex gap-3">
                        <Button variant="outline" onClick={() => setCreateProjectOpen(true)}>
                            <FolderKanban className="mr-2 h-4 w-4" />
                            New Project
                        </Button>
                        <Button variant="gradient" onClick={() => setCreateIssueOpen(true)}>
                            <Plus className="mr-2 h-4 w-4" />
                            New Issue
                        </Button>
                    </div>
                </div>

                {/* Statystyki */}
                <div className="grid gap-4 sm:gap-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4">
                    {stats.map((stat, index) => (
                        <Card key={index} className="overflow-hidden hover:shadow-lg transition-all duration-200 hover:scale-105 bg-gradient-to-br from-card to-card/50">
                            <CardHeader className="flex flex-row items-center justify-between pb-2">
                                <CardTitle className="text-sm font-medium text-muted-foreground">{stat.title}</CardTitle>
                                <stat.icon className="h-4 w-4 text-primary" />
                            </CardHeader>
                            <CardContent>
                                <div className="text-3xl font-bold">{stat.value}</div>
                                <p className="text-xs text-muted-foreground mt-1 flex items-center gap-1">
                                    <TrendingUp className="h-3 w-3 text-success" />
                                    {stat.change}
                                </p>
                            </CardContent>
                        </Card>
                    ))}
                </div>

                {/* Recent Projects */}
                <div>
                    <div className="flex items-center justify-between mb-4">
                        <h2 className="text-2xl font-bold">Recent Projects</h2>
                        <Button variant="ghost" size="sm">View all</Button>
                    </div>
                    <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                        {recentProjects.map((project) => (
                            <Card key={project.id} className="overflow-hidden hover:shadow-lg transition-all duration-200 hover:scale-105 cursor-pointer">
                                <CardHeader>
                                    <div className="flex items-start justify-between">
                                        <CardTitle className="text-lg">{project.name}</CardTitle>
                                        <Badge variant={project.status}>{project.status}</Badge>
                                    </div>
                                    <CardDescription className="mt-2">{project.description}</CardDescription>
                                </CardHeader>
                                <CardContent>
                                    <div className="space-y-4">
                                        {/* Progress */}
                                        <div>
                                            <div className="flex items-center justify-between mb-2 text-sm">
                                                <span className="text-muted-foreground">Progress</span>
                                                <span className="font-medium">{project.progress}%</span>
                                            </div>
                                            <div className="h-2 rounded-full bg-secondary overflow-hidden">
                                                <div
                                                    className="h-full bg-gradient-to-r from-primary to-accent transition-all duration-300"
                                                    style={{ width: `${project.progress}%` }}
                                                />
                                            </div>
                                        </div>
                                        {/* Team */}
                                        <div className="flex items-center gap-2">
                                            <span className="text-sm text-muted-foreground">Team:</span>
                                            <div className="flex -space-x-2">
                                                {project.team.map((member, idx) => (
                                                    <Avatar key={idx} className="h-8 w-8 border-2 border-card">
                                                        <AvatarFallback className="text-xs bg-primary text-primary-foreground">{member}</AvatarFallback>
                                                    </Avatar>
                                                ))}
                                            </div>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        ))}
                    </div>
                </div>

                {/* Recent Issues */}
                <div>
                    <div className="flex items-center justify-between mb-4">
                        <h2 className="text-2xl font-bold">Recent Issues</h2>
                        <Button variant="ghost" size="sm">View all</Button>
                    </div>
                    <Card>
                        <CardContent className="p-0">
                            <div className="divide-y divide-border">
                                {recentIssues.map((issue) => (
                                    <div
                                        key={issue.id}
                                        className="flex items-center justify-between p-4 hover:bg-accent/50 transition-colors cursor-pointer"
                                    >
                                        <div className="flex items-center gap-4 flex-1">
                                            <CheckSquare className="h-5 w-5 text-muted-foreground" />
                                            <div className="flex-1">
                                                <p className="font-medium">{issue.title}</p>
                                                <div className="flex items-center gap-2 mt-1">
                                                    <Badge variant={issue.status} className="text-xs">{issue.status}</Badge>
                                                    <Badge
                                                        variant={
                                                            issue.priority === "high"
                                                                ? "destructive"
                                                                : issue.priority === "medium"
                                                                    ? "warning"
                                                                    : "secondary"
                                                        }
                                                        className="text-xs"
                                                    >
                                                        {issue.priority}
                                                    </Badge>
                                                </div>
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-4">
                                            <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                                <Clock className="h-4 w-4" />
                                                {issue.dueDate}
                                            </div>
                                            <Avatar className="h-8 w-8">
                                                <AvatarFallback className="bg-primary text-primary-foreground text-xs">
                                                    {issue.assignee}
                                                </AvatarFallback>
                                            </Avatar>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </div>

            <CreateProjectModal open={createProjectOpen} onOpenChange={setCreateProjectOpen} />
            <CreateIssueModal open={createIssueOpen} onOpenChange={setCreateIssueOpen} />
        </AppLayout>
    );
}

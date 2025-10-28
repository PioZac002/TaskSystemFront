import React from "react";
import { AppLayout } from "@/components/layout/AppLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Input } from "@/components/ui/input";
import { Plus, FolderKanban, CheckSquare, Users, TrendingUp, MoreVertical, Target } from "lucide-react";

const stats = [
    { title: "Total Projects", value: "12", icon: FolderKanban, change: "+2 this month", trend: "up" },
    { title: "Active Issues", value: "48", icon: CheckSquare, change: "+8 this week", trend: "up" },
    { title: "Team Members", value: "24", icon: Users, change: "+3 new", trend: "up" },
    { title: "Completion Rate", value: "87%", icon: TrendingUp, change: "+5%", trend: "up" },
];

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

const recentIssues = [
    { id: 1, title: "Fix login bug", priority: "high", status: "todo", assignee: "JD", dueDate: "Today" },
    { id: 2, title: "Update documentation", priority: "medium", status: "inprogress", assignee: "SM", dueDate: "Tomorrow" },
    { id: 3, title: "Implement dark mode", priority: "low", status: "todo", assignee: "AK", dueDate: "Next week" },
    { id: 4, title: "Performance optimization", priority: "high", status: "inprogress", assignee: "MT", dueDate: "2 days" },
];

export default function Dashboard() {
    return (
        <AppLayout>
            <div className="space-y-8 animate-fade-in">
                <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                    <div>
                        <h1 className="text-4xl font-bold tracking-tight">Dashboard</h1>
                        <p className="text-muted-foreground mt-2">Welcome back! Here's what's happening today.</p>
                    </div>
                    <div className="flex gap-3">
                        <Button variant="outline">
                            <FolderKanban className="mr-2 h-4 w-4" />
                            New Project
                        </Button>
                        <Button variant="gradient">
                            <Plus className="mr-2 h-4 w-4" />
                            New Issue
                        </Button>
                    </div>
                </div>

                <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
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

                <div>
                    <div className="flex items-center justify-between mb-4">
                        <h2 className="text-2xl font-bold">Recent Projects</h2>
                        <Button variant="ghost" size="sm">View all</Button>
                    </div>
                    <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                        {recentProjects.map((project) => (
                            <Card key={project.id} className="overflow-hidden hover:shadow-lg transition-all duration-200 hover:scale-105 cursor-pointer">
                                <div className={`h-2 bg-gradient-to-r from-purple-500 to-blue-500`}/>
                                <CardHeader className="relative">
                                    <div className="flex items-start justify-between">
                                        <div className="flex items-center gap-3">
                                            <div className={`h-12 w-12 rounded-xl bg-gradient-to-br from-purple-500 to-blue-500 flex items-center justify-center shadow-lg`}>
                                                <Target className="h-6 w-6 text-white" />
                                            </div>
                                            <div>
                                                <CardTitle className="text-lg group-hover:text-primary transition-colors">{project.name}</CardTitle>
                                                <Badge variant={project.status}>{project.status}</Badge>
                                            </div>
                                        </div>
                                        <Button variant="ghost" size="icon" className="opacity-0 group-hover:opacity-100 transition-opacity">
                                            <MoreVertical className="h-4 w-4" />
                                        </Button>
                                    </div>
                                    <CardDescription className="mt-3 line-clamp-2">{project.description}</CardDescription>
                                </CardHeader>
                                <CardContent className="space-y-4">
                                    <div>
                                        <div className="flex items-center justify-between mb-2 text-sm">
                                            <span className="text-muted-foreground">Progress</span>
                                            <span className="font-medium">{project.progress}%</span>
                                        </div>
                                        <div className="h-2 rounded-full bg-secondary overflow-hidden">
                                            <div
                                                className="h-full bg-gradient-to-r from-purple-500 to-blue-500 transition-all duration-500"
                                                style={{ width: `${project.progress}%` }}
                                            />
                                        </div>
                                    </div>
                                    <div className="flex items-center justify-between text-sm">
                                        <div className="flex items-center gap-2 text-muted-foreground">
                                            <Target className="h-4 w-4" />
                                            <span>{project.completedIssues}/{project.totalIssues} issues</span>
                                        </div>
                                        <div className="flex items-center gap-2 text-muted-foreground">
                                            <Users className="h-4 w-4" />
                                            <span>{project.team.length} members</span>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-2 pt-2 border-t border-border">
                                        <span className="text-sm text-muted-foreground">Team:</span>
                                        <div className="flex -space-x-2">
                                            {project.team.map((member, idx) => (
                                                <Avatar key={idx} className="h-8 w-8 border-2 border-card">
                                                    <AvatarFallback className="text-xs bg-gradient-to-br from-purple-500 to-blue-500 text-white">
                                                        {member}
                                                    </AvatarFallback>
                                                </Avatar>
                                            ))}
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        ))}
                    </div>
                </div>

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
        </AppLayout>
    );
}

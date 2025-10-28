import React from "react";
import { AppLayout } from "@/components/layout/AppLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Plus, Search, MoreVertical, Users, Target } from "lucide-react";

const projects = [
    {
        id: 1,
        name: "Website Redesign",
        description: "Complete overhaul of the company website with modern design and improved UX",
        status: "inprogress",
        progress: 75,
        team: ["JD", "SM", "AK", "MT"],
        totalIssues: 24,
        completedIssues: 18,
        color: "from-purple-500 to-blue-500",
    },
    {
        id: 2,
        name: "Mobile App Development",
        description: "Native mobile application for iOS and Android platforms",
        status: "inprogress",
        progress: 45,
        team: ["MT", "LK", "RB"],
        totalIssues: 36,
        completedIssues: 16,
        color: "from-blue-500 to-cyan-500",
    },
    {
        id: 3,
        name: "API Integration",
        description: "Third-party API integration and microservices architecture",
        status: "done",
        progress: 100,
        team: ["JD", "SM"],
        totalIssues: 12,
        completedIssues: 12,
        color: "from-green-500 to-emerald-500",
    },
    {
        id: 4,
        name: "E-commerce Platform",
        description: "Full-stack e-commerce solution with payment gateway integration",
        status: "inprogress",
        progress: 30,
        team: ["AK", "LK", "RB", "MT", "JD"],
        totalIssues: 48,
        completedIssues: 14,
        color: "from-orange-500 to-red-500",
    },
    {
        id: 5,
        name: "Admin Dashboard",
        description: "Internal admin panel with analytics and user management",
        status: "todo",
        progress: 10,
        team: ["SM", "AK"],
        totalIssues: 18,
        completedIssues: 2,
        color: "from-violet-500 to-purple-500",
    },
    {
        id: 6,
        name: "Documentation Portal",
        description: "Technical documentation and API reference website",
        status: "inprogress",
        progress: 60,
        team: ["LK", "MT", "JD"],
        totalIssues: 15,
        completedIssues: 9,
        color: "from-pink-500 to-rose-500",
    },
];

export default function Projects() {
    return (
        <AppLayout>
            <div className="space-y-8 animate-fade-in">
                <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                    <div>
                        <h1 className="text-4xl font-bold tracking-tight">Projects</h1>
                        <p className="text-muted-foreground mt-2">Manage and track all your projects in one place.</p>
                    </div>
                    <Button variant="gradient">
                        <Plus className="mr-2 h-4 w-4" />
                        New Project
                    </Button>
                </div>

                <div className="flex flex-col gap-4 md:flex-row md:items-center">
                    <div className="relative flex-1 max-w-md">
                        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                        <Input type="search" placeholder="Search projects..." className="pl-10 bg-background" />
                    </div>
                    <div className="flex gap-2">
                        <Button variant="outline">All Projects</Button>
                        <Button variant="ghost">Active</Button>
                        <Button variant="ghost">Completed</Button>
                    </div>
                </div>

                <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                    {projects.map((project) => (
                        <Card
                            key={project.id}
                            className="group overflow-hidden hover:shadow-xl transition-all duration-300 hover:scale-105 cursor-pointer border-border/50"
                        >
                            <div className={`h-2 bg-gradient-to-r ${project.color}`} />
                            <CardHeader className="relative">
                                <div className="flex items-start justify-between">
                                    <div className="flex items-center gap-3">
                                        <div className={`h-12 w-12 rounded-xl bg-gradient-to-br ${project.color} flex items-center justify-center shadow-lg`}>
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
                                            className={`h-full bg-gradient-to-r ${project.color} transition-all duration-500`}
                                            style={{ width: `${project.progress}%` }}
                                        />
                                    </div>
                                </div>

                                <div className="flex items-center justify-between text-sm">
                                    <div className="flex items-center gap-2 text-muted-foreground">
                                        <Target className="h-4 w-4" />
                                        <span>
                      {project.completedIssues}/{project.totalIssues} issues
                    </span>
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
                                                <AvatarFallback className={`text-xs bg-gradient-to-br ${project.color} text-white`}>
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
        </AppLayout>
    );
}

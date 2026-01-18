import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { AppLayout } from "@/components/layout/AppLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { Avatar, AvatarFallback } from "@/components/ui/Avatar";
import { FolderKanban, CheckSquare, Users, TrendingUp, Plus, Clock } from "lucide-react";
import { CreateProjectModal } from "@/components/modals/CreateProjectModal";
import { CreateIssueModal } from "@/components/modals/CreateIssueModal";
import { ProjectDetailsModal } from "@/components/modals/ProjectDetailsModal";
import { IssueDetailsModal } from "@/components/modals/IssueDetailsModal";
import { useProjectStore } from "@/store/projectStore";
import { useIssueStore } from "@/store/issueStore";
import { useUserStore } from "@/store/userStore";
import { calculateProgress, getInitials } from "@/utils/formatters";

export default function Dashboard() {
    const navigate = useNavigate();
    const [createProjectOpen, setCreateProjectOpen] = useState(false);
    const [createIssueOpen, setCreateIssueOpen] = useState(false);
    const [selectedProjectId, setSelectedProjectId] = useState(null);
    const [selectedIssueId, setSelectedIssueId] = useState(null);
    
    const { projects, getProjects } = useProjectStore();
    const { issues, fetchIssues } = useIssueStore();
    const { users, fetchUsers } = useUserStore();

    useEffect(() => {
        getProjects();
        fetchIssues();
        fetchUsers();
    }, [getProjects, fetchIssues, fetchUsers]);

    // Calculate stats from real data
    const activeIssues = issues.filter(i => i.status !== 'DONE').length;
    const completedIssues = issues.filter(i => i.status === 'DONE').length;
    const completionRate = issues.length > 0 
        ? Math.round((completedIssues / issues.length) * 100) 
        : 0;
    
    const stats = [
        { 
            title: "Total Projects", 
            value: projects.length.toString(), 
            icon: FolderKanban, 
            change: `${projects.length} active`, 
            trend: "up" 
        },
        { 
            title: "Active Issues", 
            value: activeIssues.toString(), 
            icon: CheckSquare, 
            change: `${completedIssues} completed`, 
            trend: "up" 
        },
        { 
            title: "Team Members", 
            value: users.length.toString(), 
            icon: Users, 
            change: `${users.length} users`, 
            trend: "up" 
        },
        { 
            title: "Completion Rate", 
            value: `${completionRate}%`, 
            icon: TrendingUp, 
            change: "This month", 
            trend: "up" 
        },
    ];

    // Recent projects (last 3)
    const recentProjects = projects
        .sort((a, b) => new Date(b.createdAt || 0) - new Date(a.createdAt || 0))
        .slice(0, 3)
        .map(project => {
            const projectIssues = issues.filter(i => i.projectId === project.id);
            const doneIssues = projectIssues.filter(i => i.status === 'DONE');
            const progress = projectIssues.length > 0 
                ? calculateProgress(projectIssues.length, doneIssues.length)
                : 0;
            
            return {
                id: project.id,
                name: project.shortName || project.name || 'Unnamed Project',
                description: project.description || 'No description',
                progress,
                issues: projectIssues.length,
                status: progress === 100 ? 'done' : progress > 0 ? 'inprogress' : 'todo',
            };
        });

    // Recent issues (last 4)
    const recentIssues = issues
        .sort((a, b) => new Date(b.createdAt || 0) - new Date(a.createdAt || 0))
        .slice(0, 4)
        .map(issue => {
            const assignee = users.find(u => u.id === issue.assigneeId);
            return {
                id: issue.id,
                key: issue.key || `#${issue.id}`,
                title: issue.title || 'Untitled Issue',
                priority: (issue.priority || 'NORMAL').toLowerCase(),
                status: (issue.status || 'NEW').toLowerCase(),
                assignee: assignee ? getInitials(assignee.firstName, assignee.lastName) : '??',
                dueDate: issue.dueDate ? new Date(issue.dueDate).toLocaleDateString() : 'No due date',
            };
        });

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
                        <Button variant="ghost" size="sm" onClick={() => navigate('/projects')}>
                            View all
                        </Button>
                    </div>
                    <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                        {recentProjects.length === 0 ? (
                            <Card className="col-span-full">
                                <CardContent className="py-16 text-center">
                                    <FolderKanban className="h-16 w-16 mx-auto text-muted-foreground mb-4" />
                                    <p className="text-muted-foreground">No projects yet. Create one to get started!</p>
                                </CardContent>
                            </Card>
                        ) : (
                            recentProjects.map((project) => (
                                <Card 
                                    key={project.id} 
                                    className="overflow-hidden hover:shadow-lg transition-all duration-200 hover:scale-105 cursor-pointer"
                                    onClick={() => setSelectedProjectId(project.id)}
                                >
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
                                            {/* Issues count */}
                                            <div className="flex items-center gap-2">
                                                <CheckSquare className="h-4 w-4 text-muted-foreground" />
                                                <span className="text-sm text-muted-foreground">{project.issues} issues</span>
                                            </div>
                                        </div>
                                    </CardContent>
                                </Card>
                            ))
                        )}
                    </div>
                </div>

                {/* Recent Issues */}
                <div>
                    <div className="flex items-center justify-between mb-4">
                        <h2 className="text-2xl font-bold">Recent Issues</h2>
                        <Button variant="ghost" size="sm" onClick={() => navigate('/issues')}>
                            View all
                        </Button>
                    </div>
                    <Card>
                        <CardContent className="p-0">
                            {recentIssues.length === 0 ? (
                                <div className="py-16 text-center">
                                    <CheckSquare className="h-16 w-16 mx-auto text-muted-foreground mb-4" />
                                    <p className="text-muted-foreground">No issues yet. Create one to get started!</p>
                                </div>
                            ) : (
                                <div className="divide-y divide-border">
                                    {recentIssues.map((issue) => (
                                        <div
                                            key={issue.id}
                                            className="flex items-center justify-between p-4 hover:bg-accent/50 transition-colors cursor-pointer"
                                            onClick={() => setSelectedIssueId(issue.id)}
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
                                                                    : issue.priority === "normal"
                                                                        ? "secondary"
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
                            )}
                        </CardContent>
                    </Card>
                </div>
            </div>

            <CreateProjectModal open={createProjectOpen} onOpenChange={setCreateProjectOpen} />
            <CreateIssueModal open={createIssueOpen} onOpenChange={setCreateIssueOpen} />
            
            {selectedProjectId && (
                <ProjectDetailsModal 
                    open={!!selectedProjectId} 
                    onOpenChange={() => setSelectedProjectId(null)}
                    projectId={selectedProjectId}
                />
            )}
            
            {selectedIssueId && (
                <IssueDetailsModal 
                    open={!!selectedIssueId} 
                    onOpenChange={() => setSelectedIssueId(null)}
                    issueId={selectedIssueId}
                    onIssueDeleted={() => {
                        setSelectedIssueId(null);
                        fetchIssues(); // Refresh list
                    }}
                />
            )}
        </AppLayout>
    );
}

import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { AppLayout } from "@/components/layout/AppLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Progress } from "@/components/ui/Progress";
import { Badge } from "@/components/ui/Badge";
import { useProjectStore } from "@/store/projectStore";
import { useIssueStore } from "@/store/issueStore";
import { useUserStore } from "@/store/userStore";
import { ProjectDetailsModal } from "@/components/modals/ProjectDetailsModal";
import { IssueDetailsModal } from "@/components/modals/IssueDetailsModal";
import { CreateProjectModal } from "@/components/modals/CreateProjectModal";
import { CreateIssueModal } from "@/components/modals/CreateIssueModal";
import {
    FolderKanban,
    CheckSquare,
    Users,
    TrendingUp,
    Plus,
    ArrowRight
} from "lucide-react";

function formatDate(dateString) {
    if (!dateString) return "No due date";
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
        month: "short",
        day:  "numeric"
    });
}

export default function Dashboard() {
    const navigate = useNavigate();
    const { projects, fetchProjects, loading:  projectsLoading } = useProjectStore();
    const { issues, fetchIssues, loading: issuesLoading } = useIssueStore();
    const { users, fetchUsers } = useUserStore();

    const [selectedProjectId, setSelectedProjectId] = useState(null);
    const [selectedIssueId, setSelectedIssueId] = useState(null);
    const [createProjectOpen, setCreateProjectOpen] = useState(false);
    const [createIssueOpen, setCreateIssueOpen] = useState(false);

    useEffect(() => {
        fetchProjects();
        fetchIssues();
        fetchUsers();
    }, []);

    // Oblicz statystyki z real data
    const activeIssues = issues.filter(i => i.status !== 'DONE').length;
    const completedIssues = issues.filter(i => i.status === 'DONE').length;
    const completionRate = issues.length > 0
        ? Math.round((completedIssues / issues.length) * 100)
        : 0;

    const stats = [
        {
            title: "Total Projects",
            value: projects.length,
            icon: FolderKanban,
            change: `${projects.length} active`,
            trend: "up",
            color: "text-violet-600"
        },
        {
            title: "Active Issues",
            value: activeIssues,
            icon: CheckSquare,
            change: `${completedIssues} completed`,
            trend: "up",
            color: "text-blue-600"
        },
        {
            title: "Team Members",
            value: users.length,
            icon: Users,
            change: `${users.length} users`,
            trend: "neutral",
            color: "text-green-600"
        },
        {
            title:  "Completion Rate",
            value: `${completionRate}%`,
            icon: TrendingUp,
            change: "Overall progress",
            trend: completionRate > 50 ? "up" : "down",
            color: "text-orange-600"
        },
    ];

    // Recent projects (ostatnie 3, posortowane po dacie utworzenia)
    const recentProjects = projects
        .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
        .slice(0, 3)
        .map(project => {
            const projectIssues = issues.filter(i => i.projectId === project. id);
            const doneIssues = projectIssues.filter(i => i.status === 'DONE');
            const progress = projectIssues.length > 0
                ? Math.round((doneIssues.length / projectIssues.length) * 100)
                : 0;

            return {
                id: project.id,
                name: project.shortName,
                description: project.description || "No description",
                progress,
                issues: projectIssues.length,
                status: progress === 100 ? 'done' : 'inprogress',
            };
        });

    // Recent issues (ostatnie 4, posortowane po dacie utworzenia)
    const recentIssues = issues
        . sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
        .slice(0, 4)
        .map(issue => ({
            id: issue.id,
            key: issue.key,
            title: issue.title,
            priority: issue.priority?. toLowerCase() || 'normal',
            status: issue.status?. toLowerCase() || 'new',
            assignee: issue. assigneeId || null,
            dueDate: formatDate(issue. dueDate),
        }));

    const loading = projectsLoading || issuesLoading;

    return (
        <AppLayout>
            <div className="space-y-8">
                {/* Header */}
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-3xl font-bold bg-gradient-to-r from-violet-600 to-indigo-600 bg-clip-text text-transparent">
                            Dashboard
                        </h1>
                        <p className="text-muted-foreground mt-1">
                            Welcome back! Here's what's happening with your projects.
                        </p>
                    </div>
                    <div className="flex gap-2">
                        <Button variant="outline" onClick={() => setCreateProjectOpen(true)}>
                            <Plus className="mr-2 h-4 w-4" />
                            <span className="hidden sm:inline">New </span>Project
                        </Button>
                        <Button onClick={() => setCreateIssueOpen(true)}>
                            <Plus className="mr-2 h-4 w-4" />
                            <span className="hidden sm:inline">New </span>Issue
                        </Button>
                    </div>
                </div>

                {/* Stats Grid */}
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">{stats.map((stat) => {
                        const Icon = stat. icon;
                        return (
                            <Card key={stat. title} className="hover:shadow-lg transition-shadow">
                                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                    <CardTitle className="text-sm font-medium">
                                        {stat.title}
                                    </CardTitle>
                                    <Icon className={`h-5 w-5 ${stat. color}`} />
                                </CardHeader>
                                <CardContent>
                                    <div className="text-3xl font-bold">{stat.value}</div>
                                    <p className="text-xs text-muted-foreground mt-1">
                                        {stat.change}
                                    </p>
                                </CardContent>
                            </Card>
                        );
                    })}
                </div>

                {/* Recent Projects */}
                <div>
                    <div className="flex items-center justify-between mb-4">
                        <h2 className="text-2xl font-semibold">Recent Projects</h2>
                        <Button variant="ghost" size="sm" onClick={() => navigate('/projects')}>
                            View all
                            <ArrowRight className="ml-2 h-4 w-4" />
                        </Button>
                    </div>

                    {loading ? (
                        <p className="text-center text-muted-foreground py-8">Loading... </p>
                    ) : recentProjects.length === 0 ? (
                        <Card>
                            <CardContent className="py-12 text-center">
                                <FolderKanban className="mx-auto h-12 w-12 text-muted-foreground mb-3" />
                                <p className="text-muted-foreground mb-4">No projects yet</p>
                                <Button onClick={() => setCreateProjectOpen(true)}>
                                    <Plus className="mr-2 h-4 w-4" />
                                    Create Your First Project
                                </Button>
                            </CardContent>
                        </Card>
                    ) : (
                        <div className="grid gap-4 sm:gap-6 md:grid-cols-2 lg:grid-cols-3">
                            {recentProjects.map((project) => (
                                <Card
                                    key={project. id}
                                    className="cursor-pointer hover:shadow-lg transition-all hover:scale-105"
                                    onClick={() => setSelectedProjectId(project.id)}
                                >
                                    <CardHeader>
                                        <div className="flex items-start justify-between">
                                            <div className="flex-1 min-w-0">
                                                <CardTitle className="font-mono truncate">{project.name}</CardTitle>
                                                <CardDescription className="line-clamp-2 mt-1">
                                                    {project. description}
                                                </CardDescription>
                                            </div>
                                            <Badge variant={project.status === 'done' ? 'default' : 'secondary'}
                                                   className={project.status === 'done' ?  'bg-green-500' : ''}>
                                                {project. issues} issues
                                            </Badge>
                                        </div>
                                    </CardHeader>
                                    <CardContent>
                                        <div className="space-y-2">
                                            <div className="flex items-center justify-between text-sm">
                                                <span className="text-muted-foreground">Progress</span>
                                                <span className="font-medium">{project.progress}%</span>
                                            </div>
                                            <Progress value={project.progress} className="h-2" />
                                        </div>
                                    </CardContent>
                                </Card>
                            ))}
                        </div>
                    )}
                </div>

                {/* Recent Issues */}
                <div>
                    <div className="flex items-center justify-between mb-4">
                        <h2 className="text-2xl font-semibold">Recent Issues</h2>
                        <Button variant="ghost" size="sm" onClick={() => navigate('/issues')}>
                            View all
                            <ArrowRight className="ml-2 h-4 w-4" />
                        </Button>
                    </div>

                    {loading ? (
                        <p className="text-center text-muted-foreground py-8">Loading...</p>
                    ) : recentIssues.length === 0 ? (
                        <Card>
                            <CardContent className="py-12 text-center">
                                <CheckSquare className="mx-auto h-12 w-12 text-muted-foreground mb-3" />
                                <p className="text-muted-foreground mb-4">No issues yet</p>
                                <Button onClick={() => setCreateIssueOpen(true)}>
                                    <Plus className="mr-2 h-4 w-4" />
                                    Create Your First Issue
                                </Button>
                            </CardContent>
                        </Card>
                    ) : (
                        <div className="grid gap-3">
                            {recentIssues.map((issue) => (
                                <Card
                                    key={issue.id}
                                    className="cursor-pointer hover:shadow-md transition-shadow"
                                    onClick={() => setSelectedIssueId(issue.id)}
                                >
                                    <CardContent className="p-4">
                                        <div className="flex items-center justify-between">
                                            <div className="flex-1 min-w-0">
                                                <div className="flex items-center gap-3 mb-2">
                                                    <span className="font-mono text-sm text-muted-foreground font-semibold">
                                                        {issue.key}
                                                    </span>
                                                    <span className="font-medium truncate">{issue.title}</span>
                                                </div>
                                                <div className="flex items-center gap-2 flex-wrap">
                                                    <Badge
                                                        variant={issue.status === 'done' ? 'default' : 'secondary'}
                                                        className={
                                                            issue.status === 'done' ?  'bg-green-500' :
                                                                issue.status === 'in_progress' ? 'bg-blue-500' :
                                                                    issue.status === 'review' ? 'bg-purple-500' :
                                                                        'bg-gray-500'
                                                        }
                                                    >
                                                        {issue.status === 'new' ? 'To Do' :
                                                            issue.status === 'in_progress' ? 'In Progress' :
                                                                issue.status === 'review' ?  'Review' :
                                                                    'Done'}
                                                    </Badge>
                                                    <Badge
                                                        variant={
                                                            issue.priority === 'high' ? 'destructive' :
                                                                issue.priority === 'normal' ? 'secondary' :
                                                                    'outline'
                                                        }
                                                    >
                                                        {issue.priority}
                                                    </Badge>
                                                    <span className="text-sm text-muted-foreground">
                                                        📅 {issue.dueDate}
                                                    </span>
                                                    {issue.assignee && (
                                                        <span className="text-sm text-muted-foreground">
                                                            👤 User #{issue.assignee}
                                                        </span>
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                    </CardContent>
                                </Card>
                            ))}
                        </div>
                    )}
                </div>
            </div>

            {/* Modals */}
            <ProjectDetailsModal
                open={!! selectedProjectId}
                onOpenChange={() => setSelectedProjectId(null)}
                projectId={selectedProjectId}
            />

            <IssueDetailsModal
                open={!!selectedIssueId}
                onOpenChange={() => setSelectedIssueId(null)}
                issueId={selectedIssueId}
                onIssueDeleted={() => {
                    setSelectedIssueId(null);
                    fetchIssues();
                }}
            />

            <CreateProjectModal
                open={createProjectOpen}
                onOpenChange={setCreateProjectOpen}
            />

            <CreateIssueModal
                open={createIssueOpen}
                onOpenChange={setCreateIssueOpen}
            />
        </AppLayout>
    );
}
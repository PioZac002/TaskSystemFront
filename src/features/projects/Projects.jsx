import { useEffect, useState } from "react";
import { AppLayout } from "@/components/layout/AppLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Badge } from "@/components/ui/Badge";
import { Progress } from "@/components/ui/Progress";
import { useProjectStore } from "@/store/projectStore";
import { useIssueStore } from "@/store/issueStore";
import { ProjectDetailsModal } from "@/components/modals/ProjectDetailsModal";
import { CreateProjectModal } from "@/components/modals/CreateProjectModal";
import { Plus, Search, X, FolderKanban, CheckCircle2, Clock, AlertTriangle } from "lucide-react";

export default function Projects() {
    const { projects, fetchProjects, loading } = useProjectStore();
    const { issues, fetchIssues } = useIssueStore();
    const [selectedProjectId, setSelectedProjectId] = useState(null);
    const [createModalOpen, setCreateModalOpen] = useState(false);
    const [searchTerm, setSearchTerm] = useState("");

    useEffect(() => {
        fetchProjects();
        fetchIssues();
    }, []);

    // Oblicz progress dla każdego projektu
    const projectsWithProgress = projects.map(project => {
        const projectIssues = issues.filter(i => i.projectId === project. id);
        const doneIssues = projectIssues. filter(i => i.status === 'DONE');
        const inProgressIssues = projectIssues.filter(i => i. status === 'IN_PROGRESS');
        const todoIssues = projectIssues.filter(i => i.status === 'NEW');
        
        // Priority breakdown
        const highPriority = projectIssues.filter(i => i.priority === 'HIGH').length;
        const normalPriority = projectIssues.filter(i => i.priority === 'NORMAL').length;
        const lowPriority = projectIssues.filter(i => i.priority === 'LOW').length;
        
        const progress = projectIssues.length > 0
            ? Math.round((doneIssues.length / projectIssues. length) * 100)
            : 0;

        return {
            ... project,
            totalIssues: projectIssues.length,
            doneIssues: doneIssues.length,
            inProgressIssues: inProgressIssues.length,
            todoIssues: todoIssues.length,
            highPriority,
            normalPriority,
            lowPriority,
            progress
        };
    });

    // Filtrowanie
    const filteredProjects = projectsWithProgress.filter(project =>
        (project.shortName?. toLowerCase() || "").includes(searchTerm.toLowerCase()) ||
        (project.description?.toLowerCase() || "").includes(searchTerm.toLowerCase())
    );

    const clearSearch = () => setSearchTerm("");

    return (
        <AppLayout>
            <div className="space-y-6">
                {/* Header */}
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-3xl font-bold">Projects</h1>
                        <p className="text-muted-foreground">
                            Manage your project portfolio • {filteredProjects.length} of {projects.length} projects
                        </p>
                    </div>
                    <Button onClick={() => setCreateModalOpen(true)}>
                        <Plus className="mr-2 h-4 w-4" />
                        <span className="hidden sm:inline">Create </span>Project
                    </Button>
                </div>

                {/* Search */}
                <Card>
                    <CardContent className="pt-6">
                        <div className="flex gap-3">
                            <div className="relative flex-1">
                                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                                <Input
                                    placeholder="Search projects by name or description..."
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                    className="pl-10"
                                />
                            </div>
                            {searchTerm && (
                                <Button variant="outline" onClick={clearSearch}>
                                    <X className="mr-2 h-4 w-4" />
                                    Clear
                                </Button>
                            )}
                        </div>
                    </CardContent>
                </Card>

                {/* Projects Grid */}
                {loading ? (
                    <div className="text-center py-12">
                        <p className="text-muted-foreground">Loading projects... </p>
                    </div>
                ) : filteredProjects.length === 0 ? (
                    <Card>
                        <CardContent className="py-12 text-center">
                            <FolderKanban className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
                            <p className="text-lg font-medium mb-2">
                                {searchTerm ? "No projects match your search" : "No projects yet"}
                            </p>
                            <p className="text-sm text-muted-foreground mb-4">
                                {searchTerm
                                    ? "Try a different search term"
                                    : "Create your first project to get started"}
                            </p>
                            {searchTerm ?  (
                                <Button variant="outline" onClick={clearSearch}>
                                    Clear Search
                                </Button>
                            ) : (
                                <Button onClick={() => setCreateModalOpen(true)}>
                                    <Plus className="mr-2 h-4 w-4" />
                                    Create Project
                                </Button>
                            )}
                        </CardContent>
                    </Card>
                ) : (
                    <div className="grid gap-4 sm:gap-6 md:grid-cols-2 lg:grid-cols-3">
                        {filteredProjects.map(project => (
                            <Card
                                key={project.id}
                                className="cursor-pointer hover:shadow-xl transition-all hover:scale-105 hover:border-primary/50"
                                onClick={() => setSelectedProjectId(project.id)}
                            >
                                <CardHeader>
                                    <div className="flex items-start justify-between gap-2">
                                        <div className="flex-1 min-w-0">
                                            <CardTitle className="text-xl font-mono truncate">
                                                {project.shortName}
                                            </CardTitle>
                                            <CardDescription className="line-clamp-2 mt-1">
                                                {project.description || "No description provided"}
                                            </CardDescription>
                                        </div>
                                        <Badge
                                            variant={project. progress === 100 ? "default" : "secondary"}
                                            className={project.progress === 100 ? "bg-green-500" : ""}
                                        >
                                            {project.totalIssues} {project.totalIssues === 1 ? "issue" : "issues"}
                                        </Badge>
                                    </div>
                                </CardHeader>
                                <CardContent className="space-y-4">
                                    {/* Progress Bar */}
                                    <div>
                                        <div className="flex items-center justify-between mb-2">
                                            <span className="text-sm font-medium text-muted-foreground">
                                                Progress
                                            </span>
                                            <span className="text-sm font-bold">
                                                {project.progress}%
                                            </span>
                                        </div>
                                        <Progress
                                            value={project. progress}
                                            className="h-2"
                                        />
                                        <p className="text-xs text-muted-foreground mt-1">
                                            {project. doneIssues} of {project.totalIssues} issues completed
                                        </p>
                                    </div>

                                    {/* Stats */}
                                    <div className="grid grid-cols-3 gap-2 pt-2 border-t">
                                        <div className="flex items-center gap-2">
                                            <CheckCircle2 className="h-4 w-4 text-green-500" />
                                            <div>
                                                <p className="text-xs text-muted-foreground">Done</p>
                                                <p className="text-sm font-semibold">{project.doneIssues}</p>
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <Clock className="h-4 w-4 text-blue-500" />
                                            <div>
                                                <p className="text-xs text-muted-foreground">Active</p>
                                                <p className="text-sm font-semibold">{project.inProgressIssues}</p>
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <AlertTriangle className="h-4 w-4 text-gray-500" />
                                            <div>
                                                <p className="text-xs text-muted-foreground">To Do</p>
                                                <p className="text-sm font-semibold">{project.todoIssues}</p>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Priority Breakdown */}
                                    {project.totalIssues > 0 && (
                                        <div className="pt-2 border-t">
                                            <p className="text-xs text-muted-foreground mb-2">Priority</p>
                                            <div className="flex gap-2 flex-wrap">
                                                {project.highPriority > 0 && (
                                                    <Badge variant="destructive" className="text-xs">
                                                        {project.highPriority} HIGH
                                                    </Badge>
                                                )}
                                                {project.normalPriority > 0 && (
                                                    <Badge variant="secondary" className="text-xs">
                                                        {project.normalPriority} NORMAL
                                                    </Badge>
                                                )}
                                                {project.lowPriority > 0 && (
                                                    <Badge variant="outline" className="text-xs">
                                                        {project.lowPriority} LOW
                                                    </Badge>
                                                )}
                                            </div>
                                        </div>
                                    )}
                                </CardContent>
                            </Card>
                        ))}
                    </div>
                )}
            </div>

            <ProjectDetailsModal
                open={!! selectedProjectId}
                onOpenChange={() => setSelectedProjectId(null)}
                projectId={selectedProjectId}
                onProjectUpdate={() => {
                    fetchIssues();
                    fetchProjects();
                }}
            />

            <CreateProjectModal
                open={createModalOpen}
                onOpenChange={setCreateModalOpen}
            />
        </AppLayout>
    );
}
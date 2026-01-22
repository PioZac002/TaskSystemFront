import { useEffect, useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/Dialog";
import { Badge } from "@/components/ui/Badge";
import { Card, CardContent } from "@/components/ui/Card";
import { Progress } from "@/components/ui/Progress";
import { Separator } from "@/components/ui/Separator";
import { Button } from "@/components/ui/Button";
import { IssueDetailsModal } from "./IssueDetailsModal";
import { CreateIssueModal } from "./CreateIssueModal";
import apiClient from "@/services/apiClient";
import { toast } from "sonner";
import { CheckCircle2, Clock, AlertCircle, ListTodo, ExternalLink, Plus } from "lucide-react";

function formatDate(dateString) {
    if (!dateString) return "N/A";
    const date = new Date(dateString);
    return date.toLocaleString("en-US", {
        year: "numeric",
        month:  "short",
        day: "numeric",
        hour: "2-digit",
        minute: "2-digit"
    });
}

export function ProjectDetailsModal({ open, onOpenChange, projectId, onProjectUpdate }) {
    const [project, setProject] = useState(null);
    const [loading, setLoading] = useState(false);
    const [selectedIssueId, setSelectedIssueId] = useState(null);
    const [createIssueOpen, setCreateIssueOpen] = useState(false);

    useEffect(() => {
        if (open && projectId) {
            loadProjectDetails();
        }
    }, [open, projectId]);

    const loadProjectDetails = async () => {
        setLoading(true);
        try {
            const response = await apiClient.get(`/api/v1/project/${projectId}`);
            setProject(response.data);
        } catch (error) {
            const errorMessage = error.response?.data?.Message || error.message || "Failed to load project details";
            toast.error(errorMessage);
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    if (!project && !loading) return null;

    // Oblicz statystyki
    const issues = project?.issues || [];
    const totalIssues = issues.length;
    const doneIssues = issues. filter(i => i.status === 'DONE').length;
    const inProgressIssues = issues.filter(i => i.status === 'IN_PROGRESS').length;
    const reviewIssues = issues.filter(i => i.status === 'REVIEW').length;
    const todoIssues = issues.filter(i => i.status === 'NEW').length;
    const progress = totalIssues > 0 ?  Math.round((doneIssues / totalIssues) * 100) : 0;

    // Grupuj po priorytecie
    const highPriorityIssues = issues.filter(i => i.priority === 'HIGH').length;
    const normalPriorityIssues = issues.filter(i => i. priority === 'NORMAL').length;
    const lowPriorityIssues = issues.filter(i => i. priority === 'LOW').length;

    return (
        <>
            <Dialog open={open} onOpenChange={onOpenChange}>
                <DialogContent className="sm:max-w-[95vw] md:max-w-[700px] max-h-[90vh] overflow-y-auto p-4 sm:p-6">
                    {loading ?  (
                        <div className="py-12 text-center text-muted-foreground">
                            Loading project details...
                        </div>
                    ) : (
                        <>
                            <DialogHeader>
                                <div className="flex items-start justify-between">
                                    <div className="flex-1">
                                        <DialogTitle className="text-2xl md:text-3xl font-mono break-words">
                                            {project.shortName}
                                        </DialogTitle>
                                        <DialogDescription className="mt-2 text-base">
                                            {project.description || "No description provided"}
                                        </DialogDescription>
                                    </div>
                                    <Badge
                                        variant={progress === 100 ? "default" : "secondary"}
                                        className={`${progress === 100 ? "bg-green-500" : ""} text-lg px-3 py-1`}
                                    >
                                        {progress}%
                                    </Badge>
                                </div>
                            </DialogHeader>

                            <div className="space-y-6">
                                {/* Progress Bar */}
                                <div className="bg-accent/30 p-4 rounded-lg">
                                    <div className="flex items-center justify-between mb-2">
                                        <span className="text-sm font-semibold">Overall Progress</span>
                                        <span className="text-sm font-bold text-primary">{progress}%</span>
                                    </div>
                                    <Progress value={progress} className="h-3" />
                                    <p className="text-xs text-muted-foreground mt-2">
                                        {doneIssues} of {totalIssues} issues completed
                                    </p>
                                </div>

                                {/* Stats Grid */}
                                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                                    <Card className="bg-green-50 dark:bg-green-950 border-green-200 dark: border-green-800">
                                        <CardContent className="p-4">
                                            <div className="flex flex-col items-center text-center">
                                                <CheckCircle2 className="h-8 w-8 text-green-600 dark:text-green-400 mb-2" />
                                                <p className="text-2xl font-bold text-green-700 dark:text-green-300">{doneIssues}</p>
                                                <p className="text-xs text-green-600 dark:text-green-400">Done</p>
                                            </div>
                                        </CardContent>
                                    </Card>

                                    <Card className="bg-blue-50 dark:bg-blue-950 border-blue-200 dark:border-blue-800">
                                        <CardContent className="p-4">
                                            <div className="flex flex-col items-center text-center">
                                                <Clock className="h-8 w-8 text-blue-600 dark:text-blue-400 mb-2" />
                                                <p className="text-2xl font-bold text-blue-700 dark:text-blue-300">{inProgressIssues}</p>
                                                <p className="text-xs text-blue-600 dark:text-blue-400">In Progress</p>
                                            </div>
                                        </CardContent>
                                    </Card>

                                    <Card className="bg-purple-50 dark:bg-purple-950 border-purple-200 dark:border-purple-800">
                                        <CardContent className="p-4">
                                            <div className="flex flex-col items-center text-center">
                                                <ListTodo className="h-8 w-8 text-purple-600 dark:text-purple-400 mb-2" />
                                                <p className="text-2xl font-bold text-purple-700 dark:text-purple-300">{reviewIssues}</p>
                                                <p className="text-xs text-purple-600 dark:text-purple-400">Review</p>
                                            </div>
                                        </CardContent>
                                    </Card>

                                    <Card className="bg-gray-50 dark:bg-gray-900 border-gray-200 dark:border-gray-700">
                                        <CardContent className="p-4">
                                            <div className="flex flex-col items-center text-center">
                                                <AlertCircle className="h-8 w-8 text-gray-600 dark:text-gray-400 mb-2" />
                                                <p className="text-2xl font-bold text-gray-700 dark:text-gray-300">{todoIssues}</p>
                                                <p className="text-xs text-gray-600 dark:text-gray-400">To Do</p>
                                            </div>
                                        </CardContent>
                                    </Card>
                                </div>

                                {/* Priority Breakdown */}
                                <div className="bg-muted/50 p-4 rounded-lg">
                                    <h3 className="font-semibold mb-3">Priority Breakdown</h3>
                                    <div className="flex gap-4">
                                        <div className="flex items-center gap-2">
                                            <Badge variant="destructive">{highPriorityIssues}</Badge>
                                            <span className="text-sm text-muted-foreground">High</span>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <Badge variant="secondary">{normalPriorityIssues}</Badge>
                                            <span className="text-sm text-muted-foreground">Normal</span>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <Badge variant="outline">{lowPriorityIssues}</Badge>
                                            <span className="text-sm text-muted-foreground">Low</span>
                                        </div>
                                    </div>
                                </div>

                                <Separator />

                                {/* Issues List */}
                                <div>
                                    <div className="flex items-center justify-between mb-3">
                                        <h3 className="font-semibold">
                                            Issues ({totalIssues})
                                        </h3>
                                        <Button 
                                            size="sm" 
                                            onClick={() => setCreateIssueOpen(true)}
                                            variant="outline"
                                        >
                                            <Plus className="mr-2 h-4 w-4" />
                                            Add Issue
                                        </Button>
                                    </div>
                                    {issues.length === 0 ?  (
                                        <Card className="bg-muted/30">
                                            <CardContent className="py-12 text-center">
                                                <ListTodo className="mx-auto h-12 w-12 text-muted-foreground mb-3" />
                                                <p className="text-muted-foreground">
                                                    No issues in this project yet
                                                </p>
                                            </CardContent>
                                        </Card>
                                    ) : (
                                        <div className="space-y-2 max-h-[400px] overflow-y-auto">
                                            {issues.map(issue => (
                                                <Card
                                                    key={issue.id}
                                                    className="hover:bg-accent cursor-pointer transition-colors"
                                                    onClick={() => setSelectedIssueId(issue.id)}
                                                >
                                                    <CardContent className="p-3">
                                                        <div className="flex items-center justify-between gap-2">
                                                            <div className="flex-1 min-w-0">
                                                                <div className="flex items-center gap-2 mb-1">
                                                                    <span className="font-mono text-xs text-muted-foreground font-semibold">
                                                                        {issue.key}
                                                                    </span>
                                                                    <span className="font-medium truncate line-clamp-1">{issue.title}</span>
                                                                </div>
                                                                <div className="flex items-center gap-2 flex-wrap">
                                                                    <Badge
                                                                        variant={issue.status === 'DONE' ? 'default' : 'secondary'}
                                                                        className={`text-xs ${
                                                                            issue.status === 'DONE' ?  'bg-green-500' :
                                                                                issue. status === 'IN_PROGRESS' ? 'bg-blue-500' :
                                                                                    issue.status === 'REVIEW' ? 'bg-purple-500' :
                                                                                        'bg-gray-500'
                                                                        }`}
                                                                    >
                                                                        {issue. status === 'NEW' ? 'To Do' :
                                                                            issue.status === 'IN_PROGRESS' ? 'In Progress' :
                                                                                issue.status}
                                                                    </Badge>
                                                                    <Badge
                                                                        variant={
                                                                            issue.priority === 'HIGH' ? 'destructive' :
                                                                                issue.priority === 'NORMAL' ? 'secondary' :
                                                                                    'outline'
                                                                        }
                                                                        className="text-xs"
                                                                    >
                                                                        {issue.priority}
                                                                    </Badge>
                                                                </div>
                                                            </div>
                                                            <ExternalLink className="h-4 w-4 text-muted-foreground" />
                                                        </div>
                                                    </CardContent>
                                                </Card>
                                            ))}
                                        </div>
                                    )}
                                </div>

                                <Separator />

                                {/* Metadata */}
                                <div className="text-sm text-muted-foreground space-y-1">
                                    <p><strong>Project ID:</strong> {project.id}</p>
                                    <p><strong>Created:</strong> {formatDate(project.createdAt)}</p>
                                </div>
                            </div>
                        </>
                    )}
                </DialogContent>
            </Dialog>

            {/* Nested Issue Details Modal */}
            <IssueDetailsModal
                open={!! selectedIssueId}
                onOpenChange={() => setSelectedIssueId(null)}
                issueId={selectedIssueId}
                onIssueDeleted={() => {
                    setSelectedIssueId(null);
                    loadProjectDetails();
                    if (onProjectUpdate) onProjectUpdate();
                }}
                onIssueUpdated={() => {
                    loadProjectDetails();
                    if (onProjectUpdate) onProjectUpdate();
                }}
            />

            {/* Create Issue Modal */}
            <CreateIssueModal
                open={createIssueOpen}
                onOpenChange={setCreateIssueOpen}
                preSelectedProjectId={projectId}
                onIssueCreated={() => {
                    loadProjectDetails();
                    if (onProjectUpdate) onProjectUpdate();
                }}
            />
        </>
    );
}
import { useEffect, useState } from "react";
import { AppLayout } from "@/components/layout/AppLayout";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Plus, Search, Filter, Clock, MessageSquare } from "lucide-react";
import { useIssueStore } from "@/store/issueStore";
import { useProjectStore } from "@/store/projectStore";
import { CreateIssueModal } from "@/components/modals/CreateIssueModal";
import { IssueDetailsModal } from "@/components/modals/IssueDetailsModal";

export default function Issues() {
    const [searchQuery, setSearchQuery] = useState("");
    const [filterStatus, setFilterStatus] = useState("all");
    const [filterPriority, setFilterPriority] = useState("all");
    const [filterProject, setFilterProject] = useState("all");
    const [createModalOpen, setCreateModalOpen] = useState(false);
    const [detailsOpen, setDetailsOpen] = useState(false);
    const [selectedIssueId, setSelectedIssueId] = useState(null);

    const { issues, loading, error, fetchIssues } = useIssueStore();
    const projects = useProjectStore((state) => state.projects);

    useEffect(() => {
        fetchIssues();
    }, [fetchIssues]);

    const filteredIssues = issues.filter((issue) => {
        const matchesSearch =
            issue.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
            (issue.description ?? "").toLowerCase().includes(searchQuery.toLowerCase());
        const matchesStatus = filterStatus === "all" || issue.status?.toLowerCase() === filterStatus;
        const matchesPriority = filterPriority === "all" || issue.priority?.toLowerCase() === filterPriority;
        const matchesProject = filterProject === "all" || String(issue.projectId) === String(filterProject);

        return matchesSearch && matchesStatus && matchesPriority && matchesProject;
    });

    const handleOpenDetails = (id) => {
        setSelectedIssueId(id);
        setDetailsOpen(true);
    };

    return (
        <AppLayout>
            <div className="space-y-6 animate-fade-in">
                {/* Header */}
                <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                    <div>
                        <h1 className="text-4xl font-bold tracking-tight">Issues</h1>
                        <p className="text-muted-foreground mt-2">Track and manage all your tasks</p>
                    </div>
                    <Button
                        variant="gradient"
                        onClick={() => setCreateModalOpen(true)}
                        className="w-full md:w-auto"
                    >
                        <Plus className="mr-2 h-4 w-4" />
                        New Issue
                    </Button>
                </div>

                {/* Filters */}
                <Card className="border-border/50">
                    <CardContent className="p-4">
                        <div className="flex flex-col lg:flex-row gap-4">
                            {/* Search */}
                            <div className="flex-1 relative">
                                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                                <Input
                                    placeholder="Search issues..."
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                    className="pl-10 transition-all duration-200 focus:scale-[1.01]"
                                />
                            </div>

                            {/* Filters */}
                            <div className="flex flex-col sm:flex-row gap-2 lg:gap-4">
                                <Select value={filterProject} onValueChange={setFilterProject}>
                                    <SelectTrigger className="w-full sm:w-[160px] transition-all duration-200">
                                        <Filter className="h-4 w-4 mr-2" />
                                        <SelectValue placeholder="Project" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="all">All Projects</SelectItem>
                                        {projects.map((project) => (
                                            <SelectItem key={project.id} value={String(project.id)}>
                                                {project.shortName || project.name}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>

                                <Select value={filterStatus} onValueChange={setFilterStatus}>
                                    <SelectTrigger className="w-full sm:w-[140px] transition-all duration-200">
                                        <SelectValue placeholder="Status" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="all">All Status</SelectItem>
                                        <SelectItem value="todo">To Do</SelectItem>
                                        <SelectItem value="inprogress">In Progress</SelectItem>
                                        <SelectItem value="review">Review</SelectItem>
                                        <SelectItem value="done">Done</SelectItem>
                                    </SelectContent>
                                </Select>

                                <Select value={filterPriority} onValueChange={setFilterPriority}>
                                    <SelectTrigger className="w-full sm:w-[140px] transition-all duration-200">
                                        <SelectValue placeholder="Priority" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="all">All Priority</SelectItem>
                                        <SelectItem value="high">High</SelectItem>
                                        <SelectItem value="medium">Medium</SelectItem>
                                        <SelectItem value="low">Low</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                {/* Issues List */}
                <div className="space-y-3">
                    {loading ? (
                        <Card><CardContent className="p-8 text-center text-muted-foreground">Loading issues...</CardContent></Card>
                    ) : error ? (
                        <Card><CardContent className="p-8 text-center text-destructive">{error}</CardContent></Card>
                    ) : filteredIssues.length === 0 ? (
                        <Card className="border-border/50">
                            <CardContent className="flex flex-col items-center justify-center py-12">
                                <p className="text-muted-foreground text-lg">No issues found</p>
                                <Button variant="outline" onClick={() => setCreateModalOpen(true)} className="mt-4">
                                    <Plus className="mr-2 h-4 w-4" />
                                    Create your first issue
                                </Button>
                            </CardContent>
                        </Card>
                    ) : (
                        filteredIssues.map((issue) => (
                            <Card
                                key={issue.id}
                                onClick={() => handleOpenDetails(issue.id)}
                                className="group hover:shadow-lg transition-all duration-200 cursor-pointer hover:scale-[1.01] border-border/50 bg-gradient-to-br from-card to-card/80"
                            >
                                <CardContent className="p-4 md:p-6">
                                    <div className="flex flex-col md:flex-row md:items-start gap-4">
                                        {/* Status Badge */}
                                        <Badge
                                            variant={
                                                issue.status?.toLowerCase() === "todo"
                                                    ? "todo"
                                                    : issue.status?.toLowerCase() === "inprogress"
                                                        ? "inprogress"
                                                        : issue.status?.toLowerCase() === "review"
                                                            ? "warning"
                                                            : "done"
                                            }
                                            className="rounded-full w-fit"
                                        >
                                            {issue.status === "todo"
                                                ? "To Do"
                                                : issue.status === "inprogress"
                                                    ? "In Progress"
                                                    : issue.status === "review"
                                                        ? "Review"
                                                        : "Done"}
                                        </Badge>

                                        {/* Content */}
                                        <div className="flex-1 space-y-2 min-w-0">
                                            <div className="flex items-start justify-between gap-2">
                                                <h3 className="font-semibold text-lg leading-tight group-hover:text-primary transition-colors">
                                                    {issue.title}
                                                </h3>
                                                <Badge
                                                    variant={
                                                        issue.priority?.toLowerCase() === "high"
                                                            ? "destructive"
                                                            : issue.priority?.toLowerCase() === "medium"
                                                                ? "warning"
                                                                : "secondary"
                                                    }
                                                    className="text-xs shrink-0"
                                                >
                                                    {issue.priority}
                                                </Badge>
                                            </div>
                                            <p className="text-sm text-muted-foreground line-clamp-2">{issue.description}</p>
                                            {/* Labels */}
                                            {Array.isArray(issue.labels) && issue.labels.length > 0 && (
                                                <div className="flex flex-wrap gap-1">
                                                    {issue.labels.map((label, idx) => (
                                                        <Badge key={idx} variant="outline" className="text-xs px-2 py-0">
                                                            {label}
                                                        </Badge>
                                                    ))}
                                                </div>
                                            )}
                                        </div>
                                        {/* Meta */}
                                        <div className="flex md:flex-col items-center md:items-end gap-3 md:gap-2 text-xs text-muted-foreground">
                                            <div className="flex items-center gap-1">
                                                <Clock className="h-3 w-3" />
                                                {issue.dueDate}
                                            </div>
                                            <div className="flex items-center gap-1">
                                                <MessageSquare className="h-3 w-3" />
                                                {issue.comments || 0}
                                            </div>
                                            <Avatar className="h-8 w-8">
                                                <AvatarFallback className="bg-primary text-primary-foreground text-xs">
                                                    {issue.assignee}
                                                </AvatarFallback>
                                            </Avatar>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        ))
                    )}
                </div>
            </div>

            <CreateIssueModal open={createModalOpen} onOpenChange={setCreateModalOpen} />
            <IssueDetailsModal
                open={detailsOpen}
                onOpenChange={setDetailsOpen}
                issueId={selectedIssueId}
            />
        </AppLayout>
    );
}

import { useEffect, useState } from "react";
import { AppLayout } from "@/components/layout/AppLayout";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { useIssueStore } from "@/store/issueStore";
import { IssueDetailsModal } from "@/components/modals/IssueDetailsModal";
import { CreateIssueModal } from "@/components/modals/CreateIssueModal";
import { Plus, Search, X, ListTodo } from "lucide-react";
import { toast } from "sonner";

function formatDate(dateString) {
    if (!dateString) return "No due date";
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
        year: "numeric",
        month:  "short",
        day: "numeric"
    });
}

export default function Issues() {
    const { issues, fetchIssues, loading } = useIssueStore();
    const [selectedIssueId, setSelectedIssueId] = useState(null);
    const [createModalOpen, setCreateModalOpen] = useState(false);

    // Filters
    const [searchTerm, setSearchTerm] = useState("");
    const [statusFilter, setStatusFilter] = useState("all");
    const [priorityFilter, setPriorityFilter] = useState("all");

    useEffect(() => {
        fetchIssues();
    }, []);

    // Filtrowanie
    const filteredIssues = issues.filter(issue => {
        const matchesSearch =
            (issue.title?. toLowerCase() || "").includes(searchTerm.toLowerCase()) ||
            (issue.key?.toLowerCase() || "").includes(searchTerm.toLowerCase()) ||
            (issue.description?. toLowerCase() || "").includes(searchTerm.toLowerCase());

        const matchesStatus = statusFilter === "all" || issue.status === statusFilter;
        const matchesPriority = priorityFilter === "all" || issue.priority === priorityFilter;

        return matchesSearch && matchesStatus && matchesPriority;
    });

    const clearFilters = () => {
        setSearchTerm("");
        setStatusFilter("all");
        setPriorityFilter("all");
        toast.success("Filters cleared");
    };

    const hasActiveFilters = searchTerm || statusFilter !== "all" || priorityFilter !== "all";

    return (
        <AppLayout>
            <div className="space-y-6">
                {/* Header */}
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-3xl font-bold">Issues</h1>
                        <p className="text-muted-foreground">
                            Manage and track all your tasks • {filteredIssues.length} of {issues.length} issues
                        </p>
                    </div>
                    <Button onClick={() => setCreateModalOpen(true)}>
                        <Plus className="mr-2 h-4 w-4" />
                        Create Issue
                    </Button>
                </div>

                {/* Filters */}
                <Card>
                    <CardContent className="pt-6">
                        <div className="flex flex-col md:flex-row gap-4">
                            <div className="flex-1">
                                <div className="relative">
                                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                                    <Input
                                        placeholder="Search by title, key, or description..."
                                        value={searchTerm}
                                        onChange={(e) => setSearchTerm(e.target.value)}
                                        className="pl-10"
                                    />
                                </div>
                            </div>

                            <Select value={statusFilter} onValueChange={setStatusFilter}>
                                <SelectTrigger className="w-full md:w-[180px]">
                                    <SelectValue placeholder="Status" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="all">All Statuses</SelectItem>
                                    <SelectItem value="NEW">To Do</SelectItem>
                                    <SelectItem value="IN_PROGRESS">In Progress</SelectItem>
                                    <SelectItem value="REVIEW">Review</SelectItem>
                                    <SelectItem value="DONE">Done</SelectItem>
                                </SelectContent>
                            </Select>

                            <Select value={priorityFilter} onValueChange={setPriorityFilter}>
                                <SelectTrigger className="w-full md:w-[180px]">
                                    <SelectValue placeholder="Priority" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="all">All Priorities</SelectItem>
                                    <SelectItem value="HIGH">High</SelectItem>
                                    <SelectItem value="NORMAL">Normal</SelectItem>
                                    <SelectItem value="LOW">Low</SelectItem>
                                </SelectContent>
                            </Select>

                            {hasActiveFilters && (
                                <Button variant="outline" onClick={clearFilters}>
                                    <X className="mr-2 h-4 w-4" />
                                    Clear
                                </Button>
                            )}
                        </div>
                    </CardContent>
                </Card>

                {/* Issues List */}
                {loading ? (
                    <div className="text-center py-12">
                        <p className="text-muted-foreground">Loading issues...</p>
                    </div>
                ) : filteredIssues.length === 0 ? (
                    <Card>
                        <CardContent className="py-12 text-center">
                            <ListTodo className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
                            <p className="text-lg font-medium mb-2">
                                {hasActiveFilters ? "No issues match your filters" : "No issues found"}
                            </p>
                            <p className="text-sm text-muted-foreground mb-4">
                                {hasActiveFilters
                                    ? "Try adjusting your search criteria"
                                    : "Create your first issue to get started"}
                            </p>
                            {hasActiveFilters && (
                                <Button variant="outline" onClick={clearFilters}>
                                    Clear Filters
                                </Button>
                            )}
                        </CardContent>
                    </Card>
                ) : (
                    <div className="space-y-3">
                        {filteredIssues.map(issue => (
                            <Card
                                key={issue.id}
                                className="cursor-pointer hover:shadow-lg transition-all hover:scale-[1.01]"
                                onClick={() => setSelectedIssueId(issue.id)}
                            >
                                <CardContent className="p-4">
                                    <div className="flex items-center justify-between">
                                        <div className="flex-1 min-w-0">
                                            <div className="flex items-center gap-3 mb-2">
                                                <span className="font-mono text-sm text-muted-foreground font-semibold">
                                                    {issue.key}
                                                </span>
                                                <h3 className="font-semibold truncate">{issue.title}</h3>
                                            </div>
                                            <div className="flex items-center gap-2 flex-wrap">
                                                <Badge
                                                    variant={issue.status === "DONE" ? "default" : "secondary"}
                                                    className={
                                                        issue.status === "DONE" ?  "bg-green-500" :
                                                            issue.status === "IN_PROGRESS" ?  "bg-blue-500" :
                                                                issue.status === "REVIEW" ?  "bg-purple-500" :
                                                                    "bg-gray-500"
                                                    }
                                                >
                                                    {issue.status === "NEW" ? "To Do" :
                                                        issue.status === "IN_PROGRESS" ? "In Progress" :
                                                            issue.status}
                                                </Badge>
                                                <Badge
                                                    variant={
                                                        issue.priority === "HIGH" ? "destructive" :
                                                            issue.priority === "NORMAL" ? "secondary" :
                                                                "outline"
                                                    }
                                                >
                                                    {issue. priority}
                                                </Badge>
                                                <span className="text-sm text-muted-foreground">
                                                    📅 {formatDate(issue. dueDate)}
                                                </span>
                                                {issue.assigneeId && (
                                                    <span className="text-sm text-muted-foreground">
                                                        👤 User #{issue.assigneeId}
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

            <IssueDetailsModal
                open={!! selectedIssueId}
                onOpenChange={() => setSelectedIssueId(null)}
                issueId={selectedIssueId}
                onIssueDeleted={() => {
                    setSelectedIssueId(null);
                    fetchIssues();
                }}
            />

            <CreateIssueModal
                open={createModalOpen}
                onOpenChange={setCreateModalOpen}
            />
        </AppLayout>
    );
}
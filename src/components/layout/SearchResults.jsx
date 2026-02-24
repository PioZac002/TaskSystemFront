import { useEffect, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { Separator } from "@/components/ui/Separator";
import { useProjectStore } from "@/store/projectStore";
import { useIssueStore } from "@/store/issueStore";
import { useSearchStore } from "@/store/searchStore";
import { FolderKanban, ListTodo, X } from "lucide-react";
import { Button } from "@/components/ui/Button";

const PRIORITY_COLORS = {
    HIGH: "destructive",
    NORMAL: "default",
    LOW: "secondary",
};

const STATUS_COLORS = {
    NEW: "secondary",
    IN_PROGRESS: "default",
    DONE: "outline",
};

export function SearchResults() {
    const navigate = useNavigate();
    const { searchTerm, isSearchOpen, clearSearch } = useSearchStore();
    const { projects } = useProjectStore();
    const { issues } = useIssueStore();

    // Filter results based on search term
    const filteredResults = useMemo(() => {
        if (!searchTerm || searchTerm.length < 2) {
            return { projects: [], issues: [] };
        }

        const lowerTerm = searchTerm.toLowerCase();

        const matchedProjects = projects.filter(project => 
            project.shortName?.toLowerCase().includes(lowerTerm) ||
            project.description?.toLowerCase().includes(lowerTerm)
        ).slice(0, 5); // Limit to 5 results

        const matchedIssues = issues.filter(issue =>
            issue.title?.toLowerCase().includes(lowerTerm) ||
            issue.key?.toLowerCase().includes(lowerTerm) ||
            issue.description?.toLowerCase().includes(lowerTerm)
        ).slice(0, 5); // Limit to 5 results

        return { projects: matchedProjects, issues: matchedIssues };
    }, [searchTerm, projects, issues]);

    const hasResults = filteredResults.projects.length > 0 || filteredResults.issues.length > 0;

    if (!isSearchOpen || !searchTerm || searchTerm.length < 2) {
        return null;
    }

    const handleProjectClick = (projectId) => {
        navigate(`/projects`);
        clearSearch();
    };

    const handleIssueClick = (issueId) => {
        navigate(`/issues`);
        clearSearch();
    };

    return (
        <div className="absolute top-full left-0 right-0 mt-2 z-50">
            <Card className="shadow-lg max-h-[400px] overflow-y-auto">
                <CardContent className="p-4">
                    <div className="flex items-center justify-between mb-3">
                        <h3 className="text-sm font-semibold text-muted-foreground">
                            Search Results for "{searchTerm}"
                        </h3>
                        <Button 
                            variant="ghost" 
                            size="icon"
                            className="h-6 w-6"
                            onClick={clearSearch}
                        >
                            <X className="h-4 w-4" />
                        </Button>
                    </div>

                    {!hasResults && (
                        <p className="text-sm text-muted-foreground py-4 text-center">
                            No projects or issues found matching "{searchTerm}"
                        </p>
                    )}

                    {filteredResults.projects.length > 0 && (
                        <div className="mb-4">
                            <div className="flex items-center gap-2 mb-2">
                                <FolderKanban className="h-4 w-4 text-muted-foreground" />
                                <h4 className="text-xs font-semibold text-muted-foreground uppercase">
                                    Projects ({filteredResults.projects.length})
                                </h4>
                            </div>
                            <div className="space-y-2">
                                {filteredResults.projects.map(project => (
                                    <div
                                        key={project.id}
                                        className="p-2 rounded-md hover:bg-accent cursor-pointer transition-colors"
                                        onClick={() => handleProjectClick(project.id)}
                                    >
                                        <div className="flex items-center gap-2">
                                            <Badge variant="outline" className="font-mono">
                                                {project.shortName}
                                            </Badge>
                                            <span className="text-sm truncate">
                                                {project.description || 'No description'}
                                            </span>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {filteredResults.projects.length > 0 && filteredResults.issues.length > 0 && (
                        <Separator className="my-3" />
                    )}

                    {filteredResults.issues.length > 0 && (
                        <div>
                            <div className="flex items-center gap-2 mb-2">
                                <ListTodo className="h-4 w-4 text-muted-foreground" />
                                <h4 className="text-xs font-semibold text-muted-foreground uppercase">
                                    Issues ({filteredResults.issues.length})
                                </h4>
                            </div>
                            <div className="space-y-2">
                                {filteredResults.issues.map(issue => (
                                    <div
                                        key={issue.id}
                                        className="p-2 rounded-md hover:bg-accent cursor-pointer transition-colors"
                                        onClick={() => handleIssueClick(issue.id)}
                                    >
                                        <div className="flex items-center gap-2 mb-1">
                                            <Badge variant="outline" className="font-mono text-xs">
                                                {issue.key}
                                            </Badge>
                                            <Badge variant={STATUS_COLORS[issue.status]} className="text-xs">
                                                {issue.status?.replace('_', ' ')}
                                            </Badge>
                                            <Badge variant={PRIORITY_COLORS[issue.priority]} className="text-xs">
                                                {issue.priority}
                                            </Badge>
                                        </div>
                                        <p className="text-sm truncate">{issue.title}</p>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}
                </CardContent>
            </Card>
        </div>
    );
}

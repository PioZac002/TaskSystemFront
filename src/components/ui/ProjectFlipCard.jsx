import React, { useState } from "react";
import { Link } from "react-router-dom";
import { ArrowUpRight, Eye, FolderKanban, ListChecks } from "lucide-react";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Progress } from "@/components/ui/Progress";
import { IssueLabelChips } from "@/components/ui/IssueLabelChips";
import { STATUS_LABELS, getStatusBadgeClass } from "@/utils/issueConstants";
import { cn } from "@/lib/utils";

export function ProjectFlipCard({ project, issues = [], className, onPreview, onIssuePreview }) {
    const [flipped, setFlipped] = useState(false);
    const visibleIssues = issues.slice(0, 5);
    const projectName = project.name || project.shortName || `Project #${project.id}`;
    const projectDescription = project.description || "No description provided";
    const issueCount = project.issueCount ?? project.totalIssues ?? issues.length;

    const handleToggle = (event) => {
        if (event.target.closest("a, button")) return;
        setFlipped((value) => !value);
    };

    return (
        <article
            className={cn("project-flip-card group", flipped && "is-flipped", className)}
            tabIndex={0}
            onClick={handleToggle}
            onKeyDown={(event) => {
                if (event.key === "Enter" || event.key === " ") {
                    event.preventDefault();
                    setFlipped((value) => !value);
                }
            }}
            aria-label={`${projectName} project card`}
        >
            <div className="project-flip-card__inner">
                <div className="project-flip-card__face project-flip-card__front border border-border bg-card text-card-foreground shadow-sm">
                    <div className="flex h-full flex-col p-5">
                        <div className="flex items-start justify-between gap-3">
                            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-lg border border-border bg-background">
                                <FolderKanban className="h-6 w-6 text-primary" />
                            </div>
                            <div className="flex items-center gap-2">
                                {onPreview && (
                                    <button
                                        title="Quick preview"
                                        className="rounded-md p-2 text-muted-foreground transition-colors hover:bg-accent hover:text-accent-foreground"
                                        onClick={() => onPreview(project.id)}
                                    >
                                        <Eye className="h-4 w-4" />
                                    </button>
                                )}
                                <Badge variant={project.progress === 100 ? "default" : "secondary"}>
                                    {issueCount} {issueCount === 1 ? "issue" : "issues"}
                                </Badge>
                            </div>
                        </div>

                        <div className="mt-5 min-w-0">
                            <h3 className="truncate font-mono text-xl font-semibold text-primary">
                                <Link
                                    to={`/projects/${project.id}`}
                                    title="Open full page"
                                    className="block truncate hover:underline"
                                >
                                    {projectName}
                                </Link>
                            </h3>
                            <p className="mt-2 line-clamp-3 min-h-[4.5rem] text-sm leading-6 text-muted-foreground">
                                {projectDescription}
                            </p>
                        </div>

                        <div className="mt-auto space-y-2 pt-5">
                            <div className="flex items-center justify-between text-sm">
                                <span className="text-muted-foreground">Progress</span>
                                <span className="font-medium">{project.progress || 0}%</span>
                            </div>
                            <Progress value={project.progress || 0} className="h-2" />
                        </div>
                    </div>
                </div>

                <div className="project-flip-card__face project-flip-card__back border border-border bg-card text-card-foreground shadow-sm">
                    <div className="flex h-full flex-col p-5">
                        <div className="flex items-center justify-between gap-3">
                            <div className="flex items-center gap-2">
                                <ListChecks className="h-5 w-5 text-primary" />
                                <h3 className="text-sm font-semibold uppercase tracking-[0.18em] text-muted-foreground">
                                    Issues
                                </h3>
                            </div>
                            <span className="text-xs text-muted-foreground">
                                {issueCount} total
                            </span>
                        </div>

                        <div className="mt-5 flex-1 space-y-2 overflow-hidden">
                            {visibleIssues.length === 0 ? (
                                <div className="rounded-lg border border-border bg-muted/50 p-4 text-sm text-muted-foreground">
                                    No issues in this project yet.
                                </div>
                            ) : (
                                visibleIssues.map((issue) => (
                                    <button
                                        key={issue.id}
                                        type="button"
                                        className="w-full rounded-lg border border-border bg-background/80 px-3 py-2 text-left transition-colors hover:bg-muted"
                                        onClick={() => onIssuePreview?.(issue.id)}
                                    >
                                        <div className="flex items-center gap-2">
                                            <span className="shrink-0 font-mono text-xs text-muted-foreground">
                                                {issue.key || `#${issue.id}`}
                                            </span>
                                            <span className="truncate text-sm font-medium text-foreground">
                                                {issue.title || "Untitled issue"}
                                            </span>
                                        </div>
                                        <Badge
                                            variant="secondary"
                                            className={cn(
                                                "mt-2 text-[11px]",
                                                getStatusBadgeClass(issue.status)
                                            )}
                                        >
                                            {STATUS_LABELS[issue.status] || issue.status || "New"}
                                        </Badge>
                                        <IssueLabelChips
                                            labels={issue.labels || []}
                                            max={2}
                                            className="mt-2"
                                            badgeClassName="text-[11px]"
                                        />
                                    </button>
                                ))
                            )}
                        </div>

                        <Button asChild size="sm" className="mt-5 w-full bg-foreground text-background hover:bg-foreground/90 dark:bg-white dark:text-slate-950 dark:hover:bg-white/90">
                            <Link to={`/projects/${project.id}`}>
                                Go to project
                                <ArrowUpRight className="h-4 w-4" />
                            </Link>
                        </Button>
                    </div>
                </div>
            </div>
        </article>
    );
}

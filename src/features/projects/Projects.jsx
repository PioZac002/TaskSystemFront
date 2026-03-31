import { useEffect, useState, useRef } from "react";
import { Link } from "react-router-dom";
import { AppLayout } from "@/components/layout/AppLayout";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Badge } from "@/components/ui/Badge";
import { Progress } from "@/components/ui/Progress";
import { useProjectStore } from "@/store/projectStore";
import { useIssueStore } from "@/store/issueStore";
import { ProjectDetailsModal } from "@/components/modals/ProjectDetailsModal";
import { CreateProjectModal } from "@/components/modals/CreateProjectModal";
import { AddButton } from "@/components/ui/AddButton";
import { useResponsiveNavigation } from "@/hooks/useResponsiveNavigation";
import { Plus, Search, X, FolderKanban, Eye } from "lucide-react";
import { gsap } from "gsap";
import { cn } from "@/lib/utils";

// ─── Color palette (same as Dashboard) ───────────────────────────────────────
const PROJECT_PALETTE = [
    { accent: "#7c3aed", dot: "bg-violet-500",  text: "text-violet-600 dark:text-violet-400"  },
    { accent: "#3b82f6", dot: "bg-blue-500",    text: "text-blue-600 dark:text-blue-400"      },
    { accent: "#10b981", dot: "bg-emerald-500", text: "text-emerald-600 dark:text-emerald-400" },
    { accent: "#f97316", dot: "bg-orange-500",  text: "text-orange-600 dark:text-orange-400"  },
    { accent: "#a855f7", dot: "bg-purple-500",  text: "text-purple-600 dark:text-purple-400"  },
    { accent: "#06b6d4", dot: "bg-cyan-500",    text: "text-cyan-600 dark:text-cyan-400"      },
];

// ─── Project card ─────────────────────────────────────────────────────────────
function ProjectCard({ project, colorIndex, isMobile, onPreview }) {
    const color = PROJECT_PALETTE[colorIndex % PROJECT_PALETTE.length];

    return (
        <div
            className="group flex flex-col rounded-xl bg-card border border-border border-t-2 hover:border-border/80 hover:shadow-sm transition-all duration-150 overflow-hidden"
            style={{ borderTopColor: color.accent }}
        >
            <div className="p-4 flex flex-col gap-3">
                {/* Header row: name + eye + issue count */}
                <div className="flex items-start gap-2">
                    <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-1.5 min-w-0">
                            <span className={cn("h-2 w-2 rounded-full shrink-0 mt-0.5", color.dot)} />
                            {isMobile ? (
                                <span
                                    className={cn("font-mono font-semibold text-sm truncate cursor-pointer hover:underline flex-1 min-w-0", color.text)}
                                    onClick={() => onPreview(project.id)}
                                >
                                    {project.shortName}
                                </span>
                            ) : (
                                <Link
                                    to={`/projects/${project.id}`}
                                    className={cn("font-mono font-semibold text-sm truncate hover:underline flex-1 min-w-0", color.text)}
                                >
                                    {project.shortName}
                                </Link>
                            )}
                            <button
                                title="Quick preview"
                                onClick={() => onPreview(project.id)}
                                className="shrink-0 text-muted-foreground hover:text-primary transition-opacity opacity-0 group-hover:opacity-100"
                            >
                                <Eye className="h-3.5 w-3.5" />
                            </button>
                        </div>
                        <p className="text-xs text-muted-foreground line-clamp-2 mt-1 pl-3.5">
                            {project.description || "No description"}
                        </p>
                    </div>
                    <Badge variant="secondary" className="shrink-0 text-[10px] tabular-nums">
                        {project.totalIssues}
                    </Badge>
                </div>

                {/* Progress */}
                <div className="space-y-1">
                    <div className="flex items-center justify-between">
                        <span className="text-xs text-muted-foreground">Progress</span>
                        <span className="text-xs font-semibold tabular-nums">{project.progress}%</span>
                    </div>
                    <Progress value={project.progress} className="h-1.5" />
                    <p className="text-[10px] text-muted-foreground">
                        {project.doneIssues} of {project.totalIssues} issues completed
                    </p>
                </div>

                {/* Mini stats row */}
                <div className="grid grid-cols-3 gap-1 pt-2 border-t border-border/60">
                    <div className="text-center">
                        <p className="text-[10px] font-medium text-emerald-600 dark:text-emerald-400 uppercase tracking-wide">Done</p>
                        <p className="text-sm font-bold tabular-nums mt-0.5">{project.doneIssues}</p>
                    </div>
                    <div className="text-center">
                        <p className="text-[10px] font-medium text-blue-600 dark:text-blue-400 uppercase tracking-wide">Active</p>
                        <p className="text-sm font-bold tabular-nums mt-0.5">{project.inProgressIssues}</p>
                    </div>
                    <div className="text-center">
                        <p className="text-[10px] font-medium text-muted-foreground uppercase tracking-wide">To Do</p>
                        <p className="text-sm font-bold tabular-nums mt-0.5">{project.todoIssues}</p>
                    </div>
                </div>

                {/* Priority badges */}
                {project.totalIssues > 0 && (project.highPriority > 0 || project.normalPriority > 0 || project.lowPriority > 0) && (
                    <div className="pt-2 border-t border-border/60 flex gap-1.5 flex-wrap">
                        {project.highPriority > 0 && (
                            <Badge variant="destructive" className="text-[10px] px-1.5 py-0">
                                {project.highPriority} High
                            </Badge>
                        )}
                        {project.normalPriority > 0 && (
                            <Badge variant="secondary" className="text-[10px] px-1.5 py-0">
                                {project.normalPriority} Normal
                            </Badge>
                        )}
                        {project.lowPriority > 0 && (
                            <Badge variant="outline" className="text-[10px] px-1.5 py-0">
                                {project.lowPriority} Low
                            </Badge>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
}

// ─── Main component ────────────────────────────────────────────────────────────
export default function Projects() {
    const { isMobile } = useResponsiveNavigation();
    const { projects, fetchProjects, loading } = useProjectStore();
    const { issues, fetchIssues }              = useIssueStore();
    const [selectedProjectId, setSelectedProjectId] = useState(null);
    const [createModalOpen, setCreateModalOpen]     = useState(false);
    const [searchTerm, setSearchTerm]               = useState("");

    const headerRef = useRef(null);
    const gridRef   = useRef(null);

    useEffect(() => {
        fetchProjects();
        fetchIssues();
    }, []);

    // Header slide-in on mount
    useEffect(() => {
        const ctx = gsap.context(() => {
            if (headerRef.current) {
                gsap.fromTo(headerRef.current,
                    { y: -28, opacity: 0 },
                    { y: 0, opacity: 1, duration: 0.5, ease: "power3.out", clearProps: "y,transform" }
                );
            }
        });
        return () => ctx.revert();
    }, []);

    // Cards stagger when data arrives
    useEffect(() => {
        if (!loading && gridRef.current) {
            const cards = gridRef.current.querySelectorAll(".project-card");
            if (cards.length > 0) {
                gsap.fromTo(cards,
                    { opacity: 0, y: 14 },
                    { opacity: 1, y: 0, duration: 0.35, stagger: 0.06, ease: "power2.out", clearProps: "transform,opacity" }
                );
            }
        }
    }, [loading]);

    // ── Derived data ──────────────────────────────────────────────────────────
    const projectsWithProgress = projects.map(project => {
        const projectIssues    = issues.filter(i => i.projectId === project.id);
        const doneIssues       = projectIssues.filter(i => i.status === "DONE");
        const inProgressIssues = projectIssues.filter(i => i.status === "IN_PROGRESS");
        const todoIssues       = projectIssues.filter(i => i.status === "NEW");
        const highPriority     = projectIssues.filter(i => i.priority === "HIGH").length;
        const normalPriority   = projectIssues.filter(i => i.priority === "NORMAL").length;
        const lowPriority      = projectIssues.filter(i => i.priority === "LOW").length;
        const progress         = projectIssues.length > 0
            ? Math.round((doneIssues.length / projectIssues.length) * 100) : 0;

        return {
            ...project,
            totalIssues: projectIssues.length,
            doneIssues: doneIssues.length,
            inProgressIssues: inProgressIssues.length,
            todoIssues: todoIssues.length,
            highPriority,
            normalPriority,
            lowPriority,
            progress,
        };
    });

    const filteredProjects = projectsWithProgress.filter(p =>
        (p.shortName?.toLowerCase()   || "").includes(searchTerm.toLowerCase()) ||
        (p.description?.toLowerCase() || "").includes(searchTerm.toLowerCase())
    );

    const clearSearch = () => setSearchTerm("");

    // Global issue stats
    const totalIssues    = issues.length;
    const activeIssues   = issues.filter(i => i.status === "IN_PROGRESS").length;
    const doneTotal      = issues.filter(i => i.status === "DONE").length;
    const completionRate = totalIssues > 0 ? Math.round((doneTotal / totalIssues) * 100) : 0;

    const statItems = [
        { label: "Projects", value: projects.length,        color: "text-violet-600 dark:text-violet-400"  },
        { label: "Issues",   value: totalIssues,            color: "text-blue-600 dark:text-blue-400"      },
        { label: "Active",   value: activeIssues,           color: "text-orange-600 dark:text-orange-400"  },
        { label: "Done",     value: doneTotal,              color: "text-emerald-600 dark:text-emerald-400" },
        { label: "Rate",     value: `${completionRate}%`,   color: "text-cyan-600 dark:text-cyan-400"      },
        ...(searchTerm ? [{ label: "Found", value: filteredProjects.length, color: "text-muted-foreground" }] : []),
    ];

    // ── Render ────────────────────────────────────────────────────────────────
    return (
        <AppLayout>
            {/* ── Full-bleed Stats Bar ── */}
            <div ref={headerRef} className="-mx-6 md:-mx-8 -mt-6 md:-mt-8 mb-6 border-b border-border bg-card">
                <div className="flex items-center gap-2 px-4 md:px-6 py-4">
                    <div className="flex items-center justify-between md:justify-start md:gap-6 flex-1">
                        {statItems.map((s, i) => (
                            <div key={s.label} className="flex items-center gap-2 md:gap-5 shrink-0">
                                {i > 0 && <div className="hidden md:block w-px h-6 bg-border shrink-0" />}
                                <div>
                                    <p className={cn("text-[10px] uppercase tracking-wider font-medium", s.color)}>
                                        {s.label}
                                    </p>
                                    <p className="text-xl font-bold leading-none mt-0.5 tabular-nums">{s.value}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                    {/* Desktop create button */}
                    <div className="hidden md:flex shrink-0 ml-4">
                        <AddButton label="New Project" onClick={() => setCreateModalOpen(true)} />
                    </div>
                </div>
            </div>

            <div className="space-y-5">
                {/* ── Search toolbar ── */}
                <div className="flex items-center gap-2">
                    <div className="relative flex-1">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                        <Input
                            placeholder="Search projects by name or description…"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="pl-10"
                        />
                    </div>
                    {searchTerm && (
                        <Button variant="outline" size="sm" onClick={clearSearch} className="gap-1.5 shrink-0">
                            <X className="h-4 w-4" />
                            <span className="hidden sm:inline">Clear</span>
                        </Button>
                    )}
                    {/* Mobile create button */}
                    <Button
                        size="sm"
                        onClick={() => setCreateModalOpen(true)}
                        className="md:hidden gap-1.5 shrink-0"
                    >
                        <Plus className="h-4 w-4" />
                    </Button>
                </div>

                {/* ── Project grid ── */}
                {loading ? (
                    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                        {[1, 2, 3, 4, 5, 6].map(i => (
                            <div key={i} className="h-52 rounded-xl bg-muted/40 animate-pulse" />
                        ))}
                    </div>
                ) : filteredProjects.length === 0 ? (
                    <div className="rounded-xl border border-dashed border-border py-14 text-center space-y-3">
                        <FolderKanban className="mx-auto h-10 w-10 text-muted-foreground/30" />
                        <p className="text-sm font-medium text-foreground">
                            {searchTerm ? "No projects match your search" : "No projects yet"}
                        </p>
                        <p className="text-xs text-muted-foreground">
                            {searchTerm
                                ? "Try a different search term"
                                : "Create your first project to get started"}
                        </p>
                        {searchTerm ? (
                            <Button variant="outline" size="sm" onClick={clearSearch}>Clear Search</Button>
                        ) : (
                            <Button size="sm" onClick={() => setCreateModalOpen(true)} className="gap-1.5">
                                <Plus className="h-4 w-4" />
                                Create Project
                            </Button>
                        )}
                    </div>
                ) : (
                    <div ref={gridRef} className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                        {filteredProjects.map((project, i) => (
                            <div key={project.id} className="project-card">
                                <ProjectCard
                                    project={project}
                                    colorIndex={i}
                                    isMobile={isMobile}
                                    onPreview={setSelectedProjectId}
                                />
                            </div>
                        ))}
                    </div>
                )}
            </div>

            <ProjectDetailsModal
                open={!!selectedProjectId}
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

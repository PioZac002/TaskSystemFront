import { useEffect, useState, useRef } from "react";
import { useNavigate, Link } from "react-router-dom";
import { AppLayout } from "@/components/layout/AppLayout";
import { Progress } from "@/components/ui/Progress";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { useProjectStore } from "@/store/projectStore";
import { useIssueStore } from "@/store/issueStore";
import { useUserStore } from "@/store/userStore";
import { useAuthStore } from "@/store/authStore";
import { ProjectDetailsModal } from "@/components/modals/ProjectDetailsModal";
import { IssueDetailsModal } from "@/components/modals/IssueDetailsModal";
import { CreateProjectModal } from "@/components/modals/CreateProjectModal";
import { CreateIssueModal } from "@/components/modals/CreateIssueModal";
import { useResponsiveNavigation } from "@/hooks/useResponsiveNavigation";
import {
    FolderKanban, CheckSquare, Users, TrendingUp,
    Plus, ArrowRight, Eye, Calendar, User, Inbox,
} from "lucide-react";
import {
    STATUS_LABELS, PRIORITY_LABELS, getStatusBadgeClass, getPriorityBadgeVariant,
} from "@/utils/issueConstants";
import { gsap } from "gsap";
import { cn } from "@/lib/utils";

// ─── Project color palette (cycling, like Teams) ──────────────────────────────
const PROJECT_PALETTE = [
    { accent: "#7c3aed", dot: "bg-violet-500", text: "text-violet-600 dark:text-violet-400" },
    { accent: "#3b82f6", dot: "bg-blue-500",   text: "text-blue-600 dark:text-blue-400"   },
    { accent: "#10b981", dot: "bg-emerald-500", text: "text-emerald-600 dark:text-emerald-400" },
    { accent: "#f97316", dot: "bg-orange-500",  text: "text-orange-600 dark:text-orange-400"  },
    { accent: "#a855f7", dot: "bg-purple-500",  text: "text-purple-600 dark:text-purple-400"  },
    { accent: "#06b6d4", dot: "bg-cyan-500",    text: "text-cyan-600 dark:text-cyan-400"    },
];
const getProjectColor = (i) => PROJECT_PALETTE[i % PROJECT_PALETTE.length];

// ─── Section header (Board column header style) ───────────────────────────────
function SectionHeader({ label, count, accentColor, onViewAll, onAdd }) {
    return (
        <div className="flex items-center gap-2.5 mb-4">
            <div
                className="w-[3px] h-4 rounded-full shrink-0"
                style={{ backgroundColor: accentColor }}
            />
            <h2 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">
                {label}
            </h2>
            {count != null && (
                <Badge variant="secondary" className="text-xs tabular-nums">{count}</Badge>
            )}
            <div className="ml-auto flex items-center gap-2.5">
                {onAdd && (
                    <button
                        onClick={onAdd}
                        className="md:hidden flex items-center justify-center h-6 w-6 rounded-md text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
                        title="Add new"
                    >
                        <Plus className="h-3.5 w-3.5" />
                    </button>
                )}
                {onViewAll && (
                    <button
                        onClick={onViewAll}
                        className="flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground transition-colors"
                    >
                        View all <ArrowRight className="h-3 w-3" />
                    </button>
                )}
            </div>
        </div>
    );
}

// ─── Project card (Board card style with accent top-border) ───────────────────
function ProjectCard({ project, colorIndex, onPreview, isMobile }) {
    const color = getProjectColor(colorIndex);
    return (
        <div
            className="group flex flex-col rounded-xl bg-card border border-border border-t-2 hover:border-border/80 hover:shadow-sm transition-all duration-150 overflow-hidden"
            style={{ borderTopColor: color.accent }}
        >
            <div className="flex-1 p-4">
                {/* Title row */}
                <div className="flex items-start gap-2 mb-3">
                    <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-1.5 min-w-0">
                            <span className={cn("h-2 w-2 rounded-full shrink-0 mt-0.5", color.dot)} />
                            {isMobile ? (
                                <span
                                    className={cn("font-mono font-semibold text-sm truncate cursor-pointer hover:underline flex-1 min-w-0", color.text)}
                                    onClick={() => onPreview(project.id)}
                                >
                                    {project.name}
                                </span>
                            ) : (
                                <Link
                                    to={`/projects/${project.id}`}
                                    className={cn("font-mono font-semibold text-sm truncate hover:underline flex-1 min-w-0", color.text)}
                                >
                                    {project.name}
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
                        <p className="text-xs text-muted-foreground line-clamp-1 mt-1 pl-3.5">
                            {project.description}
                        </p>
                    </div>
                    <Badge variant="secondary" className="shrink-0 text-[10px] tabular-nums">
                        {project.issues}
                    </Badge>
                </div>

                {/* Progress */}
                <div className="space-y-1.5">
                    <div className="flex items-center justify-between">
                        <span className="text-xs text-muted-foreground">Progress</span>
                        <span className="text-xs font-semibold tabular-nums">{project.progress}%</span>
                    </div>
                    <Progress value={project.progress} className="h-1.5" />
                </div>
            </div>
        </div>
    );
}

// ─── Issue row (identical to Board mobile card style) ─────────────────────────
function IssueRow({ issue, isMobile, onPreview, getUserName }) {
    return (
        <div className="group flex items-start gap-3 px-4 py-3 rounded-xl bg-card border border-border hover:border-border/80 hover:shadow-sm transition-all duration-150">
            <div className="flex-1 min-w-0">
                {/* Key + title */}
                <div className="flex items-center gap-2 mb-1.5 min-w-0">
                    <span className="font-mono text-[10px] text-muted-foreground shrink-0 font-medium">
                        {issue.key}
                    </span>
                    {isMobile ? (
                        <span
                            className="text-sm font-semibold text-foreground cursor-pointer hover:underline line-clamp-1 flex-1 min-w-0"
                            onClick={() => onPreview(issue.id)}
                        >
                            {issue.title}
                        </span>
                    ) : (
                        <Link
                            to={`/issues/${issue.id}`}
                            className="text-sm font-semibold text-foreground hover:underline line-clamp-1 flex-1 min-w-0"
                        >
                            {issue.title}
                        </Link>
                    )}
                </div>
                {/* Meta row */}
                <div className="flex items-center gap-1.5 flex-wrap">
                    <Badge variant="secondary" className={cn("text-xs", getStatusBadgeClass(issue.status))}>
                        {STATUS_LABELS[issue.status] || issue.status}
                    </Badge>
                    <Badge variant={getPriorityBadgeVariant(issue.priority)} className="text-xs">
                        {PRIORITY_LABELS[issue.priority] || issue.priority}
                    </Badge>
                    {issue.dueDate && (
                        <span className="flex items-center gap-1 text-xs text-muted-foreground">
                            <Calendar className="h-3 w-3 shrink-0" />
                            {issue.dueDate}
                        </span>
                    )}
                    {issue.assignee && getUserName(issue.assignee) && (
                        <span className="flex items-center gap-1 text-xs text-muted-foreground">
                            <User className="h-3 w-3 shrink-0" />
                            {getUserName(issue.assignee)}
                        </span>
                    )}
                </div>
            </div>
            <button
                title="Quick preview"
                onClick={() => onPreview(issue.id)}
                className="shrink-0 text-muted-foreground hover:text-primary transition-opacity opacity-0 group-hover:opacity-100 mt-0.5"
            >
                <Eye className="h-4 w-4" />
            </button>
        </div>
    );
}

// ─── Helpers ──────────────────────────────────────────────────────────────────
function formatDate(dateString) {
    if (!dateString) return null;
    return new Date(dateString).toLocaleDateString("en-US", { month: "short", day: "numeric" });
}

// ─── Main component ────────────────────────────────────────────────────────────
export default function Dashboard() {
    const navigate = useNavigate();
    const { isMobile } = useResponsiveNavigation();
    const { projects, fetchProjects, loading: projectsLoading } = useProjectStore();
    const { issues, fetchIssues, loading: issuesLoading }       = useIssueStore();
    const { users, fetchUsers }                                  = useUserStore();
    const getUserIdFromToken = useAuthStore((state) => state.getUserIdFromToken);

    const [selectedProjectId, setSelectedProjectId] = useState(null);
    const [selectedIssueId, setSelectedIssueId]     = useState(null);
    const [createProjectOpen, setCreateProjectOpen] = useState(false);
    const [createIssueOpen, setCreateIssueOpen]     = useState(false);

    // ── Animation refs ────────────────────────────────────────────────────────
    const headerRef  = useRef(null);
    const contentRef = useRef(null);

    // ── Data fetching ─────────────────────────────────────────────────────────
    useEffect(() => {
        fetchProjects();
        fetchIssues();
        fetchUsers();
    }, []);

    // ── Page-mount animation (opacity only — no transforms on content) ────────
    useEffect(() => {
        const ctx = gsap.context(() => {
            if (headerRef.current) {
                gsap.fromTo(headerRef.current,
                    { y: -28, opacity: 0 },
                    { y: 0, opacity: 1, duration: 0.5, ease: "power3.out", clearProps: "y,transform" }
                );
            }
            if (contentRef.current) {
                const sections = contentRef.current.querySelectorAll(".dash-section");
                gsap.fromTo(sections,
                    { opacity: 0, y: 16 },
                    { opacity: 1, y: 0, duration: 0.4, stagger: 0.08, ease: "power2.out", delay: 0.2, clearProps: "transform,opacity" }
                );
            }
        });
        return () => ctx.revert();
    }, []);

    // ── Derived data ──────────────────────────────────────────────────────────
    const activeIssues    = issues.filter(i => i.status !== "DONE").length;
    const completedIssues = issues.filter(i => i.status === "DONE").length;
    const completionRate  = issues.length > 0
        ? Math.round((completedIssues / issues.length) * 100)
        : 0;

    const currentUserId = getUserIdFromToken();

    const getUserName = (userId) => {
        if (!userId) return null;
        const found = users.find(u => String(u.id) === String(userId));
        if (found) return `${found.firstName || ""} ${found.lastName || ""}`.trim() || null;
        return null;
    };

    // Project helper: enrich with progress
    const enrichProject = (project) => {
        const projectIssues = issues.filter(i => i.projectId === project.id);
        const doneIssues    = projectIssues.filter(i => i.status === "DONE");
        const progress      = projectIssues.length > 0
            ? Math.round((doneIssues.length / projectIssues.length) * 100) : 0;
        return {
            id: project.id,
            name: project.shortName,
            description: project.description || "No description",
            progress,
            issues: projectIssues.length,
        };
    };

    // Issue helper: normalize
    const enrichIssue = (issue) => ({
        id:       issue.id,
        key:      issue.key,
        title:    issue.title,
        priority: issue.priority || "NORMAL",
        status:   issue.status   || "NEW",
        assignee: issue.assigneeId || null,
        dueDate:  formatDate(issue.dueDate),
    });

    const yourProjects  = projects
        .filter(p => String(p.ownerId) === String(currentUserId))
        .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
        .slice(0, 3)
        .map(enrichProject);

    const yourIssues = issues
        .filter(i => String(i.assigneeId) === String(currentUserId) && i.status !== "DONE")
        .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
        .slice(0, 4)
        .map(enrichIssue);

    const recentProjects = projects
        .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
        .slice(0, 3)
        .map(enrichProject);

    const recentIssues = issues
        .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
        .slice(0, 4)
        .map(enrichIssue);

    const loading = projectsLoading || issuesLoading;

    // ── Stats (for the header bar) ────────────────────────────────────────────
    const statItems = [
        { label: "Projects",   value: projects.length,   color: "text-violet-600 dark:text-violet-400" },
        { label: "Active",     value: activeIssues,       color: "text-blue-600 dark:text-blue-400"    },
        { label: "Done",       value: completedIssues,    color: "text-emerald-600 dark:text-emerald-400" },
        { label: "Members",    value: users.length,       color: "text-cyan-600 dark:text-cyan-400"    },
        { label: "Rate",       value: `${completionRate}%`, color: "text-orange-600 dark:text-orange-400" },
    ];

    // ── Render ────────────────────────────────────────────────────────────────
    return (
        <AppLayout>
            {/* ── Full-bleed Stats Bar (Board-identical structure) ── */}
            <div
                ref={headerRef}
                className="-mx-6 md:-mx-8 -mt-6 md:-mt-8 mb-7 border-b border-border bg-card"
            >
                <div className="flex items-center gap-2 px-4 md:px-6 py-4">
                    {/* Stats — justify-between on mobile so no scrolling needed */}
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

                    {/* Action buttons — desktop only */}
                    <div className="hidden md:flex items-center gap-2 ml-4 shrink-0">
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={() => setCreateProjectOpen(true)}
                            className="gap-1.5"
                        >
                            <Plus className="h-4 w-4" />
                            Project
                        </Button>
                        <Button
                            size="sm"
                            onClick={() => setCreateIssueOpen(true)}
                            className="gap-1.5"
                        >
                            <Plus className="h-4 w-4" />
                            Issue
                        </Button>
                    </div>
                </div>
            </div>

            {/* ── Page content ── */}
            <div ref={contentRef} className="space-y-8">

                {/* ── Your Projects ── */}
                {yourProjects.length > 0 && (
                    <div className="dash-section">
                        <SectionHeader
                            label="Your Projects"
                            count={yourProjects.length}
                            accentColor="#7c3aed"
                            onViewAll={() => navigate("/projects")}
                        />
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                            {yourProjects.map((project, i) => (
                                <ProjectCard
                                    key={project.id}
                                    project={project}
                                    colorIndex={i}
                                    onPreview={setSelectedProjectId}
                                    isMobile={isMobile}
                                />
                            ))}
                        </div>
                    </div>
                )}

                {/* ── Your Issues ── */}
                {yourIssues.length > 0 && (
                    <div className="dash-section">
                        <SectionHeader
                            label="Your Issues"
                            count={yourIssues.length}
                            accentColor="#3b82f6"
                            onViewAll={() => navigate(`/issues?assignee=${currentUserId}`)}
                            onAdd={() => setCreateIssueOpen(true)}
                        />
                        <div className="space-y-2">
                            {yourIssues.map((issue) => (
                                <IssueRow
                                    key={issue.id}
                                    issue={issue}
                                    isMobile={isMobile}
                                    onPreview={setSelectedIssueId}
                                    getUserName={getUserName}
                                />
                            ))}
                        </div>
                    </div>
                )}

                {/* ── Recent Projects ── */}
                <div className="dash-section">
                    <SectionHeader
                        label="Recent Projects"
                        count={loading ? null : recentProjects.length}
                        accentColor="#10b981"
                        onViewAll={() => navigate("/projects")}
                        onAdd={() => setCreateProjectOpen(true)}
                    />

                    {loading ? (
                        <div className="space-y-2">
                            {[1, 2, 3].map(i => (
                                <div key={i} className="h-24 rounded-xl bg-muted/40 animate-pulse" />
                            ))}
                        </div>
                    ) : recentProjects.length === 0 ? (
                        <div className="rounded-xl border border-dashed border-border py-12 text-center space-y-3">
                            <FolderKanban className="mx-auto h-10 w-10 text-muted-foreground/30" />
                            <p className="text-sm text-muted-foreground">No projects yet</p>
                            <Button size="sm" onClick={() => setCreateProjectOpen(true)} className="gap-1.5">
                                <Plus className="h-4 w-4" />
                                Create first project
                            </Button>
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                            {recentProjects.map((project, i) => (
                                <ProjectCard
                                    key={project.id}
                                    project={project}
                                    colorIndex={i + 3}
                                    onPreview={setSelectedProjectId}
                                    isMobile={isMobile}
                                />
                            ))}
                        </div>
                    )}
                </div>

                {/* ── Recent Issues ── */}
                <div className="dash-section">
                    <SectionHeader
                        label="Recent Issues"
                        count={loading ? null : recentIssues.length}
                        accentColor="#f97316"
                        onViewAll={() => navigate("/issues")}
                    />

                    {loading ? (
                        <div className="space-y-2">
                            {[1, 2, 3, 4].map(i => (
                                <div key={i} className="h-16 rounded-xl bg-muted/40 animate-pulse" />
                            ))}
                        </div>
                    ) : recentIssues.length === 0 ? (
                        <div className="rounded-xl border border-dashed border-border py-12 text-center space-y-3">
                            <Inbox className="mx-auto h-10 w-10 text-muted-foreground/30" />
                            <p className="text-sm text-muted-foreground">No issues yet</p>
                            <Button size="sm" onClick={() => setCreateIssueOpen(true)} className="gap-1.5">
                                <Plus className="h-4 w-4" />
                                Create first issue
                            </Button>
                        </div>
                    ) : (
                        <div className="space-y-2">
                            {recentIssues.map((issue) => (
                                <IssueRow
                                    key={issue.id}
                                    issue={issue}
                                    isMobile={isMobile}
                                    onPreview={setSelectedIssueId}
                                    getUserName={getUserName}
                                />
                            ))}
                        </div>
                    )}
                </div>

            </div>

            {/* ── Modals ── */}
            <ProjectDetailsModal
                open={!!selectedProjectId}
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

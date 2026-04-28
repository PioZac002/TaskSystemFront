import { useEffect, useState, useRef } from "react";
import { useNavigate, Link } from "react-router-dom";
import { AppLayout } from "@/components/layout/AppLayout";
import { Progress } from "@/components/ui/Progress";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/Select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import { Checkbox } from "@/components/ui/Checkbox";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/Popover";
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/Chart";
import { useProjectStore } from "@/store/projectStore";
import { useIssueStore } from "@/store/issueStore";
import { useUserStore } from "@/store/userStore";
import { useAuthStore } from "@/store/authStore";
import { ProjectDetailsModal } from "@/components/modals/ProjectDetailsModal";
import { IssueDetailsModal } from "@/components/modals/IssueDetailsModal";
import { CreateProjectModal } from "@/components/modals/CreateProjectModal";
import { CreateIssueModal } from "@/components/modals/CreateIssueModal";
import { AddButton } from "@/components/ui/AddButton";
import { useResponsiveNavigation } from "@/hooks/useResponsiveNavigation";
import {
    FolderKanban,
    Plus, ArrowRight, Eye, Calendar, User,
    LayoutDashboard, SlidersHorizontal, PanelRightOpen, Settings2, ArrowUp, ArrowDown,
} from "lucide-react";
import {
    STATUS_LABELS, PRIORITY_LABELS, getStatusBadgeClass, getPriorityBadgeVariant,
} from "@/utils/issueConstants";
import { Bar, BarChart, CartesianGrid, Cell, Line, LineChart, Pie, PieChart, XAxis, YAxis } from "recharts";
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

const DASHBOARD_MODE_KEY = "dashboard_mode";
const DASHBOARD_WIDGETS_KEY = "dashboard_custom_widgets";
const DASHBOARD_CHART_PREFS_KEY = "dashboard_chart_prefs";
const DASHBOARD_LAYOUT_KEY = "dashboard_widget_layout";
const DEFAULT_CUSTOM_WIDGETS = ["your-projects", "your-issues", "recent-projects", "issue-status-chart", "project-progress-chart"];
const CUSTOM_WIDGET_OPTIONS = [
    { id: "your-projects", label: "Your Projects" },
    { id: "your-issues", label: "Your Issues" },
    { id: "recent-projects", label: "Recent Projects & Issues" },
    { id: "issue-status-chart", label: "Issue Status Chart" },
    { id: "project-progress-chart", label: "Project Progress Chart" },
    { id: "issue-priority-chart", label: "Issue Priority Chart" },
    { id: "issue-trend-chart", label: "Issue Trend Chart" },
];

const DEFAULT_CHART_PREFS = {
    projectId: "all",
    issueStatusVariant: "pie",
    issuePriorityVariant: "pie",
    issueTrendVariant: "line",
};

const DEFAULT_WIDGET_LAYOUT = {
    "your-projects": "full",
    "your-issues": "full",
    "recent-projects": "full",
    "issue-status-chart": "half",
    "project-progress-chart": "half",
    "issue-priority-chart": "half",
    "issue-trend-chart": "half",
};

const getUserScopedStorageKey = (prefix, userId) => `${prefix}:${userId || "anonymous"}`;

function safeReadJson(key, fallback) {
    try {
        const value = localStorage.getItem(key);
        return value ? JSON.parse(value) : fallback;
    } catch {
        return fallback;
    }
}

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

// ─── Project card front face content ──────────────────────────────────────────
function ProjectCardFrontContent({ project, colorIndex, onPreview, isMobile }) {
    const color = getProjectColor(colorIndex);
    return (
        <div className="flex flex-col h-full p-4">
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
                                title="Open full page"
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
                    <p className="text-xs text-muted-foreground line-clamp-2 mt-1 pl-3.5">
                        {project.description}
                    </p>
                </div>
                <Badge variant="secondary" className="shrink-0 text-[10px] tabular-nums">
                    {project.issues}
                </Badge>
            </div>
            <div className="mt-auto space-y-1.5">
                <div className="flex items-center justify-between">
                    <span className="text-xs text-muted-foreground">Progress</span>
                    <span className="text-xs font-semibold tabular-nums">{project.progress}%</span>
                </div>
                <Progress value={project.progress} className="h-1.5" />
            </div>
            <p className="text-[10px] text-muted-foreground/50 text-center mt-3 hidden md:block">Hover to see issues</p>
        </div>
    );
}

// ─── Mobile-only project card (no flip) ───────────────────────────────────────
function ProjectCard({ project, colorIndex, onPreview, isMobile }) {
    const color = getProjectColor(colorIndex);
    return (
        <div
            className="group flex flex-col rounded-xl bg-card border border-border border-t-2 hover:border-border/80 hover:shadow-sm transition-all duration-150 overflow-hidden"
            style={{ borderTopColor: color.accent }}
        >
            <ProjectCardFrontContent project={project} colorIndex={colorIndex} onPreview={onPreview} isMobile={isMobile} />
        </div>
    );
}

// ─── Desktop flip card: back (default) = project summary, front (hover) = issues ──
function FlipProjectCard({ project, colorIndex, allIssues, onIssuePreview }) {
    const color = getProjectColor(colorIndex);
    const projectIssues = allIssues
        .filter(i => i.projectId === project.id)
        .slice(0, 4);

    return (
        <div className="fp-card">
            <div className="fp-content">

                {/* ── BACK: default visible — project summary with spinning border ── */}
                <div className="fp-back">
                    <div className="fp-back-content">
                        <FolderKanban style={{ width: 44, height: 44, stroke: 'rgba(255,255,255,0.75)', fill: 'none' }} />
                        <strong className="fp-back-title">{project.name}</strong>
                        <div className="fp-back-progress">
                            <div className="fp-back-progress-fill" style={{ width: `${project.progress}%` }} />
                        </div>
                        <div className="fp-back-stats">
                            <span>{project.issues} issues</span>
                            <span>{project.progress}% done</span>
                        </div>
                    </div>
                </div>

                {/* ── FRONT: hover visible — floating circles + issues list ── */}
                <div className="fp-front">
                    <div className="fp-img">
                        <div className="fp-circle" style={{ backgroundColor: color.accent }} />
                        <div className="fp-circle fp-circ-r" style={{ backgroundColor: color.accent + 'bb' }} />
                        <div className="fp-circle fp-circ-b" style={{ backgroundColor: color.accent + '88' }} />
                    </div>
                    <div className="fp-front-content">
                        <small className="fp-badge">{project.name}</small>
                        <div className="fp-description">
                            <div className="fp-title-row">{project.name}</div>
                            {projectIssues.length === 0 ? (
                                <p className="fp-card-footer">No issues yet</p>
                            ) : projectIssues.map((issue) => (
                                <button
                                    key={issue.id}
                                    className="fp-issue-row"
                                    onClick={() => onIssuePreview(issue.id)}
                                >
                                    <span className="fp-issue-key">{issue.key}</span>
                                    <span className="fp-issue-title">{issue.title}</span>
                                </button>
                            ))}
                            <p className="fp-card-footer">
                                {project.progress}% complete &nbsp;·&nbsp; {project.issues} issues
                            </p>
                        </div>
                    </div>
                </div>

            </div>
        </div>
    );
}

// ─── Issue row (identical to Board mobile card style) ─────────────────────────
function IssueRow({ issue, isMobile, onPreview, getUserName, jiraLike = false }) {
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
                    ) : jiraLike ? (
                        <button
                            title="Open details panel"
                            className="text-sm font-semibold text-foreground hover:underline line-clamp-1 flex-1 min-w-0 text-left"
                            onClick={() => onPreview(issue.id)}
                        >
                            {issue.title}
                        </button>
                    ) : (
                        <Link
                            to={`/issues/${issue.id}`}
                            title="Open full page"
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
                title={jiraLike ? "Open details panel" : "Quick preview"}
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

function ChartWidgetHeader({ title, projectFilter, onProjectFilterChange, projects, actions }) {
    return (
        <CardHeader className="pb-2">
            <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                <CardTitle className="text-base">{title}</CardTitle>
                <div className="flex items-center gap-2">
                    {actions}
                    <Select value={projectFilter} onValueChange={onProjectFilterChange}>
                        <SelectTrigger className="h-8 w-[170px] text-xs">
                            <SelectValue placeholder="All Projects" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="all">All Projects</SelectItem>
                            {projects.map((project) => (
                                <SelectItem key={project.id} value={String(project.id)}>
                                    {project.shortName}
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                </div>
            </div>
        </CardHeader>
    );
}

function IssueStatusChartWidget({ issues, projects, projectFilter, onProjectFilterChange, variant, onVariantChange }) {
    const scopedIssues = projectFilter === "all"
        ? issues
        : issues.filter((issue) => String(issue.projectId) === String(projectFilter));
    const chartConfig = {
        NEW: { label: "New", color: "#3b82f6" },
        IN_PROGRESS: { label: "In Progress", color: "#f59e0b" },
        DONE: { label: "Done", color: "#10b981" },
        CANCELED: { label: "Canceled", color: "#6b7280" },
    };
    const statusData = Object.entries(chartConfig).map(([status, cfg]) => ({
        status,
        label: cfg.label,
        value: scopedIssues.filter((issue) => issue.status === status).length,
        fill: cfg.color,
    })).filter((entry) => entry.value > 0);

    return (
        <Card>
            <ChartWidgetHeader
                title="Issue Status Chart"
                projectFilter={projectFilter}
                onProjectFilterChange={onProjectFilterChange}
                projects={projects}
                actions={(
                    <div className="inline-flex items-center rounded-md border border-border p-0.5">
                        <button
                            type="button"
                            className={cn("px-2 py-1 text-xs rounded-sm", variant === "pie" ? "bg-primary text-primary-foreground" : "text-muted-foreground")}
                            onClick={() => onVariantChange("pie")}
                        >
                            Pie
                        </button>
                        <button
                            type="button"
                            className={cn("px-2 py-1 text-xs rounded-sm", variant === "bar" ? "bg-primary text-primary-foreground" : "text-muted-foreground")}
                            onClick={() => onVariantChange("bar")}
                        >
                            Bar
                        </button>
                    </div>
                )}
            />
            <CardContent>
                {statusData.length === 0 ? (
                    <p className="text-sm text-muted-foreground">No issue data yet</p>
                ) : (
                    <ChartContainer config={chartConfig} className="h-56 w-full aspect-auto">
                        {variant === "pie" ? (
                            <PieChart>
                                <Pie data={statusData} dataKey="value" nameKey="label" innerRadius={50} outerRadius={80} paddingAngle={3}>
                                    {statusData.map((entry) => <Cell key={entry.status} fill={entry.fill} />)}
                                </Pie>
                                <ChartTooltip content={<ChartTooltipContent />} />
                            </PieChart>
                        ) : (
                            <BarChart data={statusData} margin={{ left: 0, right: 12 }}>
                                <CartesianGrid vertical={false} />
                                <XAxis dataKey="label" tickLine={false} axisLine={false} tickMargin={8} />
                                <YAxis tickLine={false} axisLine={false} width={30} />
                                <Bar dataKey="value" radius={6} fill="#3b82f6" />
                                <ChartTooltip content={<ChartTooltipContent />} />
                            </BarChart>
                        )}
                    </ChartContainer>
                )}
            </CardContent>
        </Card>
    );
}

function ProjectProgressChartWidget({ projects }) {
    const data = projects.slice(0, 8).map((project) => ({
        name: project.name,
        progress: project.progress,
        issues: project.issues,
    }));
    const chartConfig = {
        progress: { label: "Progress", color: "#7c3aed" },
        issues: { label: "Issues", color: "#06b6d4" },
    };

    return (
        <Card>
            <CardHeader className="pb-2">
                <CardTitle className="text-base">Project Progress Chart</CardTitle>
            </CardHeader>
            <CardContent>
                {data.length === 0 ? (
                    <p className="text-sm text-muted-foreground">No project data yet</p>
                ) : (
                    <ChartContainer config={chartConfig} className="h-56 w-full aspect-auto">
                        <BarChart data={data} margin={{ left: 0, right: 12 }}>
                            <CartesianGrid vertical={false} />
                            <XAxis dataKey="name" tickLine={false} axisLine={false} tickMargin={8} />
                            <YAxis tickLine={false} axisLine={false} width={30} />
                            <Bar dataKey="progress" radius={6} fill="var(--color-progress)" />
                            <Bar dataKey="issues" radius={6} fill="var(--color-issues)" />
                            <ChartTooltip content={<ChartTooltipContent />} />
                        </BarChart>
                    </ChartContainer>
                )}
            </CardContent>
        </Card>
    );
}

function IssuePriorityChartWidget({ issues, projects, projectFilter, onProjectFilterChange, variant, onVariantChange }) {
    const scopedIssues = projectFilter === "all"
        ? issues
        : issues.filter((issue) => String(issue.projectId) === String(projectFilter));
    const chartConfig = {
        LOW: { label: PRIORITY_LABELS.LOW, color: "#22c55e" },
        NORMAL: { label: PRIORITY_LABELS.NORMAL, color: "#3b82f6" },
        HIGH: { label: PRIORITY_LABELS.HIGH, color: "#f59e0b" },
        CRITICAL: { label: PRIORITY_LABELS.CRITICAL, color: "#ef4444" },
    };
    const priorityData = Object.entries(chartConfig).map(([priority, cfg]) => ({
        priority,
        label: cfg.label,
        value: scopedIssues.filter((issue) => issue.priority === priority).length,
        fill: cfg.color,
    })).filter((entry) => entry.value > 0);

    return (
        <Card>
            <ChartWidgetHeader
                title="Issue Priority Chart"
                projectFilter={projectFilter}
                onProjectFilterChange={onProjectFilterChange}
                projects={projects}
                actions={(
                    <div className="inline-flex items-center rounded-md border border-border p-0.5">
                        <button
                            type="button"
                            className={cn("px-2 py-1 text-xs rounded-sm", variant === "pie" ? "bg-primary text-primary-foreground" : "text-muted-foreground")}
                            onClick={() => onVariantChange("pie")}
                        >
                            Pie
                        </button>
                        <button
                            type="button"
                            className={cn("px-2 py-1 text-xs rounded-sm", variant === "bar" ? "bg-primary text-primary-foreground" : "text-muted-foreground")}
                            onClick={() => onVariantChange("bar")}
                        >
                            Bar
                        </button>
                    </div>
                )}
            />
            <CardContent>
                {priorityData.length === 0 ? (
                    <p className="text-sm text-muted-foreground">No issue data yet</p>
                ) : (
                    <ChartContainer config={chartConfig} className="h-56 w-full aspect-auto">
                        {variant === "pie" ? (
                            <PieChart>
                                <Pie data={priorityData} dataKey="value" nameKey="label" innerRadius={50} outerRadius={80} paddingAngle={3}>
                                    {priorityData.map((entry) => <Cell key={entry.priority} fill={entry.fill} />)}
                                </Pie>
                                <ChartTooltip content={<ChartTooltipContent />} />
                            </PieChart>
                        ) : (
                            <BarChart data={priorityData} margin={{ left: 0, right: 12 }}>
                                <CartesianGrid vertical={false} />
                                <XAxis dataKey="label" tickLine={false} axisLine={false} tickMargin={8} />
                                <YAxis tickLine={false} axisLine={false} width={30} />
                                <Bar dataKey="value" radius={6} fill="#f59e0b" />
                                <ChartTooltip content={<ChartTooltipContent />} />
                            </BarChart>
                        )}
                    </ChartContainer>
                )}
            </CardContent>
        </Card>
    );
}

function IssueTrendChartWidget({ issues, projects, projectFilter, onProjectFilterChange, variant, onVariantChange }) {
    const scopedIssues = projectFilter === "all"
        ? issues
        : issues.filter((issue) => String(issue.projectId) === String(projectFilter));
    const monthMap = new Map();
    for (const issue of scopedIssues) {
        if (!issue.createdAt) continue;
        const date = new Date(issue.createdAt);
        const key = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}`;
        const label = date.toLocaleDateString("en-US", { month: "short", year: "2-digit" });
        const current = monthMap.get(key) || { label, created: 0, done: 0 };
        current.created += 1;
        if (issue.status === "DONE") current.done += 1;
        monthMap.set(key, current);
    }
    const trendData = Array.from(monthMap.entries())
        .sort((a, b) => a[0].localeCompare(b[0]))
        .map(([, value]) => value);
    const chartConfig = {
        created: { label: "Created", color: "#3b82f6" },
        done: { label: "Done", color: "#10b981" },
    };

    return (
        <Card>
            <ChartWidgetHeader
                title="Issue Trend Chart"
                projectFilter={projectFilter}
                onProjectFilterChange={onProjectFilterChange}
                projects={projects}
                actions={(
                    <div className="inline-flex items-center rounded-md border border-border p-0.5">
                        <button
                            type="button"
                            className={cn("px-2 py-1 text-xs rounded-sm", variant === "line" ? "bg-primary text-primary-foreground" : "text-muted-foreground")}
                            onClick={() => onVariantChange("line")}
                        >
                            Line
                        </button>
                        <button
                            type="button"
                            className={cn("px-2 py-1 text-xs rounded-sm", variant === "bar" ? "bg-primary text-primary-foreground" : "text-muted-foreground")}
                            onClick={() => onVariantChange("bar")}
                        >
                            Bar
                        </button>
                    </div>
                )}
            />
            <CardContent>
                {trendData.length === 0 ? (
                    <p className="text-sm text-muted-foreground">Not enough timeline data yet</p>
                ) : (
                    <ChartContainer config={chartConfig} className="h-56 w-full aspect-auto">
                        {variant === "line" ? (
                            <LineChart data={trendData} margin={{ left: 0, right: 12 }}>
                                <CartesianGrid vertical={false} />
                                <XAxis dataKey="label" tickLine={false} axisLine={false} tickMargin={8} />
                                <YAxis tickLine={false} axisLine={false} width={30} />
                                <Line type="monotone" dataKey="created" stroke="var(--color-created)" strokeWidth={2.5} dot={false} />
                                <Line type="monotone" dataKey="done" stroke="var(--color-done)" strokeWidth={2.5} dot={false} />
                                <ChartTooltip content={<ChartTooltipContent />} />
                            </LineChart>
                        ) : (
                            <BarChart data={trendData} margin={{ left: 0, right: 12 }}>
                                <CartesianGrid vertical={false} />
                                <XAxis dataKey="label" tickLine={false} axisLine={false} tickMargin={8} />
                                <YAxis tickLine={false} axisLine={false} width={30} />
                                <Bar dataKey="created" radius={6} fill="var(--color-created)" />
                                <Bar dataKey="done" radius={6} fill="var(--color-done)" />
                                <ChartTooltip content={<ChartTooltipContent />} />
                            </BarChart>
                        )}
                    </ChartContainer>
                )}
            </CardContent>
        </Card>
    );
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
    const modeStorageKey = getUserScopedStorageKey(DASHBOARD_MODE_KEY, currentUserId);
    const widgetsStorageKey = getUserScopedStorageKey(DASHBOARD_WIDGETS_KEY, currentUserId);
    const chartPrefsStorageKey = getUserScopedStorageKey(DASHBOARD_CHART_PREFS_KEY, currentUserId);
    const layoutPrefsStorageKey = getUserScopedStorageKey(DASHBOARD_LAYOUT_KEY, currentUserId);

    const getUserName = (userId) => {
        if (!userId) return null;
        const found = users.find(u => String(u.id) === String(userId));
        if (found) return `${found.firstName || ""} ${found.lastName || ""}`.trim() || null;
        return null;
    };

    const [desktopMode, setDesktopMode] = useState("default");
    const [customWidgets, setCustomWidgets] = useState(DEFAULT_CUSTOM_WIDGETS);
    const [chartPrefs, setChartPrefs] = useState(DEFAULT_CHART_PREFS);
    const [widgetLayout, setWidgetLayout] = useState(DEFAULT_WIDGET_LAYOUT);
    const [storageHydrated, setStorageHydrated] = useState(false);

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

    const loading = projectsLoading || issuesLoading;
    const activeMode = isMobile ? "default" : desktopMode;
    const jiraLikeMode = activeMode === "jira";

    useEffect(() => {
        setStorageHydrated(false);
        const anonymousModeKey = getUserScopedStorageKey(DASHBOARD_MODE_KEY, "anonymous");
        const anonymousWidgetsKey = getUserScopedStorageKey(DASHBOARD_WIDGETS_KEY, "anonymous");
        const anonymousChartPrefsKey = getUserScopedStorageKey(DASHBOARD_CHART_PREFS_KEY, "anonymous");
        const anonymousLayoutPrefsKey = getUserScopedStorageKey(DASHBOARD_LAYOUT_KEY, "anonymous");
        const pickExistingKey = (preferred, fallback) => (
            localStorage.getItem(preferred) != null ? preferred : fallback
        );

        const savedMode = localStorage.getItem(modeStorageKey) ?? localStorage.getItem(anonymousModeKey);
        const savedWidgets = safeReadJson(pickExistingKey(widgetsStorageKey, anonymousWidgetsKey), DEFAULT_CUSTOM_WIDGETS);
        const savedChartPrefs = safeReadJson(pickExistingKey(chartPrefsStorageKey, anonymousChartPrefsKey), DEFAULT_CHART_PREFS);
        const savedLayoutPrefs = safeReadJson(pickExistingKey(layoutPrefsStorageKey, anonymousLayoutPrefsKey), DEFAULT_WIDGET_LAYOUT);

        if (savedMode === "default" || savedMode === "custom" || savedMode === "jira") {
            setDesktopMode(savedMode);
        } else {
            setDesktopMode("default");
        }
        if (Array.isArray(savedWidgets) && savedWidgets.length > 0) {
            setCustomWidgets(savedWidgets);
        } else {
            setCustomWidgets(DEFAULT_CUSTOM_WIDGETS);
        }
        setChartPrefs({
            ...DEFAULT_CHART_PREFS,
            ...savedChartPrefs,
        });
        setWidgetLayout({
            ...DEFAULT_WIDGET_LAYOUT,
            ...(savedLayoutPrefs || {}),
        });
        setStorageHydrated(true);
    }, [modeStorageKey, widgetsStorageKey, chartPrefsStorageKey, layoutPrefsStorageKey]);

    useEffect(() => {
        if (!storageHydrated) return;
        localStorage.setItem(modeStorageKey, desktopMode);
        localStorage.setItem(widgetsStorageKey, JSON.stringify(customWidgets));
        localStorage.setItem(chartPrefsStorageKey, JSON.stringify(chartPrefs));
        localStorage.setItem(layoutPrefsStorageKey, JSON.stringify(widgetLayout));
    }, [storageHydrated, modeStorageKey, widgetsStorageKey, chartPrefsStorageKey, layoutPrefsStorageKey, desktopMode, customWidgets, chartPrefs, widgetLayout]);

    useEffect(() => {
        if (jiraLikeMode) {
            setSelectedProjectId(null);
        }
    }, [jiraLikeMode]);

    const toggleCustomWidget = (widgetId) => {
        setCustomWidgets((prev) => {
            if (prev.includes(widgetId)) {
                return prev.length === 1 ? prev : prev.filter((item) => item !== widgetId);
            }
            return [...prev, widgetId];
        });
    };

    const moveCustomWidget = (widgetId, direction) => {
        setCustomWidgets((prev) => {
            const index = prev.indexOf(widgetId);
            if (index < 0) return prev;
            const target = direction === "up" ? index - 1 : index + 1;
            if (target < 0 || target >= prev.length) return prev;
            const next = [...prev];
            const [item] = next.splice(index, 1);
            next.splice(target, 0, item);
            return next;
        });
    };

    const updateChartPref = (key, value) => {
        setChartPrefs((prev) => ({ ...prev, [key]: value }));
    };

    const updateWidgetLayout = (widgetId, span) => {
        setWidgetLayout((prev) => ({ ...prev, [widgetId]: span }));
    };

    const getWidgetSpanClass = (widgetId) => {
        const span = widgetLayout[widgetId] || DEFAULT_WIDGET_LAYOUT[widgetId] || "full";
        return span === "half"
            ? "md:col-span-1 xl:col-span-6"
            : "md:col-span-2 xl:col-span-12";
    };

    const modeOptions = [
        { value: "default", label: "Default", icon: LayoutDashboard },
        { value: "custom", label: "Custom", icon: SlidersHorizontal },
        { value: "jira", label: "Jira-like", icon: PanelRightOpen },
    ];
    const customWidgetsOrdered = customWidgets.filter((id) => CUSTOM_WIDGET_OPTIONS.some((option) => option.id === id));

    // ── Stats (for the header bar) ────────────────────────────────────────────
    const statItems = [
        { label: "Projects",   value: projects.length,   color: "text-violet-600 dark:text-violet-400" },
        { label: "Active",     value: activeIssues,       color: "text-blue-600 dark:text-blue-400"    },
        { label: "Done",       value: completedIssues,    color: "text-emerald-600 dark:text-emerald-400" },
        { label: "Members",    value: users.length,       color: "text-cyan-600 dark:text-cyan-400"    },
        { label: "Rate",       value: `${completionRate}%`, color: "text-orange-600 dark:text-orange-400" },
    ];

    const renderYourProjectsSection = () => (
        yourProjects.length > 0 && (
            <div className="dash-section" key="your-projects">
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
                            onPreview={jiraLikeMode ? (id) => navigate(`/projects/${id}`) : setSelectedProjectId}
                            isMobile={isMobile}
                        />
                    ))}
                </div>
            </div>
        )
    );

    const renderYourIssuesSection = () => (
        yourIssues.length > 0 && (
            <div className="dash-section" key="your-issues">
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
                            jiraLike={jiraLikeMode}
                        />
                    ))}
                </div>
            </div>
        )
    );

    const renderRecentProjectsSection = () => (
        <div className="dash-section" key="recent-projects">
            <SectionHeader
                label="Recent Projects & Issues"
                count={loading ? null : recentProjects.length}
                accentColor="#10b981"
                onViewAll={() => navigate("/projects")}
                onAdd={() => setCreateProjectOpen(true)}
            />

            {loading ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                    {[1, 2, 3].map(i => (
                        <div key={i} className="h-40 rounded-xl bg-muted/40 animate-pulse" />
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
                        isMobile ? (
                            <ProjectCard
                                key={project.id}
                                project={project}
                                colorIndex={i + 3}
                                onPreview={setSelectedProjectId}
                                isMobile={true}
                            />
                        ) : (
                            <FlipProjectCard
                                key={project.id}
                                project={project}
                                colorIndex={i + 3}
                                allIssues={issues}
                                onIssuePreview={setSelectedIssueId}
                            />
                        )
                    ))}
                </div>
            )}
        </div>
    );

    const renderCustomWidget = (widgetId) => {
        switch (widgetId) {
            case "your-projects":
                return renderYourProjectsSection();
            case "your-issues":
                return renderYourIssuesSection();
            case "recent-projects":
                return renderRecentProjectsSection();
            case "issue-status-chart":
                return (
                    <div className="dash-section" key="issue-status-chart">
                        <IssueStatusChartWidget
                            issues={issues}
                            projects={projects}
                            projectFilter={chartPrefs.projectId}
                            onProjectFilterChange={(value) => updateChartPref("projectId", value)}
                            variant={chartPrefs.issueStatusVariant}
                            onVariantChange={(value) => updateChartPref("issueStatusVariant", value)}
                        />
                    </div>
                );
            case "project-progress-chart":
                return (
                    <div className="dash-section" key="project-progress-chart">
                        <ProjectProgressChartWidget projects={recentProjects} />
                    </div>
                );
            case "issue-priority-chart":
                return (
                    <div className="dash-section" key="issue-priority-chart">
                        <IssuePriorityChartWidget
                            issues={issues}
                            projects={projects}
                            projectFilter={chartPrefs.projectId}
                            onProjectFilterChange={(value) => updateChartPref("projectId", value)}
                            variant={chartPrefs.issuePriorityVariant}
                            onVariantChange={(value) => updateChartPref("issuePriorityVariant", value)}
                        />
                    </div>
                );
            case "issue-trend-chart":
                return (
                    <div className="dash-section" key="issue-trend-chart">
                        <IssueTrendChartWidget
                            issues={issues}
                            projects={projects}
                            projectFilter={chartPrefs.projectId}
                            onProjectFilterChange={(value) => updateChartPref("projectId", value)}
                            variant={chartPrefs.issueTrendVariant}
                            onVariantChange={(value) => updateChartPref("issueTrendVariant", value)}
                        />
                    </div>
                );
            default:
                return null;
        }
    };

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
                    <div className="hidden md:flex items-center gap-3 ml-4 shrink-0">
                        <div className="hidden lg:flex items-center gap-1 rounded-lg border border-border bg-background/70 p-1">
                            {modeOptions.map((mode) => {
                                const Icon = mode.icon;
                                const active = desktopMode === mode.value;
                                return (
                                    <button
                                        key={mode.value}
                                        type="button"
                                        onClick={() => setDesktopMode(mode.value)}
                                        className={cn(
                                            "inline-flex items-center gap-1.5 rounded-md px-2.5 py-1.5 text-xs font-medium transition-colors",
                                            active
                                                ? "bg-primary text-primary-foreground"
                                                : "text-muted-foreground hover:bg-muted hover:text-foreground"
                                        )}
                                        title={mode.label}
                                    >
                                        <Icon className="h-3.5 w-3.5" />
                                        {mode.label}
                                    </button>
                                );
                            })}
                        </div>
                        {desktopMode === "custom" && (
                            <Popover>
                                <PopoverTrigger asChild>
                                    <Button variant="outline" size="sm" className="gap-1.5">
                                        <Settings2 className="h-4 w-4" />
                                        Widgets
                                    </Button>
                                </PopoverTrigger>
                                <PopoverContent align="end" className="w-72">
                                    <div className="space-y-3">
                                        <p className="text-xs uppercase tracking-wide text-muted-foreground">Custom dashboard widgets</p>
                                        <div className="space-y-2">
                                            {CUSTOM_WIDGET_OPTIONS.map((widget) => {
                                                const index = customWidgetsOrdered.indexOf(widget.id);
                                                const enabled = customWidgets.includes(widget.id);
                                                return (
                                                    <div key={widget.id} className="space-y-1.5">
                                                        <div className="flex items-center gap-2 text-sm">
                                                        <Checkbox
                                                            checked={enabled}
                                                            onCheckedChange={() => toggleCustomWidget(widget.id)}
                                                        />
                                                        <span className="flex-1">{widget.label}</span>
                                                        <div className="flex items-center gap-1">
                                                            <button
                                                                type="button"
                                                                onClick={() => moveCustomWidget(widget.id, "up")}
                                                                disabled={!enabled || index <= 0}
                                                                className="rounded border border-border p-1 text-muted-foreground enabled:hover:text-foreground enabled:hover:bg-muted disabled:opacity-40"
                                                                title="Move up"
                                                            >
                                                                <ArrowUp className="h-3 w-3" />
                                                            </button>
                                                            <button
                                                                type="button"
                                                                onClick={() => moveCustomWidget(widget.id, "down")}
                                                                disabled={!enabled || index === -1 || index >= customWidgetsOrdered.length - 1}
                                                                className="rounded border border-border p-1 text-muted-foreground enabled:hover:text-foreground enabled:hover:bg-muted disabled:opacity-40"
                                                                title="Move down"
                                                            >
                                                                <ArrowDown className="h-3 w-3" />
                                                            </button>
                                                        </div>
                                                    </div>
                                                        {enabled && (
                                                            <div className="ml-6 inline-flex items-center rounded-md border border-border p-0.5">
                                                                <button
                                                                    type="button"
                                                                    onClick={() => updateWidgetLayout(widget.id, "half")}
                                                                    className={cn(
                                                                        "px-2 py-0.5 text-[10px] rounded-sm",
                                                                        (widgetLayout[widget.id] || DEFAULT_WIDGET_LAYOUT[widget.id] || "full") === "half"
                                                                            ? "bg-primary text-primary-foreground"
                                                                            : "text-muted-foreground"
                                                                    )}
                                                                >
                                                                    Half width
                                                                </button>
                                                                <button
                                                                    type="button"
                                                                    onClick={() => updateWidgetLayout(widget.id, "full")}
                                                                    className={cn(
                                                                        "px-2 py-0.5 text-[10px] rounded-sm",
                                                                        (widgetLayout[widget.id] || DEFAULT_WIDGET_LAYOUT[widget.id] || "full") === "full"
                                                                            ? "bg-primary text-primary-foreground"
                                                                            : "text-muted-foreground"
                                                                    )}
                                                                >
                                                                    Full width
                                                                </button>
                                                            </div>
                                                        )}
                                                    </div>
                                                );
                                            })}
                                        </div>
                                    </div>
                                </PopoverContent>
                            </Popover>
                        )}
                        <AddButton label="Project" onClick={() => setCreateProjectOpen(true)} />
                        <AddButton label="Issue" onClick={() => setCreateIssueOpen(true)} />
                    </div>
                </div>
            </div>

            {/* ── Page content ── */}
            <div ref={contentRef} className="space-y-8">
                {activeMode === "custom"
                    ? (
                        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-12 gap-4">
                            {customWidgetsOrdered.map((widgetId) => (
                                <div key={`slot-${widgetId}`} className={cn(getWidgetSpanClass(widgetId))}>
                                    {renderCustomWidget(widgetId)}
                                </div>
                            ))}
                        </div>
                    )
                    : (
                        <>
                            {renderYourProjectsSection()}
                            {renderYourIssuesSection()}
                            {renderRecentProjectsSection()}
                        </>
                    )}
            </div>

            {/* ── Preview components ── */}
            {!jiraLikeMode && (
                <ProjectDetailsModal
                    open={!!selectedProjectId}
                    onOpenChange={() => setSelectedProjectId(null)}
                    projectId={selectedProjectId}
                />
            )}
            <IssueDetailsModal
                open={!!selectedIssueId}
                onOpenChange={() => setSelectedIssueId(null)}
                issueId={selectedIssueId}
                onIssueDeleted={() => {
                    setSelectedIssueId(null);
                    fetchIssues();
                }}
                contentClassName={jiraLikeMode
                    ? "!left-auto !top-0 !right-0 !translate-x-0 !translate-y-0 !h-screen !w-[min(100vw,1100px)] !max-w-[min(100vw,1100px)] rounded-none border-l border-border"
                    : ""}
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

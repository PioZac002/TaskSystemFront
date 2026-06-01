import { useEffect, useMemo, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { AppLayout } from "@/components/layout/AppLayout";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { Progress } from "@/components/ui/Progress";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import { ProjectFlipCard } from "@/components/ui/ProjectFlipCard";
import { IssueLabelChips } from "@/components/ui/IssueLabelChips";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/Popover";
import { Checkbox } from "@/components/ui/Checkbox";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/Select";
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
    ArrowDown,
    ArrowUp,
    Calendar,
    FolderKanban,
    LayoutDashboard,
    PanelRightOpen,
    Settings2,
    SlidersHorizontal,
    User,
    Eye,
} from "lucide-react";
import { Bar, BarChart, CartesianGrid, Cell, Line, LineChart, Pie, PieChart, XAxis, YAxis } from "recharts";
import { gsap } from "gsap";
import { cn } from "@/lib/utils";
import {
    STATUS_LABELS,
    PRIORITY_LABELS,
    getPriorityBadgeVariant,
    getStatusBadgeClass,
} from "@/utils/issueConstants";

const DASHBOARD_MODE_KEY = "dashboard_mode";
const DASHBOARD_WIDGETS_KEY = "dashboard_custom_widgets";
const DASHBOARD_CHART_PREFS_KEY = "dashboard_chart_prefs";
const DASHBOARD_LAYOUT_KEY = "dashboard_widget_layout";

const DEFAULT_CUSTOM_WIDGETS = [
    "your-issues",
    "recent-projects",
    "your-projects",
    "issue-status-chart",
    "issue-priority-chart",
    "issue-trend-chart",
    "project-progress-chart",
];

const CUSTOM_WIDGET_OPTIONS = [
    { id: "your-issues", label: "Your Issues" },
    { id: "recent-projects", label: "Recent Projects & Issues" },
    { id: "your-projects", label: "Your Projects" },
    { id: "issue-status-chart", label: "Issue Status Chart" },
    { id: "issue-priority-chart", label: "Issue Priority Chart" },
    { id: "issue-trend-chart", label: "Issue Trend Chart" },
    { id: "project-progress-chart", label: "Project Progress Chart" },
];

const DEFAULT_CHART_PREFS = {
    projectId: "all",
    issueStatusVariant: "pie",
    issuePriorityVariant: "bar",
    issueTrendVariant: "line",
};

const DEFAULT_WIDGET_LAYOUT = {
    "your-issues": "full",
    "recent-projects": "full",
    "your-projects": "half",
    "issue-status-chart": "half",
    "issue-priority-chart": "half",
    "issue-trend-chart": "half",
    "project-progress-chart": "full",
};

const DEFAULT_MODE_LAYOUT = ["your-issues", "recent-projects", "your-projects"];
const PROJECT_ACCENTS = ["#7c3aed", "#3b82f6", "#10b981", "#f97316", "#a855f7", "#06b6d4"];

const getUserScopedStorageKey = (prefix, userId) => `${prefix}:${userId || "anonymous"}`;

function safeReadJson(key, fallback) {
    try {
        const value = localStorage.getItem(key);
        return value ? JSON.parse(value) : fallback;
    } catch {
        return fallback;
    }
}

function formatDate(dateString) {
    if (!dateString) return null;
    return new Date(dateString).toLocaleDateString("en-US", { month: "short", day: "numeric" });
}

function WidgetShell({ title, subtitle, action, children }) {
    return (
        <Card className="h-full border-border/70 shadow-sm">
            <CardHeader className="pb-3">
                <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                        <CardTitle className="text-base">{title}</CardTitle>
                        {subtitle && <p className="text-xs text-muted-foreground mt-1">{subtitle}</p>}
                    </div>
                    {action}
                </div>
            </CardHeader>
            <CardContent className="pt-0">{children}</CardContent>
        </Card>
    );
}

function MetricTile({ label, value, tone = "default" }) {
    return (
        <Card className={cn(
            "border-border/70 shadow-sm",
            tone === "violet" && "bg-violet-500/5",
            tone === "blue" && "bg-blue-500/5",
            tone === "green" && "bg-emerald-500/5",
            tone === "orange" && "bg-orange-500/5",
            tone === "cyan" && "bg-cyan-500/5"
        )}>
            <CardContent className="p-4">
                <div className="flex items-center justify-between">
                    <p className="text-[11px] uppercase tracking-wide text-muted-foreground">{label}</p>
                </div>
                <p className="mt-2 text-2xl font-bold tabular-nums">{value}</p>
            </CardContent>
        </Card>
    );
}

function IssueItem({ issue, getUserName, jiraLike, onOpenPanel }) {
    return (
        <div className="rounded-lg border border-border/70 bg-background p-3 hover:border-border transition-colors">
            <div className="flex items-start gap-3">
                <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 min-w-0">
                        <span className="font-mono text-[10px] text-muted-foreground">{issue.key}</span>
                        {jiraLike ? (
                            <button
                                title="Open details panel"
                                className="truncate text-sm font-semibold hover:underline text-left"
                                onClick={() => onOpenPanel(issue.id)}
                            >
                                {issue.title}
                            </button>
                        ) : (
                            <Link
                                to={`/issues/${issue.id}`}
                                title="Open full page"
                                className="truncate text-sm font-semibold hover:underline"
                            >
                                {issue.title}
                            </Link>
                        )}
                    </div>
                    <div className="mt-2 flex flex-wrap items-center gap-1.5">
                        <Badge variant="secondary" className={cn("text-xs", getStatusBadgeClass(issue.status))}>
                            {STATUS_LABELS[issue.status] || issue.status}
                        </Badge>
                        <Badge variant={getPriorityBadgeVariant(issue.priority)} className="text-xs">
                            {PRIORITY_LABELS[issue.priority] || issue.priority}
                        </Badge>
                        {issue.dueDate && (
                            <span className="inline-flex items-center gap-1 text-xs text-muted-foreground">
                                <Calendar className="h-3 w-3" />
                                {formatDate(issue.dueDate)}
                            </span>
                        )}
                        {issue.assigneeId && (
                            <span className="inline-flex items-center gap-1 text-xs text-muted-foreground">
                                <User className="h-3 w-3" />
                                {getUserName(issue.assigneeId) || `User #${issue.assigneeId}`}
                            </span>
                        )}
                    </div>
                    <IssueLabelChips labels={issue.labels || []} max={3} className="mt-2" />
                </div>
                <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8 text-muted-foreground"
                    onClick={() => onOpenPanel(issue.id)}
                    title={jiraLike ? "Open details panel" : "Quick preview"}
                >
                    <Eye className="h-4 w-4" />
                </Button>
            </div>
        </div>
    );
}

function ProjectCard({ project, issues, onPreview, onIssuePreview }) {
    return (
        <ProjectFlipCard
            project={project}
            issues={issues}
            onPreview={onPreview}
            onIssuePreview={onIssuePreview}
        />
    );
}

function ChartHeaderControls({ title, projects, projectFilter, onProjectChange, variant, variantOptions, onVariantChange }) {
    return (
        <div className="flex flex-wrap items-center gap-2">
            <p className="text-sm font-semibold mr-auto">{title}</p>
            <Select value={variant} onValueChange={onVariantChange}>
                <SelectTrigger className="h-8 w-[110px] text-xs">
                    <SelectValue />
                </SelectTrigger>
                <SelectContent>
                    {variantOptions.map((opt) => (
                        <SelectItem key={opt} value={opt}>{opt}</SelectItem>
                    ))}
                </SelectContent>
            </Select>
            <Select value={projectFilter} onValueChange={onProjectChange}>
                <SelectTrigger className="h-8 w-[160px] text-xs">
                    <SelectValue placeholder="All Projects" />
                </SelectTrigger>
                <SelectContent>
                    <SelectItem value="all">All Projects</SelectItem>
                    {projects.map((project) => (
                        <SelectItem key={project.id} value={String(project.id)}>{project.shortName}</SelectItem>
                    ))}
                </SelectContent>
            </Select>
        </div>
    );
}

function IssueStatusChartWidget({ issues, projects, projectFilter, onProjectChange, variant, onVariantChange }) {
    const scopedIssues = projectFilter === "all"
        ? issues
        : issues.filter((issue) => String(issue.projectId) === String(projectFilter));

    const chartConfig = {
        NEW: { label: "New", color: "#3b82f6" },
        IN_PROGRESS: { label: "In Progress", color: "#f59e0b" },
        DONE: { label: "Done", color: "#10b981" },
        CANCELED: { label: "Canceled", color: "#6b7280" },
    };

    const data = Object.entries(chartConfig).map(([status, cfg]) => ({
        status,
        label: cfg.label,
        value: scopedIssues.filter((issue) => issue.status === status).length,
        fill: cfg.color,
    })).filter((item) => item.value > 0);

    return (
        <WidgetShell
            title="Issue Status"
            subtitle="Live status distribution"
            action={(
                <ChartHeaderControls
                    title="Issue Status"
                    projects={projects}
                    projectFilter={projectFilter}
                    onProjectChange={onProjectChange}
                    variant={variant}
                    variantOptions={["pie", "bar"]}
                    onVariantChange={onVariantChange}
                />
            )}
        >
            {data.length === 0 ? (
                <p className="text-sm text-muted-foreground">No issue data available</p>
            ) : (
                <ChartContainer config={chartConfig} className="h-64 w-full aspect-auto">
                    {variant === "pie" ? (
                        <PieChart>
                            <Pie data={data} dataKey="value" nameKey="label" innerRadius={52} outerRadius={86} paddingAngle={2}>
                                {data.map((entry) => <Cell key={entry.status} fill={entry.fill} />)}
                            </Pie>
                            <ChartTooltip content={<ChartTooltipContent />} />
                        </PieChart>
                    ) : (
                        <BarChart data={data} margin={{ left: 0, right: 12 }}>
                            <CartesianGrid vertical={false} />
                            <XAxis dataKey="label" tickLine={false} axisLine={false} tickMargin={8} />
                            <YAxis tickLine={false} axisLine={false} width={30} />
                            <Bar dataKey="value" radius={6} fill="#3b82f6" />
                            <ChartTooltip content={<ChartTooltipContent />} />
                        </BarChart>
                    )}
                </ChartContainer>
            )}
        </WidgetShell>
    );
}

function IssuePriorityChartWidget({ issues, projects, projectFilter, onProjectChange, variant, onVariantChange }) {
    const scopedIssues = projectFilter === "all"
        ? issues
        : issues.filter((issue) => String(issue.projectId) === String(projectFilter));

    const chartConfig = {
        LOW: { label: "Low", color: "#22c55e" },
        NORMAL: { label: "Normal", color: "#3b82f6" },
        HIGH: { label: "High", color: "#f59e0b" },
        CRITICAL: { label: "Critical", color: "#ef4444" },
    };

    const data = Object.entries(chartConfig).map(([priority, cfg]) => ({
        priority,
        label: cfg.label,
        value: scopedIssues.filter((issue) => issue.priority === priority).length,
        fill: cfg.color,
    })).filter((item) => item.value > 0);

    return (
        <WidgetShell
            title="Issue Priority"
            subtitle="Priority pressure by project"
            action={(
                <ChartHeaderControls
                    title="Issue Priority"
                    projects={projects}
                    projectFilter={projectFilter}
                    onProjectChange={onProjectChange}
                    variant={variant}
                    variantOptions={["bar", "pie"]}
                    onVariantChange={onVariantChange}
                />
            )}
        >
            {data.length === 0 ? (
                <p className="text-sm text-muted-foreground">No priority data available</p>
            ) : (
                <ChartContainer config={chartConfig} className="h-64 w-full aspect-auto">
                    {variant === "pie" ? (
                        <PieChart>
                            <Pie data={data} dataKey="value" nameKey="label" innerRadius={52} outerRadius={86} paddingAngle={2}>
                                {data.map((entry) => <Cell key={entry.priority} fill={entry.fill} />)}
                            </Pie>
                            <ChartTooltip content={<ChartTooltipContent />} />
                        </PieChart>
                    ) : (
                        <BarChart data={data} margin={{ left: 0, right: 12 }}>
                            <CartesianGrid vertical={false} />
                            <XAxis dataKey="label" tickLine={false} axisLine={false} tickMargin={8} />
                            <YAxis tickLine={false} axisLine={false} width={30} />
                            <Bar dataKey="value" radius={6} fill="#f59e0b" />
                            <ChartTooltip content={<ChartTooltipContent />} />
                        </BarChart>
                    )}
                </ChartContainer>
            )}
        </WidgetShell>
    );
}

function IssueTrendChartWidget({ issues, projects, projectFilter, onProjectChange, variant, onVariantChange }) {
    const scopedIssues = projectFilter === "all"
        ? issues
        : issues.filter((issue) => String(issue.projectId) === String(projectFilter));

    const bucket = new Map();
    for (const issue of scopedIssues) {
        if (!issue.createdAt) continue;
        const date = new Date(issue.createdAt);
        const key = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}`;
        const label = date.toLocaleDateString("en-US", { month: "short", year: "2-digit" });
        const current = bucket.get(key) || { label, created: 0, done: 0 };
        current.created += 1;
        if (issue.status === "DONE") current.done += 1;
        bucket.set(key, current);
    }

    const data = Array.from(bucket.entries())
        .sort((a, b) => a[0].localeCompare(b[0]))
        .map(([, value]) => value);

    const chartConfig = {
        created: { label: "Created", color: "#3b82f6" },
        done: { label: "Done", color: "#10b981" },
    };

    return (
        <WidgetShell
            title="Issue Trend"
            subtitle="Monthly creation vs completion"
            action={(
                <ChartHeaderControls
                    title="Issue Trend"
                    projects={projects}
                    projectFilter={projectFilter}
                    onProjectChange={onProjectChange}
                    variant={variant}
                    variantOptions={["line", "bar"]}
                    onVariantChange={onVariantChange}
                />
            )}
        >
            {data.length === 0 ? (
                <p className="text-sm text-muted-foreground">Not enough timeline data yet</p>
            ) : (
                <ChartContainer config={chartConfig} className="h-64 w-full aspect-auto">
                    {variant === "line" ? (
                        <LineChart data={data} margin={{ left: 0, right: 12 }}>
                            <CartesianGrid vertical={false} />
                            <XAxis dataKey="label" tickLine={false} axisLine={false} tickMargin={8} />
                            <YAxis tickLine={false} axisLine={false} width={30} />
                            <Line type="monotone" dataKey="created" stroke="var(--color-created)" strokeWidth={2.5} dot={false} />
                            <Line type="monotone" dataKey="done" stroke="var(--color-done)" strokeWidth={2.5} dot={false} />
                            <ChartTooltip content={<ChartTooltipContent />} />
                        </LineChart>
                    ) : (
                        <BarChart data={data} margin={{ left: 0, right: 12 }}>
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
        </WidgetShell>
    );
}

function ProjectProgressChartWidget({ projects }) {
    const chartConfig = {
        progress: { label: "Progress", color: "#7c3aed" },
        issues: { label: "Issues", color: "#06b6d4" },
    };

    const data = projects.slice(0, 8).map((project) => ({
        name: project.name,
        progress: project.progress,
        issues: project.totalIssues,
    }));

    return (
        <WidgetShell title="Project Progress" subtitle="Delivery and workload by project">
            {data.length === 0 ? (
                <p className="text-sm text-muted-foreground">No project data available</p>
            ) : (
                <ChartContainer config={chartConfig} className="h-64 w-full aspect-auto">
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
        </WidgetShell>
    );
}

export default function Dashboard() {
    const { isMobile } = useResponsiveNavigation();
    const { projects, fetchProjects, loading: projectsLoading } = useProjectStore();
    const { issues, fetchIssues, loading: issuesLoading } = useIssueStore();
    const { users, fetchUsers } = useUserStore();
    const getUserIdFromToken = useAuthStore((state) => state.getUserIdFromToken);

    const headerRef = useRef(null);
    const contentRef = useRef(null);

    const [selectedProjectId, setSelectedProjectId] = useState(null);
    const [selectedIssueId, setSelectedIssueId] = useState(null);
    const [createProjectOpen, setCreateProjectOpen] = useState(false);
    const [createIssueOpen, setCreateIssueOpen] = useState(false);

    const [desktopMode, setDesktopMode] = useState("default");
    const [customWidgets, setCustomWidgets] = useState(DEFAULT_CUSTOM_WIDGETS);
    const [chartPrefs, setChartPrefs] = useState(DEFAULT_CHART_PREFS);
    const [widgetLayout, setWidgetLayout] = useState(DEFAULT_WIDGET_LAYOUT);
    const [storageHydrated, setStorageHydrated] = useState(false);

    const currentUserId = getUserIdFromToken();
    const modeStorageKey = getUserScopedStorageKey(DASHBOARD_MODE_KEY, currentUserId);
    const widgetsStorageKey = getUserScopedStorageKey(DASHBOARD_WIDGETS_KEY, currentUserId);
    const chartPrefsStorageKey = getUserScopedStorageKey(DASHBOARD_CHART_PREFS_KEY, currentUserId);
    const layoutPrefsStorageKey = getUserScopedStorageKey(DASHBOARD_LAYOUT_KEY, currentUserId);

    useEffect(() => {
        fetchProjects();
        fetchIssues();
        fetchUsers();
    }, []);

    useEffect(() => {
        const ctx = gsap.context(() => {
            if (headerRef.current) {
                gsap.fromTo(
                    headerRef.current,
                    { y: -18, opacity: 0 },
                    { y: 0, opacity: 1, duration: 0.4, ease: "power2.out", clearProps: "transform,opacity" }
                );
            }
            if (contentRef.current) {
                const blocks = contentRef.current.querySelectorAll(".dash-anim");
                gsap.fromTo(
                    blocks,
                    { y: 12, opacity: 0 },
                    { y: 0, opacity: 1, duration: 0.35, stagger: 0.05, ease: "power2.out", clearProps: "transform,opacity" }
                );
            }
        });
        return () => ctx.revert();
    }, [storageHydrated, projects.length, issues.length]);

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

        setDesktopMode(savedMode === "default" || savedMode === "custom" || savedMode === "jira" ? savedMode : "default");
        setCustomWidgets(Array.isArray(savedWidgets) && savedWidgets.length > 0 ? savedWidgets : DEFAULT_CUSTOM_WIDGETS);
        setChartPrefs({ ...DEFAULT_CHART_PREFS, ...(savedChartPrefs || {}) });
        setWidgetLayout({ ...DEFAULT_WIDGET_LAYOUT, ...(savedLayoutPrefs || {}) });
        setStorageHydrated(true);
    }, [modeStorageKey, widgetsStorageKey, chartPrefsStorageKey, layoutPrefsStorageKey]);

    useEffect(() => {
        if (!storageHydrated) return;
        localStorage.setItem(modeStorageKey, desktopMode);
        localStorage.setItem(widgetsStorageKey, JSON.stringify(customWidgets));
        localStorage.setItem(chartPrefsStorageKey, JSON.stringify(chartPrefs));
        localStorage.setItem(layoutPrefsStorageKey, JSON.stringify(widgetLayout));
    }, [
        storageHydrated,
        modeStorageKey,
        widgetsStorageKey,
        chartPrefsStorageKey,
        layoutPrefsStorageKey,
        desktopMode,
        customWidgets,
        chartPrefs,
        widgetLayout,
    ]);

    const loading = projectsLoading || issuesLoading;
    const activeMode = isMobile ? "default" : desktopMode;
    const jiraLikeMode = activeMode === "jira";

    const getUserName = (userId) => {
        if (!userId) return null;
        const found = users.find((u) => String(u.id) === String(userId));
        return found ? `${found.firstName || ""} ${found.lastName || ""}`.trim() || null : null;
    };

    const projectsWithStats = useMemo(() => projects.map((project) => {
        const scopedIssues = issues.filter((issue) => issue.projectId === project.id);
        const done = scopedIssues.filter((issue) => issue.status === "DONE").length;
        const active = scopedIssues.filter((issue) => issue.status === "IN_PROGRESS").length;
        const todo = scopedIssues.filter((issue) => issue.status === "NEW").length;
        const progress = scopedIssues.length > 0 ? Math.round((done / scopedIssues.length) * 100) : 0;
        return {
            id: project.id,
            ownerId: project.ownerId,
            shortName: project.shortName,
            name: project.shortName,
            description: project.description || "No description",
            totalIssues: scopedIssues.length,
            doneIssues: done,
            inProgressIssues: active,
            todoIssues: todo,
            progress,
            createdAt: project.createdAt,
        };
    }), [projects, issues]);

    const yourProjects = useMemo(
        () => projectsWithStats
            .filter((project) => String(project.ownerId) === String(currentUserId))
            .sort((a, b) => new Date(b.createdAt || 0) - new Date(a.createdAt || 0))
            .slice(0, 4),
        [projectsWithStats, currentUserId]
    );

    const yourIssues = useMemo(
        () => issues
            .filter((issue) => String(issue.assigneeId) === String(currentUserId) && issue.status !== "DONE")
            .sort((a, b) => new Date(b.createdAt || 0) - new Date(a.createdAt || 0))
            .slice(0, 6),
        [issues, currentUserId]
    );

    const recentProjects = useMemo(
        () => projectsWithStats
            .sort((a, b) => new Date(b.createdAt || 0) - new Date(a.createdAt || 0))
            .slice(0, 6),
        [projectsWithStats]
    );

    const issuesByProject = useMemo(() => {
        const map = new Map();
        for (const issue of issues) {
            const arr = map.get(issue.projectId) || [];
            arr.push(issue);
            map.set(issue.projectId, arr);
        }
        return map;
    }, [issues]);

    const activeIssues = issues.filter((issue) => issue.status !== "DONE").length;
    const doneIssues = issues.filter((issue) => issue.status === "DONE").length;
    const completionRate = issues.length > 0 ? Math.round((doneIssues / issues.length) * 100) : 0;

    const modeOptions = [
        { value: "default", label: "Default", icon: LayoutDashboard },
        { value: "custom", label: "Custom", icon: SlidersHorizontal },
        { value: "jira", label: "Jira-like", icon: PanelRightOpen },
    ];

    const customWidgetsOrdered = customWidgets.filter((id) => CUSTOM_WIDGET_OPTIONS.some((item) => item.id === id));

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

    const updateChartPref = (key, value) => setChartPrefs((prev) => ({ ...prev, [key]: value }));
    const updateWidgetLayout = (widgetId, span) => setWidgetLayout((prev) => ({ ...prev, [widgetId]: span }));
    const getWidgetSpanClass = (widgetId) => ((widgetLayout[widgetId] || DEFAULT_WIDGET_LAYOUT[widgetId]) === "half"
        ? "md:col-span-1 xl:col-span-6"
        : "md:col-span-2 xl:col-span-12");

    const renderYourIssuesWidget = () => (
        <WidgetShell
            title="Your Issues"
            subtitle="Assigned to you and currently open"
            action={<Badge variant="secondary" className="text-xs">{yourIssues.length}</Badge>}
        >
            {yourIssues.length === 0 ? (
                <p className="text-sm text-muted-foreground">You are all caught up.</p>
            ) : (
                <div className="space-y-2.5">
                    {yourIssues.map((issue) => (
                        <IssueItem
                            key={issue.id}
                            issue={issue}
                            getUserName={getUserName}
                            jiraLike={jiraLikeMode}
                            onOpenPanel={setSelectedIssueId}
                        />
                    ))}
                </div>
            )}
        </WidgetShell>
    );

    const renderRecentProjectsWidget = () => (
        <WidgetShell
            title="Recent Projects & Issues"
            subtitle="Latest active projects with quick issue context"
            action={<Badge variant="secondary" className="text-xs">{recentProjects.length}</Badge>}
        >
            {loading ? (
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
                    {[1, 2, 3, 4].map((i) => <div key={i} className="h-28 rounded-lg bg-muted/40 animate-pulse" />)}
                </div>
            ) : recentProjects.length === 0 ? (
                <p className="text-sm text-muted-foreground">No projects yet.</p>
            ) : (
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                    {recentProjects.map((project) => (
                        <ProjectCard
                            key={project.id}
                            project={project}
                            issues={issuesByProject.get(project.id) || []}
                            onPreview={setSelectedProjectId}
                            onIssuePreview={setSelectedIssueId}
                        />
                    ))}
                </div>
            )}
        </WidgetShell>
    );

    const renderYourProjectsWidget = () => (
        <WidgetShell
            title="Your Projects"
            subtitle="Owned by your account"
            action={<Badge variant="secondary" className="text-xs">{yourProjects.length}</Badge>}
        >
            {yourProjects.length === 0 ? (
                <p className="text-sm text-muted-foreground">No owned projects yet.</p>
            ) : (
                <div className="grid grid-cols-1 xl:grid-cols-2 gap-3">
                    {yourProjects.map((project) => (
                        <ProjectCard
                            key={project.id}
                            project={project}
                            issues={issuesByProject.get(project.id) || []}
                            onPreview={setSelectedProjectId}
                            onIssuePreview={setSelectedIssueId}
                        />
                    ))}
                </div>
            )}
        </WidgetShell>
    );

    const renderCustomWidget = (widgetId) => {
        switch (widgetId) {
            case "your-issues":
                return renderYourIssuesWidget();
            case "recent-projects":
                return renderRecentProjectsWidget();
            case "your-projects":
                return renderYourProjectsWidget();
            case "issue-status-chart":
                return (
                    <IssueStatusChartWidget
                        issues={issues}
                        projects={projects}
                        projectFilter={chartPrefs.projectId}
                        onProjectChange={(value) => updateChartPref("projectId", value)}
                        variant={chartPrefs.issueStatusVariant}
                        onVariantChange={(value) => updateChartPref("issueStatusVariant", value)}
                    />
                );
            case "issue-priority-chart":
                return (
                    <IssuePriorityChartWidget
                        issues={issues}
                        projects={projects}
                        projectFilter={chartPrefs.projectId}
                        onProjectChange={(value) => updateChartPref("projectId", value)}
                        variant={chartPrefs.issuePriorityVariant}
                        onVariantChange={(value) => updateChartPref("issuePriorityVariant", value)}
                    />
                );
            case "issue-trend-chart":
                return (
                    <IssueTrendChartWidget
                        issues={issues}
                        projects={projects}
                        projectFilter={chartPrefs.projectId}
                        onProjectChange={(value) => updateChartPref("projectId", value)}
                        variant={chartPrefs.issueTrendVariant}
                        onVariantChange={(value) => updateChartPref("issueTrendVariant", value)}
                    />
                );
            case "project-progress-chart":
                return <ProjectProgressChartWidget projects={recentProjects} />;
            default:
                return null;
        }
    };

    return (
        <AppLayout>
            <div ref={headerRef} className="dash-anim rounded-xl border border-border/70 bg-card p-4 md:p-5 mb-5">
                <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
                    <div className="min-w-0">
                        <p className="text-xs uppercase tracking-wide text-muted-foreground">Workspace</p>
                        <h1 className="text-2xl md:text-3xl font-bold mt-1">Operational Dashboard</h1>
                        <p className="text-sm text-muted-foreground mt-1">
                            One place for planning, progress and execution.
                        </p>
                    </div>
                    <div className="flex flex-wrap items-center gap-2">
                        {!isMobile && (
                            <div className="inline-flex items-center rounded-lg border border-border bg-background p-1">
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
                                                active ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:bg-muted"
                                            )}
                                        >
                                            <Icon className="h-3.5 w-3.5" />
                                            {mode.label}
                                        </button>
                                    );
                                })}
                            </div>
                        )}
                        {!isMobile && desktopMode === "custom" && (
                            <Popover>
                                <PopoverTrigger asChild>
                                    <Button variant="outline" size="sm" className="gap-1.5">
                                        <Settings2 className="h-4 w-4" />
                                        Configure widgets
                                    </Button>
                                </PopoverTrigger>
                                <PopoverContent align="end" className="w-[350px]">
                                    <div className="space-y-3">
                                        <p className="text-xs uppercase tracking-wide text-muted-foreground">Custom dashboard widgets</p>
                                        <div className="space-y-2">
                                            {CUSTOM_WIDGET_OPTIONS.map((widget) => {
                                                const index = customWidgetsOrdered.indexOf(widget.id);
                                                const enabled = customWidgets.includes(widget.id);
                                                const width = widgetLayout[widget.id] || DEFAULT_WIDGET_LAYOUT[widget.id] || "full";
                                                return (
                                                    <div key={widget.id} className="rounded-md border border-border/70 p-2 space-y-1.5">
                                                        <div className="flex items-center gap-2 text-sm">
                                                            <Checkbox checked={enabled} onCheckedChange={() => toggleCustomWidget(widget.id)} />
                                                            <span className="flex-1">{widget.label}</span>
                                                            <button
                                                                type="button"
                                                                onClick={() => moveCustomWidget(widget.id, "up")}
                                                                disabled={!enabled || index <= 0}
                                                                className="rounded border border-border p-1 text-muted-foreground enabled:hover:text-foreground enabled:hover:bg-muted disabled:opacity-40"
                                                            >
                                                                <ArrowUp className="h-3 w-3" />
                                                            </button>
                                                            <button
                                                                type="button"
                                                                onClick={() => moveCustomWidget(widget.id, "down")}
                                                                disabled={!enabled || index === -1 || index >= customWidgetsOrdered.length - 1}
                                                                className="rounded border border-border p-1 text-muted-foreground enabled:hover:text-foreground enabled:hover:bg-muted disabled:opacity-40"
                                                            >
                                                                <ArrowDown className="h-3 w-3" />
                                                            </button>
                                                        </div>
                                                        {enabled && (
                                                            <div className="inline-flex items-center rounded-md border border-border p-0.5">
                                                                <button
                                                                    type="button"
                                                                    onClick={() => updateWidgetLayout(widget.id, "half")}
                                                                    className={cn(
                                                                        "px-2 py-0.5 text-[10px] rounded-sm",
                                                                        width === "half" ? "bg-primary text-primary-foreground" : "text-muted-foreground"
                                                                    )}
                                                                >
                                                                    Half
                                                                </button>
                                                                <button
                                                                    type="button"
                                                                    onClick={() => updateWidgetLayout(widget.id, "full")}
                                                                    className={cn(
                                                                        "px-2 py-0.5 text-[10px] rounded-sm",
                                                                        width === "full" ? "bg-primary text-primary-foreground" : "text-muted-foreground"
                                                                    )}
                                                                >
                                                                    Full
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
                        <div className="relative">
                            <AddButton label="Project" onClick={() => setCreateProjectOpen(true)} />
                            <span className="sr-only">+P</span>
                        </div>
                        <div className="relative">
                            <AddButton label="Issue" onClick={() => setCreateIssueOpen(true)} />
                            <span className="sr-only">+I</span>
                        </div>
                    </div>
                </div>
            </div>

            <div className="dash-anim grid grid-cols-1 md:grid-cols-2 xl:grid-cols-5 gap-3 mb-5">
                <MetricTile label="Projects" value={projects.length} tone="violet" />
                <MetricTile label="Active Issues" value={activeIssues} tone="blue" />
                <MetricTile label="Done Issues" value={doneIssues} tone="green" />
                <MetricTile label="Members" value={users.length} tone="cyan" />
                <MetricTile label="Completion" value={`${completionRate}%`} tone="orange" />
            </div>

            <div ref={contentRef}>
                {activeMode === "custom" ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-12 gap-4">
                        {customWidgetsOrdered.map((widgetId) => (
                            <div key={widgetId} className={cn("dash-anim", getWidgetSpanClass(widgetId))}>
                                {renderCustomWidget(widgetId)}
                            </div>
                        ))}
                    </div>
                ) : (
                    <div className="grid grid-cols-1 xl:grid-cols-12 gap-4">
                        {DEFAULT_MODE_LAYOUT.map((widgetId) => (
                            <div key={widgetId} className={cn("dash-anim", widgetId === "your-projects" ? "xl:col-span-4" : "xl:col-span-8")}>
                                {renderCustomWidget(widgetId)}
                            </div>
                        ))}
                    </div>
                )}
            </div>

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
                contentClassName={jiraLikeMode
                    ? "!left-auto !top-0 !right-0 !translate-x-0 !translate-y-0 !h-screen !w-[min(100vw,1100px)] !max-w-[min(100vw,1100px)] rounded-none border-l border-border"
                    : ""}
            />
            <CreateProjectModal open={createProjectOpen} onOpenChange={setCreateProjectOpen} />
            <CreateIssueModal open={createIssueOpen} onOpenChange={setCreateIssueOpen} />
        </AppLayout>
    );
}


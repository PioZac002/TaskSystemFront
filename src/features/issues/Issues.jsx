import { useEffect, useState, useCallback } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { AppLayout } from "@/components/layout/AppLayout";
import { Card, CardContent } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Label } from "@/components/ui/Label";
import { Badge } from "@/components/ui/Badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/Select";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/Popover";
import { Separator } from "@/components/ui/Separator";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/Sheet";
import { useIssueStore } from "@/store/issueStore";
import { useProjectStore } from "@/store/projectStore";
import { useUserStore } from "@/store/userStore";
import { useTeamStore } from "@/store/teamStore";
import { IssueDetailsModal } from "@/components/modals/IssueDetailsModal";
import { CreateIssueModal } from "@/components/modals/CreateIssueModal";
import { useResponsiveNavigation } from "@/hooks/useResponsiveNavigation";
import {
    Plus, Search, X, ListTodo, Eye, ChevronDown,
    SlidersHorizontal, ArrowUpDown, RotateCcw, Check
} from "lucide-react";
import { toast } from "sonner";
import {
    STATUS_LABELS, PRIORITY_LABELS, ALL_STATUSES, ALL_PRIORITIES,
    getStatusBadgeClass, getPriorityBadgeVariant
} from "@/utils/issueConstants";

function formatDate(dateString) {
    if (!dateString) return "No due date";
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", { year: "numeric", month: "short", day: "numeric" });
}

const SORT_OPTIONS = [
    { value: "createdAt__desc", label: "Newest first" },
    { value: "createdAt__asc", label: "Oldest first" },
    { value: "updatedAt__desc", label: "Recently updated" },
    { value: "updatedAt__asc", label: "Least recently updated" },
];

// Pill-style multi-select toggle group
function PillMultiSelect({ label, options, selected, onToggle }) {
    const hasSelected = selected.length > 0;
    return (
        <Popover>
            <PopoverTrigger asChild>
                <Button
                    variant={hasSelected ? "default" : "outline"}
                    size="sm"
                    className="h-9 gap-1.5 text-sm font-medium shrink-0"
                >
                    {label}
                    {hasSelected && (
                        <span className="ml-0.5 inline-flex h-4 min-w-4 items-center justify-center rounded-full bg-primary-foreground text-primary text-[10px] font-bold px-1">
                            {selected.length}
                        </span>
                    )}
                    <ChevronDown className="h-3.5 w-3.5 opacity-60" />
                </Button>
            </PopoverTrigger>
            <PopoverContent className="w-48 p-2" align="start">
                <div className="space-y-0.5">
                    {options.map(opt => (
                        <button
                            key={opt.value}
                            onClick={() => onToggle(opt.value)}
                            className={`w-full flex items-center gap-2 rounded-sm px-2 py-1.5 text-sm text-left transition-colors ${
                                selected.includes(opt.value)
                                    ? "bg-accent font-medium text-foreground"
                                    : "hover:bg-accent text-foreground"
                            }`}
                        >
                            <span className={`flex-shrink-0 h-3.5 w-3.5 rounded-sm border flex items-center justify-center transition-colors ${
                                selected.includes(opt.value)
                                    ? "bg-primary border-primary"
                                    : "border-muted-foreground/60 dark:border-muted-foreground/40"
                            }`}>
                                {selected.includes(opt.value) && (
                                    <Check className="h-2.5 w-2.5 text-primary-foreground stroke-[3]" />
                                )}
                            </span>
                            {opt.label}
                        </button>
                    ))}
                </div>
                {hasSelected && (
                    <>
                        <Separator className="my-2" />
                        <button
                            onClick={() => options.forEach(opt => selected.includes(opt.value) && onToggle(opt.value))}
                            className="w-full text-xs text-center text-muted-foreground hover:text-foreground py-1 transition-colors"
                        >
                            Clear selection
                        </button>
                    </>
                )}
            </PopoverContent>
        </Popover>
    );
}

// The filter panel (shared between desktop and mobile)
function FilterPanel({ state, handlers, projects, teams, users }) {
    const {
        statusFilter, priorityFilter, projectFilter, teamFilter,
        assigneeFilter, sortValue, dateFrom, dateTo, hasActiveFilters,
    } = state;
    const {
        toggleStatus, togglePriority, setProjectFilter, setTeamFilter,
        setAssigneeFilter, setSortValue, setDateFrom, setDateTo, clearFilters,
    } = handlers;

    const statusOptions = ALL_STATUSES.map(s => ({ value: s, label: STATUS_LABELS[s] }));
    const priorityOptions = ALL_PRIORITIES.map(p => ({ value: p, label: PRIORITY_LABELS[p] }));

    return (
        <div className="space-y-5">
            {/* Status */}
            <div>
                <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground mb-2">Status</p>
                <div className="flex flex-wrap gap-1.5">
                    {statusOptions.map(opt => (
                        <button
                            key={opt.value}
                            onClick={() => toggleStatus(opt.value)}
                            className={`text-xs px-2.5 py-1 rounded-full border font-medium transition-all ${
                                statusFilter.includes(opt.value)
                                    ? "border-primary bg-primary text-primary-foreground"
                                    : "border-border hover:border-primary/50 hover:bg-accent"
                            }`}
                        >
                            {opt.label}
                        </button>
                    ))}
                </div>
            </div>

            {/* Priority */}
            <div>
                <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground mb-2">Priority</p>
                <div className="flex flex-wrap gap-1.5">
                    {priorityOptions.map(opt => (
                        <button
                            key={opt.value}
                            onClick={() => togglePriority(opt.value)}
                            className={`text-xs px-2.5 py-1 rounded-full border font-medium transition-all ${
                                priorityFilter.includes(opt.value)
                                    ? "border-primary bg-primary text-primary-foreground"
                                    : "border-border hover:border-primary/50 hover:bg-accent"
                            }`}
                        >
                            {opt.label}
                        </button>
                    ))}
                </div>
            </div>

            <Separator />

            {/* Project */}
            <div>
                <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground mb-2">Project</p>
                <Select value={projectFilter} onValueChange={setProjectFilter}>
                    <SelectTrigger className="h-9">
                        <SelectValue placeholder="All Projects" />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="all">All Projects</SelectItem>
                        {projects.map(p => (
                            <SelectItem key={p.id} value={String(p.id)}>{p.shortName}</SelectItem>
                        ))}
                    </SelectContent>
                </Select>
            </div>

            {/* Team */}
            <div>
                <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground mb-2">Team</p>
                <Select value={teamFilter} onValueChange={setTeamFilter}>
                    <SelectTrigger className="h-9">
                        <SelectValue placeholder="All Teams" />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="all">All Teams</SelectItem>
                        {teams.map(t => (
                            <SelectItem key={t.id} value={String(t.id)}>{t.name}</SelectItem>
                        ))}
                    </SelectContent>
                </Select>
            </div>

            {/* Assignee */}
            <div>
                <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground mb-2">Assignee</p>
                <Select value={assigneeFilter} onValueChange={setAssigneeFilter}>
                    <SelectTrigger className="h-9">
                        <SelectValue placeholder="All Assignees" />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="all">All Assignees</SelectItem>
                        {users.map(u => (
                            <SelectItem key={u.id} value={String(u.id)}>
                                {`${u.firstName || ""} ${u.lastName || ""}`.trim() || u.email}
                            </SelectItem>
                        ))}
                    </SelectContent>
                </Select>
            </div>

            <Separator />

            {/* Date Range */}
            <div>
                <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground mb-2">Created Date Range</p>
                <div className="grid grid-cols-2 gap-2">
                    <div>
                        <Label className="text-xs text-muted-foreground">From</Label>
                        <Input type="date" value={dateFrom} onChange={e => setDateFrom(e.target.value)} className="h-9 mt-1 [color-scheme:light] dark:[color-scheme:dark]" />
                    </div>
                    <div>
                        <Label className="text-xs text-muted-foreground">To</Label>
                        <Input type="date" value={dateTo} onChange={e => setDateTo(e.target.value)} className="h-9 mt-1 [color-scheme:light] dark:[color-scheme:dark]" />
                    </div>
                </div>
            </div>

            {/* Sort */}
            <div>
                <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground mb-2">Sort By</p>
                <Select value={sortValue} onValueChange={setSortValue}>
                    <SelectTrigger className="h-9">
                        <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                        {SORT_OPTIONS.map(opt => (
                            <SelectItem key={opt.value} value={opt.value}>{opt.label}</SelectItem>
                        ))}
                    </SelectContent>
                </Select>
            </div>

        </div>
    );
}

export default function Issues() {
    const { isMobile } = useResponsiveNavigation();
    const { issues, fetchIssues, loading } = useIssueStore();
    const { projects, fetchProjects } = useProjectStore();
    const { users, fetchUsers } = useUserStore();
    const { teams, fetchTeams } = useTeamStore();
    const [searchParams] = useSearchParams();

    const [selectedIssueId, setSelectedIssueId] = useState(null);
    const [createModalOpen, setCreateModalOpen] = useState(false);
    const [filterSheetOpen, setFilterSheetOpen] = useState(false);

    // Filter state
    const [searchTerm, setSearchTerm] = useState("");
    const [statusFilter, setStatusFilter] = useState([]);
    const [priorityFilter, setPriorityFilter] = useState([]);
    const [projectFilter, setProjectFilter] = useState("all");
    const [teamFilter, setTeamFilter] = useState("all");
    const [assigneeFilter, setAssigneeFilter] = useState("all");
    const [sortValue, setSortValue] = useState("createdAt__desc");
    const [dateFrom, setDateFrom] = useState("");
    const [dateTo, setDateTo] = useState("");

    useEffect(() => {
        fetchIssues();
        fetchProjects();
        fetchUsers();
        fetchTeams();
    }, []);

    // Apply URL params on mount (for dashboard "view all" links)
    useEffect(() => {
        const assignee = searchParams.get("assignee");
        const status = searchParams.get("status");
        const priority = searchParams.get("priority");
        const project = searchParams.get("project");
        const team = searchParams.get("team");
        const sort = searchParams.get("sort");

        if (assignee) setAssigneeFilter(assignee);
        if (status) setStatusFilter(status.split(",").filter(Boolean));
        if (priority) setPriorityFilter(priority.split(",").filter(Boolean));
        if (project) setProjectFilter(project);
        if (team) setTeamFilter(team);
        if (sort && SORT_OPTIONS.find(o => o.value === sort)) setSortValue(sort);
    }, []);

    const getUserName = useCallback((userId) => {
        if (!userId) return null;
        const found = users.find(u => String(u.id) === String(userId));
        if (found) return `${found.firstName || ""} ${found.lastName || ""}`.trim() || null;
        return null;
    }, [users]);

    const toggleStatus = (status) => {
        setStatusFilter(prev =>
            prev.includes(status) ? prev.filter(s => s !== status) : [...prev, status]
        );
    };

    const togglePriority = (priority) => {
        setPriorityFilter(prev =>
            prev.includes(priority) ? prev.filter(p => p !== priority) : [...prev, priority]
        );
    };

    const clearFilters = () => {
        setSearchTerm("");
        setStatusFilter([]);
        setPriorityFilter([]);
        setProjectFilter("all");
        setTeamFilter("all");
        setAssigneeFilter("all");
        setSortValue("createdAt__desc");
        setDateFrom("");
        setDateTo("");
        toast.success("Filters cleared");
    };

    const activeFilterCount = [
        searchTerm !== "",
        statusFilter.length > 0,
        priorityFilter.length > 0,
        projectFilter !== "all",
        teamFilter !== "all",
        assigneeFilter !== "all",
        dateFrom !== "",
        dateTo !== "",
        sortValue !== "createdAt__desc",
    ].filter(Boolean).length;

    const hasActiveFilters = activeFilterCount > 0;

    // Parse sort
    const [sortField, sortDir] = sortValue.split("__");

    // Filter + sort
    const filteredIssues = issues
        .filter(issue => {
            const matchesSearch =
                (issue.title?.toLowerCase() || "").includes(searchTerm.toLowerCase()) ||
                (issue.key?.toLowerCase() || "").includes(searchTerm.toLowerCase()) ||
                (issue.description?.toLowerCase() || "").includes(searchTerm.toLowerCase());

            const matchesStatus = statusFilter.length === 0 || statusFilter.includes(issue.status);
            const matchesPriority = priorityFilter.length === 0 || priorityFilter.includes(issue.priority);
            const matchesProject = projectFilter === "all" || String(issue.projectId) === projectFilter;
            const matchesTeam = teamFilter === "all" || String(issue.team?.id) === teamFilter;
            const matchesAssignee = assigneeFilter === "all" || String(issue.assigneeId) === assigneeFilter;

            const issueDate = issue.createdAt ? new Date(issue.createdAt) : null;
            const matchesDateFrom = !dateFrom || !issueDate || issueDate >= new Date(dateFrom);
            const matchesDateTo = !dateTo || !issueDate || issueDate <= new Date(dateTo + "T23:59:59");

            return matchesSearch && matchesStatus && matchesPriority &&
                matchesProject && matchesTeam && matchesAssignee &&
                matchesDateFrom && matchesDateTo;
        })
        .sort((a, b) => {
            const dir = sortDir === "desc" ? -1 : 1;
            const valA = new Date(a[sortField] || 0);
            const valB = new Date(b[sortField] || 0);
            return (valA - valB) * dir;
        });

    const filterPanelState = {
        statusFilter, priorityFilter, projectFilter, teamFilter,
        assigneeFilter, sortValue, dateFrom, dateTo, hasActiveFilters,
    };
    const filterPanelHandlers = {
        toggleStatus, togglePriority, setProjectFilter, setTeamFilter,
        setAssigneeFilter, setSortValue, setDateFrom, setDateTo, clearFilters,
    };

    return (
        <AppLayout>
            <div className="space-y-4">
                {/* Header */}
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-3xl font-bold">Issues</h1>
                        <p className="text-muted-foreground text-sm">
                            {filteredIssues.length} of {issues.length} issues
                            {hasActiveFilters && " (filtered)"}
                        </p>
                    </div>
                    <Button onClick={() => setCreateModalOpen(true)} className="shrink-0">
                        <Plus className="h-4 w-4 sm:mr-2" />
                        <span className="hidden sm:inline">Create Issue</span>
                    </Button>
                </div>

                {/* Search bar + mobile filter button */}
                <div className="flex gap-2">
                    <div className="relative flex-1">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                        <Input
                            placeholder="Search by title, key, or description..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="pl-10"
                        />
                        {searchTerm && (
                            <button
                                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                                onClick={() => setSearchTerm("")}
                            >
                                <X className="h-4 w-4" />
                            </button>
                        )}
                    </div>

                    {/* Mobile: single "Filters" button */}
                    {isMobile && (
                        <Sheet open={filterSheetOpen} onOpenChange={setFilterSheetOpen}>
                            <SheetTrigger asChild>
                                <Button variant="outline" className="relative shrink-0 px-3">
                                    <SlidersHorizontal className="h-4 w-4" />
                                    {activeFilterCount > 0 && (
                                        <span className="absolute -top-1.5 -right-1.5 h-4 w-4 rounded-full bg-primary text-primary-foreground text-[10px] flex items-center justify-center font-bold leading-none">
                                            {activeFilterCount}
                                        </span>
                                    )}
                                </Button>
                            </SheetTrigger>
                            <SheetContent side="bottom" className="h-[85vh] overflow-y-auto rounded-t-2xl">
                                <SheetHeader className="mb-5">
                                    <SheetTitle className="flex items-center gap-2">
                                        <SlidersHorizontal className="h-4 w-4" />
                                        Filters &amp; Sorting
                                        {activeFilterCount > 0 && (
                                            <Badge variant="secondary" className="text-xs">{activeFilterCount} active</Badge>
                                        )}
                                    </SheetTitle>
                                </SheetHeader>
                                <FilterPanel
                                    state={filterPanelState}
                                    handlers={filterPanelHandlers}
                                    projects={projects}
                                    teams={teams}
                                    users={users}
                                />
                            </SheetContent>
                        </Sheet>
                    )}

                    {/* Clear button always visible when filters active */}
                    {hasActiveFilters && (
                        <Button
                            variant="ghost"
                            size="icon"
                            onClick={clearFilters}
                            title="Reset all filters"
                            className="shrink-0 text-muted-foreground hover:text-destructive"
                        >
                            <RotateCcw className="h-4 w-4" />
                        </Button>
                    )}
                </div>

                {/* Desktop filter bar */}
                {!isMobile && (
                    <div className="flex flex-wrap gap-2 items-center">
                        {/* Multi-select pills */}
                        <PillMultiSelect
                            label="Status"
                            options={ALL_STATUSES.map(s => ({ value: s, label: STATUS_LABELS[s] }))}
                            selected={statusFilter}
                            onToggle={toggleStatus}
                        />
                        <PillMultiSelect
                            label="Priority"
                            options={ALL_PRIORITIES.map(p => ({ value: p, label: PRIORITY_LABELS[p] }))}
                            selected={priorityFilter}
                            onToggle={togglePriority}
                        />

                        {/* Project select */}
                        <Select value={projectFilter} onValueChange={setProjectFilter}>
                            <SelectTrigger className={`h-9 text-sm w-auto min-w-[110px] ${projectFilter !== "all" ? "border-primary" : ""}`}>
                                <SelectValue placeholder="Project" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="all">All Projects</SelectItem>
                                {projects.map(p => (
                                    <SelectItem key={p.id} value={String(p.id)}>{p.shortName}</SelectItem>
                                ))}
                            </SelectContent>
                        </Select>

                        {/* Team select */}
                        <Select value={teamFilter} onValueChange={setTeamFilter}>
                            <SelectTrigger className={`h-9 text-sm w-auto min-w-[100px] ${teamFilter !== "all" ? "border-primary" : ""}`}>
                                <SelectValue placeholder="Team" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="all">All Teams</SelectItem>
                                {teams.map(t => (
                                    <SelectItem key={t.id} value={String(t.id)}>{t.name}</SelectItem>
                                ))}
                            </SelectContent>
                        </Select>

                        {/* Assignee select */}
                        <Select value={assigneeFilter} onValueChange={setAssigneeFilter}>
                            <SelectTrigger className={`h-9 text-sm w-auto min-w-[110px] ${assigneeFilter !== "all" ? "border-primary" : ""}`}>
                                <SelectValue placeholder="Assignee" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="all">All Assignees</SelectItem>
                                {users.map(u => (
                                    <SelectItem key={u.id} value={String(u.id)}>
                                        {`${u.firstName || ""} ${u.lastName || ""}`.trim() || u.email}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>

                        {/* Date range popover */}
                        <Popover>
                            <PopoverTrigger asChild>
                                <Button
                                    variant={dateFrom || dateTo ? "default" : "outline"}
                                    size="sm"
                                    className="h-9 gap-1.5 text-sm shrink-0"
                                >
                                    Date Range
                                    {(dateFrom || dateTo) && (
                                        <span className="ml-0.5 inline-flex h-4 min-w-4 items-center justify-center rounded-full bg-primary-foreground text-primary text-[10px] font-bold px-1">
                                            {[dateFrom, dateTo].filter(Boolean).length}
                                        </span>
                                    )}
                                    <ChevronDown className="h-3.5 w-3.5 opacity-60" />
                                </Button>
                            </PopoverTrigger>
                            <PopoverContent className="w-60 p-3" align="start">
                                <p className="text-xs font-semibold text-muted-foreground mb-3">CREATED DATE RANGE</p>
                                <div className="space-y-2">
                                    <div>
                                        <Label className="text-xs">From</Label>
                                        <Input type="date" value={dateFrom} onChange={e => setDateFrom(e.target.value)} className="h-8 mt-1 [color-scheme:light] dark:[color-scheme:dark]" />
                                    </div>
                                    <div>
                                        <Label className="text-xs">To</Label>
                                        <Input type="date" value={dateTo} onChange={e => setDateTo(e.target.value)} className="h-8 mt-1 [color-scheme:light] dark:[color-scheme:dark]" />
                                    </div>
                                    {(dateFrom || dateTo) && (
                                        <Button
                                            variant="ghost"
                                            size="sm"
                                            className="w-full h-7 text-xs"
                                            onClick={() => { setDateFrom(""); setDateTo(""); }}
                                        >
                                            Clear dates
                                        </Button>
                                    )}
                                </div>
                            </PopoverContent>
                        </Popover>

                        {/* Sort */}
                        <Select value={sortValue} onValueChange={setSortValue}>
                            <SelectTrigger className="h-9 w-auto text-sm gap-1.5">
                                <ArrowUpDown className="h-3.5 w-3.5 text-muted-foreground" />
                                <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                                {SORT_OPTIONS.map(opt => (
                                    <SelectItem key={opt.value} value={opt.value}>{opt.label}</SelectItem>
                                ))}
                            </SelectContent>
                        </Select>

                    </div>
                )}

                {/* Active filter chips (mobile) */}
                {isMobile && hasActiveFilters && (
                    <div className="flex flex-wrap gap-1.5">
                        {statusFilter.map(s => (
                            <Badge key={s} variant="secondary" className="gap-1 pr-1 text-xs">
                                {STATUS_LABELS[s]}
                                <button onClick={() => toggleStatus(s)} className="hover:text-destructive ml-0.5">
                                    <X className="h-3 w-3" />
                                </button>
                            </Badge>
                        ))}
                        {priorityFilter.map(p => (
                            <Badge key={p} variant="secondary" className="gap-1 pr-1 text-xs">
                                {PRIORITY_LABELS[p]}
                                <button onClick={() => togglePriority(p)} className="hover:text-destructive ml-0.5">
                                    <X className="h-3 w-3" />
                                </button>
                            </Badge>
                        ))}
                        {assigneeFilter !== "all" && (
                            <Badge variant="secondary" className="gap-1 pr-1 text-xs">
                                {getUserName(assigneeFilter) || `User #${assigneeFilter}`}
                                <button onClick={() => setAssigneeFilter("all")} className="hover:text-destructive ml-0.5">
                                    <X className="h-3 w-3" />
                                </button>
                            </Badge>
                        )}
                        {projectFilter !== "all" && (
                            <Badge variant="secondary" className="gap-1 pr-1 text-xs">
                                {projects.find(p => String(p.id) === projectFilter)?.shortName || projectFilter}
                                <button onClick={() => setProjectFilter("all")} className="hover:text-destructive ml-0.5">
                                    <X className="h-3 w-3" />
                                </button>
                            </Badge>
                        )}
                        {teamFilter !== "all" && (
                            <Badge variant="secondary" className="gap-1 pr-1 text-xs">
                                {teams.find(t => String(t.id) === teamFilter)?.name || teamFilter}
                                <button onClick={() => setTeamFilter("all")} className="hover:text-destructive ml-0.5">
                                    <X className="h-3 w-3" />
                                </button>
                            </Badge>
                        )}
                        {(dateFrom || dateTo) && (
                            <Badge variant="secondary" className="gap-1 pr-1 text-xs">
                                {dateFrom && dateTo ? `${dateFrom} – ${dateTo}` : dateFrom || dateTo}
                                <button onClick={() => { setDateFrom(""); setDateTo(""); }} className="hover:text-destructive ml-0.5">
                                    <X className="h-3 w-3" />
                                </button>
                            </Badge>
                        )}
                    </div>
                )}

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
                                    <RotateCcw className="mr-2 h-4 w-4" />
                                    Reset Filters
                                </Button>
                            )}
                        </CardContent>
                    </Card>
                ) : (
                    <div className="space-y-3">
                        {filteredIssues.map(issue => (
                            <Card
                                key={issue.id}
                                className="hover:shadow-lg transition-all hover:scale-[1.01]"
                            >
                                <CardContent className="p-4">
                                    <div className="flex items-center gap-3">
                                        <div className="flex-1 min-w-0">
                                            <div className="flex items-center gap-3 mb-2 flex-wrap">
                                                <span className="font-mono text-sm text-muted-foreground font-semibold shrink-0">
                                                    {issue.key}
                                                </span>
                                                {isMobile ? (
                                                    <h3
                                                        className="font-semibold hover:underline cursor-pointer text-primary truncate"
                                                        title={issue.title}
                                                        onClick={() => setSelectedIssueId(issue.id)}
                                                    >
                                                        {issue.title.length > 35 ? issue.title.slice(0, 35) + "…" : issue.title}
                                                    </h3>
                                                ) : (
                                                    <Link
                                                        to={`/issues/${issue.id}`}
                                                        className="font-semibold hover:underline text-primary truncate"
                                                        title={issue.title}
                                                    >
                                                        {issue.title}
                                                    </Link>
                                                )}
                                                <button
                                                    title="Quick preview"
                                                    className="text-muted-foreground hover:text-primary transition-colors shrink-0 ml-auto"
                                                    onClick={() => setSelectedIssueId(issue.id)}
                                                >
                                                    <Eye className="h-4 w-4" />
                                                </button>
                                            </div>
                                            <div className="flex items-center gap-2 flex-wrap">
                                                <Badge
                                                    variant="secondary"
                                                    className={getStatusBadgeClass(issue.status)}
                                                >
                                                    {STATUS_LABELS[issue.status] || issue.status}
                                                </Badge>
                                                <Badge variant={getPriorityBadgeVariant(issue.priority)}>
                                                    {PRIORITY_LABELS[issue.priority] || issue.priority}
                                                </Badge>
                                                <span className="text-sm text-muted-foreground">
                                                    📅 {formatDate(issue.dueDate)}
                                                </span>
                                                {issue.assigneeId && (
                                                    <span className="text-sm text-muted-foreground">
                                                        👤 {getUserName(issue.assigneeId) || `User #${issue.assigneeId}`}
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
                open={!!selectedIssueId}
                onOpenChange={() => setSelectedIssueId(null)}
                issueId={selectedIssueId}
                onIssueDeleted={() => {
                    setSelectedIssueId(null);
                    fetchIssues();
                }}
                onIssueUpdated={() => {
                    fetchIssues();
                }}
            />

            <CreateIssueModal
                open={createModalOpen}
                onOpenChange={setCreateModalOpen}
                onIssueCreated={() => fetchIssues()}
            />
        </AppLayout>
    );
}

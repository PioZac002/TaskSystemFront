import { useState } from "react";
import { NavLink } from "react-router-dom";
import { useAuthStore } from "@/store/authStore";
import {
    LayoutDashboard,
    FolderKanban,
    CheckSquare,
    KanbanSquare,
    Users,
    UserCircle,
    Tag,
    ChevronLeft,
    ChevronRight,
    Info,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/Button";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/Popover";

const ALL_NAV_ITEMS = [
    { title: "Dashboard", url: "/dashboard", icon: LayoutDashboard },
    { title: "Projects",  url: "/projects",  icon: FolderKanban  },
    { title: "Issues",    url: "/issues",    icon: CheckSquare   },
    { title: "Board",     url: "/board",     icon: KanbanSquare  },
    { title: "Teams",     url: "/teams",     icon: Users         },
    { title: "Users",     url: "/users",     icon: UserCircle, adminOnly: true },
    { title: "Labels",    url: "/labels",    icon: Tag,        adminOnly: true },
];

export const Sidebar = () => {
    const [collapsed, setCollapsed] = useState(false);
    const systemVersion = useAuthStore((state) => state.systemVersion);
    const isAdmin = useAuthStore((state) => state.isAdmin);
    const isAdminUser = isAdmin();
    const navItems = ALL_NAV_ITEMS.filter(item => !item.adminOnly || isAdminUser);

    const versionLabel = systemVersion
        ? 'v' + systemVersion.replace(/^v/, '').split('.').slice(0, 3).join('.').substring(0, 9)
        : null;

    return (
        <aside
            className={cn(
                "relative hidden md:flex flex-col border-r border-sidebar-border bg-sidebar transition-all duration-300",
                collapsed ? "w-16" : "w-64"
            )}
        >
            {/* Logo */}
            <div className="flex h-16 items-center justify-between border-b border-sidebar-border px-4">
                {!collapsed ? (
                    <div className="flex items-center gap-2 min-w-0">
                        <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-md bg-gradient-to-br from-primary to-accent">
                            <CheckSquare className="h-5 w-5 text-primary-foreground" />
                        </div>
                        <div className="flex flex-col min-w-0">
                            {/* Logo text with hover color (desktop only via CSS) */}
                            <div className="logo-text-wrap">
                                <span className="text-lg font-bold leading-tight logo-text-main">TaskSystem</span>
                            </div>
                            {versionLabel && (
                                <div className="flex items-center gap-1">
                                    <span className="text-[10px] font-mono text-sidebar-foreground/40 leading-tight">{versionLabel}</span>
                                    <Popover>
                                        <PopoverTrigger asChild>
                                            <Button
                                                variant="ghost"
                                                size="icon"
                                                className="h-4 w-4 rounded-full text-sidebar-foreground/60 hover:text-sidebar-foreground"
                                                aria-label="Release notes"
                                            >
                                                <Info className="h-3 w-3" />
                                            </Button>
                                        </PopoverTrigger>
                                        <PopoverContent align="start" className="w-[360px]">
                                            <div className="space-y-2">
                                                <p className="text-sm font-semibold">What&apos;s new in this release</p>
                                                <ul className="space-y-1 text-xs text-muted-foreground">
                                                    <li>Dashboard now supports three desktop modes: Default, Custom and Jira-like.</li>
                                                    <li>Custom dashboard widgets can be enabled/disabled, reordered and resized (half/full width) in a responsive layout.</li>
                                                    <li>New analytics widgets were added: issue status, issue priority, issue trend and project progress charts.</li>
                                                    <li>Charts now support project scoping and chart-type switching (Pie/Bar/Line where applicable).</li>
                                                    <li>Jira-like mode now uses the full issue details experience in the right-side panel.</li>
                                                    <li>Dashboard preferences are persisted per user after reload (mode, widgets, layout and chart preferences).</li>
                                                    <li>Projects page received a visual refresh with spotlight, sorting and grid/compact views.</li>
                                                    <li>Issues filtering UX was improved with clearer active pills, KPI explanations and stronger filter persistence.</li>
                                                </ul>
                                            </div>
                                        </PopoverContent>
                                    </Popover>
                                </div>
                            )}
                        </div>
                    </div>
                ) : (
                    <div className="flex h-8 w-8 items-center justify-center rounded-md bg-gradient-to-br from-primary to-accent mx-auto">
                        <CheckSquare className="h-5 w-5 text-primary-foreground" />
                    </div>
                )}
            </div>

            {/* Navigation */}
            <nav className="flex-1 space-y-1 p-2">
                {navItems.map((item) => (
                    <NavLink
                        key={item.url}
                        to={item.url}
                        className={({ isActive }) =>
                            cn(
                                "sidebar-nav-item flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-all duration-200",
                                "hover:bg-sidebar-accent hover:text-sidebar-accent-foreground",
                                isActive
                                    ? "bg-sidebar-accent text-sidebar-accent-foreground"
                                    : "text-sidebar-foreground"
                            )
                        }
                    >
                        <item.icon className="h-5 w-5 sidebar-nav-icon" />
                        {!collapsed && <span>{item.title}</span>}
                    </NavLink>
                ))}
            </nav>

            {/* Collapse Toggle */}
            <button
                onClick={() => setCollapsed(!collapsed)}
                className="absolute -right-3 top-20 flex h-6 w-6 items-center justify-center rounded-full border border-sidebar-border bg-sidebar shadow-md hover:shadow-lg transition-all duration-200"
                aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
            >
                {collapsed ? (
                    <ChevronRight className="h-4 w-4 text-sidebar-foreground" />
                ) : (
                    <ChevronLeft className="h-4 w-4 text-sidebar-foreground" />
                )}
            </button>
        </aside>
    );
};

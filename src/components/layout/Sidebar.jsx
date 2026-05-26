import { useState } from "react";
import { Link, NavLink } from "react-router-dom";
import { useAuthStore } from "@/store/authStore";
import {
    LayoutDashboard,
    FolderKanban,
    CheckSquare,
    KanbanSquare,
    Users,
    UserCircle,
    Tag,
    Info,
    Sparkles,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/Button";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/Popover";

const ALL_NAV_ITEMS = [
    { title: "Dashboard", url: "/dashboard", icon: LayoutDashboard },
    { title: "Projects", url: "/projects", icon: FolderKanban },
    { title: "Issues", url: "/issues", icon: CheckSquare },
    { title: "Board", url: "/board", icon: KanbanSquare },
    { title: "Teams", url: "/teams", icon: Users },
    { title: "Users", url: "/users", icon: UserCircle, adminOnly: true },
    { title: "Labels", url: "/labels", icon: Tag, adminOnly: true },
];

export const Sidebar = () => {
    const [open, setOpen] = useState(false);
    const systemVersion = useAuthStore((state) => state.systemVersion);
    const isAdmin = useAuthStore((state) => state.isAdmin);
    const isAdminUser = isAdmin();
    const navItems = ALL_NAV_ITEMS.filter(item => !item.adminOnly || isAdminUser);

    const versionLabel = systemVersion
        ? 'v' + systemVersion.replace(/^v/, '').split('.').slice(0, 3).join('.').substring(0, 9)
        : null;

    return (
        <aside
            onMouseEnter={() => setOpen(true)}
            onMouseLeave={() => setOpen(false)}
            onFocusCapture={() => setOpen(true)}
            onBlurCapture={(event) => {
                if (!event.currentTarget.contains(event.relatedTarget)) {
                    setOpen(false);
                }
            }}
            className={cn(
                "sticky top-0 hidden h-screen shrink-0 flex-col overflow-hidden border-r border-border bg-card/95 shadow-[12px_0_40px_rgba(15,23,42,0.04)] backdrop-blur-xl transition-[width] duration-300 ease-[cubic-bezier(0.22,1,0.36,1)] md:flex",
                open ? "w-72" : "w-[4.75rem]"
            )}
        >
            <div className="flex h-16 items-center border-b border-border px-4">
                <Link to="/dashboard" className="flex min-w-0 items-center gap-3">
                    <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-foreground text-background shadow-input dark:bg-white dark:text-slate-950">
                        <CheckSquare className="h-5 w-5" />
                    </div>
                    <div
                        className={cn(
                            "min-w-0 transition-all duration-200",
                            open ? "translate-x-0 opacity-100" : "pointer-events-none -translate-x-2 opacity-0"
                        )}
                    >
                        <div className="logo-text-wrap">
                            <span className="block truncate text-base font-semibold leading-tight text-foreground logo-text-main">
                                TaskSystem
                            </span>
                        </div>
                        {versionLabel && (
                            <div className="flex items-center gap-1">
                                <span className="font-mono text-[10px] leading-tight text-muted-foreground">
                                    {versionLabel}
                                </span>
                                <Popover>
                                    <PopoverTrigger asChild>
                                        <Button
                                            variant="ghost"
                                            size="icon"
                                            className="h-4 w-4 rounded-full text-muted-foreground hover:text-foreground"
                                            aria-label="Release notes"
                                        >
                                            <Info className="h-3 w-3" />
                                        </Button>
                                    </PopoverTrigger>
                                    <PopoverContent align="start" className="w-[360px]">
                                        <div className="space-y-2">
                                            <p className="text-sm font-semibold">What&apos;s new in this release</p>
                                            <ul className="space-y-1 text-xs text-muted-foreground">
                                                <li>Dashboard supports Default, Custom and Jira-like desktop modes.</li>
                                                <li>Custom widgets can be enabled, reordered and resized.</li>
                                                <li>Analytics widgets include status, priority, trend and progress charts.</li>
                                                <li>Projects and issues views keep the latest data refresh fixes.</li>
                                                <li>Labels and Users remain visible only for admin users.</li>
                                            </ul>
                                        </div>
                                    </PopoverContent>
                                </Popover>
                            </div>
                        )}
                    </div>
                </Link>
            </div>

            <nav className="flex-1 space-y-1 p-3">
                {navItems.map((item) => (
                    <NavLink
                        key={item.url}
                        to={item.url}
                        title={!open ? item.title : undefined}
                        className={({ isActive }) =>
                            cn(
                                "sidebar-nav-item relative flex h-11 items-center gap-3 rounded-lg px-3 text-sm font-medium transition-all duration-200",
                                "hover:bg-accent hover:text-accent-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
                                isActive
                                    ? "bg-foreground text-background shadow-input dark:bg-white dark:text-slate-950"
                                    : "text-muted-foreground"
                            )
                        }
                    >
                        <item.icon className="h-5 w-5 shrink-0 sidebar-nav-icon" />
                        <span
                            className={cn(
                                "whitespace-nowrap transition-all duration-200",
                                open ? "translate-x-0 opacity-100" : "pointer-events-none -translate-x-2 opacity-0"
                            )}
                        >
                            {item.title}
                        </span>
                    </NavLink>
                ))}
            </nav>

            <div className="border-t border-border p-3">
                <div className="flex h-11 items-center gap-3 rounded-lg border border-border bg-background px-3">
                    <Sparkles className="h-5 w-5 shrink-0 text-primary" />
                    <div
                        className={cn(
                            "min-w-0 transition-all duration-200",
                            open ? "translate-x-0 opacity-100" : "pointer-events-none -translate-x-2 opacity-0"
                        )}
                    >
                        <p className="truncate text-sm font-medium text-foreground">Workspace</p>
                        <p className="truncate text-xs text-muted-foreground">Active session</p>
                    </div>
                </div>
            </div>
        </aside>
    );
};

import { useState } from "react";
import { NavLink } from "react-router-dom";
import {
    LayoutDashboard,
    FolderKanban,
    CheckSquare,
    KanbanSquare,
    User,
    ChevronLeft,
    ChevronRight
} from "lucide-react";
import { cn } from "@/lib/utils";

const navItems = [
    { title: "Dashboard", url: "/dashboard", icon: LayoutDashboard },
    { title: "Projects", url: "/projects", icon: FolderKanban },
    { title: "Issues", url: "/issues", icon: CheckSquare },
    { title: "Board", url: "/board", icon: KanbanSquare },
    { title: "Profile", url: "/profile", icon: User },
];

export const Sidebar = () => {
    const [collapsed, setCollapsed] = useState(false);

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
                    <div className="flex items-center gap-2">
                        <div className="flex h-8 w-8 items-center justify-center rounded-md bg-gradient-to-br from-primary to-accent">
                            <CheckSquare className="h-5 w-5 text-primary-foreground" />
                        </div>
                        <span className="text-lg font-bold text-sidebar-foreground">TaskSystem</span>
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
                                "flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-all duration-200",
                                "hover:bg-sidebar-accent hover:text-sidebar-accent-foreground",
                                isActive
                                    ? "bg-sidebar-accent text-sidebar-accent-foreground"
                                    : "text-sidebar-foreground"
                            )
                        }
                    >
                        <item.icon className="h-5 w-5 shrink-0" />
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

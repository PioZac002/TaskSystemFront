import { useState } from "react";
import { Bell, Search, LogOut, Settings, Menu, X } from "lucide-react";
import { NavLink, useNavigate } from "react-router-dom";
import { LayoutDashboard, FolderKanban, ListTodo, Trello, UserCircle } from "lucide-react";
import { useAuthStore } from "@/store/authStore";
import { cn } from "@/lib/utils";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/Avatar";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { ThemeToggle } from "@/components/common/ThemeToggle";

const navItems = [
    { title: "Dashboard", url: "/dashboard", icon: LayoutDashboard },
    { title: "Projects", url: "/projects", icon: FolderKanban },
    { title: "Issues", url: "/issues", icon: ListTodo },
    { title: "Board", url: "/board", icon: Trello },
    { title: "Profile", url: "/profile", icon: UserCircle },
];

export const TopBar = () => {
    const navigate = useNavigate();
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
    const user = useAuthStore((state) => state.user);
    const logout = useAuthStore((state) => state.logout);

    const handleLogout = () => {
        logout();
        navigate("/login");
    };

    return (
        <>
            <header className="sticky top-0 z-50 flex h-16 items-center justify-between border-b border-border bg-card px-4 md:px-6 shadow-sm">
                <Button
                    variant="ghost"
                    size="icon"
                    className="md:hidden"
                    onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                    aria-label="Toggle menu"
                    aria-expanded={mobileMenuOpen}
                >
                    {mobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
                </Button>

                {/* Search */}
                <div className="flex flex-1 items-center gap-4 max-w-md">
                    <div className="relative w-full">
                        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                        <Input
                            type="search"
                            placeholder="Search projects, issues..."
                            className="pl-10 bg-background"
                        />
                    </div>
                </div>

                {/* Actions */}
                <div className="flex items-center gap-2">
                    {/* Theme Toggle */}
                    <ThemeToggle />

                    {/* Notifications */}
                    <Button variant="ghost" size="icon" className="relative">
                        <Bell className="h-5 w-5" />
                        <span className="absolute right-1 top-1 h-2 w-2 rounded-full bg-destructive"></span>
                    </Button>

                    {/* User Menu */}
                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <Button variant="ghost" className="relative h-10 w-10 rounded-full">
                                <Avatar className="h-10 w-10">
                                    <AvatarImage src="" alt="User" />
                                    <AvatarFallback className="bg-primary text-primary-foreground">
                                        {user?.name?.substring(0, 2).toUpperCase() || "JD"}
                                    </AvatarFallback>
                                </Avatar>
                            </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent className="w-56 bg-popover" align="end">
                            <DropdownMenuLabel className="font-normal">
                                <div className="flex flex-col space-y-1">
                                    <p className="text-sm font-medium leading-none">{user?.name || "John Doe"}</p>
                                    <p className="text-xs leading-none text-muted-foreground">{user?.email || "john@example.com"}</p>
                                </div>
                            </DropdownMenuLabel>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem onClick={() => navigate("/profile")}>
                                <Settings className="mr-2 h-4 w-4" />
                                <span>Settings</span>
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={handleLogout}>
                                <LogOut className="mr-2 h-4 w-4" />
                                <span>Log out</span>
                            </DropdownMenuItem>
                        </DropdownMenuContent>
                    </DropdownMenu>
                </div>
            </header>

            {/* Mobile Navigation Menu - Dropdown from top */}
            <nav
                className={cn(
                    "md:hidden fixed top-16 left-0 right-0 z-40 bg-card border-b border-border shadow-lg transition-all duration-300 ease-in-out",
                    mobileMenuOpen ? "opacity-100 translate-y-0" : "opacity-0 -translate-y-full pointer-events-none"
                )}
                aria-hidden={!mobileMenuOpen}
            >
                <div className="flex flex-col p-4 space-y-1 max-h-[calc(100vh-4rem)] overflow-y-auto">
                    {navItems.map((item) => (
                        <NavLink
                            key={item.url}
                            to={item.url}
                            onClick={() => setMobileMenuOpen(false)}
                            className={({ isActive }) =>
                                cn(
                                    "flex items-center gap-3 px-4 py-3 rounded-lg transition-all",
                                    "hover:bg-accent focus:bg-accent focus:outline-none focus-visible:ring-2 focus-visible:ring-primary",
                                    isActive ? "bg-primary/10 text-primary font-medium" : "text-muted-foreground"
                                )
                            }
                        >
                            <item.icon className="h-5 w-5" />
                            <span>{item.title}</span>
                        </NavLink>
                    ))}
                </div>
            </nav>
        </>
    );
};

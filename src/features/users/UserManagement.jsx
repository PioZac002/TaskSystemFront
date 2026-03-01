import { useEffect, useState } from "react";
import { AppLayout } from "@/components/layout/AppLayout";
import { Card, CardContent } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Label } from "@/components/ui/Label";
import { Badge } from "@/components/ui/Badge";
import { Avatar, AvatarFallback } from "@/components/ui/Avatar";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/Table";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/Dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/Select";
import { useUserStore } from "@/store/userStore";
import { useAuthStore } from "@/store/authStore";
import apiClient from "@/services/apiClient";
import { Search, Trash2, Mail, ArrowUpDown, UserCircle, KeyRound, Shield } from "lucide-react";
import { toast } from "sonner";
import { getInitials } from "@/utils/formatters";

export default function UserManagement() {
    const { users, fetchUsers, deleteUser, loading } = useUserStore();
    const isAdmin = useAuthStore((state) => state.isAdmin);
    const isCurrentUserAdmin = isAdmin();

    const [searchTerm, setSearchTerm] = useState("");
    const [sortField, setSortField] = useState("id");
    const [sortOrder, setSortOrder] = useState("asc");

    const [resetPasswordDialog, setResetPasswordDialog] = useState({ open: false, user: null });
    const [resetNewPassword, setResetNewPassword] = useState("");
    const [resetConfirmPassword, setResetConfirmPassword] = useState("");
    const [resetLoading, setResetLoading] = useState(false);

    const [changeRoleDialog, setChangeRoleDialog] = useState({ open: false, user: null });
    const [selectedRole, setSelectedRole] = useState("");
    const [roleLoading, setRoleLoading] = useState(false);

    useEffect(() => {
        fetchUsers();
    }, []);

    const handleDeleteUser = async (userId, userName) => {
        if (!window.confirm(`Are you sure you want to delete user "${userName}"?  This action cannot be undone.`)) {
            return;
        }

        try {
            await deleteUser(userId);
            toast.success("User deleted successfully!");
            await fetchUsers(); // Refresh list
        } catch (error) {
            const errorMessage = error.response?.data?.Message || error.message || "Failed to delete user";
            toast.error(errorMessage);
        }
    };

    const handleSort = (field) => {
        if (sortField === field) {
            setSortOrder(sortOrder === "asc" ? "desc" : "asc");
        } else {
            setSortField(field);
            setSortOrder("asc");
        }
    };

    const openResetPassword = (user) => {
        setResetNewPassword("");
        setResetConfirmPassword("");
        setResetPasswordDialog({ open: true, user });
    };

    const handleResetPassword = async () => {
        if (resetNewPassword !== resetConfirmPassword) {
            toast.error("Passwords do not match.");
            return;
        }
        if (resetNewPassword.length < 6) {
            toast.error("Password must be at least 6 characters.");
            return;
        }
        setResetLoading(true);
        try {
            await apiClient.put('/api/v1/admin/password', {
                userId: resetPasswordDialog.user.id,
                newPassword: resetNewPassword,
            });
            toast.success("Password reset successfully!");
            setResetPasswordDialog({ open: false, user: null });
        } catch (error) {
            const message = error.response?.data?.Message || error.response?.data?.message || error.message || "Failed to reset password";
            toast.error(message);
        } finally {
            setResetLoading(false);
        }
    };

    const openChangeRole = (user) => {
        setSelectedRole(user.role || "USER");
        setChangeRoleDialog({ open: true, user });
    };

    const handleChangeRole = async () => {
        setRoleLoading(true);
        try {
            await apiClient.put('/api/v1/user/role', {
                userId: changeRoleDialog.user.id,
                role: selectedRole,
            });
            toast.success("Role updated successfully!");
            setChangeRoleDialog({ open: false, user: null });
            await fetchUsers();
        } catch (error) {
            const message = error.response?.data?.Message || error.response?.data?.message || error.message || "Failed to update role";
            toast.error(message);
        } finally {
            setRoleLoading(false);
        }
    };

    // Filtrowanie z null safety
    const filteredUsers = users.filter(user => {
        if (!searchTerm) return true;

        const search = searchTerm.toLowerCase();

        // Bezpieczne sprawdzanie z optional chaining
        const matchesEmail = (user.email?.toLowerCase() || "").includes(search);
        const matchesFirstName = (user.firstName?.toLowerCase() || "").includes(search);
        const matchesLastName = (user.lastName?.toLowerCase() || "").includes(search);
        const matchesId = String(user.id || "").includes(search);

        return matchesEmail || matchesFirstName || matchesLastName || matchesId;
    });

    // Sortowanie
    const sortedUsers = [...filteredUsers].sort((a, b) => {
        let aVal, bVal;
        
        switch (sortField) {
            case "name":
                aVal = `${a.firstName || ""} ${a.lastName || ""}`.toLowerCase();
                bVal = `${b.firstName || ""} ${b.lastName || ""}`.toLowerCase();
                break;
            case "email":
                aVal = (a.email || "").toLowerCase();
                bVal = (b.email || "").toLowerCase();
                break;
            case "role":
                aVal = (a.role || "").toLowerCase();
                bVal = (b.role || "").toLowerCase();
                break;
            default:
                aVal = a.id || 0;
                bVal = b.id || 0;
        }

        if (aVal < bVal) return sortOrder === "asc" ? -1 : 1;
        if (aVal > bVal) return sortOrder === "asc" ? 1 : -1;
        return 0;
    });

    return (
        <AppLayout>
            <div className="space-y-6">
                {/* Header */}
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-3xl font-bold">User Management</h1>
                        <p className="text-muted-foreground">
                            Manage system users • {sortedUsers.length} of {users.length} users
                        </p>
                    </div>
                </div>

                {/* Search */}
                <Card>
                    <CardContent className="pt-6">
                        <div className="relative">
                            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                            <Input
                                placeholder="Search by name, email, or ID..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="pl-10"
                            />
                        </div>
                    </CardContent>
                </Card>

                {/* Users Table */}
                {loading ? (
                    <div className="text-center py-12">
                        <p className="text-muted-foreground">Loading users...</p>
                    </div>
                ) : sortedUsers.length === 0 ? (
                    <Card>
                        <CardContent className="py-12 text-center">
                            <UserCircle className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
                            <p className="text-lg font-medium mb-2">
                                {searchTerm ? "No users match your search" : "No users found"}
                            </p>
                            <p className="text-sm text-muted-foreground">
                                {searchTerm && "Try a different search term"}
                            </p>
                        </CardContent>
                    </Card>
                ) : (
                    <>
                        {/* Mobile - Cards */}
                        <div className="md:hidden space-y-3">
                            {sortedUsers.map(user => (
                                <Card key={user.id}>
                                    <CardContent className="p-4">
                                        <div className="flex items-center gap-3">
                                            <Avatar className="h-10 w-10 bg-primary/10">
                                                <AvatarFallback className="bg-primary/20 text-primary font-semibold">
                                                    {getInitials(user.firstName, user.lastName)}
                                                </AvatarFallback>
                                            </Avatar>
                                            <div className="flex-1 min-w-0">
                                                <p className="font-semibold" title={`${user.firstName || ''} ${user.lastName || ''}`.trim()}>
                                                    {(() => { const n = `${user.firstName || 'N/A'} ${user.lastName || ''}`.trim(); return n.length > 21 ? n.slice(0, 21) + '…' : n; })()}
                                                </p>
                                                <p className="text-sm text-muted-foreground" title={user.email || ''}>
                                                    {(user.email || "No email").length > 21 ? (user.email || "No email").slice(0, 21) + '…' : (user.email || "No email")}
                                                </p>
                                            </div>
                                            <div className="flex items-center gap-2 shrink-0">
                                                <Badge variant="secondary">
                                                    {user.role || "User"}
                                                </Badge>
                                                {isCurrentUserAdmin && (
                                                    <>
                                                        <Button size="sm" variant="outline" onClick={() => openResetPassword(user)} title="Reset password">
                                                            <KeyRound className="h-4 w-4" />
                                                        </Button>
                                                        <Button size="sm" variant="outline" onClick={() => openChangeRole(user)} title="Change role">
                                                            <Shield className="h-4 w-4" />
                                                        </Button>
                                                    </>
                                                )}
                                                <Button
                                                    variant="ghost"
                                                    size="sm"
                                                    onClick={() => handleDeleteUser(
                                                        user.id,
                                                        `${user.firstName || ''} ${user.lastName || ''}`.trim() || user.email || `User #${user.id}`
                                                    )}
                                                    className="text-destructive hover:text-destructive hover:bg-destructive/10"
                                                >
                                                    <Trash2 className="h-4 w-4" />
                                                </Button>
                                            </div>
                                        </div>
                                    </CardContent>
                                </Card>
                            ))}
                        </div>

                        {/* Desktop - Table */}
                        <Card className="hidden md:block max-w-full overflow-hidden">
                            <CardContent className="p-0 overflow-x-auto">\
                                <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead className="w-[80px]">Avatar</TableHead>
                                        <TableHead>
                                            <Button
                                                variant="ghost"
                                                size="sm"
                                                className="-ml-3 h-8"
                                                onClick={() => handleSort("name")}
                                            >
                                                Name
                                                <ArrowUpDown className="ml-2 h-4 w-4" />
                                            </Button>
                                        </TableHead>
                                        <TableHead>
                                            <Button
                                                variant="ghost"
                                                size="sm"
                                                className="-ml-3 h-8"
                                                onClick={() => handleSort("email")}
                                            >
                                                Email
                                                <ArrowUpDown className="ml-2 h-4 w-4" />
                                            </Button>
                                        </TableHead>
                                        <TableHead>
                                            <Button
                                                variant="ghost"
                                                size="sm"
                                                className="-ml-3 h-8"
                                                onClick={() => handleSort("role")}
                                            >
                                                Role
                                                <ArrowUpDown className="ml-2 h-4 w-4" />
                                            </Button>
                                        </TableHead>
                                        <TableHead>
                                            <Button
                                                variant="ghost"
                                                size="sm"
                                                className="-ml-3 h-8"
                                                onClick={() => handleSort("id")}
                                            >
                                                ID
                                                <ArrowUpDown className="ml-2 h-4 w-4" />
                                            </Button>
                                        </TableHead>
                                        <TableHead className="text-right">Actions</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {sortedUsers.map((user) => (
                                        <TableRow key={user.id}>
                                            <TableCell>
                                                <Avatar className="h-10 w-10 bg-primary/10">
                                                    <AvatarFallback className="bg-primary/20 text-primary font-semibold">
                                                        {getInitials(user.firstName, user.lastName)}
                                                    </AvatarFallback>
                                                </Avatar>
                                            </TableCell>
                                            <TableCell className="font-medium">
                                                {user.firstName || "N/A"} {user.lastName || ""}
                                            </TableCell>
                                            <TableCell>
                                                <div className="flex items-center gap-2">
                                                    <Mail className="h-4 w-4 text-muted-foreground" />
                                                    <span className="text-sm">{user.email || "No email"}</span>
                                                </div>
                                            </TableCell>
                                            <TableCell>
                                                <Badge variant="secondary">
                                                    {user.role || "User"}
                                                </Badge>
                                            </TableCell>
                                            <TableCell>
                                                <Badge variant="outline">{user.id}</Badge>
                                            </TableCell>
                                            <TableCell className="text-right">
                                                <div className="flex items-center justify-end gap-1">
                                                    {isCurrentUserAdmin && (
                                                        <>
                                                            <Button size="sm" variant="outline" onClick={() => openResetPassword(user)} title="Reset password">
                                                                <KeyRound className="h-4 w-4" />
                                                            </Button>
                                                            <Button size="sm" variant="outline" onClick={() => openChangeRole(user)} title="Change role">
                                                                <Shield className="h-4 w-4" />
                                                            </Button>
                                                        </>
                                                    )}
                                                    <Button
                                                        variant="ghost"
                                                        size="sm"
                                                        onClick={() => handleDeleteUser(
                                                            user.id,
                                                            `${user.firstName || ''} ${user.lastName || ''}`.trim() || user.email || `User #${user.id}`
                                                        )}
                                                        className="text-destructive hover:text-destructive hover:bg-destructive/10"
                                                    >
                                                        <Trash2 className="h-4 w-4" />
                                                    </Button>
                                                </div>
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        </CardContent>
                    </Card>
                    </>
                )}
            </div>

            {/* Reset Password Dialog */}
            <Dialog open={resetPasswordDialog.open} onOpenChange={(open) => setResetPasswordDialog(prev => ({ ...prev, open }))}>
                <DialogContent className="max-w-sm">
                    <DialogHeader>
                        <DialogTitle>Reset Password</DialogTitle>
                    </DialogHeader>
                    <div className="space-y-4 py-2">
                        <p className="text-sm text-muted-foreground">
                            Set a new password for <strong>{resetPasswordDialog.user ? `${resetPasswordDialog.user.firstName || ''} ${resetPasswordDialog.user.lastName || ''}`.trim() || resetPasswordDialog.user.email : ''}</strong>
                        </p>
                        <div className="space-y-2">
                            <Label htmlFor="resetNewPassword">New Password</Label>
                            <Input
                                id="resetNewPassword"
                                type="password"
                                value={resetNewPassword}
                                onChange={(e) => setResetNewPassword(e.target.value)}
                                disabled={resetLoading}
                            />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="resetConfirmPassword">Confirm Password</Label>
                            <Input
                                id="resetConfirmPassword"
                                type="password"
                                value={resetConfirmPassword}
                                onChange={(e) => setResetConfirmPassword(e.target.value)}
                                disabled={resetLoading}
                            />
                        </div>
                    </div>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setResetPasswordDialog({ open: false, user: null })} disabled={resetLoading}>
                            Cancel
                        </Button>
                        <Button onClick={handleResetPassword} disabled={resetLoading}>
                            {resetLoading ? "Resetting..." : "Reset Password"}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* Change Role Dialog */}
            <Dialog open={changeRoleDialog.open} onOpenChange={(open) => setChangeRoleDialog(prev => ({ ...prev, open }))}>
                <DialogContent className="max-w-sm">
                    <DialogHeader>
                        <DialogTitle>Change Role</DialogTitle>
                    </DialogHeader>
                    <div className="space-y-4 py-2">
                        <p className="text-sm text-muted-foreground">
                            Change role for <strong>{changeRoleDialog.user ? `${changeRoleDialog.user.firstName || ''} ${changeRoleDialog.user.lastName || ''}`.trim() || changeRoleDialog.user.email : ''}</strong>
                        </p>
                        <div className="space-y-2">
                            <Label>Role</Label>
                            <Select value={selectedRole} onValueChange={setSelectedRole}>
                                <SelectTrigger>
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="USER">User</SelectItem>
                                    <SelectItem value="ADMIN">Admin</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                    </div>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setChangeRoleDialog({ open: false, user: null })} disabled={roleLoading}>
                            Cancel
                        </Button>
                        <Button onClick={handleChangeRole} disabled={roleLoading}>
                            {roleLoading ? "Saving..." : "Save Role"}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </AppLayout>
    );
}
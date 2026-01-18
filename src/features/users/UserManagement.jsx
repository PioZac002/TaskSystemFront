import { useEffect, useState } from "react";
import { AppLayout } from "@/components/layout/AppLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { useUserStore } from "@/store/userStore";
import { Search, Trash2, User, Mail, UserCircle } from "lucide-react";
import { toast } from "sonner";
import { getInitials } from "@/utils/formatters";

export default function UserManagement() {
    const { users, fetchUsers, deleteUser, loading } = useUserStore();
    const [searchTerm, setSearchTerm] = useState("");

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

    // Filtrowanie z null safety
    const filteredUsers = users. filter(user => {
        if (!searchTerm) return true;

        const search = searchTerm.toLowerCase();

        // Bezpieczne sprawdzanie z optional chaining
        const matchesEmail = (user.email?. toLowerCase() || "").includes(search);
        const matchesFirstName = (user.firstName?.toLowerCase() || "").includes(search);
        const matchesLastName = (user.lastName?.toLowerCase() || "").includes(search);
        const matchesId = String(user.id || "").includes(search);

        return matchesEmail || matchesFirstName || matchesLastName || matchesId;
    });

    return (
        <AppLayout>
            <div className="space-y-6">
                {/* Header */}
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-3xl font-bold">User Management</h1>
                        <p className="text-muted-foreground">
                            Manage system users • {filteredUsers.length} of {users.length} users
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

                {/* Users List */}
                {loading ? (
                    <div className="text-center py-12">
                        <p className="text-muted-foreground">Loading users...</p>
                    </div>
                ) : filteredUsers.length === 0 ? (
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
                    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                        {filteredUsers. map((user) => (
                            <Card key={user.id} className="hover:shadow-lg transition-shadow">
                                <CardHeader>
                                    <div className="flex items-start gap-4">
                                        <Avatar className="h-12 w-12 bg-primary/10">
                                            <AvatarFallback className="bg-primary/20 text-primary font-semibold">
                                                {getInitials(user.firstName, user.lastName)}
                                            </AvatarFallback>
                                        </Avatar>
                                        <div className="flex-1 min-w-0">
                                            <CardTitle className="text-lg truncate">
                                                {user.firstName || "N/A"} {user.lastName || ""}
                                            </CardTitle>
                                            <div className="flex items-center gap-2 mt-1">
                                                <Mail className="h-3 w-3 text-muted-foreground" />
                                                <p className="text-sm text-muted-foreground truncate">
                                                    {user.email || "No email"}
                                                </p>
                                            </div>
                                        </div>
                                    </div>
                                </CardHeader>
                                <CardContent>
                                    <div className="space-y-3">
                                        <div className="flex items-center justify-between text-sm">
                                            <span className="text-muted-foreground">User ID</span>
                                            <Badge variant="outline">{user.id}</Badge>
                                        </div>

                                        <div className="flex items-center justify-between text-sm">
                                            <span className="text-muted-foreground">Role</span>
                                            <Badge variant="secondary">
                                                {user.role || "User"}
                                            </Badge>
                                        </div>

                                        <div className="pt-3 border-t">
                                            <Button
                                                variant="destructive"
                                                size="sm"
                                                className="w-full"
                                                onClick={() => handleDeleteUser(
                                                    user.id,
                                                    `${user.firstName || ''} ${user.lastName || ''}`.trim() || user.email || `User #${user.id}`
                                                )}
                                            >
                                                <Trash2 className="mr-2 h-4 w-4" />
                                                Delete User
                                            </Button>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        ))}
                    </div>
                )}
            </div>
        </AppLayout>
    );
}
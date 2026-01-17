import { useEffect, useState } from "react";
import { AppLayout } from "@/components/layout/AppLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/Table";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/AlertDialog";
import { Skeleton } from "@/components/ui/Skeleton";
import { useUserStore } from "@/store/userStore";
import { toast } from "@/hooks/use-toast";
import { Users, RefreshCw, Trash2, Search } from "lucide-react";

export default function UserManagement() {
    const [searchTerm, setSearchTerm] = useState("");
    const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
    const [userToDelete, setUserToDelete] = useState(null);
    
    const users = useUserStore((state) => state.users);
    const loading = useUserStore((state) => state.loading);
    const fetchUsers = useUserStore((state) => state.fetchUsers);
    const deleteUser = useUserStore((state) => state.deleteUser);

    useEffect(() => {
        fetchUsers();
    }, []);

    const handleRefresh = () => {
        fetchUsers();
        toast({ title: "Refreshing", description: "Loading users..." });
    };

    const confirmDelete = (user) => {
        setUserToDelete(user);
        setDeleteDialogOpen(true);
    };

    const handleDelete = async () => {
        if (!userToDelete) return;
        try {
            await deleteUser(userToDelete.id);
            toast({ title: "Success", description: "User deleted successfully" });
        } catch (error) {
            toast({ 
                title: "Error", 
                description: error.message || "Failed to delete user", 
                variant: "destructive" 
            });
        } finally {
            setDeleteDialogOpen(false);
            setUserToDelete(null);
        }
    };

    const filteredUsers = users.filter((user) => {
        const search = searchTerm.toLowerCase();
        return (
            user.email.toLowerCase().includes(search) ||
            user.lastName.toLowerCase().includes(search) ||
            user.firstName.toLowerCase().includes(search)
        );
    });

    const getInitials = (firstName, lastName) => {
        return `${firstName?.[0] || ''}${lastName?.[0] || ''}`.toUpperCase() || 'U';
    };

    return (
        <AppLayout>
            <div className="space-y-6 animate-fade-in">
                {/* Header */}
                <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                    <div>
                        <h1 className="text-4xl font-bold tracking-tight flex items-center gap-3">
                            <Users className="h-8 w-8" />
                            User Management
                        </h1>
                        <p className="text-muted-foreground mt-2">
                            View and manage all users in the system
                        </p>
                    </div>
                    <Button onClick={handleRefresh} variant="outline" disabled={loading}>
                        <RefreshCw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
                        Refresh
                    </Button>
                </div>

                {/* Search */}
                <Card>
                    <CardContent className="pt-6">
                        <div className="relative">
                            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                            <Input
                                placeholder="Search by name or email..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="pl-10"
                            />
                        </div>
                    </CardContent>
                </Card>

                {/* Users Table */}
                <Card>
                    <CardHeader>
                        <CardTitle>
                            Users ({filteredUsers.length})
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        {loading ? (
                            <div className="space-y-2">
                                {[...Array(5)].map((_, i) => (
                                    <Skeleton key={i} className="h-16 w-full" />
                                ))}
                            </div>
                        ) : (
                            <div className="overflow-x-auto">
                                <Table>
                                    <TableHeader>
                                        <TableRow>
                                            <TableHead className="w-12">ID</TableHead>
                                            <TableHead>User</TableHead>
                                            <TableHead className="hidden md:table-cell">First Name</TableHead>
                                            <TableHead className="hidden md:table-cell">Last Name</TableHead>
                                            <TableHead>Email</TableHead>
                                            <TableHead className="hidden sm:table-cell">Role</TableHead>
                                            <TableHead className="text-right">Actions</TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {filteredUsers.length === 0 ? (
                                            <TableRow>
                                                <TableCell colSpan={7} className="text-center py-8 text-muted-foreground">
                                                    No users found
                                                </TableCell>
                                            </TableRow>
                                        ) : (
                                            filteredUsers.map((user) => (
                                                <TableRow key={user.id} className="hover:bg-accent/50">
                                                    <TableCell className="font-medium">{user.id}</TableCell>
                                                    <TableCell>
                                                        <div className="flex items-center gap-3">
                                                            <Avatar className="h-8 w-8">
                                                                <AvatarFallback className="bg-primary text-primary-foreground text-xs">
                                                                    {getInitials(user.firstName, user.lastName)}
                                                                </AvatarFallback>
                                                            </Avatar>
                                                            <span className="md:hidden font-medium">
                                                                {user.firstName} {user.lastName}
                                                            </span>
                                                        </div>
                                                    </TableCell>
                                                    <TableCell className="hidden md:table-cell">{user.firstName}</TableCell>
                                                    <TableCell className="hidden md:table-cell">{user.lastName}</TableCell>
                                                    <TableCell>{user.email}</TableCell>
                                                    <TableCell className="hidden sm:table-cell">
                                                        <Badge variant="outline">{user.roleName}</Badge>
                                                    </TableCell>
                                                    <TableCell className="text-right">
                                                        <Button
                                                            size="sm"
                                                            variant="ghost"
                                                            onClick={() => confirmDelete(user)}
                                                            disabled={loading}
                                                        >
                                                            <Trash2 className="h-4 w-4 text-destructive" />
                                                        </Button>
                                                    </TableCell>
                                                </TableRow>
                                            ))
                                        )}
                                    </TableBody>
                                </Table>
                            </div>
                        )}
                    </CardContent>
                </Card>
            </div>

            <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Delete User</AlertDialogTitle>
                        <AlertDialogDescription>
                            Are you sure you want to delete {userToDelete?.firstName} {userToDelete?.lastName}? 
                            This action cannot be undone.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction onClick={handleDelete}>Delete</AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </AppLayout>
    );
}

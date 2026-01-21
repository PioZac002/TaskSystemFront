import { useEffect, useState } from "react";
import { AppLayout } from "@/components/layout/AppLayout";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useTeamStore } from "@/store/teamStore";
import { useUserStore } from "@/store/userStore";
import { Plus, Users as UsersIcon, Trash2, UserPlus, UserMinus, Edit } from "lucide-react";
import { toast } from "sonner";
import { getInitials } from "@/utils/formatters";

export default function TeamManagement() {
    const { teams, fetchTeams, createTeam, addUserToTeam, removeUserFromTeam, loading } = useTeamStore();
    const { users, fetchUsers } = useUserStore();

    const [newTeamName, setNewTeamName] = useState("");
    const [selectedTeamId, setSelectedTeamId] = useState("");
    const [selectedUserId, setSelectedUserId] = useState("");
    const [creatingTeam, setCreatingTeam] = useState(false);
    
    // Modal states
    const [createTeamModalOpen, setCreateTeamModalOpen] = useState(false);
    const [addUserModalOpen, setAddUserModalOpen] = useState(false);
    const [manageTeamModalOpen, setManageTeamModalOpen] = useState(false);
    const [managingTeamId, setManagingTeamId] = useState(null);

    useEffect(() => {
        fetchTeams();
        fetchUsers();
    }, []);

    const handleCreateTeam = async (e) => {
        e.preventDefault();

        if (!newTeamName. trim()) {
            toast.error("Team name is required");
            return;
        }

        setCreatingTeam(true);
        try {
            await createTeam({ name: newTeamName. trim() });
            toast.success(`Team "${newTeamName}" created successfully!`);
            setNewTeamName("");
            setCreateTeamModalOpen(false);
            await fetchTeams();
        } catch (error) {
            const errorMessage = error.response?.data?.Message || error.message || "Failed to create team";
            toast.error(errorMessage);
        } finally {
            setCreatingTeam(false);
        }
    };

    const handleAddUser = async () => {
        if (!selectedTeamId || !selectedUserId) {
            toast.error("Please select both team and user");
            return;
        }

        try {
            await addUserToTeam(Number(selectedTeamId), Number(selectedUserId));

            const team = teams.find(t => t.id === Number(selectedTeamId));
            const user = users.find(u => u.id === Number(selectedUserId));
            const userName = user ?  `${user.firstName} ${user. lastName}` : "User";
            const teamName = team?. name || "team";

            toast.success(`${userName} added to ${teamName}!`);

            setSelectedUserId("");
            setAddUserModalOpen(false);
            await fetchTeams();
        } catch (error) {
            const errorMessage = error.response?.data?.Message || error.message || "Failed to add user to team";
            toast.error(errorMessage);
        }
    };

    const handleRemoveUser = async (teamId, userId, userName, teamName) => {
        if (! window.confirm(`Remove ${userName} from ${teamName}?`)) {
            return;
        }

        try {
            await removeUserFromTeam(teamId, userId);
            toast.success(`${userName} removed from ${teamName}!`);
            await fetchTeams();
        } catch (error) {
            const errorMessage = error.response?.data?.Message || error.message || "Failed to remove user from team";
            toast.error(errorMessage);
        }
    };

    const selectedTeam = teams.find(t => t.id === Number(selectedTeamId));
    const availableUsers = users.filter(user =>
        ! selectedTeam?.members?. some(member => member.id === user.id)
    );

    const managingTeam = teams.find(t => t.id === managingTeamId);

    return (
        <AppLayout>
            <div className="space-y-6">
                {/* Header */}
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-3xl font-bold">Team Management</h1>
                        <p className="text-muted-foreground">
                            Create and manage teams • {teams.length} teams
                        </p>
                    </div>
                    <div className="flex gap-2">
                        <Button onClick={() => setCreateTeamModalOpen(true)}>
                            <Plus className="mr-2 h-4 w-4" />
                            New Team
                        </Button>
                        <Button variant="outline" onClick={() => setAddUserModalOpen(true)}>
                            <UserPlus className="mr-2 h-4 w-4" />
                            Add User to Team
                        </Button>
                    </div>
                </div>

                {/* Teams List */}
                <div>
                    <h2 className="text-2xl font-semibold mb-4">Teams</h2>
                    {loading ? (
                        <div className="text-center py-12">
                            <p className="text-muted-foreground">Loading teams...</p>
                        </div>
                    ) : teams.length === 0 ? (
                        <Card>
                            <CardContent className="py-12 text-center">
                                <UsersIcon className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
                                <p className="text-lg font-medium mb-2">No teams yet</p>
                                <p className="text-sm text-muted-foreground">
                                    Create your first team to get started
                                </p>
                            </CardContent>
                        </Card>
                    ) : (
                        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                            {teams.map((team) => (
                                <Card key={team.id} className="hover:shadow-lg transition-shadow">
                                    <CardHeader>
                                        <div className="flex items-start justify-between">
                                            <div className="flex-1">
                                                <CardTitle className="text-xl">{team.name}</CardTitle>
                                                <CardDescription className="mt-1">
                                                    Team ID: {team.id}
                                                </CardDescription>
                                            </div>
                                            <Badge variant="secondary">
                                                {team.members?.length || 0} members
                                            </Badge>
                                        </div>
                                    </CardHeader>
                                    <CardContent className="space-y-3">
                                        {/* Member count preview */}
                                        {! team.members || team.members.length === 0 ? (
                                            <p className="text-sm text-muted-foreground py-4 text-center">
                                                No members yet
                                            </p>
                                        ) : (
                                            <div className="flex -space-x-2">
                                                {team.members.slice(0, 5).map((member) => (
                                                    <Avatar key={member.id} className="h-8 w-8 border-2 border-background bg-primary/10">
                                                        <AvatarFallback className="bg-primary/20 text-primary text-xs">
                                                            {getInitials(member.firstName, member.lastName)}
                                                        </AvatarFallback>
                                                    </Avatar>
                                                ))}
                                                {team.members.length > 5 && (
                                                    <div className="h-8 w-8 rounded-full bg-muted border-2 border-background flex items-center justify-center">
                                                        <span className="text-xs text-muted-foreground">
                                                            +{team.members.length - 5}
                                                        </span>
                                                    </div>
                                                )}
                                            </div>
                                        )}
                                        
                                        {/* Action Buttons */}
                                        <div className="flex gap-2 pt-3 border-t">
                                            <Button
                                                variant="outline"
                                                size="sm"
                                                className="flex-1"
                                                onClick={() => {
                                                    setManagingTeamId(team.id);
                                                    setManageTeamModalOpen(true);
                                                }}
                                            >
                                                <Edit className="mr-2 h-4 w-4" />
                                                Manage
                                            </Button>
                                        </div>
                                    </CardContent>
                                </Card>
                            ))}
                        </div>
                    )}
                </div>
            </div>

            {/* Create Team Modal */}
            <Dialog open={createTeamModalOpen} onOpenChange={setCreateTeamModalOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Create New Team</DialogTitle>
                        <DialogDescription>
                            Create a team to organize your members
                        </DialogDescription>
                    </DialogHeader>
                    <form onSubmit={handleCreateTeam} className="space-y-4">
                        <div className="space-y-2">
                            <Label htmlFor="teamName">Team Name</Label>
                            <Input
                                id="teamName"
                                placeholder="Enter team name..."
                                value={newTeamName}
                                onChange={(e) => setNewTeamName(e.target.value)}
                                disabled={creatingTeam}
                            />
                        </div>
                        <div className="flex justify-end gap-3">
                            <Button
                                type="button"
                                variant="outline"
                                onClick={() => setCreateTeamModalOpen(false)}
                                disabled={creatingTeam}
                            >
                                Cancel
                            </Button>
                            <Button type="submit" disabled={creatingTeam || !newTeamName.trim()}>
                                <Plus className="mr-2 h-4 w-4" />
                                {creatingTeam ? "Creating..." : "Create Team"}
                            </Button>
                        </div>
                    </form>
                </DialogContent>
            </Dialog>

            {/* Add User to Team Modal */}
            <Dialog open={addUserModalOpen} onOpenChange={setAddUserModalOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Add User to Team</DialogTitle>
                        <DialogDescription>
                            Assign a user to a team
                        </DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4">
                        <div className="space-y-2">
                            <Label>Select Team</Label>
                            <Select value={selectedTeamId} onValueChange={setSelectedTeamId}>
                                <SelectTrigger>
                                    <SelectValue placeholder="Choose a team" />
                                </SelectTrigger>
                                <SelectContent>
                                    {teams.map((team) => (
                                        <SelectItem key={team.id} value={String(team.id)}>
                                            {team.name} ({team.members?.length || 0} members)
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                        <div className="space-y-2">
                            <Label>Select User</Label>
                            <Select
                                value={selectedUserId}
                                onValueChange={setSelectedUserId}
                                disabled={!selectedTeamId}
                            >
                                <SelectTrigger>
                                    <SelectValue placeholder="Choose a user" />
                                </SelectTrigger>
                                <SelectContent>
                                    {availableUsers.length === 0 ? (
                                        <div className="p-2 text-sm text-muted-foreground">
                                            No available users
                                        </div>
                                    ) : (
                                        availableUsers.map((user) => (
                                            <SelectItem key={user.id} value={String(user.id)}>
                                                {user.firstName} {user.lastName} ({user.email})
                                            </SelectItem>
                                        ))
                                    )}
                                </SelectContent>
                            </Select>
                        </div>
                        <div className="flex justify-end gap-3">
                            <Button
                                variant="outline"
                                onClick={() => setAddUserModalOpen(false)}
                            >
                                Cancel
                            </Button>
                            <Button
                                onClick={handleAddUser}
                                disabled={!selectedTeamId || !selectedUserId}
                            >
                                <UserPlus className="mr-2 h-4 w-4" />
                                Add User
                            </Button>
                        </div>
                    </div>
                </DialogContent>
            </Dialog>

            {/* Manage Team Modal */}
            <Dialog open={manageTeamModalOpen} onOpenChange={setManageTeamModalOpen}>
                <DialogContent className="max-w-2xl">
                    <DialogHeader>
                        <DialogTitle>Manage Team: {managingTeam?.name}</DialogTitle>
                        <DialogDescription>
                            View and manage team members
                        </DialogDescription>
                    </DialogHeader>
                    {managingTeam && (
                        <div className="space-y-4">
                            <div className="flex items-center justify-between">
                                <Label className="text-sm font-semibold">Members ({managingTeam.members?.length || 0})</Label>
                                <Badge variant="secondary">{managingTeam.members?.length || 0} members</Badge>
                            </div>
                            {!managingTeam.members || managingTeam.members.length === 0 ? (
                                <p className="text-sm text-muted-foreground py-8 text-center">
                                    No members in this team yet
                                </p>
                            ) : (
                                <div className="space-y-2 max-h-[400px] overflow-y-auto">
                                    {managingTeam.members.map((member) => (
                                        <div
                                            key={member.id}
                                            className="flex items-center justify-between p-3 rounded-lg bg-accent/50 hover:bg-accent transition-colors"
                                        >
                                            <div className="flex items-center gap-3 flex-1 min-w-0">
                                                <Avatar className="h-10 w-10 bg-primary/10">
                                                    <AvatarFallback className="bg-primary/20 text-primary">
                                                        {getInitials(member.firstName, member.lastName)}
                                                    </AvatarFallback>
                                                </Avatar>
                                                <div className="min-w-0 flex-1">
                                                    <p className="text-sm font-medium truncate">
                                                        {member.firstName} {member.lastName}
                                                    </p>
                                                    <p className="text-xs text-muted-foreground truncate">
                                                        {member.email}
                                                    </p>
                                                </div>
                                            </div>
                                            <Button
                                                variant="ghost"
                                                size="sm"
                                                onClick={() => handleRemoveUser(
                                                    managingTeam.id,
                                                    member.id,
                                                    `${member.firstName} ${member.lastName}`,
                                                    managingTeam.name
                                                )}
                                                className="text-destructive hover:text-destructive hover:bg-destructive/10"
                                            >
                                                <UserMinus className="h-4 w-4" />
                                            </Button>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    )}
                </DialogContent>
            </Dialog>
        </AppLayout>
    );
}
import { useEffect, useState } from "react";
import { AppLayout } from "@/components/layout/AppLayout";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useTeamStore } from "@/store/teamStore";
import { useUserStore } from "@/store/userStore";
import { Plus, Users as UsersIcon, Trash2, UserPlus, UserMinus } from "lucide-react";
import { toast } from "sonner";
import { getInitials } from "@/utils/formatters";

export default function TeamManagement() {
    const { teams, fetchTeams, createTeam, addUserToTeam, removeUserFromTeam, loading } = useTeamStore();
    const { users, fetchUsers } = useUserStore();

    const [newTeamName, setNewTeamName] = useState("");
    const [selectedTeamId, setSelectedTeamId] = useState("");
    const [selectedUserId, setSelectedUserId] = useState("");
    const [creatingTeam, setCreatingTeam] = useState(false);

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

    return (
        <AppLayout>
            <div className="space-y-6">
                {/* Header */}
                <div>
                    <h1 className="text-3xl font-bold">Team Management</h1>
                    <p className="text-muted-foreground">
                        Create and manage teams • {teams.length} teams
                    </p>
                </div>

                {/* Create Team Form */}
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <Plus className="h-5 w-5" />
                            Create New Team
                        </CardTitle>
                        <CardDescription>
                            Create a team to organize your members
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <form onSubmit={handleCreateTeam} className="flex gap-3">
                            <div className="flex-1">
                                <Input
                                    placeholder="Enter team name..."
                                    value={newTeamName}
                                    onChange={(e) => setNewTeamName(e.target.value)}
                                    disabled={creatingTeam}
                                />
                            </div>
                            <Button type="submit" disabled={creatingTeam || !newTeamName.trim()}>
                                <Plus className="mr-2 h-4 w-4" />
                                {creatingTeam ? "Creating..." : "Create Team"}
                            </Button>
                        </form>
                    </CardContent>
                </Card>

                {/* Add User to Team */}
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <UserPlus className="h-5 w-5" />
                            Add User to Team
                        </CardTitle>
                        <CardDescription>
                            Assign users to teams
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="flex flex-col md:flex-row gap-3">
                            <div className="flex-1">
                                <Label>Select Team</Label>
                                <Select value={selectedTeamId} onValueChange={setSelectedTeamId}>
                                    <SelectTrigger className="mt-2">
                                        <SelectValue placeholder="Choose a team" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {teams.map((team) => (
                                            <SelectItem key={team.id} value={String(team.id)}>
                                                {team.name} ({team.members?. length || 0} members)
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>
                            <div className="flex-1">
                                <Label>Select User</Label>
                                <Select
                                    value={selectedUserId}
                                    onValueChange={setSelectedUserId}
                                    disabled={!selectedTeamId}
                                >
                                    <SelectTrigger className="mt-2">
                                        <SelectValue placeholder="Choose a user" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {availableUsers. length === 0 ? (
                                            <div className="p-2 text-sm text-muted-foreground">
                                                No available users
                                            </div>
                                        ) : (
                                            availableUsers.map((user) => (
                                                <SelectItem key={user. id} value={String(user. id)}>
                                                    {user.firstName} {user.lastName} ({user.email})
                                                </SelectItem>
                                            ))
                                        )}
                                    </SelectContent>
                                </Select>
                            </div>
                            <div className="flex items-end">
                                <Button
                                    onClick={handleAddUser}
                                    disabled={!selectedTeamId || !selectedUserId}
                                >
                                    <UserPlus className="mr-2 h-4 w-4" />
                                    Add User
                                </Button>
                            </div>
                        </div>
                    </CardContent>
                </Card>

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
                                    <CardContent>
                                        <div className="space-y-3">
                                            <Label className="text-sm font-semibold">Members</Label>
                                            {! team.members || team.members.length === 0 ? (
                                                <p className="text-sm text-muted-foreground py-4 text-center">
                                                    No members yet
                                                </p>
                                            ) : (
                                                <div className="space-y-2 max-h-[200px] overflow-y-auto">
                                                    {team. members.map((member) => (
                                                        <div
                                                            key={member. id}
                                                            className="flex items-center justify-between p-2 rounded-lg bg-accent/50 hover:bg-accent transition-colors"
                                                        >
                                                            <div className="flex items-center gap-2 flex-1 min-w-0">
                                                                <Avatar className="h-8 w-8 bg-primary/10">
                                                                    <AvatarFallback className="bg-primary/20 text-primary text-xs">
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
                                                                    team.id,
                                                                    member.id,
                                                                    `${member.firstName} ${member. lastName}`,
                                                                    team.name
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
                                    </CardContent>
                                </Card>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </AppLayout>
    );
}
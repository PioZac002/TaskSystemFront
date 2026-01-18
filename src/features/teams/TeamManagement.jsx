import { useEffect, useState } from "react";
import { AppLayout } from "@/components/layout/AppLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { Avatar, AvatarFallback } from "@/components/ui/Avatar";
import { Skeleton } from "@/components/ui/Skeleton";
import { CreateTeamModal } from "@/components/modals/CreateTeamModal";
import { ManageTeamMembersModal } from "@/components/modals/ManageTeamMembersModal";
import { useTeamStore } from "@/store/teamStore";
import { toast } from "sonner";
import { Users, FolderKanban, Plus, UserPlus } from "lucide-react";

export default function TeamManagement() {
    const [createTeamOpen, setCreateTeamOpen] = useState(false);
    const [manageMembersOpen, setManageMembersOpen] = useState(false);
    const [selectedTeamId, setSelectedTeamId] = useState(null);
    
    const teams = useTeamStore((state) => state.teams);
    const loading = useTeamStore((state) => state.loading);
    const fetchTeams = useTeamStore((state) => state.fetchTeams);

    useEffect(() => {
        fetchTeams();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    const handleManageMembers = (teamId) => {
        setSelectedTeamId(teamId);
        setManageMembersOpen(true);
    };

    const handleViewIssues = (teamId) => {
        toast.info(`Viewing issues for team ${teamId}`);
    };

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
                            Team Management
                        </h1>
                        <p className="text-muted-foreground mt-2">
                            Manage teams and their members
                        </p>
                    </div>
                    <Button onClick={() => setCreateTeamOpen(true)} variant="gradient">
                        <Plus className="h-4 w-4 mr-2" />
                        Create Team
                    </Button>
                </div>

                {/* Teams Grid */}
                {loading ? (
                    <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                        {[...Array(6)].map((_, i) => (
                            <Skeleton key={i} className="h-64 w-full" />
                        ))}
                    </div>
                ) : teams.length === 0 ? (
                    <Card>
                        <CardContent className="py-16">
                            <div className="text-center">
                                <Users className="h-16 w-16 mx-auto text-muted-foreground mb-4" />
                                <h3 className="text-xl font-semibold mb-2">No Teams Yet</h3>
                                <p className="text-muted-foreground mb-4">
                                    Create your first team to get started
                                </p>
                                <Button onClick={() => setCreateTeamOpen(true)} variant="gradient">
                                    <Plus className="h-4 w-4 mr-2" />
                                    Create Team
                                </Button>
                            </div>
                        </CardContent>
                    </Card>
                ) : (
                    <div className="grid gap-6 grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
                        {teams.map((team) => (
                            <Card key={team.id} className="overflow-hidden hover:shadow-lg transition-all duration-200 hover:scale-105">
                                <CardHeader className="bg-gradient-to-br from-primary/10 to-accent/10">
                                    <CardTitle className="flex items-center justify-between">
                                        <span className="text-lg">{team.name}</span>
                                        <div className="flex gap-2">
                                            <Badge variant="secondary" className="gap-1">
                                                <Users className="h-3 w-3" />
                                                {team.users?.length || 0}
                                            </Badge>
                                            <Badge variant="outline" className="gap-1">
                                                <FolderKanban className="h-3 w-3" />
                                                {team.issues?.length || 0}
                                            </Badge>
                                        </div>
                                    </CardTitle>
                                </CardHeader>
                                <CardContent className="pt-6 space-y-4">
                                    {/* Team Members */}
                                    <div>
                                        <h4 className="text-sm font-semibold mb-2 text-muted-foreground">
                                            Members
                                        </h4>
                                        {team.users && team.users.length > 0 ? (
                                            <div className="flex flex-wrap gap-2">
                                                {team.users.slice(0, 6).map((user) => (
                                                    <Avatar key={user.id} className="h-8 w-8 border-2 border-card">
                                                        <AvatarFallback className="bg-primary text-primary-foreground text-xs">
                                                            {getInitials(user.firstName, user.lastName)}
                                                        </AvatarFallback>
                                                    </Avatar>
                                                ))}
                                                {team.users.length > 6 && (
                                                    <div className="h-8 w-8 rounded-full bg-muted flex items-center justify-center text-xs font-medium">
                                                        +{team.users.length - 6}
                                                    </div>
                                                )}
                                            </div>
                                        ) : (
                                            <p className="text-sm text-muted-foreground">No members yet</p>
                                        )}
                                    </div>

                                    {/* Actions */}
                                    <div className="flex gap-2 pt-2">
                                        <Button
                                            size="sm"
                                            variant="outline"
                                            className="flex-1"
                                            onClick={() => handleManageMembers(team.id)}
                                        >
                                            <UserPlus className="h-4 w-4 mr-2" />
                                            Manage Members
                                        </Button>
                                        <Button
                                            size="sm"
                                            variant="ghost"
                                            className="flex-1"
                                            onClick={() => handleViewIssues(team.id)}
                                        >
                                            <FolderKanban className="h-4 w-4 mr-2" />
                                            View Issues
                                        </Button>
                                    </div>
                                </CardContent>
                            </Card>
                        ))}
                    </div>
                )}
            </div>

            <CreateTeamModal open={createTeamOpen} onOpenChange={setCreateTeamOpen} />
            <ManageTeamMembersModal 
                open={manageMembersOpen} 
                onOpenChange={setManageMembersOpen}
                teamId={selectedTeamId}
            />
        </AppLayout>
    );
}

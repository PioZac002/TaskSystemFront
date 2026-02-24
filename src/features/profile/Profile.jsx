import { useState, useEffect } from "react";
import { AppLayout } from "@/components/layout/AppLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import { Avatar, AvatarFallback } from "@/components/ui/Avatar";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Label } from "@/components/ui/Label";
import { Badge } from "@/components/ui/Badge";
import { useAuthStore } from "@/store/authStore";
import { useUserStore } from "@/store/userStore";
import { toast } from "sonner";
import { User, Mail, Save } from "lucide-react";

export default function Profile() {
    const user = useAuthStore((state) => state.user);
    const updateCachedUser = useAuthStore((state) => state.updateCachedUser);
    const { updateUser, loading } = useUserStore();

    const [firstName, setFirstName] = useState(user?.firstName || "");
    const [lastName, setLastName] = useState(user?.lastName || "");
    const [email, setEmail] = useState(user?.email || "");
    const [slackUserId, setSlackUserId] = useState(user?.slackUserId || "");

    // Sync form fields when user data loads
    useEffect(() => {
        if (user) {
            setFirstName(user.firstName || "");
            setLastName(user.lastName || "");
            setEmail(user.email || "");
            setSlackUserId(user.slackUserId || "");
        }
    }, [user]);

    const getDisplayName = () => {
        const fullName = `${user?.firstName || ''} ${user?.lastName || ''}`.trim();
        return fullName || user?.email || "User";
    };

    const getInitials = () => {
        const f = user?.firstName?.[0] || '';
        const l = user?.lastName?.[0] || '';
        if (f && l) return `${f}${l}`.toUpperCase();
        return user?.email?.substring(0, 2).toUpperCase() || "??";
    };

    const handleUpdateProfile = async (e) => {
        e.preventDefault();
        if (!user?.id) {
            toast.error("User not found. Please log in again.");
            return;
        }

        try {
            const updated = await updateUser(user.id, {
                firstName,
                lastName,
                email,
                slackUserId,
                disabled: user.disabled ?? false,
            });

            // Refresh the cached user in authStore
            updateCachedUser(updated);
            toast.success("Profile updated successfully!");
        } catch (error) {
            const message = error.response?.data?.Message || error.message || "Failed to update profile";
            toast.error(message);
        }
    };

    return (
        <AppLayout>
            <div className="space-y-6 animate-fade-in max-w-4xl mx-auto">
                <div>
                    <h1 className="text-4xl font-bold tracking-tight">Profile Settings</h1>
                    <p className="text-muted-foreground mt-2">Manage your account and preferences</p>
                </div>

                {/* Profile overview */}
                <Card className="border-border/50 bg-gradient-to-br from-card to-card/80">
                    <CardContent className="p-6">
                        <div className="flex flex-col md:flex-row items-center md:items-start gap-6">
                            <Avatar className="h-24 w-24 transition-transform duration-200 hover:scale-105">
                                <AvatarFallback className="bg-primary text-primary-foreground text-2xl">
                                    {getInitials()}
                                </AvatarFallback>
                            </Avatar>
                            <div className="flex-1 text-center md:text-left space-y-2">
                                <h2 className="text-2xl font-bold">{getDisplayName()}</h2>
                                <p className="text-muted-foreground">{user?.email || ""}</p>
                                <div className="flex flex-wrap gap-2 justify-center md:justify-start pt-2">
                                    <Badge variant="outline">Active Member</Badge>
                                </div>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                {/* Personal Information */}
                <Card className="border-border/50">
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <User className="h-5 w-5" />
                            Personal Information
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <form onSubmit={handleUpdateProfile} className="space-y-4">
                            <div className="grid sm:grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label htmlFor="firstName">First Name</Label>
                                    <Input
                                        id="firstName"
                                        value={firstName}
                                        onChange={(e) => setFirstName(e.target.value)}
                                        disabled={loading}
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="lastName">Last Name</Label>
                                    <Input
                                        id="lastName"
                                        value={lastName}
                                        onChange={(e) => setLastName(e.target.value)}
                                        disabled={loading}
                                    />
                                </div>
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="email" className="flex items-center gap-2">
                                    <Mail className="h-4 w-4" />
                                    Email
                                </Label>
                                <Input
                                    id="email"
                                    type="email"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    disabled={loading}
                                />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="slackUserId">Slack User ID</Label>
                                <Input
                                    id="slackUserId"
                                    value={slackUserId}
                                    onChange={(e) => setSlackUserId(e.target.value)}
                                    placeholder="e.g. U01AB2C3D"
                                    disabled={loading}
                                />
                            </div>
                            <Button type="submit" className="w-full" disabled={loading}>
                                <Save className="mr-2 h-4 w-4" />
                                {loading ? "Saving..." : "Save Changes"}
                            </Button>
                        </form>
                    </CardContent>
                </Card>
            </div>
        </AppLayout>
    );
}

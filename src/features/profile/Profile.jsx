import { useState } from "react";
import { AppLayout } from "@/components/layout/AppLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import { Avatar, AvatarFallback } from "@/components/ui/Avatar";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Label } from "@/components/ui/Label";
import { Textarea } from "@/components/ui/Textarea";
import { Badge } from "@/components/ui/Badge";
import { useAuthStore } from "@/store/authStore"; // Używasz tego store
import { toast } from "@/hooks/use-toast";
import { User, Mail, Briefcase, Lock, Save } from "lucide-react";

export default function Profile() {
    const user = useAuthStore((state) => state.user);
    const updateProfile = useAuthStore((state) => state.updateProfile);

    const [name, setName] = useState(user?.name || "");
    const [email, setEmail] = useState(user?.email || "");
    const [role, setRole] = useState(user?.role || "");
    const [bio, setBio] = useState("");
    const [currentPassword, setCurrentPassword] = useState("");
    const [newPassword, setNewPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");

    const handleUpdateProfile = (e) => {
        e.preventDefault();
        updateProfile({ name, email, role });
        toast({ title: "Success", description: "Profile updated successfully" });
    };

    const handleChangePassword = (e) => {
        e.preventDefault();
        if (newPassword !== confirmPassword) {
            toast({ title: "Error", description: "Passwords don't match", variant: "destructive" });
            return;
        }
        toast({ title: "Success", description: "Password changed successfully" });
        setCurrentPassword("");
        setNewPassword("");
        setConfirmPassword("");
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
                                    {user?.name?.substring(0, 2).toUpperCase() || "JD"}
                                </AvatarFallback>
                            </Avatar>
                            <div className="flex-1 text-center md:text-left space-y-2">
                                <h2 className="text-2xl font-bold">{user?.name || "John Doe"}</h2>
                                <p className="text-muted-foreground">{user?.email || "john@example.com"}</p>
                                <div className="flex flex-wrap gap-2 justify-center md:justify-start pt-2">
                                    <Badge variant="secondary">{user?.role || "Developer"}</Badge>
                                    <Badge variant="outline">Active Member</Badge>
                                </div>
                            </div>
                            <Button variant="outline" className="transition-all duration-200 hover:scale-105">Change Avatar</Button>
                        </div>
                    </CardContent>
                </Card>

                <div className="grid lg:grid-cols-2 gap-6">
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
                                <div className="space-y-2">
                                    <Label htmlFor="name" className="flex items-center gap-2">
                                        <User className="h-4 w-4" />
                                        Full Name
                                    </Label>
                                    <Input id="name" value={name} onChange={(e) => setName(e.target.value)} />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="email" className="flex items-center gap-2">
                                        <Mail className="h-4 w-4" />
                                        Email
                                    </Label>
                                    <Input id="email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="role" className="flex items-center gap-2">
                                        <Briefcase className="h-4 w-4" />
                                        Role
                                    </Label>
                                    <Input id="role" value={role} onChange={(e) => setRole(e.target.value)} />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="bio">Bio</Label>
                                    <Textarea id="bio" placeholder="Tell us about yourself..." value={bio} onChange={(e) => setBio(e.target.value)} rows={3} />
                                </div>
                                <Button type="submit" variant="gradient" className="w-full">
                                    <Save className="mr-2 h-4 w-4" /> Save Changes
                                </Button>
                            </form>
                        </CardContent>
                    </Card>

                    {/* Change password */}
                    <Card className="border-border/50">
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <Lock className="h-5 w-5" />
                                Change Password
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <form onSubmit={handleChangePassword} className="space-y-4">
                                <div className="space-y-2">
                                    <Label htmlFor="currentPassword">Current Password</Label>
                                    <Input
                                        id="currentPassword"
                                        type="password"
                                        value={currentPassword}
                                        onChange={(e) => setCurrentPassword(e.target.value)}
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="newPassword">New Password</Label>
                                    <Input
                                        id="newPassword"
                                        type="password"
                                        value={newPassword}
                                        onChange={(e) => setNewPassword(e.target.value)}
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="confirmPassword">Confirm Password</Label>
                                    <Input
                                        id="confirmPassword"
                                        type="password"
                                        value={confirmPassword}
                                        onChange={(e) => setConfirmPassword(e.target.value)}
                                    />
                                </div>
                                <Button type="submit" variant="gradient" className="w-full">
                                    <Lock className="mr-2 h-4 w-4" /> Update Password
                                </Button>
                            </form>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </AppLayout>
    );
}

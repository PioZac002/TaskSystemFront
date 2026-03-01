import { useState, useRef, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { gsap } from "gsap";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Label } from "@/components/ui/Label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/Card";
import { Layers, Mail, Lock, User, UserCheck, Hash } from "lucide-react";
import { toast } from "sonner";
import { useAuthStore } from "@/store/authStore";
import { authService } from "@/services/authService";

export default function RegisterForm() {
    const navigate = useNavigate();
    const location = useLocation();
    const setAuth = useAuthStore((state) => state.setAuth);
    const cardRef = useRef(null);

    const [firstName, setFirstName] = useState("");
    const [lastName, setLastName] = useState("");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [slackUserId, setSlackUserId] = useState("");
    const [loading, setLoading] = useState(false);

    // Animate card in on mount — direction depends on where we came from
    useEffect(() => {
        const fromLogin = location.state?.from === "login";
        gsap.fromTo(
            cardRef.current,
            { opacity: 0, x: fromLogin ? 60 : 0, y: fromLogin ? 0 : 30, scale: 0.97 },
            { opacity: 1, x: 0, y: 0, scale: 1, duration: 0.45, ease: "power3.out" }
        );
    }, []);

    const handleRegister = async (e) => {
        e.preventDefault();
        if (!firstName || !lastName || !email || !password || !confirmPassword) {
            toast.error("Fill in all required fields");
            return;
        }
        if (password !== confirmPassword) {
            toast.error("Passwords don't match!");
            return;
        }
        if (password.length < 6) {
            toast.error("Password must be at least 6 characters");
            return;
        }

        setLoading(true);
        try {
            const finalSlackUserId = slackUserId.trim() || `U${Date.now()}`;
            const data = await authService.register({
                firstName,
                lastName,
                email,
                password,
                slackUserId: finalSlackUserId,
            });

            if (data.user) {
                setAuth(data.user, data.accessToken);
                toast.success("Account created successfully!");
                navigate("/dashboard");
            }
        } catch (err) {
            const errorMessage = err.response?.data?.Message || err.message || "Registration failed";
            toast.error(errorMessage);
        } finally {
            setLoading(false);
        }
    };

    const handleGoToLogin = () => {
        gsap.to(cardRef.current, {
            opacity: 0,
            x: 60,
            scale: 0.97,
            duration: 0.3,
            ease: "power2.in",
            onComplete: () => navigate("/login", { state: { from: "register" } }),
        });
    };

    return (
        <div className="min-h-screen flex items-center justify-center p-4 bg-gradient-to-br from-slate-50 via-slate-100 to-slate-200 dark:from-slate-950 dark:via-slate-900 dark:to-slate-800">
            {/* Background decorations */}
            <div className="absolute inset-0 overflow-hidden pointer-events-none">
                <div className="absolute top-20 left-10 w-72 h-72 bg-primary/10 rounded-full blur-3xl" />
                <div className="absolute bottom-20 right-10 w-96 h-96 bg-primary/5 rounded-full blur-3xl" />
            </div>

            <Card ref={cardRef} className="w-full max-w-md relative z-10 shadow-2xl border-slate-200 dark:border-slate-800">
                <CardHeader className="space-y-4 text-center pb-8">
                    <div className="mx-auto w-16 h-16 bg-gradient-to-br from-primary to-primary/80 rounded-2xl flex items-center justify-center shadow-lg">
                        <Layers className="w-8 h-8 text-primary-foreground" />
                    </div>
                    <div>
                        <CardTitle className="text-3xl font-bold">Create Account</CardTitle>
                        <CardDescription className="text-base mt-2">
                            Start managing your tasks efficiently
                        </CardDescription>
                    </div>
                </CardHeader>

                <CardContent>
                    <form onSubmit={handleRegister} className="space-y-5">
                        {/* First Name */}
                        <div className="space-y-2">
                            <Label htmlFor="firstName" className="text-sm font-medium">
                                First Name <span className="text-destructive">*</span>
                            </Label>
                            <div className="relative">
                                <User className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                                <Input
                                    id="firstName"
                                    type="text"
                                    value={firstName}
                                    onChange={(e) => setFirstName(e.target.value)}
                                    placeholder="John"
                                    className="pl-10 h-11"
                                    disabled={loading}
                                    required
                                />
                            </div>
                        </div>

                        {/* Last Name */}
                        <div className="space-y-2">
                            <Label htmlFor="lastName" className="text-sm font-medium">
                                Last Name <span className="text-destructive">*</span>
                            </Label>
                            <div className="relative">
                                <UserCheck className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                                <Input
                                    id="lastName"
                                    type="text"
                                    value={lastName}
                                    onChange={(e) => setLastName(e.target.value)}
                                    placeholder="Doe"
                                    className="pl-10 h-11"
                                    disabled={loading}
                                    required
                                />
                            </div>
                        </div>

                        {/* Email */}
                        <div className="space-y-2">
                            <Label htmlFor="email" className="text-sm font-medium">
                                Email Address <span className="text-destructive">*</span>
                            </Label>
                            <div className="relative">
                                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                                <Input
                                    id="email"
                                    type="email"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    placeholder="you@example.com"
                                    className="pl-10 h-11"
                                    disabled={loading}
                                    required
                                />
                            </div>
                        </div>

                        {/* Slack User ID */}
                        <div className="space-y-2">
                            <Label htmlFor="slackUserId" className="text-sm font-medium">
                                Slack User ID{" "}
                                <span className="text-muted-foreground text-xs">(optional)</span>
                            </Label>
                            <div className="relative">
                                <Hash className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                                <Input
                                    id="slackUserId"
                                    type="text"
                                    value={slackUserId}
                                    onChange={(e) => setSlackUserId(e.target.value)}
                                    placeholder="U123456 (auto-generated if empty)"
                                    className="pl-10 h-11"
                                    disabled={loading}
                                />
                            </div>
                            <p className="text-xs text-muted-foreground">Leave empty to auto-generate</p>
                        </div>

                        {/* Password */}
                        <div className="space-y-2">
                            <Label htmlFor="password" className="text-sm font-medium">
                                Password <span className="text-destructive">*</span>
                            </Label>
                            <div className="relative">
                                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                                <Input
                                    id="password"
                                    type="password"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    placeholder="••••••••"
                                    className="pl-10 h-11"
                                    disabled={loading}
                                    required
                                />
                            </div>
                            <p className="text-xs text-muted-foreground">Minimum 6 characters</p>
                        </div>

                        {/* Confirm Password */}
                        <div className="space-y-2">
                            <Label htmlFor="confirmPassword" className="text-sm font-medium">
                                Confirm Password <span className="text-destructive">*</span>
                            </Label>
                            <div className="relative">
                                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                                <Input
                                    id="confirmPassword"
                                    type="password"
                                    value={confirmPassword}
                                    onChange={(e) => setConfirmPassword(e.target.value)}
                                    placeholder="••••••••"
                                    className="pl-10 h-11"
                                    disabled={loading}
                                    required
                                />
                            </div>
                        </div>

                        {/* Submit */}
                        <Button
                            type="submit"
                            className="w-full h-11 text-base font-semibold"
                            disabled={loading}
                        >
                            {loading ? "Creating account..." : "Create Account"}
                        </Button>

                        {/* Login link */}
                        <div className="text-center text-sm pt-2">
                            <span className="text-muted-foreground">Already have an account? </span>
                            <button
                                type="button"
                                onClick={handleGoToLogin}
                                className="font-semibold text-primary hover:underline"
                            >
                                Sign in
                            </button>
                        </div>
                    </form>
                </CardContent>
            </Card>
        </div>
    );
}

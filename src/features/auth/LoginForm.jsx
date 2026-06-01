import { useState, useRef, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { gsap } from "gsap";
import { useAuth } from "@/hooks/useAuth";
import { Input } from "@/components/ui/Input";
import { Label } from "@/components/ui/Label";
import { Checkbox } from "@/components/ui/Checkbox";
import { toast } from "sonner";
import { Mail, Lock } from "lucide-react";
import { AuthCard, AuthSubmitButton, LabelInputContainer } from "./AuthFormShell";

export default function LoginForm() {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [rememberMe, setRememberMe] = useState(true);
    const [loading, setLoading] = useState(false);

    const { login } = useAuth();
    const navigate = useNavigate();
    const location = useLocation();
    const cardRef = useRef(null);

    useEffect(() => {
        const fromRegister = location.state?.from === "register";
        gsap.fromTo(
            cardRef.current,
            { opacity: 0, x: fromRegister ? -60 : 0, y: fromRegister ? 0 : 30, scale: 0.97 },
            { opacity: 1, x: 0, y: 0, scale: 1, duration: 0.45, ease: "power3.out" }
        );
    }, []);

    const handleLogin = async (e) => {
        e.preventDefault();
        if (!email || !password) {
            toast.error("Please fill in all fields");
            return;
        }
        setLoading(true);
        try {
            await login(email, password, rememberMe);
            toast.success("Welcome back!");
            navigate("/dashboard");
        } catch (error) {
            const errorMessage = error.response?.data?.Message || error.message || "Invalid credentials";
            toast.error(errorMessage);
        } finally {
            setLoading(false);
        }
    };

    const handleGoToRegister = () => {
        gsap.to(cardRef.current, {
            opacity: 0,
            x: -60,
            scale: 0.97,
            duration: 0.3,
            ease: "power2.in",
            onComplete: () => navigate("/register", { state: { from: "login" } }),
        });
    };

    return (
        <AuthCard
            ref={cardRef}
            title="Welcome Back"
            description="Sign in to your account to continue managing projects, issues and boards."
        >
            <form onSubmit={handleLogin} className="space-y-5">
                <LabelInputContainer>
                    <Label htmlFor="email">Email Address</Label>
                    <div className="relative">
                        <Mail className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-muted-foreground" />
                        <Input
                            id="email"
                            type="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            placeholder="you@example.com"
                            className="h-11 pl-10 shadow-input"
                            disabled={loading}
                            required
                            autoComplete="email"
                        />
                    </div>
                </LabelInputContainer>

                <LabelInputContainer>
                    <Label htmlFor="password">Password</Label>
                    <div className="relative">
                        <Lock className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-muted-foreground" />
                        <Input
                            id="password"
                            type="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            placeholder="Password"
                            className="h-11 pl-10 shadow-input"
                            disabled={loading}
                            required
                            autoComplete="current-password"
                        />
                    </div>
                </LabelInputContainer>

                <div className="flex items-center space-x-2">
                    <Checkbox
                        id="remember"
                        checked={rememberMe}
                        onCheckedChange={setRememberMe}
                        disabled={loading}
                    />
                    <Label htmlFor="remember" className="cursor-pointer text-sm font-normal">
                        Remember me
                    </Label>
                </div>

                <AuthSubmitButton disabled={loading}>
                    {loading ? "Signing in..." : "Sign In"}
                </AuthSubmitButton>
            </form>

            <div className="mt-6 text-center text-sm">
                <span className="text-muted-foreground">Don&apos;t have an account? </span>
                <button
                    type="button"
                    onClick={handleGoToRegister}
                    className="font-semibold text-primary hover:underline"
                >
                    Sign up
                </button>
            </div>
        </AuthCard>
    );
}

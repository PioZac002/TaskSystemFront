import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import apiClient from "@/services/apiClient";
import { useAuthStore } from "@/store/authStore";
import { toast } from "sonner";
import { Eye, EyeOff } from "lucide-react";

export default function RegisterForm() {
    const navigate = useNavigate();
    const [firstName, setFirstName] = useState("");
    const [lastName, setLastName] = useState("");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [slackUserId, setSlackUserId] = useState("");
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const [loading, setLoading] = useState(false);

    const login = useAuthStore((state) => state.login);

    const handleSubmit = async (e) => {
        e.preventDefault();

        // Walidacja
        if (! firstName. trim() || !lastName.trim() || !email.trim() || !password.trim()) {
            toast.error("All required fields must be filled");
            return;
        }

        if (password !== confirmPassword) {
            toast.error("Passwords do not match");
            return;
        }

        if (password.length < 6) {
            toast.error("Password must be at least 6 characters");
            return;
        }

        setLoading(true);

        try {
            // ✅ Payload zgodny z backendem (PascalCase!)
            const registerPayload = {
                FirstName: firstName.trim(),
                LastName: lastName.trim(),
                Email: email.trim().toLowerCase(),
                Password: password,
                SlackUserId: slackUserId.trim() || ""  // ✅ Pusty string jeśli nie podano
            };

            console.log("📤 Registering user:", registerPayload);

            const registerResponse = await apiClient.post('/api/v1/register', registerPayload);

            console.log("✅ Registration successful:", registerResponse. data);
            toast.success("Registration successful!  Logging in...");

            // ✅ Automatyczne logowanie
            await login({
                email: email.trim().toLowerCase(),
                password: password,
            });

            console.log("✅ Auto-login successful");
            toast.success("Welcome!  Redirecting to dashboard...");

            setTimeout(() => {
                navigate("/dashboard");
            }, 500);

        } catch (error) {
            console.error("❌ Registration error:", error);
            console.error("❌ Error response:", error.response?.data);

            let errorMessage = "Registration failed";

            if (error.response?.data?.Message) {
                errorMessage = error.response.data.Message;
            } else if (error.response?.status === 409) {
                errorMessage = "Email already registered";
            } else if (error.response?.status === 400) {
                errorMessage = "Invalid registration data";
            } else if (error.message) {
                errorMessage = error. message;
            }

            toast.error(errorMessage);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 dark:from-slate-950 dark:via-slate-900 dark:to-slate-950 p-4">
            <Card className="w-full max-w-lg shadow-2xl border-0 bg-white/80 dark:bg-slate-900/80 backdrop-blur-sm">
                <CardHeader className="space-y-2 text-center pb-8">
                    <div className="mx-auto w-16 h-16 bg-gradient-to-br from-blue-500 to-purple-600 rounded-2xl flex items-center justify-center mb-4">
                        <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />
                        </svg>
                    </div>
                    <CardTitle className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                        Create Account
                    </CardTitle>
                    <CardDescription className="text-base">
                        Join us and start managing your tasks efficiently
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <form onSubmit={handleSubmit} className="space-y-5">
                        {/* First Name & Last Name */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label htmlFor="firstName" className="text-sm font-medium">
                                    First Name <span className="text-red-500">*</span>
                                </Label>
                                <Input
                                    id="firstName"
                                    type="text"
                                    placeholder="John"
                                    value={firstName}
                                    onChange={(e) => setFirstName(e.target.value)}
                                    required
                                    disabled={loading}
                                    className="h-11"
                                />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="lastName" className="text-sm font-medium">
                                    Last Name <span className="text-red-500">*</span>
                                </Label>
                                <Input
                                    id="lastName"
                                    type="text"
                                    placeholder="Doe"
                                    value={lastName}
                                    onChange={(e) => setLastName(e.target.value)}
                                    required
                                    disabled={loading}
                                    className="h-11"
                                />
                            </div>
                        </div>

                        {/* Email */}
                        <div className="space-y-2">
                            <Label htmlFor="email" className="text-sm font-medium">
                                Email Address <span className="text-red-500">*</span>
                            </Label>
                            <Input
                                id="email"
                                type="email"
                                placeholder="john.doe@example.com"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                required
                                disabled={loading}
                                className="h-11"
                            />
                        </div>

                        {/* Slack User ID (Optional) */}
                        <div className="space-y-2">
                            <Label htmlFor="slackUserId" className="text-sm font-medium">
                                Slack User ID <span className="text-xs text-muted-foreground">(Optional)</span>
                            </Label>
                            <Input
                                id="slackUserId"
                                type="text"
                                placeholder="U01234ABCDE"
                                value={slackUserId}
                                onChange={(e) => setSlackUserId(e.target. value)}
                                disabled={loading}
                                className="h-11"
                            />
                            <p className="text-xs text-muted-foreground">
                                For Slack integration (leave empty if not using)
                            </p>
                        </div>

                        {/* Password */}
                        <div className="space-y-2">
                            <Label htmlFor="password" className="text-sm font-medium">
                                Password <span className="text-red-500">*</span>
                            </Label>
                            <div className="relative">
                                <Input
                                    id="password"
                                    type={showPassword ? "text" : "password"}
                                    placeholder="••••••••"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    required
                                    disabled={loading}
                                    className="h-11 pr-10"
                                />
                                <Button
                                    type="button"
                                    variant="ghost"
                                    size="sm"
                                    className="absolute right-0 top-0 h-11 px-3 hover:bg-transparent"
                                    onClick={() => setShowPassword(!showPassword)}
                                    disabled={loading}
                                    tabIndex={-1}
                                >
                                    {showPassword ? (
                                        <EyeOff className="h-4 w-4 text-muted-foreground" />
                                    ) : (
                                        <Eye className="h-4 w-4 text-muted-foreground" />
                                    )}
                                </Button>
                            </div>
                            <p className="text-xs text-muted-foreground">
                                Must be at least 6 characters
                            </p>
                        </div>

                        {/* Confirm Password */}
                        <div className="space-y-2">
                            <Label htmlFor="confirmPassword" className="text-sm font-medium">
                                Confirm Password <span className="text-red-500">*</span>
                            </Label>
                            <div className="relative">
                                <Input
                                    id="confirmPassword"
                                    type={showConfirmPassword ? "text" : "password"}
                                    placeholder="••••••••"
                                    value={confirmPassword}
                                    onChange={(e) => setConfirmPassword(e. target.value)}
                                    required
                                    disabled={loading}
                                    className="h-11 pr-10"
                                />
                                <Button
                                    type="button"
                                    variant="ghost"
                                    size="sm"
                                    className="absolute right-0 top-0 h-11 px-3 hover:bg-transparent"
                                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                                    disabled={loading}
                                    tabIndex={-1}
                                >
                                    {showConfirmPassword ? (
                                        <EyeOff className="h-4 w-4 text-muted-foreground" />
                                    ) : (
                                        <Eye className="h-4 w-4 text-muted-foreground" />
                                    )}
                                </Button>
                            </div>
                        </div>

                        {/* Submit Button */}
                        <Button
                            type="submit"
                            className="w-full h-11 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-medium shadow-lg hover:shadow-xl transition-all"
                            disabled={loading}
                        >
                            {loading ? (
                                <>
                                    <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" fill="none" viewBox="0 0 24 24">
                                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                    </svg>
                                    Creating your account...
                                </>
                            ) : (
                                "Create Account"
                            )}
                        </Button>

                        {/* Login Link */}
                        <div className="text-center pt-4 border-t">
                            <span className="text-sm text-muted-foreground">Already have an account? </span>
                            <Button
                                type="button"
                                variant="link"
                                className="p-0 h-auto font-semibold text-blue-600 hover:text-purple-600"
                                onClick={() => navigate("/login")}
                                disabled={loading}
                            >
                                Sign in instead
                            </Button>
                        </div>
                    </form>
                </CardContent>
            </Card>
        </div>
    );
}
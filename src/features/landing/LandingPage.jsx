import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
    Zap,
    Shield,
    Users,
    Rocket,
    Code,
    Layers,
    CheckCircle,
    ArrowRight,
    MessageSquare,
    BarChart3,
    Github
} from "lucide-react";

export default function LandingPage() {
    const navigate = useNavigate();

    const scrollToSection = (id) => {
        const element = document.getElementById(id);
        if (element) {
            element.scrollIntoView({ behavior: 'smooth' });
        }
    };

    const features = [
        {
            icon:  Rocket,
            title: "Project Management",
            description: "Organize projects with intuitive tools and streamlined workflows designed for modern teams."
        },
        {
            icon: CheckCircle,
            title: "Issue Tracking",
            description: "Track tasks, bugs, and features with customizable workflows and smart priority management."
        },
        {
            icon: Users,
            title: "Team Collaboration",
            description: "Seamless collaboration with team assignments, shared workspaces, and role-based access."
        },
        {
            icon:  Zap,
            title: "Real-time Updates",
            description: "Stay in sync with instant notifications and live updates across your entire team."
        },
        {
            icon: MessageSquare,
            title: "Smart Comments",
            description: "Contextual discussions with threaded comments and inline feedback on every task."
        },
        {
            icon: BarChart3,
            title: "Analytics Dashboard",
            description: "Data-driven insights with comprehensive reporting and team performance metrics."
        }
    ];

    const steps = [
        {
            number: "01",
            title: "Create Account",
            description: "Sign up in seconds with email or social login."
        },
        {
            number: "02",
            title: "Setup Project",
            description: "Configure workflows and invite your team members."
        },
        {
            number: "03",
            title: "Start Shipping",
            description: "Track progress and deliver results faster than ever."
        }
    ];

    const techStack = [
        { name:  "React 18", icon: Code },
        { name: "TypeScript", icon: Code },
        { name: "Tailwind CSS", icon:  Layers },
        { name: "ASP.NET Core", icon: Shield },
        { name: "PostgreSQL", icon: Layers },
        { name: "JWT Auth", icon: Shield }
    ];

    return (
        <div className="min-h-screen bg-white dark:bg-slate-950">
            {/* Navigation */}
            <nav className="fixed top-0 w-full z-50 bg-white/80 dark:bg-slate-950/80 backdrop-blur-lg border-b border-slate-200 dark:border-slate-800">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex justify-between items-center h-16">
                        <div className="flex items-center gap-2">
                            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-slate-900 dark:bg-white">
                                <Layers className="h-5 w-5 text-white dark:text-slate-900" />
                            </div>
                            <span className="text-xl font-bold text-slate-900 dark:text-white">TaskSystem</span>
                        </div>
                        <div className="hidden md:flex items-center gap-8">
                            <button onClick={() => scrollToSection('features')} className="text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white transition-colors">
                                Features
                            </button>
                            <button onClick={() => scrollToSection('how-it-works')} className="text-slate-600 dark: text-slate-400 hover: text-slate-900 dark: hover:text-white transition-colors">
                                How it works
                            </button>
                            <button onClick={() => scrollToSection('tech-stack')} className="text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover: text-white transition-colors">
                                Technology
                            </button>
                        </div>
                        <div className="flex items-center gap-3">
                            <Button
                                variant="ghost"
                                onClick={() => navigate('/login')}
                                className="text-slate-700 dark:text-slate-300"
                            >
                                Sign in
                            </Button>
                            <Button
                                onClick={() => navigate('/register')}
                                className="bg-slate-900 dark:bg-white text-white dark:text-slate-900 hover:bg-slate-800 dark:hover:bg-slate-100"
                            >
                                Get Started
                            </Button>
                        </div>
                    </div>
                </div>
            </nav>

            {/* Hero Section */}
            <section className="pt-32 pb-20 px-4 sm:px-6 lg:px-8">
                <div className="max-w-7xl mx-auto">
                    <div className="text-center max-w-4xl mx-auto space-y-8">
                        <div className="inline-flex items-center gap-2 px-4 py-1. 5 rounded-full border border-slate-200 dark: border-slate-800 bg-slate-50 dark:bg-slate-900">
                            <Zap className="h-4 w-4 text-slate-900 dark:text-white" />
                            <span className="text-sm font-medium text-slate-700 dark:text-slate-300">
                                Modern Task Management Platform
                            </span>
                        </div>

                        <h1 className="text-5xl sm:text-6xl lg:text-7xl font-bold text-slate-900 dark:text-white leading-tight tracking-tight">
                            Ship faster with
                            <span className="block mt-2 bg-gradient-to-r from-slate-900 to-slate-600 dark:from-white dark:to-slate-400 bg-clip-text text-transparent">
                                better task management
                            </span>
                        </h1>

                        <p className="text-xl text-slate-600 dark:text-slate-400 max-w-2xl mx-auto leading-relaxed">
                            Streamline your workflow with an intuitive platform designed for modern teams.
                            Track progress, collaborate seamlessly, and deliver exceptional results.
                        </p>

                        <div className="flex flex-col sm:flex-row gap-4 justify-center items-center pt-4">
                            <Button
                                size="lg"
                                className="bg-slate-900 dark:bg-white text-white dark:text-slate-900 hover:bg-slate-800 dark:hover:bg-slate-100 px-8"
                                onClick={() => navigate('/register')}
                            >
                                Start for free
                                <ArrowRight className="ml-2 h-4 w-4" />
                            </Button>
                            <Button
                                size="lg"
                                variant="outline"
                                className="border-slate-300 dark:border-slate-700 px-8"
                                onClick={() => scrollToSection('features')}
                            >
                                See how it works
                            </Button>
                        </div>

                        <div className="pt-8 flex items-center justify-center gap-8 text-sm text-slate-500 dark:text-slate-500">
                            <div className="flex items-center gap-2">
                                <CheckCircle className="h-4 w-4" />
                                <span>No credit card required</span>
                            </div>
                            <div className="flex items-center gap-2">
                                <CheckCircle className="h-4 w-4" />
                                <span>Free forever plan</span>
                            </div>
                        </div>
                    </div>

                    {/* Hero Image Placeholder */}
                    <div className="mt-20 rounded-xl border border-slate-200 dark: border-slate-800 bg-slate-50 dark:bg-slate-900 p-4 shadow-2xl">
                        <div className="aspect-video rounded-lg bg-gradient-to-br from-slate-100 to-slate-200 dark:from-slate-800 dark:to-slate-900 flex items-center justify-center">
                            <div className="text-center space-y-2">
                                <Layers className="h-16 w-16 mx-auto text-slate-400 dark:text-slate-600" />
                                <p className="text-slate-500 dark:text-slate-500 text-sm">Dashboard Preview</p>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Features Section */}
            <section id="features" className="py-24 px-4 sm:px-6 lg:px-8 bg-slate-50 dark: bg-slate-900/50">
                <div className="max-w-7xl mx-auto">
                    <div className="text-center mb-16 space-y-4">
                        <h2 className="text-4xl sm:text-5xl font-bold text-slate-900 dark:text-white tracking-tight">
                            Everything you need
                        </h2>
                        <p className="text-xl text-slate-600 dark: text-slate-400 max-w-2xl mx-auto">
                            Powerful features designed to help your team work smarter, not harder
                        </p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                        {features.map((feature, index) => (
                            <Card
                                key={index}
                                className="group border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 hover:shadow-lg transition-all duration-300"
                            >
                                <CardContent className="p-6">
                                    <div className="space-y-4">
                                        <div className="h-12 w-12 rounded-lg bg-slate-100 dark:bg-slate-900 flex items-center justify-center group-hover:bg-slate-900 dark:group-hover:bg-white transition-colors">
                                            <feature.icon className="h-6 w-6 text-slate-700 dark:text-slate-300 group-hover:text-white dark:group-hover:text-slate-900 transition-colors" />
                                        </div>
                                        <div>
                                            <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-2">
                                                {feature.title}
                                            </h3>
                                            <p className="text-slate-600 dark:text-slate-400 leading-relaxed">
                                                {feature.description}
                                            </p>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        ))}
                    </div>
                </div>
            </section>

            {/* How It Works Section */}
            <section id="how-it-works" className="py-24 px-4 sm:px-6 lg:px-8">
                <div className="max-w-7xl mx-auto">
                    <div className="text-center mb-16 space-y-4">
                        <h2 className="text-4xl sm: text-5xl font-bold text-slate-900 dark:text-white tracking-tight">
                            Get started in minutes
                        </h2>
                        <p className="text-xl text-slate-600 dark:text-slate-400 max-w-2xl mx-auto">
                            Three simple steps to transform your team's productivity
                        </p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-12 relative">
                        {/* Connection Line */}
                        <div className="hidden md:block absolute top-12 left-[16. 66%] right-[16.66%] h-px bg-slate-200 dark:bg-slate-800"></div>

                        {steps.map((step, index) => (
                            <div
                                key={index}
                                className="relative text-center space-y-4"
                            >
                                <div className="relative inline-block">
                                    <div className="w-24 h-24 mx-auto rounded-full border-2 border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 flex items-center justify-center relative z-10">
                                        <span className="text-3xl font-bold text-slate-900 dark:text-white">
                                            {step.number}
                                        </span>
                                    </div>
                                </div>
                                <h3 className="text-xl font-semibold text-slate-900 dark:text-white">
                                    {step.title}
                                </h3>
                                <p className="text-slate-600 dark:text-slate-400">
                                    {step.description}
                                </p>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Tech Stack Section */}
            <section id="tech-stack" className="py-24 px-4 sm: px-6 lg:px-8 bg-slate-50 dark: bg-slate-900/50">
                <div className="max-w-7xl mx-auto">
                    <div className="text-center mb-16 space-y-4">
                        <h2 className="text-4xl sm: text-5xl font-bold text-slate-900 dark:text-white tracking-tight">
                            Built with modern technology
                        </h2>
                        <p className="text-xl text-slate-600 dark:text-slate-400 max-w-2xl mx-auto">
                            Powered by industry-leading tools and frameworks
                        </p>
                    </div>

                    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
                        {techStack. map((tech, index) => (
                            <div
                                key={index}
                                className="p-6 rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 hover:shadow-md transition-all duration-300 text-center"
                            >
                                <tech.icon className="h-8 w-8 mx-auto mb-3 text-slate-700 dark:text-slate-300" />
                                <span className="text-sm font-medium text-slate-900 dark:text-white">
                                    {tech.name}
                                </span>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* CTA Section */}
            <section className="py-24 px-4 sm:px-6 lg:px-8">
                <div className="max-w-4xl mx-auto">
                    <Card className="border-slate-200 dark:border-slate-800 bg-slate-900 dark:bg-white overflow-hidden">
                        <CardContent className="p-12 text-center">
                            <h2 className="text-4xl sm:text-5xl font-bold text-white dark:text-slate-900 mb-6 tracking-tight">
                                Ready to get started?
                            </h2>
                            <p className="text-xl text-slate-300 dark:text-slate-600 mb-8 max-w-2xl mx-auto">
                                Join teams worldwide who are already shipping faster with TaskSystem
                            </p>
                            <div className="flex flex-col sm:flex-row gap-4 justify-center">
                                <Button
                                    size="lg"
                                    className="bg-white dark:bg-slate-900 text-slate-900 dark:text-white hover: bg-slate-100 dark:hover:bg-slate-800 px-8"
                                    onClick={() => navigate('/register')}
                                >
                                    Create free account
                                    <ArrowRight className="ml-2 h-4 w-4" />
                                </Button>
                                <Button
                                    size="lg"
                                    variant="outline"
                                    className="border-slate-700 dark:border-slate-300 text-white dark:text-slate-900 hover:bg-slate-800 dark:hover:bg-slate-100 px-8"
                                    onClick={() => navigate('/login')}
                                >
                                    Sign in
                                </Button>
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </section>

            {/* Footer */}
            <footer className="py-12 px-4 sm:px-6 lg:px-8 border-t border-slate-200 dark:border-slate-800">
                <div className="max-w-7xl mx-auto">
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
                        <div className="space-y-4">
                            <div className="flex items-center gap-2">
                                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-slate-900 dark:bg-white">
                                    <Layers className="h-4 w-4 text-white dark:text-slate-900" />
                                </div>
                                <span className="text-lg font-bold text-slate-900 dark:text-white">TaskSystem</span>
                            </div>
                            <p className="text-sm text-slate-600 dark: text-slate-400">
                                Modern task management for modern teams
                            </p>
                        </div>
                        <div>
                            <h4 className="font-semibold text-slate-900 dark:text-white mb-4">Product</h4>
                            <ul className="space-y-2 text-sm">
                                <li><a href="#features" className="text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white">Features</a></li>
                                <li><a href="#" className="text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white">Pricing</a></li>
                                <li><a href="#" className="text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white">Roadmap</a></li>
                            </ul>
                        </div>
                        <div>
                            <h4 className="font-semibold text-slate-900 dark:text-white mb-4">Resources</h4>
                            <ul className="space-y-2 text-sm">
                                <li><a href="#" className="text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white">Documentation</a></li>
                                <li><a href="#" className="text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white">API Reference</a></li>
                                <li><a href="#" className="text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white">Support</a></li>
                            </ul>
                        </div>
                        <div>
                            <h4 className="font-semibold text-slate-900 dark:text-white mb-4">Company</h4>
                            <ul className="space-y-2 text-sm">
                                <li><a href="#" className="text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white">About</a></li>
                                <li><a href="#" className="text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white">Blog</a></li>
                                <li><a href="https://github.com" className="text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white flex items-center gap-1">
                                    <Github className="h-4 w-4" />
                                    GitHub
                                </a></li>
                            </ul>
                        </div>
                    </div>
                    <div className="pt-8 border-t border-slate-200 dark:border-slate-800 flex flex-col sm:flex-row justify-between items-center gap-4">
                        <p className="text-sm text-slate-600 dark: text-slate-400">
                            © 2026 TaskSystem. All rights reserved.
                        </p>
                        <div className="flex gap-6 text-sm">
                            <a href="#" className="text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white">Privacy</a>
                            <a href="#" className="text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white">Terms</a>
                            <a href="#" className="text-slate-600 dark: text-slate-400 hover: text-slate-900 dark: hover:text-white">Cookies</a>
                        </div>
                    </div>
                </div>
            </footer>
        </div>
    );
}
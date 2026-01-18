import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/Button";
import { Card, CardContent } from "@/components/ui/Card";
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
    BarChart3
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
            icon: Rocket,
            title: "Project Management",
            description: "Manage your projects efficiently with intuitive tools and real-time collaboration features."
        },
        {
            icon: CheckCircle,
            title: "Issue Tracking",
            description: "Track tasks, bugs, and features with customizable workflows and priority levels."
        },
        {
            icon: Users,
            title: "Team Collaboration",
            description: "Work together seamlessly with team management, assignments, and shared workspaces."
        },
        {
            icon: Zap,
            title: "Real-time Updates",
            description: "Stay synchronized with instant notifications and live updates across your team."
        },
        {
            icon: MessageSquare,
            title: "Comments & Discussion",
            description: "Communicate effectively with threaded discussions and inline comments on tasks."
        },
        {
            icon: BarChart3,
            title: "Advanced Analytics",
            description: "Gain insights with powerful analytics and reporting features (coming soon)."
        }
    ];

    const steps = [
        {
            number: "01",
            title: "Create Account",
            description: "Sign up in seconds and start your journey to better project management."
        },
        {
            number: "02",
            title: "Create Project",
            description: "Set up your first project with custom workflows and team members."
        },
        {
            number: "03",
            title: "Start Managing",
            description: "Track tasks, collaborate with your team, and achieve your goals faster."
        }
    ];

    const techStack = [
        "React",
        "Vite",
        "Tailwind CSS",
        "ASP.NET Core",
        "PostgreSQL",
        "JWT Auth"
    ];

    return (
        <div className="min-h-screen bg-background overflow-x-hidden">
            {/* Hero Section */}
            <section className="relative min-h-screen flex items-center justify-center px-4 py-20 overflow-hidden">
                {/* Animated Background */}
                <div className="absolute inset-0 bg-gradient-to-br from-violet-600/10 via-purple-600/10 to-indigo-600/10"></div>
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(139,92,246,0.1),transparent_50%)]"></div>
                
                {/* Floating shapes */}
                <div className="absolute top-20 left-10 w-72 h-72 bg-purple-500/20 rounded-full blur-3xl animate-float"></div>
                <div className="absolute bottom-20 right-10 w-96 h-96 bg-indigo-500/20 rounded-full blur-3xl animate-float" style={{ animationDelay: '2s' }}></div>
                <div className="absolute top-1/2 left-1/2 w-64 h-64 bg-cyan-500/20 rounded-full blur-3xl animate-float" style={{ animationDelay: '4s' }}></div>

                <div className="relative z-10 max-w-6xl mx-auto text-center space-y-8 animate-fade-in">
                    <div className="inline-block">
                        <div className="flex items-center gap-2 px-4 py-2 rounded-full bg-white/10 backdrop-blur-lg border border-white/20 mb-6">
                            <Zap className="h-4 w-4 text-yellow-400" />
                            <span className="text-sm font-medium">Modern Task Management</span>
                        </div>
                    </div>
                    
                    <h1 className="text-5xl md:text-7xl font-bold bg-gradient-to-r from-violet-600 via-purple-600 to-indigo-600 bg-clip-text text-transparent leading-tight animate-slide-in-up">
                        Manage Tasks Like Never Before
                    </h1>
                    
                    <p className="text-xl md:text-2xl text-muted-foreground max-w-3xl mx-auto animate-slide-in-up" style={{ animationDelay: '0.2s' }}>
                        A powerful, intuitive platform for teams to collaborate, track progress, and deliver exceptional results together.
                    </p>
                    
                    <div className="flex flex-col sm:flex-row gap-4 justify-center items-center animate-slide-in-up" style={{ animationDelay: '0.4s' }}>
                        <Button 
                            size="lg" 
                            className="bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-700 hover:to-indigo-700 text-white shadow-lg shadow-purple-500/50 hover:shadow-xl hover:shadow-purple-500/50 transition-all duration-300 hover:scale-105"
                            onClick={() => navigate('/register')}
                        >
                            Get Started
                            <ArrowRight className="ml-2 h-4 w-4" />
                        </Button>
                        <Button 
                            size="lg" 
                            variant="outline"
                            className="border-2 backdrop-blur-sm hover:bg-white/10 transition-all duration-300 hover:scale-105"
                            onClick={() => scrollToSection('features')}
                        >
                            Learn More
                        </Button>
                    </div>
                </div>
            </section>

            {/* Features Section */}
            <section id="features" className="py-20 px-4 relative">
                <div className="max-w-7xl mx-auto">
                    <div className="text-center mb-16 space-y-4 animate-fade-in">
                        <h2 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-violet-600 to-indigo-600 bg-clip-text text-transparent">
                            Powerful Features
                        </h2>
                        <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
                            Everything you need to manage projects and tasks effectively
                        </p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {features.map((feature, index) => (
                            <Card 
                                key={index}
                                className="group relative overflow-hidden bg-white/5 backdrop-blur-lg border border-white/10 hover:border-purple-500/50 transition-all duration-300 hover:scale-105 hover:shadow-2xl hover:shadow-purple-500/20 animate-fade-in"
                                style={{ animationDelay: `${index * 0.1}s` }}
                            >
                                <div className="absolute inset-0 bg-gradient-to-br from-purple-500/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                                <CardContent className="p-6 relative">
                                    <div className="flex items-start gap-4">
                                        <div className="p-3 rounded-lg bg-gradient-to-br from-violet-600 to-indigo-600 text-white shadow-lg group-hover:shadow-purple-500/50 transition-shadow duration-300">
                                            <feature.icon className="h-6 w-6" />
                                        </div>
                                        <div className="flex-1">
                                            <h3 className="text-xl font-bold mb-2">{feature.title}</h3>
                                            <p className="text-muted-foreground">{feature.description}</p>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        ))}
                    </div>
                </div>
            </section>

            {/* How It Works Section */}
            <section id="how-it-works" className="py-20 px-4 relative bg-gradient-to-b from-transparent via-purple-500/5 to-transparent">
                <div className="max-w-7xl mx-auto">
                    <div className="text-center mb-16 space-y-4 animate-fade-in">
                        <h2 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-violet-600 to-indigo-600 bg-clip-text text-transparent">
                            How It Works
                        </h2>
                        <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
                            Get started in three simple steps
                        </p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8 relative">
                        {/* Connection Line */}
                        <div className="hidden md:block absolute top-16 left-1/4 right-1/4 h-0.5 bg-gradient-to-r from-violet-600 via-purple-600 to-indigo-600"></div>
                        
                        {steps.map((step, index) => (
                            <div 
                                key={index}
                                className="relative text-center space-y-4 animate-fade-in"
                                style={{ animationDelay: `${index * 0.2}s` }}
                            >
                                <div className="relative inline-block">
                                    <div className="w-32 h-32 mx-auto rounded-full bg-gradient-to-br from-violet-600 via-purple-600 to-indigo-600 flex items-center justify-center text-4xl font-bold text-white shadow-2xl shadow-purple-500/50 hover:scale-110 transition-transform duration-300">
                                        {step.number}
                                    </div>
                                    <div className="absolute -top-2 -right-2 w-8 h-8 bg-yellow-400 rounded-full flex items-center justify-center">
                                        <CheckCircle className="h-5 w-5 text-white" />
                                    </div>
                                </div>
                                <h3 className="text-2xl font-bold">{step.title}</h3>
                                <p className="text-muted-foreground">{step.description}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Tech Stack Section */}
            <section id="tech-stack" className="py-20 px-4 relative">
                <div className="max-w-7xl mx-auto">
                    <div className="text-center mb-16 space-y-4 animate-fade-in">
                        <h2 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-violet-600 to-indigo-600 bg-clip-text text-transparent">
                            Built With Modern Tech
                        </h2>
                        <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
                            Powered by cutting-edge technologies
                        </p>
                    </div>

                    <div className="flex flex-wrap justify-center gap-4">
                        {techStack.map((tech, index) => (
                            <div
                                key={index}
                                className="px-6 py-3 rounded-full bg-white/5 backdrop-blur-lg border border-white/10 hover:border-purple-500/50 hover:bg-gradient-to-r hover:from-violet-600/10 hover:to-indigo-600/10 transition-all duration-300 hover:scale-110 hover:shadow-lg hover:shadow-purple-500/20 animate-fade-in"
                                style={{ animationDelay: `${index * 0.1}s` }}
                            >
                                <span className="font-medium text-lg flex items-center gap-2">
                                    <Code className="h-5 w-5 text-purple-500" />
                                    {tech}
                                </span>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* CTA Section */}
            <section className="py-20 px-4 relative">
                <div className="max-w-4xl mx-auto text-center space-y-8">
                    <Card className="overflow-hidden bg-gradient-to-br from-violet-600 via-purple-600 to-indigo-600 border-none shadow-2xl shadow-purple-500/50 animate-fade-in">
                        <CardContent className="p-12">
                            <h2 className="text-4xl md:text-5xl font-bold text-white mb-6">
                                Ready to Transform Your Workflow?
                            </h2>
                            <p className="text-xl text-white/90 mb-8 max-w-2xl mx-auto">
                                Join teams worldwide who are already managing their projects better with TaskSystem.
                            </p>
                            <div className="flex flex-col sm:flex-row gap-4 justify-center">
                                <Button 
                                    size="lg"
                                    className="bg-white text-purple-600 hover:bg-gray-100 shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105"
                                    onClick={() => navigate('/register')}
                                >
                                    Create Free Account
                                    <ArrowRight className="ml-2 h-4 w-4" />
                                </Button>
                                <Button 
                                    size="lg"
                                    variant="outline"
                                    className="border-2 border-white text-white hover:bg-white/10 transition-all duration-300 hover:scale-105"
                                    onClick={() => navigate('/login')}
                                >
                                    Sign In
                                </Button>
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </section>

            {/* Footer */}
            <footer className="py-8 px-4 border-t border-border/50 backdrop-blur-lg">
                <div className="max-w-7xl mx-auto">
                    <div className="flex flex-col md:flex-row justify-between items-center gap-4">
                        <div className="flex items-center gap-2">
                            <div className="flex h-8 w-8 items-center justify-center rounded-md bg-gradient-to-br from-violet-600 to-indigo-600">
                                <Layers className="h-5 w-5 text-white" />
                            </div>
                            <span className="text-lg font-bold">TaskSystem</span>
                        </div>
                        <p className="text-muted-foreground">
                            © 2026 TaskSystem. Built with ❤️ for better productivity.
                        </p>
                        <div className="flex gap-6">
                            <a href="#" className="text-muted-foreground hover:text-primary transition-colors">
                                GitHub
                            </a>
                            <a href="#" className="text-muted-foreground hover:text-primary transition-colors">
                                Documentation
                            </a>
                        </div>
                    </div>
                </div>
            </footer>
        </div>
    );
}

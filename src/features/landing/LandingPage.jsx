import { useEffect, useRef, useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
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
    BarChart3,
    Github,
    ChevronLeft,
    ChevronRight,
    X,
} from "lucide-react";
import tsimg1 from "@/assets/tsimg1.png";
import tsimg2 from "@/assets/tsimg2.png";
import tsimg3 from "@/assets/tsimg3.png";

gsap.registerPlugin(ScrollTrigger);

const IMAGES = [tsimg1, tsimg2, tsimg3];
const AUTO_DELAY = 4000;

export default function LandingPage() {
    const navigate = useNavigate();

    // Carousel state
    const [carouselIndex, setCarouselIndex] = useState(0);
    const [lightboxOpen, setLightboxOpen] = useState(false);
    const [lightboxIndex, setLightboxIndex] = useState(0);
    const autoPlayRef = useRef(null);

    const startAutoPlay = useCallback(() => {
        clearInterval(autoPlayRef.current);
        autoPlayRef.current = setInterval(() => {
            setCarouselIndex(prev => (prev + 1) % IMAGES.length);
        }, AUTO_DELAY);
    }, []);

    useEffect(() => {
        if (!lightboxOpen) startAutoPlay();
        else clearInterval(autoPlayRef.current);
        return () => clearInterval(autoPlayRef.current);
    }, [lightboxOpen, startAutoPlay]);

    const carouselPrev = (e) => {
        e?.stopPropagation();
        setCarouselIndex(prev => (prev - 1 + IMAGES.length) % IMAGES.length);
        startAutoPlay();
    };
    const carouselNext = (e) => {
        e?.stopPropagation();
        setCarouselIndex(prev => (prev + 1) % IMAGES.length);
        startAutoPlay();
    };

    const openLightbox = () => {
        setLightboxIndex(carouselIndex);
        setLightboxOpen(true);
    };
    const closeLightbox = () => setLightboxOpen(false);
    const lightboxPrev = () => setLightboxIndex(prev => (prev - 1 + IMAGES.length) % IMAGES.length);
    const lightboxNext = () => setLightboxIndex(prev => (prev + 1) % IMAGES.length);

    // Keyboard nav for lightbox
    useEffect(() => {
        if (!lightboxOpen) return;
        const handler = (e) => {
            if (e.key === "ArrowLeft") lightboxPrev();
            if (e.key === "ArrowRight") lightboxNext();
            if (e.key === "Escape") closeLightbox();
        };
        window.addEventListener("keydown", handler);
        return () => window.removeEventListener("keydown", handler);
    }, [lightboxOpen]);

    // Refs for animation targets
    const navRef = useRef(null);
    const heroRef = useRef(null);
    const heroBadgeRef = useRef(null);
    const heroTitleRef = useRef(null);
    const heroSubRef = useRef(null);
    const heroCTARef = useRef(null);
    const heroPreviewRef = useRef(null);
    const featuresRef = useRef(null);
    const stepsRef = useRef(null);
    const techRef = useRef(null);
    const ctaRef = useRef(null);

    useEffect(() => {
        const ctx = gsap.context(() => {
            // Nav slide down
            gsap.fromTo(navRef.current,
                { y: -80, opacity: 0 },
                { y: 0, opacity: 1, duration: 0.7, ease: "power3.out" }
            );

            // Hero staggered entrance
            const heroTl = gsap.timeline({ delay: 0.3 });
            heroTl
                .fromTo(heroBadgeRef.current,
                    { opacity: 0, y: 20, scale: 0.95 },
                    { opacity: 1, y: 0, scale: 1, duration: 0.5, ease: "back.out(1.5)" }
                )
                .fromTo(heroTitleRef.current,
                    { opacity: 0, y: 40 },
                    { opacity: 1, y: 0, duration: 0.7, ease: "power3.out" }, "-=0.2"
                )
                .fromTo(heroSubRef.current,
                    { opacity: 0, y: 30 },
                    { opacity: 1, y: 0, duration: 0.6, ease: "power3.out" }, "-=0.3"
                )
                .fromTo(heroCTARef.current,
                    { opacity: 0, y: 20 },
                    { opacity: 1, y: 0, duration: 0.5, ease: "power3.out" }, "-=0.2"
                )
                .fromTo(heroPreviewRef.current,
                    { opacity: 0, y: 60, scale: 0.97 },
                    { opacity: 1, y: 0, scale: 1, duration: 0.8, ease: "power3.out" }, "-=0.3"
                );

            // Features cards stagger on scroll
            if (featuresRef.current) {
                const cards = featuresRef.current.querySelectorAll(".feature-card");
                gsap.fromTo(cards,
                    { opacity: 0, y: 50 },
                    {
                        opacity: 1, y: 0,
                        duration: 0.6,
                        stagger: 0.1,
                        ease: "power3.out",
                        scrollTrigger: {
                            trigger: featuresRef.current,
                            start: "top 80%",
                        }
                    }
                );
                const heading = featuresRef.current.querySelector(".section-heading");
                gsap.fromTo(heading,
                    { opacity: 0, y: 30 },
                    {
                        opacity: 1, y: 0, duration: 0.6, ease: "power3.out",
                        scrollTrigger: { trigger: featuresRef.current, start: "top 85%" }
                    }
                );
            }

            // Steps stagger on scroll
            if (stepsRef.current) {
                const items = stepsRef.current.querySelectorAll(".step-item");
                gsap.fromTo(items,
                    { opacity: 0, y: 40 },
                    {
                        opacity: 1, y: 0,
                        duration: 0.6,
                        stagger: 0.18,
                        ease: "power3.out",
                        scrollTrigger: { trigger: stepsRef.current, start: "top 80%" }
                    }
                );
            }

            // Tech tiles stagger
            if (techRef.current) {
                const tiles = techRef.current.querySelectorAll(".tech-tile");
                gsap.fromTo(tiles,
                    { opacity: 0, scale: 0.85 },
                    {
                        opacity: 1, scale: 1,
                        duration: 0.5,
                        stagger: 0.07,
                        ease: "back.out(1.4)",
                        scrollTrigger: { trigger: techRef.current, start: "top 80%" }
                    }
                );
            }

            // CTA section
            if (ctaRef.current) {
                gsap.fromTo(ctaRef.current,
                    { opacity: 0, y: 40, scale: 0.97 },
                    {
                        opacity: 1, y: 0, scale: 1, duration: 0.7, ease: "power3.out",
                        scrollTrigger: { trigger: ctaRef.current, start: "top 85%" }
                    }
                );
            }
        });

        return () => ctx.revert();
    }, []);

    const scrollToSection = (id) => {
        const element = document.getElementById(id);
        if (element) element.scrollIntoView({ behavior: "smooth" });
    };

    const features = [
        { icon: Rocket, title: "Project Management", description: "Organize projects with intuitive tools and streamlined workflows designed for modern teams." },
        { icon: CheckCircle, title: "Issue Tracking", description: "Track tasks, bugs, and features with customizable workflows and smart priority management." },
        { icon: Users, title: "Team Collaboration", description: "Seamless collaboration with team assignments, shared workspaces, and role-based access." },
        { icon: Zap, title: "Real-time Updates", description: "Stay in sync with instant notifications and live updates across your entire team." },
        { icon: MessageSquare, title: "Smart Comments", description: "Contextual discussions with threaded comments and inline feedback on every task." },
        { icon: BarChart3, title: "Analytics Dashboard", description: "Data-driven insights with comprehensive reporting and team performance metrics." },
    ];

    const steps = [
        { number: "01", title: "Create Account", description: "Sign up in seconds with email or social login." },
        { number: "02", title: "Setup Project", description: "Configure workflows and invite your team members." },
        { number: "03", title: "Start Shipping", description: "Track progress and deliver results faster than ever." },
    ];

    const techStack = [
        { name: "React 18", icon: Code },
        { name: "TypeScript", icon: Code },
        { name: "Tailwind CSS", icon: Layers },
        { name: "Spring Boot", icon: Shield },
        { name: "PostgreSQL", icon: Layers },
        { name: "JWT Auth", icon: Shield },
    ];

    return (
        <div className="min-h-screen bg-white dark:bg-slate-950">

            {/* Navigation */}
            <nav
                ref={navRef}
                className="fixed top-0 w-full z-50 bg-white/90 dark:bg-slate-950/90 backdrop-blur-lg border-b border-slate-200 dark:border-slate-800"
            >
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex justify-between items-center h-16">
                        {/* Logo */}
                        <div className="flex items-center gap-2">
                            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-slate-900 dark:bg-white">
                                <Layers className="h-5 w-5 text-white dark:text-slate-900" />
                            </div>
                            <span className="text-xl font-bold text-slate-900 dark:text-white">TaskSystem</span>
                        </div>

                        {/* Desktop nav links */}
                        <div className="hidden md:flex items-center gap-8">
                            <button
                                onClick={() => scrollToSection("features")}
                                className="text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white transition-colors font-medium"
                            >
                                Features
                            </button>
                            <button
                                onClick={() => scrollToSection("how-it-works")}
                                className="text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white transition-colors font-medium"
                            >
                                How it works
                            </button>
                            <button
                                onClick={() => scrollToSection("tech-stack")}
                                className="text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white transition-colors font-medium"
                            >
                                Technology
                            </button>
                        </div>

                        {/* Auth buttons */}
                        <div className="flex items-center gap-3">
                            <Button
                                variant="ghost"
                                onClick={() => navigate("/login")}
                                className="text-slate-700 dark:text-slate-200 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800"
                            >
                                Sign in
                            </Button>
                            <Button
                                onClick={() => navigate("/register")}
                                className="bg-slate-900 dark:bg-white text-white dark:text-slate-900 hover:bg-slate-700 dark:hover:bg-slate-100"
                            >
                                Get Started
                            </Button>
                        </div>
                    </div>
                </div>
            </nav>

            {/* Hero Section */}
            <section ref={heroRef} className="pt-32 pb-20 px-4 sm:px-6 lg:px-8">
                <div className="max-w-7xl mx-auto">
                    <div className="text-center max-w-4xl mx-auto space-y-8">

                        <div ref={heroBadgeRef} className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900">
                            <Zap className="h-4 w-4 text-slate-900 dark:text-white" />
                            <span className="text-sm font-medium text-slate-700 dark:text-slate-300">
                                Modern Task Management Platform
                            </span>
                        </div>

                        <h1 ref={heroTitleRef} className="text-5xl sm:text-6xl lg:text-7xl font-bold text-slate-900 dark:text-white leading-tight tracking-tight">
                            Ship faster with
                            <span className="block mt-2 bg-gradient-to-r from-slate-900 to-slate-500 dark:from-white dark:to-slate-400 bg-clip-text text-transparent">
                                better task management
                            </span>
                        </h1>

                        <p ref={heroSubRef} className="text-xl text-slate-600 dark:text-slate-400 max-w-2xl mx-auto leading-relaxed">
                            Streamline your workflow with an intuitive platform designed for modern teams.
                            Track progress, collaborate seamlessly, and deliver exceptional results.
                        </p>

                        <div ref={heroCTARef} className="flex flex-col sm:flex-row gap-4 justify-center items-center pt-4">
                            <Button
                                size="lg"
                                className="bg-slate-900 dark:bg-white text-white dark:text-slate-900 hover:bg-slate-700 dark:hover:bg-slate-100 px-8"
                                onClick={() => navigate("/register")}
                            >
                                Start for free
                                <ArrowRight className="ml-2 h-4 w-4" />
                            </Button>
                            <Button
                                size="lg"
                                variant="outline"
                                className="border-slate-300 dark:border-slate-600 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 px-8"
                                onClick={() => scrollToSection("features")}
                            >
                                See how it works
                            </Button>
                        </div>

                        <div className="pt-4 flex items-center justify-center gap-8 text-sm text-slate-500 dark:text-slate-500">
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

                    {/* Hero preview — auto-scroll carousel */}
                    <div
                        ref={heroPreviewRef}
                        className="mt-20 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900 p-3 shadow-2xl"
                    >
                        {/* Carousel wrapper */}
                        <div
                            className="relative rounded-lg overflow-hidden cursor-pointer group"
                            onClick={openLightbox}
                            title="Click to enlarge"
                        >
                            {/* Slides */}
                            <div
                                className="flex transition-transform duration-700 ease-in-out"
                                style={{ transform: `translateX(-${carouselIndex * 100}%)` }}
                            >
                                {IMAGES.map((src, i) => (
                                    <img
                                        key={i}
                                        src={src}
                                        alt={`Screenshot ${i + 1}`}
                                        className="w-full shrink-0 object-cover aspect-video select-none"
                                        draggable={false}
                                    />
                                ))}
                            </div>

                            {/* Hover overlay */}
                            <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors duration-300 flex items-center justify-center">
                                <span className="opacity-0 group-hover:opacity-100 transition-opacity duration-300 text-white text-sm font-medium bg-black/50 px-3 py-1.5 rounded-full backdrop-blur-sm">
                                    Click to enlarge
                                </span>
                            </div>

                            {/* Prev / Next arrows */}
                            <button
                                onClick={carouselPrev}
                                className="absolute left-2 top-1/2 -translate-y-1/2 h-8 w-8 rounded-full bg-black/40 hover:bg-black/60 text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-200"
                                aria-label="Previous"
                            >
                                <ChevronLeft className="h-5 w-5" />
                            </button>
                            <button
                                onClick={carouselNext}
                                className="absolute right-2 top-1/2 -translate-y-1/2 h-8 w-8 rounded-full bg-black/40 hover:bg-black/60 text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-200"
                                aria-label="Next"
                            >
                                <ChevronRight className="h-5 w-5" />
                            </button>
                        </div>

                        {/* Dot indicators */}
                        <div className="flex justify-center gap-2 mt-3 pb-1">
                            {IMAGES.map((_, i) => (
                                <button
                                    key={i}
                                    onClick={() => { setCarouselIndex(i); startAutoPlay(); }}
                                    className={`h-1.5 rounded-full transition-all duration-300 ${
                                        i === carouselIndex
                                            ? "w-6 bg-slate-700 dark:bg-slate-300"
                                            : "w-1.5 bg-slate-300 dark:bg-slate-600 hover:bg-slate-500 dark:hover:bg-slate-400"
                                    }`}
                                    aria-label={`Go to slide ${i + 1}`}
                                />
                            ))}
                        </div>
                    </div>
                </div>
            </section>

            {/* Features Section */}
            <section id="features" ref={featuresRef} className="py-24 px-4 sm:px-6 lg:px-8 bg-slate-50 dark:bg-slate-900/50">
                <div className="max-w-7xl mx-auto">
                    <div className="section-heading text-center mb-16 space-y-4">
                        <h2 className="text-4xl sm:text-5xl font-bold text-slate-900 dark:text-white tracking-tight">
                            Everything you need
                        </h2>
                        <p className="text-xl text-slate-600 dark:text-slate-400 max-w-2xl mx-auto">
                            Powerful features designed to help your team work smarter, not harder
                        </p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                        {features.map((feature, index) => (
                            <Card
                                key={index}
                                className="feature-card group border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 hover:shadow-lg transition-all duration-300 hover:-translate-y-1"
                            >
                                <CardContent className="p-6">
                                    <div className="space-y-4">
                                        <div className="h-12 w-12 rounded-lg bg-slate-100 dark:bg-slate-800 flex items-center justify-center group-hover:bg-slate-900 dark:group-hover:bg-white transition-colors duration-300">
                                            <feature.icon className="h-6 w-6 text-slate-700 dark:text-slate-300 group-hover:text-white dark:group-hover:text-slate-900 transition-colors duration-300" />
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
                <div ref={stepsRef} className="max-w-7xl mx-auto">
                    <div className="step-item text-center mb-16 space-y-4">
                        <h2 className="text-4xl sm:text-5xl font-bold text-slate-900 dark:text-white tracking-tight">
                            Get started in minutes
                        </h2>
                        <p className="text-xl text-slate-600 dark:text-slate-400 max-w-2xl mx-auto">
                            Three simple steps to transform your team's productivity
                        </p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-12 relative">
                        <div className="hidden md:block absolute top-12 left-[16.66%] right-[16.66%] h-px bg-slate-200 dark:bg-slate-800" />

                        {steps.map((step, index) => (
                            <div key={index} className="step-item relative text-center space-y-4">
                                <div className="relative inline-block">
                                    <div className="w-24 h-24 mx-auto rounded-full border-2 border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-950 flex items-center justify-center relative z-10">
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
            <section id="tech-stack" className="py-24 px-4 sm:px-6 lg:px-8 bg-slate-50 dark:bg-slate-900/50">
                <div ref={techRef} className="max-w-7xl mx-auto">
                    <div className="tech-tile text-center mb-16 space-y-4">
                        <h2 className="text-4xl sm:text-5xl font-bold text-slate-900 dark:text-white tracking-tight">
                            Built with modern technology
                        </h2>
                        <p className="text-xl text-slate-600 dark:text-slate-400 max-w-2xl mx-auto">
                            Powered by industry-leading tools and frameworks
                        </p>
                    </div>

                    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
                        {techStack.map((tech, index) => (
                            <div
                                key={index}
                                className="tech-tile p-6 rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 hover:shadow-md hover:-translate-y-0.5 transition-all duration-300 text-center"
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
                <div ref={ctaRef} className="max-w-4xl mx-auto">
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
                                    className="bg-white dark:bg-slate-900 text-slate-900 dark:text-white hover:bg-slate-100 dark:hover:bg-slate-800 px-8"
                                    onClick={() => navigate("/register")}
                                >
                                    Create free account
                                    <ArrowRight className="ml-2 h-4 w-4" />
                                </Button>
                                <Button
                                    size="lg"
                                    variant="outline"
                                    className="border-slate-600 dark:border-slate-300 text-slate-200 dark:text-slate-800 hover:bg-slate-800 dark:hover:bg-slate-100 px-8"
                                    onClick={() => navigate("/login")}
                                >
                                    Sign in
                                </Button>
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </section>

            {/* Lightbox */}
            {lightboxOpen && (
                <div
                    className="fixed inset-0 z-[100] bg-black/90 backdrop-blur-sm flex items-center justify-center"
                    onClick={closeLightbox}
                >
                    {/* Close */}
                    <button
                        onClick={closeLightbox}
                        className="absolute top-4 right-4 h-10 w-10 rounded-full bg-white/10 hover:bg-white/25 text-white flex items-center justify-center transition-colors"
                        aria-label="Close"
                    >
                        <X className="h-5 w-5" />
                    </button>

                    {/* Prev */}
                    <button
                        onClick={(e) => { e.stopPropagation(); lightboxPrev(); }}
                        className="absolute left-4 h-12 w-12 rounded-full bg-white/10 hover:bg-white/25 text-white flex items-center justify-center transition-colors"
                        aria-label="Previous"
                    >
                        <ChevronLeft className="h-7 w-7" />
                    </button>

                    {/* Image */}
                    <div
                        className="max-w-5xl w-full mx-16 rounded-xl overflow-hidden shadow-2xl"
                        onClick={(e) => e.stopPropagation()}
                    >
                        <img
                            src={IMAGES[lightboxIndex]}
                            alt={`Screenshot ${lightboxIndex + 1}`}
                            className="w-full h-auto object-contain select-none"
                            draggable={false}
                        />
                    </div>

                    {/* Next */}
                    <button
                        onClick={(e) => { e.stopPropagation(); lightboxNext(); }}
                        className="absolute right-4 h-12 w-12 rounded-full bg-white/10 hover:bg-white/25 text-white flex items-center justify-center transition-colors"
                        aria-label="Next"
                    >
                        <ChevronRight className="h-7 w-7" />
                    </button>

                    {/* Dot indicators */}
                    <div className="absolute bottom-6 flex gap-2">
                        {IMAGES.map((_, i) => (
                            <button
                                key={i}
                                onClick={(e) => { e.stopPropagation(); setLightboxIndex(i); }}
                                className={`h-2 rounded-full transition-all duration-300 ${
                                    i === lightboxIndex ? "w-8 bg-white" : "w-2 bg-white/40 hover:bg-white/70"
                                }`}
                                aria-label={`Go to slide ${i + 1}`}
                            />
                        ))}
                    </div>
                </div>
            )}

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
                            <p className="text-sm text-slate-600 dark:text-slate-400">
                                Modern task management for modern teams
                            </p>
                        </div>
                        <div>
                            <h4 className="font-semibold text-slate-900 dark:text-white mb-4">Product</h4>
                            <ul className="space-y-2 text-sm">
                                <li><a href="#features" className="text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white transition-colors">Features</a></li>
                                <li><a href="#" className="text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white transition-colors">Pricing</a></li>
                                <li><a href="#" className="text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white transition-colors">Roadmap</a></li>
                            </ul>
                        </div>
                        <div>
                            <h4 className="font-semibold text-slate-900 dark:text-white mb-4">Resources</h4>
                            <ul className="space-y-2 text-sm">
                                <li><a href="#" className="text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white transition-colors">Documentation</a></li>
                                <li><a href="#" className="text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white transition-colors">API Reference</a></li>
                                <li><a href="#" className="text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white transition-colors">Support</a></li>
                            </ul>
                        </div>
                        <div>
                            <h4 className="font-semibold text-slate-900 dark:text-white mb-4">Company</h4>
                            <ul className="space-y-2 text-sm">
                                <li><a href="#" className="text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white transition-colors">About</a></li>
                                <li><a href="#" className="text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white transition-colors">Blog</a></li>
                                <li>
                                    <a href="https://github.com" className="text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white transition-colors flex items-center gap-1">
                                        <Github className="h-4 w-4" />
                                        GitHub
                                    </a>
                                </li>
                            </ul>
                        </div>
                    </div>
                    <div className="pt-8 border-t border-slate-200 dark:border-slate-800 flex flex-col sm:flex-row justify-between items-center gap-4">
                        <p className="text-sm text-slate-600 dark:text-slate-400">
                            © 2026 TaskSystem. All rights reserved.
                        </p>
                        <div className="flex gap-6 text-sm">
                            <a href="#" className="text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white transition-colors">Privacy</a>
                            <a href="#" className="text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white transition-colors">Terms</a>
                            <a href="#" className="text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white transition-colors">Cookies</a>
                        </div>
                    </div>
                </div>
            </footer>
        </div>
    );
}

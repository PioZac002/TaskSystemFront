import { useEffect, useState } from "react";

export const ThemeToggle = () => {
    const [theme, setTheme] = useState("light");
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        setMounted(true);
        const savedTheme = localStorage.getItem("theme") ||
            (window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light");
        setTheme(savedTheme);
        document.documentElement.classList.toggle("dark", savedTheme === "dark");
    }, []);

    const toggleTheme = () => {
        const newTheme = theme === "dark" ? "light" : "dark";
        setTheme(newTheme);
        document.documentElement.classList.toggle("dark", newTheme === "dark");
        localStorage.setItem("theme", newTheme);
    };

    const isDark = mounted ? theme === "dark" : false;

    return (
        <label
            className="theme-switch-label"
            aria-label="Toggle theme"
            title={isDark ? "Switch to light mode" : "Switch to dark mode"}
        >
            <input
                type="checkbox"
                checked={isDark}
                onChange={toggleTheme}
                disabled={!mounted}
            />
            <span className="theme-slider">
                <span className="theme-sun-moon" aria-hidden="true">
                    <svg className="theme-moon-dot theme-moon-dot-one" viewBox="0 0 100 100">
                        <circle cx="50" cy="50" r="50" />
                    </svg>
                    <svg className="theme-moon-dot theme-moon-dot-two" viewBox="0 0 100 100">
                        <circle cx="50" cy="50" r="50" />
                    </svg>
                    <svg className="theme-moon-dot theme-moon-dot-three" viewBox="0 0 100 100">
                        <circle cx="50" cy="50" r="50" />
                    </svg>
                    <svg className="theme-light-ray theme-light-ray-one" viewBox="0 0 100 100">
                        <circle cx="50" cy="50" r="50" />
                    </svg>
                    <svg className="theme-light-ray theme-light-ray-two" viewBox="0 0 100 100">
                        <circle cx="50" cy="50" r="50" />
                    </svg>
                    <svg className="theme-light-ray theme-light-ray-three" viewBox="0 0 100 100">
                        <circle cx="50" cy="50" r="50" />
                    </svg>
                </span>
                <span className="theme-clouds" aria-hidden="true">
                    <svg className="theme-cloud theme-cloud-one" viewBox="0 0 100 100">
                        <circle cx="50" cy="50" r="50" />
                    </svg>
                    <svg className="theme-cloud theme-cloud-two" viewBox="0 0 100 100">
                        <circle cx="50" cy="50" r="50" />
                    </svg>
                    <svg className="theme-cloud theme-cloud-three" viewBox="0 0 100 100">
                        <circle cx="50" cy="50" r="50" />
                    </svg>
                </span>
                <span className="theme-stars" aria-hidden="true">
                    {[0, 1, 2, 3].map((star) => (
                        <svg key={star} className={`theme-star theme-star-${star + 1}`} viewBox="0 0 20 20">
                            <path d="M 0 10 C 10 10,10 10,0 10 C 10 10,10 10,10 20 C 10 10,10 10,20 10 C 10 10,10 10,10 0 C 10 10,10 10,0 10 Z" />
                        </svg>
                    ))}
                </span>
            </span>
        </label>
    );
};

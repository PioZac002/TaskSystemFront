import React, { useEffect, useRef, useState } from "react";
import { Check, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";

export function StatefulButton({
    children,
    className,
    disabled,
    onClick,
    loadingText = "Working...",
    successText = "Done",
    type = "button",
    ...props
}) {
    const [state, setState] = useState("idle");
    const resetTimer = useRef(null);

    useEffect(() => {
        return () => {
            if (resetTimer.current) {
                window.clearTimeout(resetTimer.current);
            }
        };
    }, []);

    const handleClick = async (event) => {
        if (disabled || state === "loading") return;

        setState("loading");
        try {
            const result = await onClick?.(event);

            if (result === false) {
                setState("idle");
                return;
            }

            setState("success");
            resetTimer.current = window.setTimeout(() => setState("idle"), 1300);
        } catch (error) {
            setState("idle");
            throw error;
        }
    };

    const isBusy = state === "loading";
    const isSuccess = state === "success";

    return (
        <button
            type={type}
            onClick={handleClick}
            disabled={disabled || isBusy}
            className={cn(
                "group/stateful relative inline-flex h-10 items-center justify-center overflow-hidden rounded-md bg-foreground px-4 text-sm font-medium text-background shadow-input transition-all duration-300 hover:-translate-y-0.5 hover:shadow-[0_14px_34px_rgba(15,23,42,0.18)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background disabled:pointer-events-none disabled:opacity-55 dark:bg-white dark:text-slate-950",
                className
            )}
            {...props}
        >
            <span className="absolute inset-x-0 -bottom-px h-px bg-gradient-to-r from-transparent via-primary to-transparent opacity-0 transition-opacity duration-500 group-hover/stateful:opacity-100" />
            <span className="absolute inset-x-8 -bottom-px h-px bg-gradient-to-r from-transparent via-emerald-400 to-transparent opacity-0 blur-sm transition-opacity duration-500 group-hover/stateful:opacity-100" />
            <span className="relative flex items-center gap-2">
                {isBusy && <Loader2 className="h-4 w-4 animate-spin" />}
                {isSuccess && <Check className="h-4 w-4" />}
                {isBusy ? loadingText : isSuccess ? successText : children}
            </span>
        </button>
    );
}

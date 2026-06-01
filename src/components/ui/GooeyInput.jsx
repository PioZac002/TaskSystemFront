import React, { forwardRef } from "react";
import { Search } from "lucide-react";
import { cn } from "@/lib/utils";

const GooeyInput = forwardRef(
    ({ className, containerClassName, icon = true, type = "search", ...props }, ref) => (
        <div className={cn("gooey-input relative w-full", containerClassName)}>
            <svg aria-hidden="true" className="pointer-events-none absolute h-0 w-0">
                <filter id="gooey-input-filter">
                    <feGaussianBlur in="SourceGraphic" stdDeviation="7" result="blur" />
                    <feColorMatrix
                        in="blur"
                        mode="matrix"
                        values="1 0 0 0 0  0 1 0 0 0  0 0 1 0 0  0 0 0 19 -8"
                        result="goo"
                    />
                    <feBlend in="SourceGraphic" in2="goo" />
                </filter>
            </svg>

            <div className="gooey-input__liquid absolute inset-0 -z-10 overflow-hidden rounded-full">
                <span className="gooey-input__blob gooey-input__blob--one" />
                <span className="gooey-input__blob gooey-input__blob--two" />
            </div>

            <div className="relative flex h-11 items-center rounded-full border border-input bg-card/90 shadow-input transition-all duration-300 focus-within:border-primary/60 focus-within:shadow-[0_12px_36px_rgba(15,23,42,0.12)] dark:bg-card/80">
                {icon && (
                    <Search className="pointer-events-none absolute left-4 h-4 w-4 text-muted-foreground" />
                )}
                <input
                    ref={ref}
                    type={type}
                    className={cn(
                        "h-full w-full rounded-full bg-transparent pr-4 text-sm text-foreground outline-none placeholder:text-muted-foreground disabled:cursor-not-allowed disabled:opacity-50",
                        icon ? "pl-11" : "pl-4",
                        className
                    )}
                    {...props}
                />
            </div>
        </div>
    )
);

GooeyInput.displayName = "GooeyInput";

export { GooeyInput };

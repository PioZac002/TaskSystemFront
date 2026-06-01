import { cn } from "@/lib/utils";

export function AddButton({ label = "Add", onClick, className = "" }) {
    return (
        <button
            type="button"
            onClick={onClick}
            className={cn(
                "rounded-lg relative w-36 h-10 cursor-pointer flex items-center overflow-hidden shrink-0",
                "border border-violet-600 bg-violet-600 group",
                "hover:bg-violet-600 active:bg-violet-600 active:border-violet-600",
                className
            )}
        >
            <span className="text-white font-semibold ml-8 transform group-hover:translate-x-20 transition-all duration-300 text-sm whitespace-nowrap pointer-events-none">
                {label}
            </span>
            <span className="absolute right-0 h-full w-10 rounded-lg bg-violet-600 flex items-center justify-center transform group-hover:translate-x-0 group-hover:w-full transition-all duration-300 pointer-events-none">
                <svg className="w-5 h-5 text-white" fill="none" height={24} stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} viewBox="0 0 24 24" width={24} xmlns="http://www.w3.org/2000/svg">
                    <line x1={12} x2={12} y1={5} y2={19} />
                    <line x1={5} x2={19} y1={12} y2={12} />
                </svg>
            </span>
        </button>
    );
}

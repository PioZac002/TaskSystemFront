import { Badge } from "@/components/ui/Badge";
import { cn } from "@/lib/utils";
import { getLabelName } from "@/utils/labelUtils";

export function IssueLabelChips({ labels = [], max = 3, emptyText = null, className, badgeClassName }) {
    const visibleLabels = (labels || []).filter(Boolean);

    if (visibleLabels.length === 0) {
        return emptyText ? <p className="text-sm text-muted-foreground">{emptyText}</p> : null;
    }

    const shown = visibleLabels.slice(0, max);
    const hiddenCount = Math.max(visibleLabels.length - shown.length, 0);

    return (
        <div className={cn("flex flex-wrap items-center gap-1", className)}>
            {shown.map((label, index) => (
                <Badge
                    key={`${getLabelName(label)}-${label?.id ?? index}`}
                    variant="outline"
                    style={label?.color ? { backgroundColor: label.color, color: "#fff", borderColor: label.color } : {}}
                    className={cn(
                        "max-w-[9rem] truncate border-primary/25 bg-primary/5 px-2 py-0.5 text-[11px] text-primary",
                        badgeClassName
                    )}
                    title={getLabelName(label)}
                >
                    {getLabelName(label)}
                </Badge>
            ))}
            {hiddenCount > 0 && (
                <Badge
                    variant="secondary"
                    className={cn("px-2 py-0.5 text-[11px]", badgeClassName)}
                    title={`${hiddenCount} more label${hiddenCount === 1 ? "" : "s"}`}
                >
                    +{hiddenCount}
                </Badge>
            )}
        </div>
    );
}

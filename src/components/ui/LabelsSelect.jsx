import { useState } from "react";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/Popover";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { Check, ChevronDown } from "lucide-react";

export function LabelsSelect({ labels = [], selectedIds = [], onChange, placeholder = "Select labels" }) {
    const [open, setOpen] = useState(false);

    const toggle = (id) => {
        const sid = String(id);
        if (selectedIds.map(String).includes(sid)) {
            onChange(selectedIds.filter(x => String(x) !== sid));
        } else {
            onChange([...selectedIds, sid]);
        }
    };

    const selectedLabels = labels.filter(l => selectedIds.map(String).includes(String(l.id)));

    return (
        <Popover open={open} onOpenChange={setOpen}>
            <PopoverTrigger asChild>
                <Button
                    type="button"
                    variant="outline"
                    className="w-full justify-between h-auto min-h-9 flex-wrap gap-1 px-3 py-1.5"
                >
                    {selectedLabels.length > 0 ? (
                        <div className="flex flex-wrap gap-1">
                            {selectedLabels.map(label => (
                                <Badge
                                    key={label.id}
                                    style={label.color ? { backgroundColor: label.color, color: "#fff", borderColor: label.color } : {}}
                                    className="text-xs"
                                >
                                    {label.name}
                                </Badge>
                            ))}
                        </div>
                    ) : (
                        <span className="text-muted-foreground text-sm">{placeholder}</span>
                    )}
                    <ChevronDown className="h-4 w-4 shrink-0 opacity-50 ml-1" />
                </Button>
            </PopoverTrigger>
            <PopoverContent className="w-64 p-1" align="start">
                {labels.length === 0 ? (
                    <p className="text-sm text-muted-foreground px-2 py-4 text-center">No labels defined</p>
                ) : (
                    labels.map(label => {
                        const selected = selectedIds.map(String).includes(String(label.id));
                        return (
                            <button
                                key={label.id}
                                type="button"
                                className="w-full flex items-center gap-2 px-2 py-1.5 text-sm rounded hover:bg-accent text-left"
                                onClick={() => toggle(label.id)}
                            >
                                <div
                                    className="w-4 h-4 rounded border flex items-center justify-center shrink-0"
                                    style={label.color ? {
                                        borderColor: label.color,
                                        backgroundColor: selected ? label.color : 'transparent'
                                    } : {}}
                                >
                                    {selected && <Check className="h-2.5 w-2.5 text-white" />}
                                </div>
                                {label.color && (
                                    <div className="w-3 h-3 rounded-full shrink-0" style={{ backgroundColor: label.color }} />
                                )}
                                <span>{label.name}</span>
                                <span className="text-muted-foreground text-xs ml-auto">{label.code}</span>
                            </button>
                        );
                    })
                )}
            </PopoverContent>
        </Popover>
    );
}

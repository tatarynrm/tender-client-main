import React from "react";
import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { GripVertical, X, MapPin } from "lucide-react";

interface SortableWaypointProps {
    id: string;
    index: number;
    value: string;
    onChange: (id: string, value: string) => void;
    onRemove: (id: string) => void;
    placeholder?: string;
}

export function SortableWaypoint({
    id,
    index,
    value,
    onChange,
    onRemove,
    placeholder = "Адреса або місто...",
}: SortableWaypointProps) {
    const {
        attributes,
        listeners,
        setNodeRef,
        transform,
        transition,
        isDragging,
    } = useSortable({ id });

    const style = {
        transform: CSS.Transform.toString(transform),
        transition,
        zIndex: isDragging ? 50 : "auto",
    };

    return (
        <div
            ref={setNodeRef}
            style={style}
            className={`relative flex items-center gap-2 p-2 rounded-xl border transition-colors ${isDragging
                    ? "bg-blue-50/80 border-blue-200 shadow-lg"
                    : "bg-white border-zinc-200 hover:border-zinc-300"
                }`}
        >
            <div
                {...attributes}
                {...listeners}
                className="cursor-grab active:cursor-grabbing text-zinc-400 hover:text-blue-500 p-1 rounded-md hover:bg-zinc-100 transition-colors"
            >
                <GripVertical size={16} />
            </div>

            <div className="flex-1 flex items-center gap-2 bg-zinc-50 border border-zinc-100 rounded-lg px-3 py-1.5 focus-within:border-blue-300 focus-within:ring-2 focus-within:ring-blue-100 transition-all">
                <MapPin
                    size={14}
                    className={index === 0 ? "text-emerald-500" : "text-blue-500"}
                />
                <input
                    type="text"
                    value={value}
                    onChange={(e) => onChange(id, e.target.value)}
                    placeholder={placeholder}
                    className="w-full bg-transparent border-none outline-none text-sm text-zinc-800 font-medium placeholder:text-zinc-400 placeholder:font-normal"
                />
            </div>

            <button
                onClick={() => onRemove(id)}
                className="p-1.5 text-zinc-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                title="Видалити точку"
            >
                <X size={16} />
            </button>

            {/* Connection Line */}
            <div className="absolute -bottom-4 left-[22px] w-[2px] h-4 bg-zinc-200 border-l border-dashed border-zinc-300 z-0 pointer-events-none last:hidden" />
        </div>
    );
}

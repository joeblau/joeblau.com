"use client";

import { LayoutGrid, List } from "lucide-react";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";

export type ViewMode = "grid" | "list";

interface ViewToggleProps {
	value: ViewMode;
	onValueChange: (value: ViewMode) => void;
}

export function ViewToggle({ value, onValueChange }: ViewToggleProps) {
	return (
		<ToggleGroup
			type="single"
			value={value}
			onValueChange={(v) => {
				if (v) onValueChange(v as ViewMode);
			}}
		>
			<ToggleGroupItem value="grid" aria-label="Grid view">
				<LayoutGrid className="h-4 w-4" />
			</ToggleGroupItem>
			<ToggleGroupItem value="list" aria-label="List view">
				<List className="h-4 w-4" />
			</ToggleGroupItem>
		</ToggleGroup>
	);
}

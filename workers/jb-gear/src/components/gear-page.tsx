"use client";

import { useState, useMemo } from "react";
import { gearItems, type Category } from "@/lib/data/gear";
import { CategoryFilter } from "@/components/category-filter";
import { ViewToggle, type ViewMode } from "@/components/view-toggle";
import { GearGrid } from "@/components/gear-grid";
import { GearList } from "@/components/gear-list";
import { GearTotal } from "@/components/gear-total";
import { ThemeToggle } from "@/components/theme-toggle";

export function GearPage() {
	const [viewMode, setViewMode] = useState<ViewMode>("grid");
	const [selectedCategory, setSelectedCategory] = useState<string>("all");

	const filteredItems = useMemo(() => {
		if (selectedCategory === "all") return gearItems;
		return gearItems.filter((item) => item.category === selectedCategory);
	}, [selectedCategory]);

	return (
		<div className="min-h-screen">
			<div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
				<header className="flex items-center justify-between mb-8">
					<div>
						<h1 className="text-2xl font-bold tracking-tight">Gear</h1>
						<p className="text-muted-foreground text-sm mt-1">My personal equipment and tools</p>
					</div>
					<ThemeToggle />
				</header>

				<div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
					<CategoryFilter
						items={gearItems}
						value={selectedCategory}
						onValueChange={setSelectedCategory}
					/>
					<div className="flex items-center gap-4">
						<GearTotal items={filteredItems} />
						<ViewToggle value={viewMode} onValueChange={setViewMode} />
					</div>
				</div>

				{viewMode === "grid" ? (
					<GearGrid items={filteredItems} />
				) : (
					<GearList items={filteredItems} />
				)}
			</div>
		</div>
	);
}

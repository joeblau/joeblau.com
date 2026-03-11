"use client";

import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { allCategories, type GearItem, getItemCountByCategory, type Category } from "@/lib/data/gear";

interface CategoryFilterProps {
	items: GearItem[];
	value: string;
	onValueChange: (value: string) => void;
}

export function CategoryFilter({ items, value, onValueChange }: CategoryFilterProps) {
	return (
		<Tabs value={value} onValueChange={onValueChange}>
			<TabsList className="flex-wrap h-auto gap-1">
				<TabsTrigger value="all">
					All ({items.length})
				</TabsTrigger>
				{allCategories.map((category) => {
					const count = getItemCountByCategory(items, category as Category);
					return (
						<TabsTrigger key={category} value={category}>
							{category} ({count})
						</TabsTrigger>
					);
				})}
			</TabsList>
		</Tabs>
	);
}

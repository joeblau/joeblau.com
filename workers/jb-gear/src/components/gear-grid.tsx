import { GearCard } from "@/components/gear-card";
import type { GearItem } from "@/lib/data/gear";

interface GearGridProps {
	items: GearItem[];
}

export function GearGrid({ items }: GearGridProps) {
	return (
		<div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
			{items.map((item, index) => (
				<GearCard key={`${item.name}-${index}`} item={item} />
			))}
		</div>
	);
}

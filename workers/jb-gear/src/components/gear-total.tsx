import { formatPrice, calculateTotal, type GearItem } from "@/lib/data/gear";

interface GearTotalProps {
	items: GearItem[];
}

export function GearTotal({ items }: GearTotalProps) {
	const total = calculateTotal(items);

	return (
		<div className="text-sm text-muted-foreground">
			{items.length} {items.length === 1 ? "item" : "items"} · {formatPrice(total)} total
		</div>
	);
}

import Image from "next/image";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { formatPrice, type GearItem } from "@/lib/data/gear";
import { ExternalLink } from "lucide-react";

interface GearCardProps {
	item: GearItem;
}

export function GearCard({ item }: GearCardProps) {
	return (
		<a href={item.url} target="_blank" rel="noopener noreferrer" className="group block">
			<Card className="overflow-hidden transition-all hover:shadow-lg hover:-translate-y-1">
				<div className="relative aspect-square bg-muted/50 p-6">
					<Image
						src={item.image}
						alt={item.name}
						fill
						className="object-contain p-4"
						sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
					/>
					<ExternalLink className="absolute top-3 right-3 h-4 w-4 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity" />
				</div>
				<CardContent className="p-4 space-y-2">
					<div className="flex items-start justify-between gap-2">
						<h3 className="font-medium text-sm leading-tight">{item.name}</h3>
						<span className="text-sm font-semibold whitespace-nowrap">{formatPrice(item.price)}</span>
					</div>
					{item.description && (
						<p className="text-xs text-muted-foreground">{item.description}</p>
					)}
					<Badge variant="secondary" className="text-xs">
						{item.category}
					</Badge>
				</CardContent>
			</Card>
		</a>
	);
}

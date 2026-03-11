import Image from "next/image";
import { ExternalLink } from "lucide-react";
import {
	Table,
	TableBody,
	TableCell,
	TableHead,
	TableHeader,
	TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { formatPrice, type GearItem } from "@/lib/data/gear";

interface GearListProps {
	items: GearItem[];
}

export function GearList({ items }: GearListProps) {
	return (
		<div className="rounded-md border">
			<Table>
				<TableHeader>
					<TableRow>
						<TableHead className="w-12"></TableHead>
						<TableHead>Name</TableHead>
						<TableHead>Category</TableHead>
						<TableHead className="text-right">Price</TableHead>
						<TableHead className="w-10"></TableHead>
					</TableRow>
				</TableHeader>
				<TableBody>
					{items.map((item, index) => (
						<TableRow key={`${item.name}-${index}`}>
							<TableCell>
								<div className="relative h-10 w-10 rounded bg-muted/50">
									<Image
										src={item.image}
										alt={item.name}
										fill
										className="object-contain p-1"
										sizes="40px"
									/>
								</div>
							</TableCell>
							<TableCell>
								<div>
									<div className="font-medium text-sm">{item.name}</div>
									{item.description && (
										<div className="text-xs text-muted-foreground">{item.description}</div>
									)}
								</div>
							</TableCell>
							<TableCell>
								<Badge variant="secondary" className="text-xs">
									{item.category}
								</Badge>
							</TableCell>
							<TableCell className="text-right font-medium text-sm">
								{formatPrice(item.price)}
							</TableCell>
							<TableCell>
								<a
									href={item.url}
									target="_blank"
									rel="noopener noreferrer"
									className="text-muted-foreground hover:text-foreground transition-colors"
								>
									<ExternalLink className="h-4 w-4" />
								</a>
							</TableCell>
						</TableRow>
					))}
				</TableBody>
			</Table>
		</div>
	);
}

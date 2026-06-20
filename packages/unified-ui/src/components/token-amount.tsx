import { formatTokenParts } from "../lib/format";

/**
 * Renders a token amount with the DexScreener-style leading-zero count rendered
 * as a styled <sub> (e.g. 0.0₅4773). Display only.
 */
export function TokenAmount({
	value,
	className,
}: {
	value: string | number;
	className?: string;
}) {
	const { lead, sub, rest } = formatTokenParts(value);
	return (
		<span className={className}>
			{lead}
			{sub && <sub className="text-[0.7em] font-normal">{sub}</sub>}
			{rest}
		</span>
	);
}

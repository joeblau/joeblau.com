import { toBaseUnits } from "@/lib/relay/units";

/**
 * Builds the payload encoded into a receive/payment QR code. For EVM addresses
 * we emit an EIP-681 `ethereum:` URI (so a scanning wallet can pre-fill a
 * transfer); for non-EVM addresses (Solana, etc.) the bare address is the
 * universal, every-wallet-scannable form.
 */
export interface PaymentRequest {
	address: string;
	chainId?: number;
	/** Decimal token amount in human units (optional). */
	amount?: string;
	/** ERC-20 contract; omit/zero for the native asset. */
	tokenAddress?: string;
	decimals?: number;
	vmType?: string;
}

const ZERO = "0x0000000000000000000000000000000000000000";

export function isEvmAddress(address: string): boolean {
	return /^0x[a-fA-F0-9]{40}$/.test(address);
}

/** Universal QR payload: EIP-681 for EVM, bare address otherwise. */
export function buildPaymentPayload(req: PaymentRequest): string {
	const evm = isEvmAddress(req.address) && (req.vmType ?? "evm") === "evm";
	return evm ? buildEip681Uri(req) : req.address;
}

/**
 * EIP-681:
 *  - native:  `ethereum:<addr>@<chainId>[?value=<wei>]`
 *  - erc-20:  `ethereum:<token>@<chainId>/transfer?address=<addr>[&uint256=<base>]`
 */
export function buildEip681Uri(req: PaymentRequest): string {
	const chainSuffix = req.chainId ? `@${req.chainId}` : "";
	const isErc20 = !!req.tokenAddress && req.tokenAddress.toLowerCase() !== ZERO;
	if (isErc20) {
		let uri = `ethereum:${req.tokenAddress}${chainSuffix}/transfer?address=${req.address}`;
		if (req.amount && req.decimals != null) {
			uri += `&uint256=${toBaseUnits(req.amount, req.decimals)}`;
		}
		return uri;
	}
	let uri = `ethereum:${req.address}${chainSuffix}`;
	if (req.amount && req.decimals != null) {
		uri += `?value=${toBaseUnits(req.amount, req.decimals)}`;
	}
	return uri;
}

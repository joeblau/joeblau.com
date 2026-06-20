# @joeblau/unified-ui

Presentational, fully-controlled React components for a unified **send / swap / bridge** card. Pixel-faithful layout and spacing extracted from the production card, with every data concern (Relay quoting, wallet SDK, i18n) removed — you own the state and inject the data-heavy surfaces through slots.

- **Presentational** — every value and callback is a prop. No Relay, no Privy, no i18n.
- **One card, both wallet states** — pass `generateAddress` for a disconnected wallet (receive/generate-address view available) or omit it for a connected wallet (no generate-address affordance anywhere).
- **Layout preserved exactly** — the `-my-3` swap-button overlap, the `border-t-2 border-background` seams, the height-conservation animation between the two fields, the `h-12` / `size-12` action row, the mobile keypad, and the Apple edge-glow.
- **Slots for the data-heavy bits** — the token search/list drawer and the settings menu are render props.

## Install

```bash
bun add @joeblau/unified-ui
# peers (you almost certainly already have react/react-dom):
bun add react react-dom framer-motion vaul
# optional, only for the center-logo QR adapter:
bun add cuer
```

Dependencies bundled for you: `@number-flow/react`, `boring-avatars`, `clsx`, `tailwind-merge`, `lucide-react`, `qrcode-generator`.

## Styles

The components are Tailwind-class based and read a small set of CSS variables. Two things to wire up:

**1. Import the style contract once** (defines the tokens + the non-utility CSS — `.apple-edge-glow`, `.haptic-*`, `.scrollbar-subtle`, `.scroll-fade`):

```ts
import "@joeblau/unified-ui/styles.css";
```

**2. Map the semantic color scale** so utilities like `bg-card`, `text-foreground`, and the `foreground/<opacity>` overlays resolve.

Tailwind **v3** — use the preset, and add the package to `content` so its classes are scanned:

```js
// tailwind.config.js
module.exports = {
  presets: [require("@joeblau/unified-ui/tailwind-preset")],
  content: [
    "./src/**/*.{ts,tsx}",
    "./node_modules/@joeblau/unified-ui/src/**/*.{ts,tsx}",
  ],
};
```

Tailwind **v4** — add an `@theme inline` mapping and scan the package source:

```css
@import "tailwindcss";
@import "@joeblau/unified-ui/styles.css";
@source "../node_modules/@joeblau/unified-ui/src";

@theme inline {
  --color-background: hsl(var(--background));
  --color-foreground: hsl(var(--foreground));
  --color-card: hsl(var(--card));
  --color-card-foreground: hsl(var(--card-foreground));
  --color-primary: hsl(var(--primary));
  --color-primary-foreground: hsl(var(--primary-foreground));
  --color-secondary: hsl(var(--secondary));
  --color-secondary-foreground: hsl(var(--secondary-foreground));
  --color-muted: hsl(var(--muted));
  --color-muted-foreground: hsl(var(--muted-foreground));
  --color-border: hsl(var(--border));
}
```

Dark mode: add `class="dark"` to a parent (the contract ships `:root` + `.dark`).

### Token contract

`styles.css` ships these (light / dark). Override any in your own `:root`/`.dark` to re-theme.

| Variable | Light | Dark | Used by |
| --- | --- | --- | --- |
| `--background` | `0 0% 100%` | `0 0% 3.9%` | page bg; swap-disc; seam color |
| `--foreground` | `0 0% 3.9%` | `0 0% 98%` | text + every `foreground/<n>` overlay |
| `--card` | `0 0% 96%` | `0 0% 7.5%` | the two card sections + sheets |
| `--muted` / `--muted-foreground` | `0 0% 96.1%` / `0 0% 45.1%` | `0 0% 14.9%` / `0 0% 63.9%` | kbd hint / secondary text |
| `--primary` / `--primary-foreground` | `0 0% 9%` / `0 0% 98%` | `0 0% 98%` / `0 0% 9%` | primary CTA |
| `--secondary` / `--secondary-foreground` | `0 0% 96.1%` / `0 0% 9%` | `0 0% 14.9%` / `0 0% 98%` | menu + reset buttons |
| `--border` | `0 0% 89.8%` | `0 0% 14.9%` | bare `border` utilities |
| `--radius` | `0.5rem` | `0.5rem` | `rounded-lg/md/sm` only (card geometry uses Tailwind defaults) |

> The `*` border reset is scoped to `.unified-ui-root` in `styles.css`. If you don't already have a global `* { border-color: hsl(var(--border)) }` reset, wrap the card in a `<div className="unified-ui-root">` so the `border-t-2 border-background` seams paint.

## Wallet states

The generate-address (receive) affordance is governed by a single optional prop:

- **Disconnected** — pass `generateAddress={{ enabled, onToggle, receiveAddress, … }}`. The From field can flip to a QR + address receive view, the To amount collapses to keep the card height constant, and the From picker slot receives the toggle config so your drawer can render the switch.
- **Connected** — **omit** `generateAddress`. Internally `genAddress` is forced `false`; there is no receive view and no toggle anywhere. The same `<SwapCard/>` renders both — the affordance is removed by absence of one prop, not a flag you must remember to also hide.

## Slots

Three data-heavy surfaces are injected:

- `renderFromPicker(api)` / `renderToPicker(api)` — return the drawer body (search, list, connect, generate-address switch …), typically wrapped in `<BottomSheet trigger={<TokenTrigger …/>}>`. The package owns the presentational `<TokenTrigger/>` and hands you a `PickerSlotApi` (`variant`, `selected`, `onSelect`, `triggerClassName`, `open`, `onOpenChange`, `onActivate`, `walletAddress`, `generateAddress?`, To-side `slippage`/`fee`/`feeLoading`/`onOpenSlippage`, From-side `onSetAmount`, `labels`). Omit a render prop and a bare static trigger is rendered.
- `renderMenu(api)` — return the settings views (slippage, order type, language, fees …) for the shared sheet. `<AppMenuShell/>` owns the trigger, sheet chrome, header, and the morphing `ResizablePanel` host; `api` is `{ view, setView, close }`. Compose your rows from the exported `SettingsRow`, `SegmentedControl`, `Keypad`.

## Usage — disconnected (generate-address available)

```tsx
import { SwapCard, BottomSheet, TokenTrigger, type PickerSlotApi } from "@joeblau/unified-ui";
import "@joeblau/unified-ui/styles.css";

function Pay() {
  const [fromToken, setFromToken] = useState(null);
  const [toToken, setToToken] = useState(null);
  const [fromAmount, setFromAmount] = useState("0");
  const [fromMode, setFromMode] = useState<"token" | "usd">("usd");
  const [toMode, setToMode] = useState<"token" | "usd">("usd");
  const [slippage, setSlippage] = useState(0.005);
  const [genAddr, setGenAddr] = useState(false);

  // your data layer (Relay quote, prices, …)
  const { fromUsd, fromUnits, toAmount, toUsd, feeUsd, quoteLoading } = useMyQuote(/* … */);

  const renderPicker = (api: PickerSlotApi) => (
    <BottomSheet
      open={api.open}
      onOpenChange={api.onOpenChange}
      contentClassName="h-[88vh]"
      trigger={
        <TokenTrigger
          variant={api.variant}
          selected={api.selected}
          triggerClassName={api.triggerClassName}
          walletAddress={api.walletAddress}
          onActivate={api.onActivate}
          onSetAmount={api.onSetAmount}
          slippage={api.slippage}
          fee={api.fee}
          feeLoading={api.feeLoading}
          onOpenSlippage={api.onOpenSlippage}
          labels={api.labels}
        />
      }
    >
      <MyTokenDrawerBody
        variant={api.variant}
        onSelect={(t) => { api.onSelect(t); api.onOpenChange(false); }}
        generateAddress={api.generateAddress} // From side, defined → render the switch
      />
    </BottomSheet>
  );

  return (
    <SwapCard
      fromToken={fromToken} onSelectFromToken={setFromToken}
      toToken={toToken} onSelectToToken={setToToken}
      fromAmount={fromAmount} onFromAmountChange={setFromAmount}
      fromMode={fromMode} onToggleFromMode={() => setFromMode((m) => (m === "usd" ? "token" : "usd"))}
      toMode={toMode} onToggleToMode={() => setToMode((m) => (m === "usd" ? "token" : "usd"))}
      fromUsd={fromUsd} fromUnits={fromUnits}
      toAmount={toAmount} toUsd={toUsd}
      fee={feeUsd} feeLoading={quoteLoading}
      slippage={slippage} onOpenSlippage={() => openMyMenuToSlippage()}
      canFlip={!!fromToken && !!toToken}
      onSwapTokens={() => { setFromToken(toToken); setToToken(fromToken); }}
      canSwap={!!fromToken && !!toToken && fromUnits > 0}
      isPristine={!fromToken && !toToken && Number(fromAmount) === 0}
      onReset={() => { setFromToken(null); setToToken(null); setFromAmount("0"); }}
      actionLabel={genAddr ? "Send from your wallet" : deriveLabel(fromToken, toToken)}
      onSubmit={() => myConnectOrExecute()}
      // *** present → generate-address available ***
      generateAddress={{
        enabled: genAddr,
        onToggle: (next) => { setGenAddr(next); if (!next) { setFromToken(null); setFromAmount("0"); } },
        receiveAddress: "0x71C7656EC7ab88b098defB751B7401B5f6d8976F",
        receivePayload: myEip681Uri,
        arena: fromToken?.logo,
      }}
      renderFromPicker={renderPicker}
      renderToPicker={renderPicker}
      renderMenu={(menu) => <MySettingsViews {...menu} slippage={slippage} onSlippageChange={setSlippage} />}
      onCopyAddress={(addr) => myToast(`Copied ${addr}`)}
    />
  );
}
```

## Usage — connected (no generate-address button)

Identical, except `generateAddress` is **omitted**:

```tsx
<SwapCard
  /* …same controlled props… */
  walletAddress={address}
  actionLabel={deriveLabel(fromToken, toToken)}
  onSubmit={() => myExecute(quote)}
  // *** generateAddress intentionally ABSENT → no receive view, no toggle ***
  renderFromPicker={renderPicker}
  renderToPicker={renderPicker}
  renderMenu={(menu) => <MySettingsViews {...menu} />}
/>
```

## Center-logo QR (optional)

`CryptoAddress` defaults to the dependency-free `<QrCode/>`. For a center asset logo, pass the `cuer` adapter (and install `cuer`):

```tsx
import { CryptoAddress } from "@joeblau/unified-ui";
import { cuerQr } from "@joeblau/unified-ui/cuer";

<CryptoAddress address={addr} arena={logo} renderQr={cuerQr} />;
```

## Exports

`SwapCard`, `SwapFrom`, `SwapTo` · `ActionRow`, `AppMenuShell`, `BottomSheet`, `SheetHeader`, `TokenTrigger`, `SettingsRow`, `SegmentedControl`, `ResizablePanel`, `Keypad`, `MobileKeypad` · `HapticButton`, `AppleBorderGradient`, `CryptoAddress`, `QrCode`, `TokenAmount`, `AmountInput`, `ConversionValue`, `Pill` · helpers `cn`, `formatPct`, `fmtUsd`, `price`, `computeTest`, `truncateAddress`, `formatTokenParts`, `trim`, `trimUsd`, `sanitizeAmount`, `applyAmountKey`, `sanitizePastedAmount`, `useMeasuredHeight`, `shouldUseHapticOverlay` · types `TokenRow`, `Mode`, `GenerateAddressConfig`, `PickerSlotApi`, `MenuSlotApi`, `TokenTriggerLabels`, `SwapCardLabels`, `SegmentOption`.

## Notes

- **Types ship from source.** The package `exports` resolve types to `./src`, so a TS-aware bundler gets full types directly. `bun run build` emits JS bundles (ESM + CJS); standalone `.d.ts` emit is disabled because this monorepo carries two `@types/react` majors that trip declaration generation — flip `dts` on in a deduped-types environment.
- **Haptics** are additive and iOS-WebKit only (`HapticButton` degrades to a plain button elsewhere).

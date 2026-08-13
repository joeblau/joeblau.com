# Hyperliquid Full Validator: Strategy Overview

## Strategy Overview

Custom latency-optimized execution on HIP-3 markets (primarily tokenized equities / indices via Bloxwap). Focus is on reducing end-to-end order-to-fill latency and capturing the fee stack more efficiently than standard retail or semi-pro flows.

## Execution Path

```flow
{
  "nodes": [
    { "id": "order", "label": "Order", "col": 0 },
    { "id": "routing", "label": "Node Routing", "col": 1 },
    { "id": "validator", "label": "Full Validator", "note": "~500 ms", "accent": true, "col": 2 },
    { "id": "hypercore", "label": "HyperCore", "col": 3 }
  ],
  "edges": [
    { "source": "order", "target": "routing" },
    { "source": "routing", "target": "validator" },
    { "source": "validator", "target": "hypercore" }
  ]
}
```

## Key Technical Edges

* **HIP-3 path optimization** — measured latency cut from ~5,000 ms → ~500 ms (90%+ reduction) via node-level routing, local book reconstruction, and priority-aware submission.
* **Fee stack** — 47% lower taker + 100% maker reduction relative to baseline, plus the extra ~20% staking discount from the 10k HYPE.
* **Execution layer** — sits on HyperCore order books with independent margining per HIP-3 DEX; no custody of the staked HYPE beyond the standard staking account mechanics.

| Metric | Baseline | With validator path |
| --- | ---: | ---: |
| Order-to-fill latency | ~5,000 ms | ~500 ms |
| Taker fees | baseline | 47% lower |
| Maker fees | baseline | 100% reduction |
| Staking discount (10k HYPE) | — | ~20% |

## Duration & Terms

* Initial test window: 2–4 weeks.
* Can extend if the edge holds; otherwise we unwind cleanly.
* HYPE stays in a staking account under standard Hyperliquid rules (7-day unstaking queue on exit). No lock beyond that.
* Position sizing and risk limits are conservative; full transparency on fills and PnL available.

## Next Steps

Happy to hop on a quick call or share more granular latency / fee data if useful. Let me know what would help you check internally.

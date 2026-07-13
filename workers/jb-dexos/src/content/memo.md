# A 24/7 Global Trading Operating System: The Next Evolution in Capital-Market Infrastructure

## Executive Summary

Global capital markets are at an important inflection point. Most traditional exchanges are still tied to legacy infrastructure and constrained trading hours, leaving liquidity fragmented and participants forced into time-zone misalignment. Recent projects have shown strong demand for continuous markets, but many remain too centralized and too geographically concentrated to be truly global.

We propose a different model: a purpose-built 24/7 trading operating system with 16 high-performance validators distributed across major financial hubs. This creates a system that combines institutional-grade speed with genuine geographic decentralization and sets a foundation for the next generation of market infrastructure.

## The Problem

Many exchanges still run on infrastructure designed for a previous era. Limited trading windows create liquidity gaps and force traders to work around fragmented schedules across time zones. At the same time, market infrastructure is increasingly concentrated in a small number of data centers, concentrating operational, political, and infrastructure risk.

That model is increasingly misaligned with a digital economy that operates across borders and around the clock.

## Hyperliquid

Hyperliquid has proven there is real demand for 24/7 markets, scaling to billions in daily volume very quickly. But it still relies on a tightly concentrated infrastructure footprint, with validators largely concentrated in one location, while also carrying trade-offs in latency versus established, co-located exchanges.

Our system aims to be the more decentralized and operationally resilient version of that model: fast exchange-grade execution with broader global distribution.

## Our Solution

We are building a purpose-built 24/7 Global Trading Operating System. Unlike a general-purpose blockchain, this network is designed as exchange infrastructure first, with decentralization built in.

We use a compact set of 16 high-performance nodes placed across major financial centers to deliver institutional-grade speed plus geographic resilience.

## Technical Architecture

The network uses a fixed validator set of 16 high-capacity nodes across key global geographies. Each node runs a purpose-built consensus protocol designed for low-latency trading. Leader election is geographically aware so the active leader is positioned to minimize latency for most traffic.

Throughput comes from a tightly engineered execution and networking stack:

* **SIMD execution** — vectorized instruction processing so each core validates and applies many transactions in parallel rather than one at a time.
* **Slab allocation** — pre-sized memory slabs keep account and order-book state cache-resident and eliminate per-transaction allocation overhead.
* **Compression** — aggressive on-the-wire and at-rest compression that keeps bandwidth and storage in check as volume scales.
* **Minimmit consensus** — a minimal-round-trip finality path that commits blocks in as few communication steps as possible across the 16-node set.

These run over **100 Gbps+ networking** between validators, so a small, elite node set can move enormous transaction volume at the low latencies co-located exchanges expect.

**The throughput math.** Let $C_{line}$ be the link capacity in bytes/s, $P$ the compressible order payload, $r$ the LZ4 compression ratio, $O$ the per-batch overhead (aggregated consensus + framing), and $B$ the orders per batch. The effective per-order wire cost and the resulting order-throughput ceiling on a single link are:

$$
W(B, r) = P\,r + \frac{O}{B}
\qquad
T \le \frac{C_{line}}{W(B, r)} = \frac{C_{line}}{P\,r + O/B}
$$

Over a DoubleZero **100 Gbit/s** link ($C_{line} = 12.5$ GB/s) with $P = 64$ B, $O = 145$ B, and a batch of $B = 64$ at raw LZ4 ($r = 1$), the effective cost is $W = 66.27$ B/order:

| Calculation | Result |
| --- | ---: |
| DoubleZero link | 100 Gbit/s |
| Byte capacity | 12.5 GB/s |
| DexOS raw wire cost | 66.27 B/order |
| Theoretical order-only capacity | 188.6M orders/s |

That is a single 100 Gbit/s link; larger batches and LZ4 push the order-only ceiling higher still:

| Batch $B$ | LZ4 ratio | Wire B/msg | 100 Gbit/s ceiling |
| ---: | ---: | ---: | ---: |
| 32 | 1.00 (raw) | 68.53 | 182.4M msg/s |
| 32 | 0.90 | 62.13 | 201.2M msg/s |
| 32 | 0.75 | 52.53 | 238.0M msg/s |
| 32 | 0.50 | 36.53 | 342.2M msg/s |
| 64 | 1.00 (raw) | 66.27 | 188.6M msg/s |
| 64 | 0.90 | 59.87 | 208.8M msg/s |
| 64 | 0.75 | 50.27 | 248.7M msg/s |
| 64 | 0.50 | 34.27 | 364.8M msg/s |
| 128 | 1.00 (raw) | 65.13 | 191.9M msg/s |
| 128 | 0.90 | 58.73 | 212.8M msg/s |
| 128 | 0.75 | 49.13 | 254.4M msg/s |
| 128 | 0.50 | 33.13 | 377.3M msg/s |

As $B$ grows the per-order overhead $O/B$ vanishes, so the asymptotic order-only ceiling is set by payload alone:

$$
T_{\max} = \lim_{B \to \infty} \frac{C_{line}}{P\,r + O/B} = \frac{C_{line}}{P\,r}
$$

At raw LZ4 ($r = 1$) that is $12.5\text{ GB/s} / 64\text{ B} \approx 195.3\text{M orders/s}$ per link, rising to $\approx 390\text{M}$ at $r = 0.5$ — throughput is never the binding constraint.

Built as a trading operating system, the protocol is intended to support spot, perpetuals, options, and additional market structures through native composability.

## Why This Wins

This approach creates a clear advantage: it combines institutional-grade speed with genuine 24/7 global access.

Legacy exchanges can match speed in some markets, but not always availability. Current 24/7 alternatives often accept broader centralization or higher latency. With only 16 validators, the network keeps communication and consensus overhead low, helping it compete on performance while retaining decentralization.

The result is a market layer that is fast, resilient, and open to global participation.

## The Ask

We are looking for a small group of partners to build this infrastructure with us:

* strategic capital
* world-class network connectivity
* deep liquidity partnerships
* native stablecoin integration

We are especially interested in speaking with:

* **Paradigm** for investment and ecosystem support
* **Circle** for native stablecoin settlement
* **DoubleZero** for primary open-fiber networking
* **Jump Trading** for liquidity provision
* **Chainalysis** for compliance and on-chain analytics

Early partners can help shape the foundation layer of 24/7 global markets and secure a leadership position as this infrastructure matures.

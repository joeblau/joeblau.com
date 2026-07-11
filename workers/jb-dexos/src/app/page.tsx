type Section = {
  heading: string;
  body: string[];
};

const SECTIONS: Section[] = [
  {
    heading: "Executive Summary",
    body: [
      "The global capital markets are entering their most significant architectural shift in decades. While traditional exchanges remain constrained by legacy infrastructure and limited trading hours, a massive opportunity exists to build the first truly 24/7, globally accessible trading operating system. Recent projects have validated explosive demand for continuous trading, yet they remain fundamentally centralized and geographically concentrated. Our approach solves this by deploying a small, elite set of 16 high-performance validators strategically placed across global financial hubs. This architecture delivers institutional-grade speed with true geographic decentralization, creating the foundation for the next generation of capital markets infrastructure.",
    ],
  },
  {
    heading: "The Problem",
    body: [
      "Global capital markets are still running on outdated infrastructure. Leading exchanges operate with restricted trading hours, creating artificial gaps in liquidity and forcing participants across time zones into inefficient, fragmented schedules. Even more concerning, market infrastructure has become dangerously centralized. A small number of data centers now control the majority of global trading volume, creating systemic single points of failure vulnerable to technical outages, regulatory intervention, and geographic concentration risk. This model is fundamentally incompatible with a 24/7 digital global economy.",
    ],
  },
  {
    heading: "Hyperliquid",
    body: [
      "Hyperliquid has clearly demonstrated explosive demand for 24/7 trading, scaling to billions in daily volume in a short time. However, it suffers from the worst of both worlds: it is effectively centralized, with nearly all validators running in a single AWS region in Tokyo, while remaining orders of magnitude slower than traditional co-located exchanges like Nasdaq. Our system is built to be what Hyperliquid should have been — the truly decentralized, high-performance version of the same vision.",
    ],
  },
  {
    heading: "Our Solution",
    body: [
      "Our solution is a purpose-built 24/7 Global Trading Operating System. Unlike general-purpose blockchains, this network is architected from the ground up as high-performance exchange infrastructure that happens to be decentralized. By deploying a carefully selected set of 16 high-powered nodes strategically placed across global financial centers, we combine institutional-grade speed with true geographic distribution.",
    ],
  },
  {
    heading: "Technical Architecture",
    body: [
      "We are building a custom high-performance network with a fixed validator set of 16 nodes, strategically located across key financial geographies. This small, elite set of high-powered machines will run a purpose-built consensus protocol optimized for speed and low latency. Leader election will be geographically aware, ensuring the network leader is always optimally positioned for the majority of traffic. The system is designed as a trading operating system first — capable of supporting spot, perpetuals, options, and other market structures through native composability.",
    ],
  },
  {
    heading: "Why This Wins",
    body: [
      "This architecture delivers a decisive advantage: the combination of institutional-grade speed and true 24/7 global access that no existing system currently offers. Traditional exchanges have the speed but lack continuous availability. Hyperliquid has continuous trading but lacks both speed and decentralization. By maintaining a small validator set of just 16 high-performance nodes, we achieve dramatically lower communication overhead and latency than networks with hundreds or thousands of validators. This allows us to compete directly with centralized infrastructure while offering the resilience, neutrality, and global accessibility that only decentralization can provide.",
    ],
  },
  {
    heading: "The Ask",
    body: [
      "We are seeking a small number of high-caliber partners who can help us build this next-generation market infrastructure. This includes strategic capital, world-class networking technology, deep liquidity partnerships, and stablecoin integration.",
      "We are particularly interested in speaking with Paradigm for investment and ecosystem support, Circle for native stablecoin settlement, DoubleZero for our primary open fiber networking layer, and Jump Trading for liquidity provision.",
      "By coming in early, partners will have the opportunity to shape the foundation layer of 24/7 global markets and secure strategic positioning in what we believe will become critical infrastructure.",
    ],
  },
];

export default function Home() {
  return (
    <main className="mx-auto max-w-2xl px-6 py-16 sm:py-24">
      <article>
        <header className="mb-12">
          <p className="mb-3 text-sm font-bold uppercase tracking-widest text-muted-foreground">
            DEXos
          </p>
          <h1 className="text-balance text-3xl font-extrabold leading-tight tracking-tight sm:text-4xl">
            A 24/7 Global Trading Operating System: The Next Evolution of
            Capital Markets
          </h1>
        </header>

        <div className="space-y-10">
          {SECTIONS.map((section) => (
            <section key={section.heading}>
              <h2 className="mb-3 text-xl font-bold tracking-tight">
                {section.heading}
              </h2>
              <div className="space-y-4">
                {section.body.map((paragraph, i) => (
                  <p
                    key={i}
                    className="text-pretty text-base leading-relaxed text-muted-foreground"
                  >
                    {paragraph}
                  </p>
                ))}
              </div>
            </section>
          ))}
        </div>
      </article>
    </main>
  );
}

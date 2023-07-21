enum BadgeSymbol {
  exit = "exit",
  crypto = "₿",
  angel = "$",
}

type SectionBadge = {
  symbol: BadgeSymbol;
  title: string;
};

type SectionItem = {
  title: string;
  description: string;
  link?: string;
  badge?: SectionBadge;
};
type CurriculumVitaeSection = {
  title: string;
  items: SectionItem[];
};

export const curriculumVitae: CurriculumVitaeSection[] = [
  {
    title: "Who",
    items: [
      {
        title: "Joe Blau",
        description: "Founder • Investor",
      },
    ],
  },
  {
    title: "founder",
    items: [
      {
        title: "FENIX",
        description: "Trustless yield protocol co-founder.",
        link: "https://fenix.fyi",
      },
      {
        title: "Atomize",
        description: "Web3 decentralized finance protocol co-founder.",
      },
      {
        title: "Doodle",
        description: "The drawing app where every line tells a story.",
        link: "https://doodle.app",
      },
      {
        title: "TeslaAPI",
        description: "Tesla API documentation.",
        link: "https://teslaapi.io",
      },
      {
        title: "gitignore.io",
        description: "Create useful .gitignore files for your project",
        link: "https://gitignore.io",
        badge: {
          symbol: BadgeSymbol.exit,
          title: "Sold to Toptal",
        },
      },
    ],
  },
  {
    title: "investor",
    items: [
      {
        title: "Phamous",
        description: "Perpetual futures Decentralized Exchange.",
        link: "https://phamous.io",
        badge: {
          symbol: BadgeSymbol.crypto,
          title: "crypto investment",
        },
      },
      {
        title: "XEN",
        description: "Token for onboarding the next billion users to crypto.",
        link: "https://xen.network",
        badge: {
          symbol: BadgeSymbol.crypto,
          title: "crypto investment",
        },
      },
      {
        title: "Safara",
        description: "Book 1M curated hotels and stays on Safara connected by a cashback rewards program.",
        link: "https://app.safara.com/referral/Joe-9",
        badge: {
          symbol: BadgeSymbol.angel,
          title: "angel investment",
        },
      },
      {
        title: "PulseX",
        description: "Spot Decentralized Exchange.",
        link: "https://pulsex.com",
        badge: {
          symbol: BadgeSymbol.crypto,
          title: "crypto investment",
        },
      },
      {
        title: "Pacto",
        description: "Square checkout for latin america.",
        link: "https://www.pacto.co",
        badge: {
          symbol: BadgeSymbol.angel,
          title: "angel investment",
        },
      },
      {
        title: "0xMacro",
        description: "Defi and Crypto for Smart Contract auditing.",
        link: "https://0xmacro.com",
        badge: {
          symbol: BadgeSymbol.angel,
          title: "angel investment",
        },
      },
      {
        title: "PulseChain",
        description: "Energy efficient, cheaper, faster, fee-burning Ethereum fork.",
        link: "https://pulsechain.com",
        badge: {
          symbol: BadgeSymbol.crypto,
          title: "crypto investment",
        },
      },
      {
        title: "Hairlooks",
        description: "Empowering communities of hairstylists and barbers to elevate their craft.",
        link: "http://www.thehairlooks.com",
        badge: {
          symbol: BadgeSymbol.angel,
          title: "angel investment",
        },
      },
      {
        title: "Mage.ai",
        description: "A product development collaborative AI application development tool.",
        link: "https://mage.ai",
        badge: {
          symbol: BadgeSymbol.angel,
          title: "angel investment",
        },
      },
      {
        title: "Assemble",
        description: "The future of compensation is data-driven, technology-enabled, and strategic.",
        link: "https://www.assemble.inc",
        badge: {
          symbol: BadgeSymbol.angel,
          title: "angel investment",
        },
      },
      {
        title: "HEX",
        description: "Blockchain certificate of deposit.",
        link: "https://hex.com",
        badge: {
          symbol: BadgeSymbol.crypto,
          title: "crypto investment",
        },
      },
      {
        title: "Flexport",
        description: "The freight forwarder for modern logistics teams.",
        link: "https://www.flexport.com",
        badge: {
          symbol: BadgeSymbol.angel,
          title: "angel investment",
        },
      },
      {
        title: "Ethereum",
        description: "World computer.",
        link: "https://ethereum.org",
        badge: {
          symbol: BadgeSymbol.crypto,
          title: "crypto investment",
        },
      },
    ],
  },
  {
    title: "Career",
    items: [
      {
        title: "Uber",
        description: "Uber Advanced Technology Group Self-Driving engineer.",
      },
      {
        title: "Amazon",
        description: "Amazon Register point of sale engineer.",
      },
      {
        title: "SAIC (Scitor)",
        description: "Defense Information Systems Agency Public Key Infrastructure engineer.",
      },
      {
        title: "Raytheon (BBN)",
        description: "Defense Advanced Research Projects Agency information systems security officer.",
      },
    ],
  },
  {
    title: "Open Source",
    items: [
      {
        title: "ZenPhones",
        description: "Turn iPhone ear buds into noise-canceling ear buds with phase inversion.",
      },
      {
        title: "Dust",
        description: "Ephemeral gesture interface built using multi-peer connectivity for the iPhone and iPad.",
      },
      {
        title: "Touch Visualizer",
        description: "Enhance presentations, videos and collaboration by visualizing touches.",
      },
      {
        title: "Full Screen Gestures",
        description: "New type of interactive gestures on iOS.",
      },
      {
        title: "Flappy Block",
        description: "iOS native re-creation of Flappy Bird using UIDynamics.",
      },
      {
        title: "JJBShort",
        description: "Bit.ly style URL shortener coding challenge for Getaround.",
      },
      {
        title: "Stop SOPA",
        description: "The Stop Online Piracy Act web browser plugin alerts you to which sites support SOPA.",
      },
    ],
  },
  {
    title: "Education",
    items: [
      {
        title: "First Round Capital Angel Track",
        description: "Curriculum, opportunity and community for exceptional emerging angels.",
      },
      {
        title: "Harvard Business School",
        description: "Executive Education Leadership / Executive Education Strategy.",
      },
      {
        title: "Virginia Tech",
        description: "Bachelors in Computer Science / Minor in Mathematics.",
      },
    ],
  },
  {
    title: "Contact",
    items: [
      {
        title: "im@joeblau.com",
        description: "Email",
        link: "mailto:im@joeblau.com",
      },
      {
        title: "+1.760.joe.blau",
        description: "Phone",
        link: "tel:+17605632528",
      },
    ],
  },
  {
    title: "Social",
    items: [
      {
        title: "Svbtle",
        description: "Blog",
        link: "https://blog.joeblau.com",
      },
      {
        title: "Github",
        description: "Code",
        link: "https://github.com/joeblau",
      },
      {
        title: "Twitter",
        description: "Thoughts",
        link: "https://twitter.com/joeblau",
      },
      {
        title: "AngelList",
        description: "Investing",
        link: "https://angel.co/joeblau",
      },
      {
        title: "Dribbble",
        description: "Design",
        link: "https://dribbble.com/joeblau",
      },
      {
        title: "Tesla",
        description: "referral",
        link: "https://ts.la/joe5702",
      },
    ],
  },
];

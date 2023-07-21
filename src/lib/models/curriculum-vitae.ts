enum SectionBadge {
  exit = "exit",
}

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
    title: "Investments",
    items: [
      {
        title: "Phamous",
        description: "Perpetual futures Decentralized Exchange.",
        link: "https://phamous.io",
      },
      {
        title: "Safara",
        description: "Book 1M curated hotels and stays on Safara connected by a cashback rewards program.",
        link: "https://www.safara.com",
      },

      {
        title: "PulseX",
        description: "Spot Decentralized Exchange.",
        link: "https://pulsex.com",
      },
      {
        title: "Pacto",
        description: "Square checkout for latin america.",
        link: "https://www.pacto.co",
      },
      {
        title: "0xMacro",
        description: "Defi and Crypto for Smart Contract auditing.",
        link: "https://0xmacro.com",
      },
      {
        title: "PulseChain",
        description: "Energy efficient, cheaper, faster, fee-burning Ethereum fork.",
        link: "https://pulsechain.com",
      },

      {
        title: "Hairlooks",
        description: "Empowering communities of hairstylists and barbers to elevate their craft.",
        link: "http://www.thehairlooks.com",
      },
      {
        title: "Mage.ai",
        description: "A product development collaborative AI application development tool.",
        link: "https://mage.ai",
      },
      {
        title: "Assemble",
        description: "The future of compensation is data-driven, technology-enabled, and strategic.",
        link: "https://www.assemble.inc",
      },
      {
        title: "Flexport",
        description: "The freight forwarder for modern logistics teams.",
        link: "https://www.flexport.com",
      },
      {
        title: "Ethereum",
        description: "World computer.",
        link: "https://ethereum.org",
      },
    ],
  },
  {
    title: "Career",
    items: [
      {
        title: "Atomize",
        description: "Web3 decentralized finance protocol co-founder.",
      },
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
        title: "FENIX",
        description: "A decentralized finance protocol for the future of money.",
        link: "https://fenix.fyi",
      },
      {
        title: "Doodle",
        description: "The drawing app where every line tells a story.",
        link: "https://doodle.app",
      },
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
        title: "First Round Capital",
        description: "Angel Track.",
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
    ],
  },
];

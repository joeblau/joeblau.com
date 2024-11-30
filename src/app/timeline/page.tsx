"use client";

import { useState, useEffect } from "react";
import {
  HoverCard,
  HoverCardContent,
  HoverCardTrigger,
} from "@/components/ui/hover-card";
import { cn } from "@/lib/utils";

const TimelineVis = () => {
  const years = Array.from({ length: 27 }, (_, i) => 1999 + i);
  const [activeHoverCard, setActiveHoverCard] = useState<number | null>(null);
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkIfMobile = () => {
      setIsMobile(window.innerWidth <= 768); // Adjust this breakpoint as needed
    };

    checkIfMobile();
    window.addEventListener('resize', checkIfMobile);

    return () => window.removeEventListener('resize', checkIfMobile);
  }, []);

  const data = [
    {
      name: "Founder",
      periods: [
        { start: 2021, end: 2025, roles: ["submap.com", "superdapp.com"] },
      ],
    },
    {
      name: "Investor",
      periods: [
        {
          start: 2017,
          end: 2025,
          roles: [
            "Ethereum",
            "Flexport",
            "HEX",
            "Assemble",
            "Mage.ai",
            "Hairlooks",
            "PulseChain",
            "0xmacro",
            "Pacto",
            "PulseX",
            "Safara",
            "XEN",
            "Phamous",
            "DEGEN",
          ],
        },
      ],
    },
    {
      name: "Blogging",
      periods: [{ start: 2014, end: 2025, roles: ["blog.joeblau.com"] }],
    },
    {
      name: "Crypto",
      periods: [
        {
          start: 2013,
          end: 2025,
          roles: ["Mining", "Trading", "Investing", "Building"],
        },
      ],
    },
    {
      name: "Mobile Eng",
      periods: [
        {
          start: 2007,
          end: 2025,
          roles: [
            "Vroomtrap",
            "Proxignos",
            "Conopsys",
            "COSTouchVisualizer",
            "Amazon Local Register",
            "Uber Self-Driving",
            "HEX Wallet",
            "Doodle"
          ],
        },
      ],
    },
    {
        name: "Systems Eng",
        periods: [
            { start: 2011, end: 2013, roles: ["Attensity", "Timeline Labs"]},
            { start: 2021, end: 2025, roles: ["Submap", "Superdapp"]}
        ]
    },
    {
        name: "Security Eng",
        periods: [{ start: 2004, end: 2011, roles: ["BBN", "SAIC"] }],
      },
    {
      name: "Web Eng",
      periods: [
        { start: 2000, end: 2004, roles: ["AIM profiles", "StarCraft Clan Site"] },
        { start: 2008, end: 2011, roles: ["vroomtrap.com"] },
        {
          start: 2022,
          end: 2025,
          roles: [
            "tokenlaunch.com",
            "atomize.xyz",
            "dehi.app",
            "xen.fyi",
            "fenix.fyi",
            "veblen.co",
            "superdapp.com",
          ],
        },
      ],
    },
    {
      name: "AI",
      periods: [
        {
          start: 2011,
          end: 2020,
          roles: ["Proxignos", "Conopsys", "Uber ATG", "Uber AI"],
        },
      ],
    },
    {
      name: "Open Source",
      periods: [{ start: 2011, end: 2018, roles: ["gitignore.io", "Touch Visualizer"] }],
    },

    {
      name: "Sales",
      periods: [
        { start: 2002, end: 2003, roles: ["Cutco"] },
        { start: 2005, end: 2009, roles: ["Quixtar/Amway"] },
      ],
    },
    {
      name: "Music",
      periods: [
        { start: 2001, end: 2009, roles: ["Bling Blau Entertainment"] },
      ],
    },
    {
      name: "Food Service",
      periods: [
        {
          start: 2001,
          end: 2003,
          roles: ["Pizza Hut", "Chick-fil-A", "Cinnabon"],
        },
      ],
    },
    {
      name: "Graduate",
      periods: [
        { start: 2017, end: 2019, roles: ["Harvard Business School - MBA"] },
      ],
    },
    {
      name: "Undergraduate",
      periods: [
        {
          start: 1999,
          end: 2003,
          roles: [
            "Virginia Tech - BS Computer Science",
            "Virginia Tech - Minor Mathematics",
          ],
        },
      ],
    },
  ];

  const getBarWidth = (start: number, end: number) => {
    const startYear = Math.max(start, 1999);
    const endYear = Math.min(end, 2025);
    return `${((endYear - startYear) / 26) * 100}%`;
  };

  const getBarOffset = (start: number) => {
    const startYear = Math.max(start, 1999);
    return `${((startYear - 1999) / 26) * 100}%`;
  };

  const handleInteraction = (index: number) => {
    if (isMobile) {
      if (activeHoverCard === index) {
        setActiveHoverCard(null);
      } else {
        setActiveHoverCard(index);
      }
    }
  };

  return (
    <div className="w-full max-w-6xl mx-auto p-6">
      <div className="mb-8 overflow-x-auto">
        {/* Year labels */}
        <div className="flex mb-4 text-sm ml-32">
          {years.map((year) => (
            <div
              key={year}
              className={cn(
                "flex-1 text-center font-mono text-muted-foreground",
                {
                  "hidden md:block": year % 3 === 0,
                  "hidden lg:block": year % 2 === 0,
                  "hidden xl:block": year % 1 === 0,
                  block: year % 5 === 0,
                }
              )}
            >
              {year.toString().slice(2)}
            </div>
          ))}
        </div>

        {/* Timeline rows */}
        <div className="space-y-4">
          {data.map((row, rowIndex) => (
            <div key={rowIndex} className="flex items-center">
              <div className="w-32 pr-4 font-medium text-muted-foreground">
                {row.name}
              </div>
              <div className="flex-1 h-4 relative bg-secondary rounded-2xl">
                {row.periods.map((period, periodIndex) => {
                  const index = rowIndex * 100 + periodIndex;
                  return (
                    <HoverCard key={periodIndex} open={isMobile ? activeHoverCard === index : undefined} openDelay={0} closeDelay={0}>
                      <HoverCardTrigger asChild>
                        <button
                          className="absolute h-full bg-muted-foreground rounded-2xl"
                          style={{
                            width: getBarWidth(period.start, period.end),
                            left: getBarOffset(period.start),
                          }}
                          onClick={() => handleInteraction(index)}
                        />
                      </HoverCardTrigger>
                      <HoverCardContent className="w-64">
                        <div className="space-y-1">
                          <p className="text-sm font-medium">{row.name}</p>
                          <p className="text-sm">{`${period.start} - ${period.end}`}</p>
                          {period.roles && (
                            <ul className="text-sm list-disc list-inside">
                              {period.roles.map((item, i) => (
                                <li key={i}>{item}</li>
                              ))}
                            </ul>
                          )}
                        </div>
                      </HoverCardContent>
                    </HoverCard>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default TimelineVis;

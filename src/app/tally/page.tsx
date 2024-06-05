"use client";

import Image from "next/image";
import { Button } from "@/components/ui/button";
import Link from "next/link";

const Hero = () => {
  return (
    <div className="absolute right-0 top-0 w-screen h-screen overflow-hidden">
      <div className="relative place-content-start lg:place-content-center h-full flex-col bg-muted text-black flex dark:border-r">
        <Image
          src="/images/background.png"
          alt="house"
          sizes="100%"
          fill
          style={{ objectFit: "cover" }}
          className="animate-fade-1"
          priority
        />

        <div className="z-30 flex flex-col items-center pt-8 lg:pt-0 animate-fade-3">
          <div className="pb-4 text-5xl font-bold text-center">Tally</div>
          <div className="pb-4 font-semibold font-mono">Tally Counter List</div>
          <div className="pb-2 flex space-x-4">
            <Button asChild disabled>
              <Link href="https://itunes.apple.com/app/id6503914304"> Download On AppStore</Link>
            </Button>
          </div>
          <div className="w-80">
            <Image
              src="/images/tally.png"
              alt="tally"
              width={1170}
              height={2532}
              style={{ objectFit: "contain" }}
              priority
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default Hero;

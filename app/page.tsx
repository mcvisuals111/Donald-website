import { Hero } from "@/components/sections/Hero";
import { TickerTape } from "@/components/TickerTape";
import { WhatWeTrade } from "@/components/sections/WhatWeTrade";
import { HowItWorks } from "@/components/sections/HowItWorks";
import { Pricing } from "@/components/sections/Pricing";
import { About } from "@/components/sections/About";
import { WhatThisIsnt } from "@/components/sections/WhatThisIsnt";
import { Booking } from "@/components/sections/Booking";
import { heroBars } from "@/lib/chart-data";

export default function Home() {
  return (
    <>
      <Hero bars={heroBars} />
      <TickerTape />
      <div className="space-y-16 pt-16 sm:space-y-28 sm:pt-28">
        <WhatWeTrade />
        <HowItWorks />
        <Pricing />
        <About />
        <WhatThisIsnt />
        <Booking />
      </div>
    </>
  );
}

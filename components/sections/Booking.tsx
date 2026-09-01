import { Reveal, RevealItem } from "@/components/motion/Reveal";
import { SectionHeading } from "./SectionHeading";
import { CalEmbed } from "@/components/CalEmbed";
import { CAL_LINK } from "@/lib/site";

export function Booking() {
  return (
    <section
      id="book"
      aria-labelledby="book-title"
      className="mx-auto w-full max-w-[1120px] scroll-mt-24 px-5 sm:px-8"
    >
      <Reveal>
        <SectionHeading
          id="book"
          title="Book a lesson"
          sub="Pick a time that works. You'll get a confirmation with the location."
        />
        <RevealItem className="mt-10">
          <CalEmbed calLink={CAL_LINK} />
        </RevealItem>
      </Reveal>
    </section>
  );
}

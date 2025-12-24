import Hero from "@/components/sections/Hero";
import Experiences from "@/components/sections/Experiences";
import Snacks from "@/components/sections/Snacks";
import WhyChooseUs from "@/components/sections/WhyChooseUs";
import CTA from "@/components/sections/CTA";

export default function Home() {
  return (
    <main className="min-h-screen">
      <Hero />
      <Experiences />
      <Snacks />
      <WhyChooseUs />
      <CTA />
    </main>
  );
}

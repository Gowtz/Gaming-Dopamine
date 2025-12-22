import Navbar from "@/components/Navbar";
import Hero from "@/components/sections/Hero";
import Experiences from "@/components/sections/Experiences";
import Snacks from "@/components/sections/Snacks";
import WhyChooseUs from "@/components/sections/WhyChooseUs";
import CTA from "@/components/sections/CTA";
import Footer from "@/components/Footer";

export default function Home() {
  return (
    <main className="min-h-screen">
      <Navbar />
      <Hero />
      <Experiences />
      <Snacks />
      <WhyChooseUs />
      <CTA />
      <Footer />
    </main>
  );
}

import Header from "@/components/Header";
import Hero from "@/components/Hero";
import OrganisersMarquee from "@/components/OrganisersMarquee";
import TodayEvents from "@/components/TodayEvents";
import ThisMonthSection from "@/components/this-month/ThisMonthSection";
import EventCategories from "@/components/EventCategories";
import LiveMusicWeekend from "@/components/weekend/LiveMusicWeekend";
import EverythingOnMarquee from "@/components/EverythingOnMarquee";
import BrandPromise from "@/components/BrandPromise";
import Footer from "@/components/Footer";

export default function Home() {
  return (
    <>
      <Header />
      <main className="flex-1">
        <Hero />
        <OrganisersMarquee />
        <section className="px-5 pt-9 pb-4 lg:mx-auto lg:max-w-[1280px] lg:px-20 lg:pt-12 lg:pb-6">
          <TodayEvents />
        </section>
        <ThisMonthSection />
        <EventCategories />
        <LiveMusicWeekend />
        <EverythingOnMarquee />
        <BrandPromise />
      </main>
      <Footer />
    </>
  );
}

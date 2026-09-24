import Header from "@/components/Header";
import Hero from "@/components/Hero";
import TodayEvents from "@/components/TodayEvents";
import ThisMonthSection from "@/components/this-month/ThisMonthSection";
import EventCategories from "@/components/EventCategories";
import LiveMusicWeekend from "@/components/weekend/LiveMusicWeekend";
import EverythingOnMarquee from "@/components/EverythingOnMarquee";
import OrganisersMarquee from "@/components/OrganisersMarquee";
import CreateEventCta from "@/components/CreateEventCta";
import BrandPromise from "@/components/BrandPromise";
import Footer from "@/components/Footer";

export default function Home() {
  return (
    <>
      <Header />
      <main className="flex-1">
        <Hero />
        <TodayEvents />
        <ThisMonthSection />
        <EventCategories />
        <LiveMusicWeekend />
        <EverythingOnMarquee />
        <OrganisersMarquee />
        <CreateEventCta />
        <BrandPromise />
      </main>
      <Footer />
    </>
  );
}

import type { Metadata } from "next";
import AuthFlow from "@/components/auth/AuthFlow";
import PageShell from "@/components/PageShell";
import { getCities } from "@/lib/api";

export const metadata: Metadata = {
  title: "Complete Your Profile | CityTales",
};

export default async function CompleteProfilePage() {
  const cities = await getCities();
  return (
    <PageShell>
      <AuthFlow mode="complete-profile" initialCities={cities} />
    </PageShell>
  );
}

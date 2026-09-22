import type { Metadata } from "next";
import AuthFlow from "@/components/auth/AuthFlow";
import PageShell from "@/components/PageShell";
import { getCities } from "@/lib/api";

export const metadata: Metadata = {
  title: "Log in or Sign up | CityTales",
};

export default async function LoginPage() {
  const cities = await getCities();
  return (
    <PageShell>
      <AuthFlow mode="login" initialCities={cities} />
    </PageShell>
  );
}

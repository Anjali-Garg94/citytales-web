import { redirect } from "next/navigation";

/** Legacy route — This Week feed lives at /explore-events?from=this-week. */
export default function ThisWeekPage() {
  redirect("/explore-events?from=this-week");
}

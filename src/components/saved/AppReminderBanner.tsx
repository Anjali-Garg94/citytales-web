import { BellIcon } from "@/components/Icons";
import { APP_STORE } from "@/lib/apps";

/** Saved Events banner nudging people to the app for saved-event reminders. */
export default function AppReminderBanner() {
  return (
    <div className="mt-5 flex items-center gap-3.5 rounded-[14px] border border-line bg-white px-4 py-3.5 lg:gap-4 lg:px-5 lg:py-4">
      <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-accent/10 text-accent">
        <BellIcon className="h-5 w-5" />
      </span>
      <div className="min-w-0 flex-1">
        <p className="text-[14px] font-semibold text-ink lg:text-[15px]">Never miss a saved event</p>
        <p className="mt-0.5 text-[12.5px] leading-[1.45] text-ink-soft lg:text-[13px]">
          The CityTales app reminds you before each one starts.
        </p>
      </div>
      <a
        href={APP_STORE.url}
        target="_blank"
        rel="noopener noreferrer"
        aria-label={`Get ${APP_STORE.name} on the App Store`}
        className="shrink-0 rounded-full bg-ink px-4 py-2 text-[12.5px] font-semibold text-bg no-underline transition hover:bg-accent"
      >
        Get the app
      </a>
    </div>
  );
}

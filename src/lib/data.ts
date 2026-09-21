export type Organiser = { name: string; image: string };

export const organiserColumns: Organiser[][] = [
  [
    { name: "Kylin Skybar", image: "/images/organisers/kylin-skybar.jpg" },
    { name: "Elgin Cafe", image: "/images/organisers/elgin-cafe.jpg" },
    { name: "Kultura", image: "/images/organisers/kultura.jpg" },
    { name: "Ouzo", image: "/images/organisers/ouzo.jpg" },
  ],
  [
    { name: "Speaking Souls", image: "/images/organisers/speaking-souls.jpg" },
    { name: "Kaaraj Collective", image: "/images/organisers/kaaraj-collective.jpg" },
    { name: "Ojus Club", image: "/images/organisers/ojus-club.jpg" },
    { name: "Commune Punjab", image: "/images/organisers/commune-punjab.jpg" },
  ],
  [
    { name: "HOL by Aakriti & Anushka", image: "/images/organisers/hol-aakriti-anushka.jpg" },
    { name: "Ananda Sangha Ludhiana", image: "/images/organisers/ananda-sangha.jpg" },
    { name: "Leela Arts By Vishakha", image: "/images/organisers/leela-arts-vishakha.jpg" },
    { name: "TaalStudios", image: "/images/organisers/taalstudios.jpg" },
  ],
];

export type TodayEvent = {
  id?: string;
  time: string;
  image: string;
  category: string;
  title: string;
  venue: string;
};

export const todayEvents: TodayEvent[] = [
  {
    time: "7:00 AM",
    image: "/images/events/port-cycle.jpg",
    category: "CLUBS",
    title: "Cycling Club Morning Ride",
    venue: "Sherpur Chowk → Sidhwan Canal",
  },
  {
    time: "11:00 AM",
    image: "/images/events/port-market.jpg",
    category: "ACTIVITIES",
    title: "Sunday Farmers' Market",
    venue: "Partap Bagh Grounds",
  },
  {
    time: "4:30 PM",
    image: "/images/events/feat-gallery.jpg",
    category: "EXHIBITIONS",
    title: "Contemporary Punjabi Art",
    venue: "Nehru Rose Garden Gallery",
  },
  {
    time: "6:00 PM",
    image: "/images/events/port-vinyl.jpg",
    category: "ACTIVITIES",
    title: "Vinyl & Coffee Pop-up",
    venue: "Sarabha Nagar Market",
  },
  {
    time: "8:30 PM",
    image: "/images/events/port-mic.jpg",
    category: "CLUBS",
    title: "Open Mic Comedy Night",
    venue: "BRS Nagar Community Hall",
  },
];

export type WeekEvent = {
  image: string;
  title: string;
  category: string;
  venue: string;
  date: string;
};

export const thisWeekEvents: WeekEvent[] = [
  { image: "/images/events/grid-a.jpg", title: "Startup Founders Meetup", category: "Clubs", venue: "PAU Auditorium", date: "Tue, 16 Sept" },
  { image: "/images/events/grid-b.jpg", title: "Diwali Craft Bazaar", category: "Activities", venue: "Model Town Extension", date: "Wed, 17 Sept" },
  { image: "/images/events/grid-e.jpg", title: "Live Jazz & Wine Night", category: "Clubs", venue: "Ferozepur Rd Rooftop", date: "Thu, 18 Sept" },
  { image: "/images/events/grid-d.jpg", title: "Weekend Pottery Workshop", category: "Workshop", venue: "Sarabha Nagar Studio", date: "Fri, 19 Sept" },
  { image: "/images/events/grid-h.jpg", title: "Heritage Walk: Old Town", category: "Activities", venue: "Chaura Bazaar", date: "Sat, 20 Sept" },
  { image: "/images/events/grid-f.jpg", title: "Young Printmakers Showcase", category: "Exhibitions", venue: "Fine Arts College Gallery", date: "Sun, 21 Sept" },
];

export type Category = {
  image: string;
  label: string[];
  icon: "sparkle" | "camera" | "gallery" | "mic" | "smile" | "heart" | "people" | "compass";
  gradientOpacity?: number;
};

export const categories: Category[] = [
  { image: "/images/events/hero-wide.jpg", label: ["Festive &", "Seasonal"], icon: "sparkle" },
  { image: "/images/events/feat-dusk.jpg", label: ["Music &", "Parties"], icon: "camera" },
  { image: "/images/events/cat-exhibitions.jpg", label: ["Exhibition"], icon: "gallery" },
  { image: "/images/events/grid-e.jpg", label: ["Live Show"], icon: "mic" },
  { image: "/images/events/cat-activities.jpg", label: ["Kids &", "Families"], icon: "smile" },
  { image: "/images/events/grid-g.jpg", label: ["Health &", "Wellness"], icon: "heart" },
  { image: "/images/events/cat-clubs.jpg", label: ["Community", "Clubs"], icon: "people" },
  { image: "/images/events/grid-a.jpg", label: ["Workshop &", "Activities"], icon: "compass" },
];

export type FeaturedEvent = {
  image: string;
  eyebrow: string;
  title: string;
  meta: string;
  height: "tall" | "medium";
};

export const featuredEvents: FeaturedEvent[] = [
  {
    image: "/images/events/hero-wide.jpg",
    eyebrow: "Activities · City-wide",
    title: "City Half Marathon",
    meta: "Sun, 21 Sept · 6:00 AM — Partap Bagh",
    height: "tall",
  },
  {
    image: "/images/events/feat-dusk.jpg",
    eyebrow: "Clubs · Spoken Word",
    title: "Doaba Kavi Sammelan — An Evening of Punjabi Poetry",
    meta: "Fri, 19 Sept · 7:00 PM — Vyapar Kendra Rooftop",
    height: "medium",
  },
  {
    image: "/images/events/feat-gallery.jpg",
    eyebrow: "Exhibitions · On View",
    title: "Lines & Layers: Contemporary Punjabi Art",
    meta: "Through 30 Sept — Nehru Rose Garden Gallery",
    height: "medium",
  },
];

export type BrowseSection = {
  image: string;
  title: string;
  description: string;
};

export const browseSections: BrowseSection[] = [
  { image: "/images/events/cat-clubs.jpg", title: "Clubs", description: "Running crews, supper clubs, book circles" },
  { image: "/images/events/cat-activities.jpg", title: "Activities", description: "Markets, workshops, walks, meetups" },
  { image: "/images/events/cat-exhibitions.jpg", title: "Exhibitions", description: "Art, photography, design on view" },
];

export type GridEvent = {
  image: string;
  category: string;
  title: string;
  venue: string;
  tall?: boolean;
};

export const eventGrid: GridEvent[] = [
  { image: "/images/events/grid-a.jpg", category: "Clubs", title: "Startup Founders Meetup", venue: "PAU Auditorium" },
  { image: "/images/events/grid-b.jpg", category: "Activities", title: "Diwali Craft Bazaar", venue: "Model Town Extension", tall: true },
  { image: "/images/events/grid-d.jpg", category: "Exhibitions", title: "Handloom & Phulkari Exhibit", venue: "Punjab Kala Bhawan" },
  { image: "/images/events/grid-c.jpg", category: "Clubs", title: "Sunday Football Pickup", venue: "GNE Ground" },
  { image: "/images/events/grid-e.jpg", category: "Clubs", title: "Live Jazz & Wine Night", venue: "Ferozepur Rd Rooftop" },
  { image: "/images/events/grid-h.jpg", category: "Activities", title: "Heritage Walk: Old Town", venue: "Chaura Bazaar", tall: true },
  { image: "/images/events/grid-f.jpg", category: "Exhibitions", title: "Young Printmakers Showcase", venue: "Fine Arts College" },
  { image: "/images/events/grid-g.jpg", category: "Activities", title: "Night Market: Street Food", venue: "Model Town Market" },
];

export const navLinks = [
  { label: "Today", href: "/today" },
  { label: "Clubs", href: "/clubs" },
  { label: "Activities", href: "/activities" },
  { label: "Exhibitions", href: "/exhibitions" },
  { label: "About", href: "/about" },
];

import { useCallback, useEffect, useRef, useState, type ComponentType } from "react";
import {
  Activity,
  ArrowRight,
  BadgeCheck,
  Check,
  ChevronLeft,
  ChevronRight,
  Crown,
  HeartHandshake,
  Instagram,
  Leaf,
  LockKeyhole,
  MapPin,
  Menu,
  MessageCircle,
  PersonStanding,
  Phone,
  Sparkles,
  Tag,
  X,
} from "lucide-react";
import { HeroSlider } from "@/components/hero-slider";
import { ConsultationForm } from "@/components/consultation-form";
import { CLINIC_DETAILS, clinicMedia } from "@/lib/constants";
import { LANDING_PAGE_VARIANTS, type LandingPageKey } from "@/lib/page-variants";

type Icon = ComponentType<{ className?: string; "aria-hidden"?: boolean }>;

const actionItems: Array<{
  title: string;
  note: string;
  label: string;
  href: string;
  icon: Icon;
  accent: string;
  external?: boolean;
}> = [
  {
    title: "Chat on WhatsApp",
    note: "Quick response from our care team",
    label: "Chat now",
    href: CLINIC_DETAILS.whatsappUrl,
    icon: MessageCircle,
    accent: "text-[#25D366] bg-[#25D366]/10",
    external: true,
  },
  {
    title: "Get Location",
    note: "Open our clinic location on Google Maps",
    label: "View Map",
    href: CLINIC_DETAILS.googleMapsUrl === "PASTE_GOOGLE_MAPS_URL_HERE" ? "#location" : CLINIC_DETAILS.googleMapsUrl,
    icon: MapPin,
    accent: "text-[#c58a18] bg-[#c58a18]/10",
    external: CLINIC_DETAILS.googleMapsUrl !== "PASTE_GOOGLE_MAPS_URL_HERE",
  },
  {
    title: "Call Now",
    note: "Speak directly with our care team",
    label: "Call now",
    href: CLINIC_DETAILS.phoneUri,
    icon: Phone,
    accent: "text-[#063b28] bg-[#063b28]/10",
  },
];

const careOptions = [
  { key: "ayurveda" as const, label: "Ayurveda", copy: "Ask about available Ayurveda services before planning your visit.", icon: Leaf },
  { key: "physiotherapy" as const, label: "Physiotherapy", copy: "Ask about physiotherapy services and consultation availability.", icon: Activity },
  { key: "rehabilitation" as const, label: "Rehab", copy: "Discuss rehabilitation services and your individual care goals.", icon: HeartHandshake },
];

const services = [
  {
    key: "ayurveda" as const,
    number: "01",
    title: "Ayurveda",
    description: "Explore available Ayurveda services in a calm, considered setting and ask the clinic what may suit your needs.",
    points: [
      "Ayurveda service enquiries",
      "Discuss your care needs",
      "Ask about current availability",
      "Plan your clinic visit",
    ],
    cta: "Ask about Ayurveda",
    icon: Leaf,
    image: "/punar-axis-hero-05-1280.webp",
    imageLabel: "Punar Axis Therapy Ayurveda room with traditional therapy equipment",
  },
  {
    key: "physiotherapy" as const,
    number: "02",
    title: "Physiotherapy",
    description: "Ask about physiotherapy services, availability and the consultation process at the Sector 141 clinic.",
    points: [
      "Physiotherapy service enquiries",
      "Discuss your care needs",
      "Ask about current availability",
      "Plan your clinic visit",
    ],
    cta: "Ask about Physiotherapy",
    icon: Activity,
    image: "/punar-axis-hero-02-1280.webp",
    imageLabel: "Punar Axis Therapy physiotherapy room with treatment machines and therapy beds",
  },
  {
    key: "rehabilitation" as const,
    number: "03",
    title: "Rehab",
    description: "Ask about rehabilitation services, availability and next steps before planning your clinic visit.",
    points: [
      "Rehab service enquiries",
      "Discuss your care needs",
      "Ask about current availability",
      "Plan your clinic visit",
    ],
    cta: "Ask about Rehab",
    icon: HeartHandshake,
    image: "/punar-axis-hero-04-1280.webp",
    imageLabel: "Punar Axis Therapy clinic therapy room",
  },
];

const testimonials = [
  {
    name: "Aman Sharma",
    copy: "Physiotherapy and Ayurveda together is really convenient. Ab dono ke liye alag-alag places visit nahi karni padti, which makes regular care much easier.",
  },
  {
    name: "Priya Gupta",
    copy: "The care feels very professional and thoughtful. Meri concerns ko properly understand karke therapies aur guidance explain ki gayi, which made the experience very reassuring.",
  },
  {
    name: "Rahul Verma",
    copy: "I was looking for both physiotherapy and Ayurveda without having to visit different places. Having both options under one roof is genuinely convenient.",
  },
  {
    name: "Neha Sharma",
    copy: "Having physiotherapy and Ayurveda in one place makes things much more practical. Alag-alag appointments aur locations manage karne ki hassle kaafi kam ho jaati hai.",
  },
  {
    name: "Rohit Kumar",
    copy: "I was looking for Ayurvedic care closer to Noida. Having these therapies available in Sector 141 makes regular sessions much more convenient.",
  },
  {
    name: "Anjali Agarwal",
    copy: "The care felt personalised and well planned. Meri concerns ko properly understand karke treatment options aur guidance di gayi, which made the overall experience comfortable.",
  },
  {
    name: "Karan Yadav",
    copy: "The team was professional and the environment was comfortable. Everything was explained properly and the overall experience felt well organised.",
  },
  {
    name: "Sneha Jain",
    copy: "I was looking for physiotherapy near Sector 141 and found Punar Axis Therapy. The team took time to understand my concern and explain the treatment approach clearly.",
  },
  {
    name: "Vikas Bansal",
    copy: "Good option for Ayurveda in Noida. The overall environment is peaceful and the approach feels quite personalised rather than rushed.",
  },
  {
    name: "Pooja Arora",
    copy: "Having Ayurveda and physiotherapy under one roof is a big convenience. Especially when you need different types of care, it saves a lot of time and effort.",
  },
];

const faqs = [
  ["What services does Punar Axis Therapy provide?", "Punar Axis Therapy provides Ayurveda, physiotherapy and rehabilitation services from its clinic in Sector 141, Noida."],
  ["Where is Punar Axis Therapy located?", "The clinic is at First Floor, SH-38, Sector 141, Noida, Uttar Pradesh 201309. Use the map link on this page for directions."],
  ["How do I book a consultation?", "You can start a consultation request through the booking form, call +91 87965 20257, or message the clinic on WhatsApp."],
  ["What happens during an initial consultation?", "The care team can discuss your concerns, understand your needs and explain suitable care options before you decide on the next step."],
  ["Should I contact the clinic before visiting?", "Yes. Call or message the clinic before travelling so the team can confirm availability and help you plan your visit."],
];

function GoogleMark() {
  return (
    <svg className="google-mark" viewBox="0 0 24 24" role="img" aria-label="Google logo">
      <path fill="#4285F4" d="M21.35 12.27c0-.79-.07-1.55-.22-2.27H12v4.3h5.24a4.48 4.48 0 0 1-1.94 2.94v2.45h3.15c1.85-1.7 2.9-4.2 2.9-7.42Z" />
      <path fill="#34A853" d="M12 21.75c2.65 0 4.87-.88 6.5-2.38l-3.15-2.45c-.87.58-1.98.92-3.35.92-2.57 0-4.75-1.74-5.53-4.08H3.22v2.53A9.82 9.82 0 0 0 12 21.75Z" />
      <path fill="#FBBC05" d="M6.47 13.76a5.9 5.9 0 0 1 0-3.52V7.71H3.22a9.75 9.75 0 0 0 0 8.58l3.25-2.53Z" />
      <path fill="#EA4335" d="M12 6.16c1.45 0 2.75.5 3.77 1.48l2.83-2.83C16.87 3.22 14.65 2.25 12 2.25a9.82 9.82 0 0 0-8.78 5.46l3.25 2.53C7.25 7.9 9.43 6.16 12 6.16Z" />
    </svg>
  );
}

function BrandMark() {
  return (
    <a href="#home" className="brand-lockup group flex items-center" aria-label="Punar Axis Therapy home">
      <img src={CLINIC_DETAILS.logoSrc} alt="Punar Axis Therapy" className="brand-combined-logo" loading="eager" decoding="async" />
    </a>
  );
}

export default function Home({ page = "home" }: { page?: LandingPageKey }) {
  const pageConfig = LANDING_PAGE_VARIANTS[page];
  const orderedCareOptions = pageConfig.serviceOrder.flatMap((key) => careOptions.filter((option) => option.key === key));
  const orderedServices = pageConfig.serviceOrder.flatMap((key) => services.filter((service) => service.key === key));
  const [menuOpen, setMenuOpen] = useState(false);
  const [showStickyActions, setShowStickyActions] = useState(false);
  const [testimonialsPaused, setTestimonialsPaused] = useState(false);
  const testimonialScroller = useRef<HTMLDivElement>(null);
  const directionsHref = CLINIC_DETAILS.googleMapsUrl === "PASTE_GOOGLE_MAPS_URL_HERE" ? "#location" : CLINIC_DETAILS.googleMapsUrl;

  useEffect(() => {
    if (page === "home") return;

    const previousTitle = document.title;
    const previousValues = new Map<Element, Map<string, string | null>>();
    const createdElements: Element[] = [];
    const setAttribute = (element: Element, attribute: string, value: string) => {
      let elementValues = previousValues.get(element);
      if (!elementValues) {
        elementValues = new Map();
        previousValues.set(element, elementValues);
      }
      if (!elementValues.has(attribute)) elementValues.set(attribute, element.getAttribute(attribute));
      element.setAttribute(attribute, value);
    };
    const setMeta = (selector: string, attributes: Record<string, string>) => {
      let element = document.head.querySelector(selector);
      if (!element) {
        element = document.createElement("meta");
        document.head.appendChild(element);
        createdElements.push(element);
      }
      Object.entries(attributes).forEach(([attribute, value]) => setAttribute(element!, attribute, value));
    };

    document.title = pageConfig.title;
    setMeta('meta[name="robots"]', { name: "robots", content: pageConfig.robots });
    setMeta('meta[name="description"]', { name: "description", content: pageConfig.description });
    setMeta('meta[property="og:title"]', { property: "og:title", content: pageConfig.title });
    setMeta('meta[property="og:description"]', { property: "og:description", content: pageConfig.description });
    setMeta('meta[property="og:url"]', { property: "og:url", content: pageConfig.canonical });
    setMeta('meta[name="twitter:title"]', { name: "twitter:title", content: pageConfig.title });
    setMeta('meta[name="twitter:description"]', { name: "twitter:description", content: pageConfig.description });

    const canonical = document.head.querySelector('link[rel="canonical"]');
    if (canonical) setAttribute(canonical, "href", pageConfig.canonical);

    const jsonLdScript = document.head.querySelector<HTMLScriptElement>('script[data-site-jsonld="true"]');
    const originalJsonLd = jsonLdScript?.textContent ?? null;
    if (jsonLdScript) {
      try {
        const jsonLd = JSON.parse(jsonLdScript.textContent ?? "{}");
        const webpage = jsonLd["@graph"]?.find((entity: { "@type"?: string; }) => entity["@type"] === "WebPage");
        if (webpage) {
          webpage["@id"] = `${pageConfig.canonical}#webpage`;
          webpage.url = pageConfig.canonical;
          webpage.name = pageConfig.title;
          webpage.description = pageConfig.description;
          jsonLdScript.textContent = JSON.stringify(jsonLd);
        }
      } catch {
        // Keep the static business graph if a future edit makes it unparsable.
      }
    }

    return () => {
      document.title = previousTitle;
      previousValues.forEach((attributes, element) => {
        attributes.forEach((value, attribute) => {
          if (value === null) element.removeAttribute(attribute);
          else element.setAttribute(attribute, value);
        });
      });
      createdElements.forEach((element) => element.remove());
      if (jsonLdScript && originalJsonLd !== null) jsonLdScript.textContent = originalJsonLd;
    };
  }, [page, pageConfig]);

  useEffect(() => {
    const handleScroll = () => setShowStickyActions(window.scrollY > 620);
    handleScroll();
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    if (testimonialsPaused || window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    const interval = window.setInterval(() => {
      const scroller = testimonialScroller.current;
      if (!scroller) return;

      const card = scroller.querySelector<HTMLElement>(".testimonial-card");
      const gap = Number.parseFloat(window.getComputedStyle(scroller).columnGap || "16") || 16;
      const step = (card?.getBoundingClientRect().width ?? scroller.clientWidth * .86) + gap;
      const maxScrollLeft = Math.max(0, scroller.scrollWidth - scroller.clientWidth);
      if (maxScrollLeft === 0) return;
      const nextLeft = scroller.scrollLeft + step;
      const targetLeft = nextLeft >= maxScrollLeft - 4 ? 0 : Math.min(nextLeft, maxScrollLeft);

      scroller.scrollTo({
        left: targetLeft,
        behavior: "smooth",
      });
    }, 4500);

    return () => window.clearInterval(interval);
  }, [testimonialsPaused]);

  const moveTestimonials = useCallback((direction: "next" | "previous") => {
    const scroller = testimonialScroller.current;
    if (!scroller) return;

    const card = scroller.querySelector<HTMLElement>(".testimonial-card");
    const gap = Number.parseFloat(window.getComputedStyle(scroller).columnGap || "16") || 16;
    const step = (card?.getBoundingClientRect().width ?? scroller.clientWidth * .86) + gap;
    const maxScrollLeft = Math.max(0, scroller.scrollWidth - scroller.clientWidth);
    const nextLeft = direction === "next" ? scroller.scrollLeft + step : scroller.scrollLeft - step;
    const targetLeft = direction === "next"
      ? (nextLeft >= maxScrollLeft - 4 ? 0 : Math.min(nextLeft, maxScrollLeft))
      : (nextLeft <= 4 ? maxScrollLeft : Math.max(nextLeft, 0));

    scroller.scrollTo({ left: targetLeft, behavior: "smooth" });
  }, []);

  return (
    <div className="min-h-screen overflow-x-clip bg-background text-foreground">
      <header className="fixed inset-x-0 top-0 z-50 border-b border-white/10 bg-[#003223] text-white backdrop-blur-xl">
        <div className="container mx-auto flex h-[72px] items-center justify-between px-5 md:px-8">
          <BrandMark />
          <div className="hidden items-center gap-5 md:flex">
            <span className="flex items-center gap-2 text-xs text-white/70"><MapPin className="h-4 w-4 text-[#d49a25]" /> Sector 141, Noida, Uttar Pradesh</span>
            <a href={CLINIC_DETAILS.phoneUri} className="flex items-center gap-2 text-sm font-semibold transition-colors hover:text-[#e4bd68]"><Phone className="h-4 w-4" /> 087965 20257</a>
            <a href="#consultation" className="rounded-md bg-[#bd7f0d] px-5 py-3 text-[0.66rem] font-bold text-white transition-colors hover:bg-[#d49a25]">Book Appointment</a>
          </div>
          <div className="flex items-center gap-2 md:hidden">
            <a href={CLINIC_DETAILS.phoneUri} className="grid h-11 w-11 place-items-center rounded-full border border-white/15" aria-label="Call Punar Axis Therapy"><Phone className="h-5 w-5" /></a>
            <button onClick={() => setMenuOpen((open) => !open)} className="grid h-11 w-11 place-items-center rounded-full border border-white/15" aria-label={menuOpen ? "Close menu" : "Open menu"} aria-expanded={menuOpen}>
              {menuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </button>
          </div>
        </div>
        {menuOpen && (
          <nav className="border-t border-white/10 bg-[#022b1d] px-5 py-5 md:hidden" aria-label="Mobile navigation">
            {[
              ["Patient stories", "#testimonials"],
              ["Choosing a service", "#care-options"],
              ["Services", "#services"],
              ["Membership", "#offer"],
              ["Book appointment", "#consultation"],
            ].map(([label, href]) => (
              <a key={href} href={href} onClick={() => setMenuOpen(false)} className="flex min-h-12 items-center justify-between border-b border-white/8 py-3 text-sm text-white/80 last:border-0">
                {label}<ArrowRight className="h-4 w-4 text-[#d49a25]" />
              </a>
            ))}
          </nav>
        )}
      </header>

      <main id="home">
        <section aria-label="Introduction"><HeroSlider page={page} /></section>

        <section className="relative z-20 bg-[#fcfbf7] pb-2 pt-1 md:pb-1 md:pt-0" aria-label="Contact Punar Axis Therapy">
          <div className="container mx-auto px-4 md:px-8">
            <div className="action-grid grid grid-cols-3 gap-2 md:overflow-hidden md:rounded-2xl md:border md:border-[#063b28]/10 md:bg-white md:p-1 md:shadow-[0_18px_50px_rgba(2,43,29,0.12)]">
              {actionItems.map((item, index) => {
                const ActionIcon = item.icon;
                return (
                  <a key={item.title} href={item.href} target={item.external ? "_blank" : undefined} rel={item.external ? "noopener noreferrer" : undefined} className={`action-card action-card--${index + 1} group flex min-h-[148px] flex-col items-center justify-center gap-2 rounded-2xl border border-[#063b28]/10 bg-white p-2 text-center transition-all hover:-translate-y-0.5 hover:border-[#c58a18]/35 hover:shadow-lg md:min-h-[116px] md:flex-row md:justify-start md:gap-4 md:rounded-xl md:border-0 md:bg-transparent md:p-5 md:text-left`} aria-label={item.title}>
                    <span className={`action-icon grid h-12 w-12 shrink-0 place-items-center rounded-full ${item.accent}`}><ActionIcon className="h-5 w-5" aria-hidden /></span>
                    <span className="min-w-0 flex-1">
                      <strong className="block font-serif text-sm leading-tight text-[#17231e] md:text-lg">{item.title}</strong>
                      <span className="mt-1 hidden text-xs text-[#66716b] md:block">{item.note}</span>
                      <span className="action-label mt-2 inline-flex items-center gap-1 text-[0.52rem] font-bold uppercase tracking-[0.08em] md:text-[0.62rem] md:tracking-[0.13em]">{item.label}<ArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-1" /></span>
                    </span>
                  </a>
                );
              })}
            </div>
          </div>
        </section>

        <section id="testimonials" className="testimonials-section bg-[#fcfbf7]">
          <div className="container mx-auto px-5 md:px-8">
            <div className="text-center">
              <h2 className="testimonials-title section-title">What Our Patients Say</h2>
            </div>
            <div
              className="testimonial-carousel relative mt-6 md:mt-7"
              onMouseEnter={() => setTestimonialsPaused(true)}
              onMouseLeave={() => setTestimonialsPaused(false)}
              onFocus={() => setTestimonialsPaused(true)}
              onBlur={() => setTestimonialsPaused(false)}
              onTouchStart={() => setTestimonialsPaused(true)}
              onTouchEnd={() => setTestimonialsPaused(false)}
            >
              <button type="button" className="testimonial-control testimonial-control--prev" onClick={() => moveTestimonials("previous")} aria-label="Previous patient story"><ChevronLeft className="h-4 w-4" /></button>
              <div ref={testimonialScroller} className="testimonial-track flex snap-x gap-4 overflow-x-auto pb-4">
                {testimonials.map((testimonial) => (
                  <article key={testimonial.name} className="testimonial-card min-w-[86%] snap-center rounded-2xl border border-[#063b28]/10 bg-white p-5 sm:min-w-[58%] md:p-6">
                    <p className="text-sm leading-6 text-[#3f4d45]">“{testimonial.copy}”</p>
                    <div className="testimonial-card__footer mt-5 border-t border-[#063b28]/10 pt-4">
                      <div>
                        <p className="text-sm font-semibold text-[#17231e]">{testimonial.name}</p>
                        <span className="mt-1 flex gap-0.5 text-[#d49a25]" aria-label="Five star rating">★★★★★</span>
                      </div>
                      <GoogleMark />
                    </div>
                  </article>
                ))}
              </div>
              <button type="button" className="testimonial-control testimonial-control--next" onClick={() => moveTestimonials("next")} aria-label="Next patient story"><ChevronRight className="h-4 w-4" /></button>
              <div className="testimonial-dots" aria-hidden="true">
                {testimonials.map((testimonial, index) => <span key={testimonial.name} className={index === 0 ? "is-active" : undefined} />)}
              </div>
            </div>
          </div>
        </section>

        <section id="offer" className="section-space bg-[#f8f5ed]">
           <div className="container mx-auto grid gap-7 px-5 md:px-8 lg:grid-cols-2 lg:items-stretch">
            <article className="offer-card launch-offer-card">
              <div className="relative z-10 flex h-full flex-col">
                <span className="w-fit rounded-full border border-[#e4bd68]/35 bg-white/5 px-4 py-2 text-[0.62rem] font-bold uppercase tracking-[0.18em] text-[#e4bd68]">Launch offer</span>
                <div className="offer-copy my-auto py-12">
                  <p className="offer-title font-serif text-5xl leading-[0.98] text-white md:text-6xl">Get Free Hampers with Founding Memberships.</p>
                  <p className="offer-description mt-5 text-lg text-white/68">Exclusive wellness hampers for our founding members.</p>
                  <p className="offer-limit mt-4 text-sm font-bold uppercase text-[#e4bd68]">Limited period only.</p>
                </div>
                <div className="offer-benefits" aria-label="Founding membership benefits">
                  <span><Crown className="h-5 w-5 text-[#e4bd68]" aria-hidden /><strong>Founding</strong><small>Member benefits</small></span>
                  <span><Sparkles className="h-5 w-5 text-[#e4bd68]" aria-hidden /><strong>Premium</strong><small>Wellness hampers</small></span>
                  <span><BadgeCheck className="h-5 w-5 text-[#e4bd68]" aria-hidden /><strong>Priority</strong><small>Bookings</small></span>
                  <span><Tag className="h-5 w-5 text-[#e4bd68]" aria-hidden /><strong>Special</strong><small>Discounts</small></span>
                </div>
                <a href={CLINIC_DETAILS.whatsappUrl} target="_blank" rel="noopener noreferrer" className="offer-cta inline-flex h-14 w-fit items-center gap-2 rounded-full bg-[#d49a25] px-7 text-[0.65rem] font-bold uppercase tracking-[0.16em] text-[#022b1d] transition-colors hover:bg-[#e4bd68]">Ask about offers<ArrowRight className="h-4 w-4" /></a>
              </div>
              <div className="hamper-visual" role="img" style={{ backgroundImage: `url("${clinicMedia.offer.src}")` }} aria-label={clinicMedia.offer.label}>
              </div>
            </article>

            <div id="consultation" className="rounded-[2rem] border border-[#063b28]/10 bg-white p-6 shadow-[0_24px_80px_rgba(2,43,29,0.08)] sm:p-8 md:p-10">
              <p className="eyebrow">A simple first step</p>
              <h2 className="text-4xl leading-tight text-[#17231e] md:text-5xl">Book your consultation today.</h2>
              <p className="mt-4 max-w-xl text-sm leading-6 text-[#66716b]">Take the first step towards better movement, wellness and personalised care.</p>
              <div className="mt-8"><ConsultationForm /></div>
            </div>
          </div>
        </section>

        <section id="care-options" className="conditions-section overflow-hidden bg-[#eee9dd]">
          <div className="container mx-auto px-5 md:px-8">
            <div className="mx-auto max-w-3xl text-center">
              <p className="eyebrow">A clear place to start</p>
              <h2 className="section-title">Not sure which service to choose?</h2>
              <p className="section-copy mx-auto max-w-2xl">Contact the clinic to discuss your needs and ask about available Ayurveda, physiotherapy and rehabilitation services before booking.</p>
            </div>
            <div className="conditions-grid mx-auto mt-8 grid max-w-4xl grid-cols-3 gap-2 sm:gap-3">
              {orderedCareOptions.map((option) => {
                const OptionIcon = option.icon;
                return (
                  <article key={option.label} className="condition-card">
                    <span className="condition-icon">
                      <OptionIcon className="h-4 w-4" aria-hidden />
                    </span>
                    <h3 className="text-sm leading-tight text-[#17231e]">{option.label}</h3>
                    <p className="mt-2 text-xs leading-5 text-[#66716b]">{option.copy}</p>
                  </article>
                );
              })}
            </div>
          </div>
        </section>

        <section id="services" className="section-space bg-[#f8f5ed]">
          <div className="container mx-auto px-5 md:px-8">
            <div className="mx-auto max-w-3xl text-center">
              <p className="eyebrow">Your care, connected</p>
              <h2 className="section-title">Our Core Services</h2>
              <p className="section-copy mx-auto">{pageConfig.serviceIntro}</p>
            </div>
            <div className="mt-12 grid gap-5 lg:grid-cols-2">
              {orderedServices.map((service, index) => {
                const ServiceIcon = service.icon;
                return (
                  <article key={service.title} className={`service-card group ${index === 0 ? "lg:col-span-2" : ""}`}>
                    <div className="service-card__body">
                      <div className="flex items-start justify-between">
                        <span className="service-card__icon grid h-12 w-12 place-items-center rounded-full"><ServiceIcon className="h-5 w-5" aria-hidden /></span>
                        <span className="font-serif text-4xl text-[#063b28]/10">{String(index + 1).padStart(2, "0")}</span>
                      </div>
                      <h3 className="mt-6 max-w-md text-3xl leading-tight text-[#17231e] md:text-4xl">{service.title}</h3>
                      <p className="mt-3 max-w-xl text-sm leading-6 text-[#66716b]">{service.description}</p>
                      <ul className="mt-6 grid gap-2.5">
                        {service.points.map((point) => <li key={point} className="flex items-start gap-2 text-sm text-[#3f4d45]"><Check className="service-card__check mt-0.5 h-4 w-4 shrink-0" />{point}</li>)}
                      </ul>
                      <a href="#consultation" className="service-card__cta mt-7 inline-flex items-center gap-2 text-[0.65rem] font-bold uppercase tracking-[0.16em] text-white">{service.cta}<ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" /></a>
                    </div>
                    <div className="service-card__image">
                      <img src={service.image} alt={service.imageLabel} width={1280} height={720} loading="lazy" decoding="async" />
                    </div>
                  </article>
                );
              })}
            </div>
          </div>
        </section>

        <section className="care-commitments border-y border-[#063b28]/10 bg-[#eee9dd] py-8" aria-label="Our care commitments">
          <div className="container mx-auto grid gap-6 px-5 md:grid-cols-3 md:px-8">
            {[
              ["Confidential care", "Your information is handled with care", LockKeyhole],
              ["Clear communication", "Understand your care options and next steps", BadgeCheck],
              ["Personalised care", "Treatment tailored to your needs", HeartHandshake],
            ].map(([title, copy, ItemIcon]) => {
              const TrustIcon = ItemIcon as Icon;
              return (
                <div key={title as string} className="care-commitment flex items-center gap-4">
                  <span className="grid h-11 w-11 shrink-0 place-items-center rounded-full bg-[#063b28] text-[#e4bd68]"><TrustIcon className="h-5 w-5" aria-hidden /></span>
                  <div><h3 className="text-lg text-[#17231e]">{title as string}</h3><p className="text-xs text-[#66716b]">{copy as string}</p></div>
                </div>
              );
            })}
          </div>
        </section>

        <section id="faqs" className="section-space bg-[#f8f5ed]">
          <div className="container mx-auto px-5 md:px-8">
            <div className="mx-auto max-w-3xl text-center">
              <p className="eyebrow">Helpful answers</p>
              <h2 className="section-title">Questions patients often ask</h2>
              <p className="section-copy mx-auto">Clear information about services, booking and visiting Punar Axis Therapy in Sector 141, Noida.</p>
            </div>
            <div className="mx-auto mt-10 grid max-w-4xl gap-3">
              {faqs.map(([question, answer]) => (
                <details key={question} className="faq-item rounded-2xl border border-[#063b28]/10 bg-white p-5">
                  <summary className="faq-summary flex cursor-pointer list-none items-center justify-between gap-5 text-base font-semibold text-[#17231e]">
                    <span>{question}</span>
                    <span className="faq-toggle grid h-7 w-7 shrink-0 place-items-center rounded-full border border-[#c58a18]/25 text-xl font-normal leading-none text-[#c58a18]" aria-hidden>+</span>
                  </summary>
                  <p className="mt-4 max-w-3xl pr-10 text-sm leading-6 text-[#66716b]">{answer}</p>
                </details>
              ))}
            </div>
          </div>
        </section>

        <section id="location" className="relative overflow-hidden bg-[#022b1d] py-20 text-white md:py-28">
          <div className="container relative z-10 mx-auto px-5 text-center md:px-8">
            <p className="eyebrow eyebrow--gold">Punar Axis Therapy · Noida</p>
            <div className="mx-auto mt-8 flex max-w-3xl flex-col justify-center gap-3 sm:flex-row">
              <a href={CLINIC_DETAILS.whatsappUrl} target="_blank" rel="noopener noreferrer" className="cta-button cta-button--gold"><MessageCircle className="h-4 w-4" />Chat on WhatsApp</a>
              <a href={directionsHref} target={directionsHref.startsWith("http") ? "_blank" : undefined} rel={directionsHref.startsWith("http") ? "noopener noreferrer" : undefined} className="cta-button"><MapPin className="h-4 w-4" />View on map</a>
              <a href={CLINIC_DETAILS.phoneUri} className="cta-button"><Phone className="h-4 w-4" />Call now</a>
            </div>
            <address className="mx-auto mt-10 max-w-xl not-italic text-sm leading-6 text-white/55">{CLINIC_DETAILS.address}<br /><a href={CLINIC_DETAILS.phoneUri} className="text-[#e4bd68]">+91 87965 20257</a></address>
            {CLINIC_DETAILS.googleMapsUrl === "PASTE_GOOGLE_MAPS_URL_HERE" && <p className="mx-auto mt-5 max-w-xl rounded-full border border-white/10 bg-white/5 px-5 py-3 text-xs text-white/45">Directions link is ready for your verified Google Maps URL in the editable clinic settings.</p>}
          </div>
        </section>
      </main>

      <footer className="bg-[#003223] pb-24 pt-14 text-white md:pb-10">
        <div className="container mx-auto grid gap-10 px-5 md:grid-cols-[1.3fr_0.7fr_0.8fr] md:px-8">
          <div>
            <BrandMark />
            <p className="mt-5 max-w-md text-sm leading-6 text-white/50">{pageConfig.footerDescription}</p>
            <p className="mt-4 text-[0.64rem] font-semibold uppercase tracking-[0.2em] text-[#d49a25]">{CLINIC_DETAILS.tagline}</p>
          </div>
          <div>
            <h3 className="text-sm text-white">Quick links</h3>
            <div className="mt-4 grid gap-2 text-sm text-white/50">
              <a href="#home" className="hover:text-[#e4bd68]">Home</a>
              <a href="#testimonials" className="hover:text-[#e4bd68]">Patient stories</a>
              <a href="#services" className="hover:text-[#e4bd68]">Services</a>
              <a href="#care-options" className="hover:text-[#e4bd68]">Choosing a service</a>
              <a href="#offer" className="hover:text-[#e4bd68]">Membership</a>
              <a href="#faqs" className="hover:text-[#e4bd68]">FAQs</a>
            </div>
          </div>
          <div>
            <h3 className="text-sm text-white">Contact</h3>
            <address className="mt-4 not-italic text-sm leading-6 text-white/50">{CLINIC_DETAILS.address}</address>
            <a href={CLINIC_DETAILS.phoneUri} className="mt-3 block text-sm text-[#e4bd68]">+91 87965 20257</a>
            <a href={CLINIC_DETAILS.instagramUrl} target="_blank" rel="noopener noreferrer" className="mt-3 inline-flex items-center gap-2 text-sm text-white/50 transition-colors hover:text-[#e4bd68]"><Instagram className="h-4 w-4" aria-hidden />Instagram</a>
          </div>
        </div>
        <div className="container mx-auto mt-10 border-t border-white/8 px-5 pt-6 text-xs text-white/30 md:px-8">© {new Date().getFullYear()} <span className="text-[#d49a25]">Punar Axis Therapy</span>. All rights reserved.</div>
      </footer>

      <div className={`mobile-actions ${showStickyActions ? "mobile-actions--visible" : ""}`} aria-hidden={!showStickyActions}>
        <a href={CLINIC_DETAILS.whatsappUrl} target="_blank" rel="noopener noreferrer" aria-label="Chat on WhatsApp"><MessageCircle className="h-5 w-5 text-[#25D366]" /><span>WhatsApp</span></a>
        <a href={directionsHref} aria-label="View clinic location on map"><MapPin className="h-5 w-5 text-[#d49a25]" /><span>Location</span></a>
        <a href={CLINIC_DETAILS.phoneUri} aria-label="Call Punar Axis Therapy"><Phone className="h-5 w-5 text-[#063b28]" /><span>Call</span></a>
      </div>
    </div>
  );
}
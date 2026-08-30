import { CLINIC_DETAILS } from "@/lib/constants";

export type ServiceKey = "ayurveda" | "physiotherapy" | "rehabilitation";
export type LandingPageKey = "home" | "physiotherapy" | "ayurveda";

export type LandingPageVariant = {
  title: string;
  description: string;
  robots: "index, follow" | "noindex,follow";
  canonical: string;
  serviceOrder: ServiceKey[];
  serviceIntro: string;
  footerDescription: string;
};

export const SERVICE_LABELS: Record<ServiceKey, string> = {
  ayurveda: "Ayurveda",
  physiotherapy: "Physiotherapy",
  rehabilitation: "Rehab",
};

export const LANDING_PAGE_VARIANTS: Record<LandingPageKey, LandingPageVariant> = {
  home: {
    title: "Punar Axis Therapy │ Ayurveda & physiotherapy in Sector 141, Noida",
    description: "Punar Axis Therapy offers Ayurveda, physiotherapy and rehabilitation services in Sector 141, Noida. Contact the clinic to plan a personalised consultation.",
    robots: "index, follow",
    canonical: CLINIC_DETAILS.siteUrl,
    serviceOrder: ["ayurveda", "physiotherapy", "rehabilitation"],
    serviceIntro: "Ayurveda, physiotherapy and rehabilitation, thoughtfully brought together.",
    footerDescription: CLINIC_DETAILS.description,
  },
  physiotherapy: {
    title: "Punar Axis Therapy | Physiotherapy in Sector 141, Noida",
    description: "Punar Axis Therapy offers physiotherapy, Ayurveda and rehabilitation services in Sector 141, Noida. Contact the clinic to plan a personalised consultation.",
    robots: "noindex,follow",
    canonical: `${CLINIC_DETAILS.siteUrl}physiotherapy/`,
    serviceOrder: ["physiotherapy", "ayurveda", "rehabilitation"],
    serviceIntro: "Physiotherapy, Ayurveda and rehabilitation, thoughtfully brought together.",
    footerDescription: "Physiotherapy-led care with Ayurveda and rehabilitation services in Sector 141, Noida.",
  },
  ayurveda: {
    title: "Punar Axis Therapy | Ayurveda Clinic in Sector 141, Noida",
    description: "Punar Axis Therapy offers Ayurveda, physiotherapy and rehabilitation services in Sector 141, Noida. Contact the clinic to plan a personalised consultation.",
    robots: "noindex,follow",
    canonical: `${CLINIC_DETAILS.siteUrl}ayurveda/`,
    serviceOrder: ["ayurveda", "physiotherapy", "rehabilitation"],
    serviceIntro: "Ayurveda, physiotherapy and rehabilitation, thoughtfully brought together.",
    footerDescription: CLINIC_DETAILS.description,
  },
};
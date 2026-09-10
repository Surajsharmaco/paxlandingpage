import React, { useCallback, useEffect, useRef, useState } from "react";
import { Activity, ChevronLeft, ChevronRight, ClipboardCheck, HeartHandshake, Leaf, MapPin, Pause, Play, Plus, Stethoscope } from "lucide-react";
import { clinicMedia } from "@/lib/constants";
import { LANDING_PAGE_VARIANTS, SERVICE_LABELS, type LandingPageKey, type ServiceKey } from "@/lib/page-variants";

const localSlides = [
  {
    id: 1,
    visualClass: "hero-visual--clinic-detail",
    mediaLabel: "Punar Axis Therapy reception lounge",
  },
  {
    id: 2,
    visualClass: "hero-visual--clinic-detail",
    mediaLabel: "Punar Axis Therapy physiotherapy equipment room",
  },
  {
    id: 3,
    visualClass: "hero-visual--clinic-detail",
    mediaLabel: "Punar Axis Therapy clinic room with therapy equipment",
  },
  {
    id: 4,
    visualClass: "hero-visual--clinic-detail",
    mediaLabel: "Punar Axis Therapy therapy room",
  },
  {
    id: 5,
    visualClass: "hero-visual--clinic-detail",
    mediaLabel: "Punar Axis Therapy Ayurveda room with traditional therapy equipment",
  },
  {
    id: 6,
    visualClass: "hero-visual--clinic-detail",
    mediaLabel: "Punar Axis Therapy physiotherapy room",
  },
  {
    id: 7,
    visualClass: "hero-visual--clinic-detail",
    mediaLabel: "Punar Axis Therapy clinic room with wooden therapy cabinet",
  },
  {
    id: 8,
    visualClass: "hero-visual--clinic-detail",
    mediaLabel: "Punar Axis Therapy reception area",
  },
  {
    id: 9,
    visualClass: "hero-visual--clinic-detail",
    mediaLabel: "Punar Axis Therapy care team",
  },
];

const serviceIcons: Record<ServiceKey, typeof Leaf> = {
  ayurveda: Leaf,
  physiotherapy: Activity,
  rehabilitation: HeartHandshake,
};

const ayurvedaBenefits = [
  { label: "Doctor-Guided Care", icon: Stethoscope },
  { label: "Personalized Treatment", icon: ClipboardCheck },
  { label: "Holistic Pain Support", icon: HeartHandshake },
];

const ayurvedaTherapies = [
  {
    label: "Shirodhara",
    description: "Calms the mind",
    image: "/ayurveda-therapy-shirodhara.webp",
  },
  {
    label: "Abhyanga",
    description: "Relaxes muscles",
    image: "/ayurveda-therapy-abhyanga.webp",
  },
  {
    label: "Kati Basti",
    description: "Soothes back pain",
    image: "/ayurveda-therapy-kati-basti.webp",
  },
  {
    label: "Swedana",
    description: "Detoxifies the body",
    image: "/ayurveda-therapy-swedana.webp",
  },
  {
    label: "Panchakarma",
    description: "Traditional cleansing care",
    image: "/ayurveda-therapy-panchakarma.webp",
  },
  {
    label: "Nasya",
    description: "Traditional nasal therapy",
    image: "/clinic-ayurveda.jpg",
  },
  {
    label: "Potli Therapy",
    description: "Warm herbal compress",
    image: "/ayurveda-therapy-potli.webp",
  },
  {
    label: "Ayurvedic Steam",
    description: "Herbal steam therapy",
    image: "/ayurveda-therapy-steam.webp",
  },
];

const ayurvedaConcerns = [
  { label: "Neck Pain", image: "/ayurveda-concern-neck-pain.webp" },
  { label: "Shoulder Pain", image: "/ayurveda-concern-shoulder-pain.webp" },
  { label: "Back Pain", image: "/ayurveda-concern-back-pain.webp" },
  { label: "Knee Pain", image: "/ayurveda-concern-knee-pain.webp" },
  { label: "Elbow Pain", image: "/ayurveda-concern-elbow-pain.webp" },
  { label: "Hip Pain", image: "/ayurveda-concern-hip-pain.webp" },
  { label: "Headache & Migraine", image: "/ayurveda-concern-headache-migraine.webp" },
  { label: "Digestive Issues", image: "/ayurveda-concern-digestive-issues.webp" },
];

export const AyurvedaSinglePanel = () => (
  <section className="ayurveda-single-panel relative overflow-hidden bg-[#fcfbf7]" aria-label="Ayurvedic treatment at Punar Axis Therapy">
    <div className="container relative z-10 mx-auto px-5 pb-6 pt-[96px] md:px-8 md:pb-8 md:pt-[104px]">
      <div className="ayurveda-single-panel__intro text-center">
        <p className="hero-kicker"><span />Ayurveda care in Noida<span /></p>
        <h1 className="ayurveda-single-panel__heading">
          Ayurvedic Treatment for <em>Lasting Relief</em>
        </h1>
        <p className="ayurveda-single-panel__location">
          <MapPin aria-hidden />
          <span>In Noida, Sector 141</span>
        </p>
      </div>

      <div className="ayurveda-benefits" aria-label="Ayurveda care benefits">
        {ayurvedaBenefits.map((benefit) => (
          <span key={benefit.label}>
            <benefit.icon className="h-4 w-4" aria-hidden />
            {benefit.label}
          </span>
        ))}
      </div>

      <section className="ayurveda-offerings" aria-labelledby="ayurveda-offerings-title">
        <h2 id="ayurveda-offerings-title" className="sr-only">Ayurveda Conditions and Therapies</h2>
        <div className="ayurveda-offerings__layout">
          <div className="ayurveda-conditions-block" aria-labelledby="ayurveda-conditions-title">
            <h2 id="ayurveda-conditions-title">Conditions We Treat</h2>
            <div className="ayurveda-conditions-grid">
              {ayurvedaConcerns.map((concern) => (
                <article key={concern.label} className="ayurveda-condition-card">
                  <img
                    src={concern.image}
                    alt=""
                    width={215}
                    height={195}
                    loading="lazy"
                    decoding="async"
                  />
                  <h3>{concern.label}</h3>
                </article>
              ))}
              <article className="ayurveda-condition-card ayurveda-more-card ayurveda-more-card--condition">
                <h3>And More</h3>
              </article>
            </div>
          </div>

          <div className="ayurveda-therapies-block" aria-labelledby="ayurveda-therapies-title">
            <div className="ayurveda-therapies-header">
              <h2 id="ayurveda-therapies-title">Ayurvedic Therapies We Offer</h2>
            </div>
            <div className="ayurveda-therapies-grid">
              {ayurvedaTherapies.map((therapy) => (
                <article key={therapy.label} className="ayurveda-therapy-card group">
                  <div className="ayurveda-therapy-card__image">
                    <img
                      src={therapy.image}
                      alt={`${therapy.label} Ayurveda therapy`}
                      width={376}
                      height={220}
                      loading="lazy"
                      decoding="async"
                    />
                  </div>
                  <div className="ayurveda-therapy-card__content">
                    <h3>{therapy.label}</h3>
                  </div>
                </article>
              ))}
              <article className="ayurveda-therapy-card ayurveda-more-card ayurveda-more-card--therapy">
                <Plus aria-hidden />
                <h3>More Therapies</h3>
              </article>
            </div>
          </div>
        </div>
      </section>
    </div>
  </section>
);

export const HeroSlider = ({ page = "home" }: { page?: LandingPageKey }) => {
  const serviceOrder = LANDING_PAGE_VARIANTS[page].serviceOrder;
  const [primaryService, secondaryService, tertiaryService] = serviceOrder;
  const [activeIndex, setActiveIndex] = useState(0);
  const [trackIndex, setTrackIndex] = useState(1);
  const [isAnimating, setIsAnimating] = useState(true);
  const [isPaused, setIsPaused] = useState(false);
  const touchStart = useRef<number | null>(null);
  const isTransitioning = useRef(false);
  const slideCount = clinicMedia.hero.length;
  const trackSlides = [
    clinicMedia.hero[slideCount - 1],
    ...clinicMedia.hero,
    clinicMedia.hero[0],
  ];

  const goTo = useCallback((index: number) => {
    if (isTransitioning.current) return;
    const nextIndex = (index + slideCount) % slideCount;
    if (nextIndex === activeIndex) return;
    isTransitioning.current = true;
    setActiveIndex(nextIndex);
    setTrackIndex(nextIndex + 1);
    setIsAnimating(true);
  }, [activeIndex, slideCount]);

  const next = useCallback(() => {
    if (isTransitioning.current) return;
    isTransitioning.current = true;
    setActiveIndex((current) => (current + 1) % slideCount);
    setTrackIndex((current) => (current >= slideCount + 1 ? 2 : current + 1));
    setIsAnimating(true);
  }, [slideCount]);

  const previous = useCallback(() => {
    if (isTransitioning.current) return;
    isTransitioning.current = true;
    setActiveIndex((current) => (current - 1 + slideCount) % slideCount);
    setTrackIndex((current) => (current <= 0 ? slideCount - 1 : current - 1));
    setIsAnimating(true);
  }, [slideCount]);

  useEffect(() => {
    if (isPaused) return;
    const timer = window.setInterval(next, 3000);
    return () => window.clearInterval(timer);
  }, [isPaused, next]);

  const handleTouchStart = (event: React.TouchEvent<HTMLDivElement>) => {
    touchStart.current = event.touches[0]?.clientX ?? null;
  };

  const handleTouchEnd = (event: React.TouchEvent<HTMLDivElement>) => {
    if (touchStart.current === null) return;
    const distance = (event.changedTouches[0]?.clientX ?? touchStart.current) - touchStart.current;
    if (Math.abs(distance) > 45) {
      distance < 0 ? next() : previous();
    }
    touchStart.current = null;
  };

  const handleTrackTransitionEnd = () => {
    if (trackIndex === 0) {
      setIsAnimating(false);
      setTrackIndex(slideCount);
      window.requestAnimationFrame(() => {
        setIsAnimating(true);
        isTransitioning.current = false;
      });
    } else if (trackIndex === slideCount + 1) {
      setIsAnimating(false);
      setTrackIndex(1);
      window.requestAnimationFrame(() => {
        setIsAnimating(true);
        isTransitioning.current = false;
      });
    } else {
      isTransitioning.current = false;
    }
  };

  return (
    <div
      className="hero-slider relative overflow-hidden bg-[#fcfbf7]"
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
      aria-roledescription="carousel"
      aria-label="Punar Axis Therapy clinic highlights"
    >
      <div className="container relative z-10 mx-auto px-5 pb-6 pt-[96px] md:px-8 md:pb-8 md:pt-[104px]">
        <div className="hero-intro text-center">
          <p className="hero-kicker"><span />Ancient healing. Modern revival.<span /></p>
          <h1 className="hero-heading">
            <span className="hero-heading__services">
              <span className="hero-heading__service hero-heading__primary">{SERVICE_LABELS[primaryService]}</span>
              <span className="hero-heading__separator">,</span>
              <span className="hero-heading__secondary">
                <span className="hero-heading__service"><em>{SERVICE_LABELS[secondaryService]}</em></span>
                <span className="hero-heading__amp">&amp;</span>
                <span className="hero-heading__service"><em>{SERVICE_LABELS[tertiaryService]}</em></span>
              </span>
            </span>
            <span className="hero-heading__location">in Sector 141, <em>Noida.</em></span>
          </h1>
          <p className="hero-subheading">{page === "physiotherapy" ? "Physiotherapy care with Ayurveda and rehabilitation available at Punar Axis Therapy." : page === "ayurveda" ? "Ayurveda care with physiotherapy and rehabilitation available at Punar Axis Therapy." : "Personalised care. Thoughtful therapies. Clear next steps."}</p>
          <div className="hero-categories" aria-label="Areas of care">
            {serviceOrder.map((service) => {
              const ServiceIcon = serviceIcons[service];
              return <span key={service}><ServiceIcon className="h-4 w-4" aria-hidden />{SERVICE_LABELS[service]}</span>;
            })}
          </div>
        </div>

        <div className="hero-frame relative mt-2 overflow-hidden">
          <div
            className={`hero-visual-track ${isAnimating ? "" : "hero-visual-track--no-transition"}`}
            style={{
              width: `${trackSlides.length * 100}%`,
              transform: `translate3d(-${trackIndex * (100 / trackSlides.length)}%, 0, 0)`,
            }}
            onTransitionEnd={handleTrackTransitionEnd}
          >
            {trackSlides.map((media, index) => {
              const mediaIndex = (index - 1 + slideCount) % slideCount;
              const slide = localSlides[mediaIndex];
              const isCurrentSlide = index === trackIndex;
              return (
                <div
                  key={`${media.src}-${index}`}
                  className={`hero-visual-slide ${slide.visualClass}`}
                  style={{
                    flex: `0 0 ${100 / trackSlides.length}%`,
                  }}
                  role="img"
                  aria-label={slide.mediaLabel}
                >
                  <img
                    src={media.src}
                    srcSet={media.srcSet}
                    sizes={media.sizes}
                    loading="eager"
                    decoding="async"
                    fetchPriority={isCurrentSlide ? "high" : "auto"}
                    alt={media.label}
                    width={1280}
                    height={720}
                    draggable={false}
                  />
                </div>
              );
            })}
          </div>
          <button onClick={previous} className="hero-control hero-control--left" aria-label="Previous clinic highlight"><ChevronLeft className="h-5 w-5" /></button>
          <button onClick={next} className="hero-control hero-control--right" aria-label="Next clinic highlight"><ChevronRight className="h-5 w-5" /></button>
          <div className="hero-frame-dots" role="tablist" aria-label="Choose clinic highlight">
            {localSlides.map((slide, index) => (
              <button key={slide.id} onClick={() => goTo(index)} className={`hero-dot ${index === activeIndex ? "hero-dot--active" : ""}`} aria-label={`Show highlight ${index + 1}`} aria-selected={index === activeIndex} role="tab" />
            ))}
          </div>
          <button onClick={() => setIsPaused((current) => !current)} className="hero-control hero-control--pause" aria-label={isPaused ? "Resume slider" : "Pause slider"}>
            {isPaused ? <Play className="h-4 w-4" /> : <Pause className="h-4 w-4" />}
          </button>
        </div>

        <div className="hero-scroll-label" aria-hidden="true">
          <span>Scroll to explore</span>
          <span className="hero-scroll-line" />
        </div>
      </div>
    </div>
  );
};

import React, { useCallback, useEffect, useRef, useState } from "react";
import { Activity, ChevronLeft, ChevronRight, HeartHandshake, Leaf, Pause, Play } from "lucide-react";
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
    const timer = window.setInterval(next, 4000);
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

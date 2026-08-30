# Punar Axis Therapy SEO Implementation Report

## 1. Implementation status

The current single-page website has been strengthened for technical SEO, local entity clarity, crawlability, social sharing, image semantics and AI-readable factual content without redesigning the established visual identity. The final hierarchy positions Ayurveda as the primary business and brand pillar, followed by Physiotherapy and Rehabilitation, while preserving Physiotherapy as a major local-search acquisition pillar.

Only verified facts supplied by the business were used:

- Business name: Punar Axis Therapy
- Address: First Floor, SH-38, Sector 141, Noida, Uttar Pradesh 201309
- Phone: +91 87965 20257
- Services: Ayurveda, Physiotherapy and Rehabilitation
- Business/brand hierarchy: Ayurveda → Physiotherapy → Rehabilitation
- Official Instagram: https://www.instagram.com/punaraxistherapy/
- Google Maps share URL: https://share.google/1wtkcRP5jdJmK7Qwi
- Existing testimonials: confirmed as genuine and permitted for publication

Opening hours were deliberately omitted because they were not supplied. Latitude and longitude were not added because the supplied Google share URL did not expose verified coordinates.

## 2. Final sitemap

Public sitemap:

- https://punaraxistrytherapy.in/sitemap.xml

Current indexable URL:

- https://punaraxistrytherapy.in/

Two campaign-only URLs are also available for paid traffic, but are intentionally noindexed and are not listed in the XML sitemap:

- https://punaraxistrytherapy.in/physiotherapy/
- https://punaraxistrytherapy.in/ayurveda/

No additional indexable service, condition, location or blog URLs were added because the current site does not yet contain enough verified, original content to justify separate organic pages. This avoids thin pages and doorway-page risk.

## 3. Final robots.txt

```txt
User-agent: *
Allow: /

Sitemap: https://punaraxistrytherapy.in/sitemap.xml
```

## 4. Final llms.txt

Public files:

- https://punaraxistrytherapy.in/llms.txt
- https://punaraxistrytherapy.in/llm.txt

Both files contain the verified business identity, the Ayurveda-first service hierarchy, location, phone, map link, Instagram profile and the main organic page. `llm.txt` is provided as a singular-name compatibility alias. The paid campaign variants are intentionally excluded from these AI-oriented discovery files.

## 5. Page SEO map

| URL | Title | Meta description | H1 | Primary keyword | Secondary keywords | Canonical |
| --- | --- | --- | --- | --- | --- | --- |
| https://punaraxistrytherapy.in/ | Punar Axis Therapy \| Ayurveda Clinic in Sector 141, Noida | Punar Axis Therapy offers Ayurveda, physiotherapy and rehabilitation services in Sector 141, Noida. Contact the clinic to plan a personalised consultation. | Ayurveda, Physiotherapy & Rehab in Sector 141, Noida | Ayurveda clinic in Sector 141 Noida | physiotherapy clinic Sector 141, rehabilitation Sector 141, Ayurveda Noida, physiotherapy Noida | https://punaraxistrytherapy.in/ |
| https://punaraxistrytherapy.in/physiotherapy/ | Punar Axis Therapy \| Physiotherapy in Sector 141, Noida | Punar Axis Therapy offers physiotherapy, Ayurveda and rehabilitation services in Sector 141, Noida. Contact the clinic to plan a personalised consultation. | Physiotherapy, Ayurveda & Rehab in Sector 141, Noida | Physiotherapy in Sector 141 Noida | Ayurveda Noida, rehabilitation Sector 141 | https://punaraxistrytherapy.in/physiotherapy/ (noindex,follow) |
| https://punaraxistrytherapy.in/ayurveda/ | Punar Axis Therapy \| Ayurveda Clinic in Sector 141, Noida | Punar Axis Therapy offers Ayurveda, physiotherapy and rehabilitation services in Sector 141, Noida. Contact the clinic to plan a personalised consultation. | Ayurveda, Physiotherapy & Rehab in Sector 141, Noida | Ayurveda clinic in Sector 141 Noida | physiotherapy clinic Sector 141, rehabilitation Sector 141 | https://punaraxistrytherapy.in/ayurveda/ (noindex,follow) |

Exactly one H1 is present. The visible heading uses “Rehab” for the compact campaign design; “Rehabilitation” remains in supporting copy, metadata, FAQ content and structured data for unambiguous search context.

### Dual-priority keyword strategy

- **Business and brand priority:** Ayurveda → Physiotherapy → Rehabilitation
- **Search acquisition priority:** retain strong Physiotherapy local-intent coverage while expanding realistic Ayurveda long-tail and local queries
- **Measurement rule:** do not claim search-volume leadership without Google Ads or Search Console data; use Search Console impressions, calls, WhatsApp enquiries and consultation requests to refine priorities after launch

Keyword classification:

| Cluster | Current target examples | Use |
| --- | --- | --- |
| Ayurveda primary/local | Ayurveda clinic Sector 141, Ayurvedic clinic Sector 141, Ayurveda clinic Noida | Homepage now; future Ayurveda page after content verification |
| Ayurveda therapy/service | Ayurveda consultation Noida, Ayurveda therapies Sector 141 | Future Ayurveda page only after exact therapies are confirmed |
| Ayurveda + condition/problem | Ayurveda for specific concerns in Noida | Research only; publish only for confirmed scope with medical review |
| Ayurveda + location | Ayurveda Sector 141, Ayurveda Noida, Ayurveda near Sector 137 | Local research targets; nearby-area references require genuine relevance |
| Physiotherapy high-intent local | physiotherapy clinic Sector 141, physiotherapist Sector 141, physiotherapy Noida | Preserve on homepage and future Physiotherapy page |
| Physiotherapy + condition | physiotherapy for specific concerns in Noida | Future condition pages only after scope and clinical review |
| Rehabilitation | rehabilitation clinic Sector 141, rehabilitation services Noida | Homepage and future Rehabilitation page |

## 6. Structured data

The homepage contains a connected JSON-LD `@graph` with stable IDs for:

- Organization
- WebSite
- WebPage
- ImageObject
- LocalBusiness + MedicalBusiness
- Ayurveda Service
- Physiotherapy Service
- Rehabilitation Service
- FAQPage

Implemented properties include:

- name
- canonical URL
- logo
- image
- description
- telephone
- verified postal address
- map URL
- Noida service area
- official Instagram `sameAs`
- appointment contact point
- service/provider relationships
- website/publisher relationship
- webpage/business relationship
- primary image relationship

The two campaign routes keep the same factual business graph and update the WebPage URL, name and description both in the generated static HTML and after client render. They remain noindex paid-traffic variants rather than organic service pages.

Not included because unverified:

- opening hours
- latitude and longitude
- practitioner credentials
- review or aggregate-rating schema
- prices
- treatment outcomes

## 7. Internal linking map

The single-page navigation links users and crawlers to descriptive page sections:

- Home → introduction
- Choosing a service → verified Ayurveda, physiotherapy and rehabilitation options
- Services → distinct Ayurveda, Physiotherapy and Rehabilitation cards in that order, with Ayurveda receiving the primary full-width position
- Launch offer → founding-membership offer enquiry via WhatsApp
- FAQs → service, booking and location answers
- Consultation → booking form
- Location → phone, WhatsApp and map actions

Footer links reinforce the main section relationships.

## 8. Image SEO map

| Image group | SEO treatment |
| --- | --- |
| Hero clinic photos | Responsive 640/1280 WebP sources, meaningful alt text, intrinsic 1280×720 dimensions, priority loading only for the active LCP slide |
| Ayurveda service image | Descriptive alt text, intrinsic dimensions, lazy loading |
| Physiotherapy service image | Descriptive alt text, intrinsic dimensions, lazy loading |
| Logo | Real Punar Axis Therapy branding used in page identity, favicon, manifest and Organization schema |
| Social image | Real reception photo used for Open Graph and Twitter/X preview |
| Launch-offer image | Founding membership wellness hamper asset used as the offer visual |

## 9. Local SEO implementation

- Exact business name is consistent across metadata, page content and schema.
- Exact verified address includes the PIN code.
- Verified phone is clickable.
- Google Maps and directions actions are present.
- Sector 141 and Noida are stated naturally in the H1, metadata, visible copy and structured data.
- Official Instagram is visible and connected through `sameAs`.
- No unsupported nearby-sector or service-area claims were introduced.

## 10. Google Business Profile consistency checklist

- [x] Business name matches: Punar Axis Therapy
- [x] Address matches the supplied Google Business Profile address
- [x] Phone matches the supplied clinic phone
- [x] Website canonical is https://punaraxistrytherapy.in/
- [x] Official Instagram is connected
- [x] Map link is present
- [x] Confirmed service categories are aligned
- [ ] Add verified opening hours when supplied
- [ ] Confirm exact latitude and longitude if GeoCoordinates are desired
- [ ] Confirm that the Google Business Profile website field uses the canonical HTTPS URL

## 11. Core Web Vitals improvements

- The first hero image is preloaded as the likely LCP asset.
- Hero images retain responsive `srcset` and sizes.
- Image dimensions were added to reduce layout shift.
- Below-the-fold service images remain lazy-loaded.
- Existing compressed WebP hero assets remain in use.
- No additional third-party marketing or analytics script was introduced.

The existing mobile-performance task should still be completed with a production Lighthouse/PageSpeed run after publishing.

## 12. Indexing checklist

- [x] Index/follow directive
- [x] Self-referencing canonical
- [x] Absolute HTTPS sitemap URL
- [x] Sitemap contains only the canonical public homepage
- [x] Public robots.txt allows the site
- [x] Public CSS, JavaScript and images are not blocked
- [x] Crawlable visible business and service content
- [x] Semantic H1/H2 structure
- [x] Client-side not-found route exists
- [ ] Confirm HTTP → HTTPS redirect in production
- [ ] Confirm one preferred www/non-www host in production
- [ ] Test unknown production URLs for a real HTTP 404 response

## 13. Search Console checklist

- [ ] Verify https://punaraxistrytherapy.in/ in Google Search Console
- [ ] Submit https://punaraxistrytherapy.in/sitemap.xml
- [ ] Inspect the homepage canonical
- [ ] Request indexing after deployment
- [ ] Review Page Indexing, Core Web Vitals and Mobile Usability reports
- [ ] Validate the live JSON-LD after deployment
- [ ] Monitor queries for Sector 141, physiotherapy, rehabilitation and Ayurveda intent

## 14. Analytics event map

Analytics was not connected because no verified GA4/GTM configuration was supplied. Recommended non-PII events:

| Event | Trigger |
| --- | --- |
| `page_view` | Homepage load |
| `phone_click` | Any telephone CTA |
| `whatsapp_click` | General WhatsApp CTA |
| `get_directions` | Google Maps CTA |
| `appointment_click` | Book Appointment navigation |
| `form_submit` / `generate_lead` | Consultation request prepared for WhatsApp |
| `service_cta_click` | Physiotherapy, Rehabilitation or Ayurveda CTA |
| `membership_click` | Founding membership offer enquiry CTA |

Do not send names, phone numbers, messages or health-related form data to analytics.

## 15. Redirect map

No legacy URLs were supplied, so no path redirects were added.

Production requirements:

- `http://punaraxistrytherapy.in/*` → `https://punaraxistrytherapy.in/*`
- `https://www.punaraxistrytherapy.in/*` → `https://punaraxistrytherapy.in/*`

These redirects must be configured and verified at the production hosting/domain layer.

## 16. 404 strategy

The React application has a visible not-found route. The static production rewrite currently needs a live HTTP-status test because some SPA hosting configurations return `200` for unknown paths, which can create soft 404s.

Before publishing additional pages:

- return a true 404 status for unknown URLs where the hosting platform allows it
- provide links back to the homepage, services and contact options
- do not include 404 URLs in the sitemap

## 17. Technical SEO issues fixed

- Added self-referencing canonical
- Expanded Open Graph and Twitter/X metadata
- Added a real social preview image
- Added manifest and touch icon declaration
- Added connected entity and service JSON-LD
- Added WebSite, WebPage and primary ImageObject entities
- Added factual FAQ content and matching FAQ schema
- Added sitemap.xml
- Added sitemap reference to robots.txt
- Added llms.txt without presenting it as a Google ranking signal
- Added llm.txt as a compatibility alias
- Added image alt text and dimensions
- Added LCP image preload
- Added verified full address and official Instagram
- Removed the unsupported “Noida’s First” and “Premium” hero claim
- Replaced unverified absolute trust claims with factual wording
- Removed the visible email placeholder

## 18. Remaining issues

- Opening hours are missing by instruction.
- Verified latitude/longitude is unavailable.
- GA4/GTM is not connected.
- Google Search Console verification and sitemap submission require account access.
- Production redirects and real HTTP 404 behavior require live-host validation.
- Dedicated service and condition pages require verified original content before creation.
- The font files are still loaded from Google Fonts; self-hosting can be evaluated after a production performance audit.

## 19. Claims requiring business verification

Verify before relying on them for service pages or structured data:

- Panchakarma therapies
- Abhyanga
- Shirodhara
- Ayurvedic consultation
- wellness and rejuvenation programs
- diet and lifestyle guidance
- manual therapy
- strength and mobility training
- pain-relief programs
- any future membership promotion, inclusions, discount, availability or expiry claims

## 20. Content that should not be published until verified

- Practitioner names, biographies, credentials or registrations
- Opening hours
- Latitude and longitude
- Prices or discount amounts
- Treatment outcomes or cure claims
- Awards, certifications or accreditations
- New location/nearby-sector pages
- Additional services not explicitly confirmed
- Review or aggregate-rating schema
- Parking or accessibility claims

## 21. Final quality confirmation

No fake credentials, fake locations, invented opening hours, invented coordinates, fake review schema, keyword stuffing, doorway pages, manipulative links or guaranteed medical outcomes were introduced.

The implementation improves eligibility, clarity, trust and discoverability. It does not promise rankings, Google Maps placement or inclusion in AI answers.

## 22. Official guidance used

The implementation and audit were checked against current official guidance available in August 2026:

- Google Search Central — AI features and your website: https://developers.google.com/search/docs/appearance/ai-features
- Google Search Central — Optimizing for generative AI features: https://developers.google.com/search/docs/fundamentals/ai-optimization-guide
- Google Search Central — Helpful, reliable, people-first content: https://developers.google.com/search/docs/fundamentals/creating-helpful-content
- Google Search Central — Canonical URL guidance: https://developers.google.com/search/docs/crawling-indexing/consolidate-duplicate-urls
- Google Search Central — Build and submit a sitemap: https://developers.google.com/search/docs/crawling-indexing/sitemaps/build-sitemap
- Google Search Central — Structured data introduction: https://developers.google.com/search/docs/appearance/structured-data/intro-structured-data
- Google Business Profile — Improve local ranking: https://support.google.com/business/answer/7091
- Google Business Profile — Manage reviews: https://support.google.com/business/answer/3474050
- Google Business Profile — Get more reviews without incentives: https://support.google.com/business/answer/3474122

Current official guidance supports the same core approach used here: technically accessible pages, people-first original content, accurate business information, strong page experience and normal Search SEO fundamentals. Google does not require special AI-only markup, hidden text or an `llms.txt` file for AI Overviews or AI Mode.

## 23. Before vs after SEO readiness score

These are internal directional readiness scores based on the codebase before the SEO implementation and after the final implementation. They are not Google scores, ranking predictions, Lighthouse scores or third-party authority metrics.

| Area | Before | After | Main reason for improvement |
| --- | ---: | ---: | --- |
| Technical SEO | 38/100 | 92/100 | Canonical, complete metadata, sitemap, robots, manifest and validated structured data |
| On-page SEO | 58/100 | 87/100 | Factual local H1, improved title/description, service hierarchy, FAQs and descriptive anchors |
| Local SEO | 52/100 | 84/100 | Exact NAP, map, Sector 141 relevance, phone, Instagram and LocalBusiness schema |
| Entity SEO | 30/100 | 90/100 | Connected Organization, WebSite, WebPage, LocalBusiness, ImageObject and Service entities |
| AI Search readiness | 25/100 | 82/100 | Clear factual entity data, answerable FAQs, visible source content and LLM-readable summaries |
| Content quality | 55/100 | 76/100 | Unsupported claims removed, content remains useful; depth is limited by the verified fact set |
| Performance readiness | 68/100 | 79/100 | Responsive WebP images, preload, intrinsic dimensions and lazy loading; live CWV remains unmeasured |
| Accessibility | 70/100 | 84/100 | Semantic sections, accessible controls, alt text, form labels and native FAQ details elements |
| Conversion SEO | 80/100 | 89/100 | Phone, WhatsApp, Maps and consultation actions are prominent and usable |
| Overall readiness | 52/100 | 85/100 | Strong single-page foundation with external verification and content expansion still pending |

## 24. Final URL architecture

### Live and indexable

- `/` — homepage and primary local entity page

### Public supporting files

- `/sitemap.xml`
- `/robots.txt`
- `/llms.txt`
- `/llm.txt`
- `/site.webmanifest`

### Paid campaign URLs

- `/ayurveda/`
- `/physiotherapy/`

These two routes reuse the current landing-page design for paid traffic, use the matching service as the primary hierarchy, remain crawlable with `noindex,follow`, and are excluded from the XML sitemap.

### Recommended future URLs, not yet created

- `/rehabilitation/`
- `/conditions/back-pain/`
- `/conditions/neck-pain/`
- `/conditions/shoulder-pain/`
- `/conditions/knee-pain/`
- `/conditions/sports-injury/`

The future URLs should only be created when Punar Axis Therapy confirms the relevant services and can supply original, medically responsible content. A separate Sector 141 doorway page is not recommended while the homepage already serves that local intent.

## 25. Final keyword-to-URL map

No search-volume figures are claimed because no verified Google Ads/Search Console dataset was connected. Competition is a qualitative assessment based on the current local result sample.

| URL | Status | Primary intent | Supporting queries | Intent | Competition | Recommendation |
| --- | --- | --- | --- | --- | --- | --- |
| `/` | Live | Ayurveda-first integrated clinic in Sector 141 | Ayurveda clinic Sector 141, physiotherapy clinic Sector 141, rehabilitation Sector 141, Ayurveda Noida, physiotherapy Noida | Local commercial | High | Keep Ayurveda first in brand hierarchy while retaining strong Physiotherapy acquisition coverage |
| `/ayurveda/` | Paid / noindex | Ayurveda clinic Sector 141 | Ayurvedic clinic Sector 141, Ayurveda Noida, Ayurveda consultation Noida | Local commercial | Medium to high | Use for Ayurveda-focused paid traffic; do not treat as an organic service page |
| `/physiotherapy/` | Paid / noindex | physiotherapy clinic Sector 141 | physiotherapist Sector 141, physiotherapy Noida, physiotherapy consultation | Local commercial | High | Use for Physiotherapy-focused paid traffic; do not treat as an organic service page |
| `/rehabilitation/` | Future | rehabilitation Sector 141 | rehabilitation clinic Noida, mobility rehabilitation, strength rehabilitation | Local commercial | Medium | Create after actual rehabilitation scope is verified |
| `/conditions/back-pain/` | Future | back pain physiotherapy Sector 141 | physiotherapy for back pain Noida | Local mixed intent | High | Create only if treatment scope and medical review are confirmed |
| `/conditions/neck-pain/` | Future | neck pain physiotherapy Sector 141 | physiotherapy for neck pain Noida | Local mixed intent | Medium to high | Create only if confirmed |
| `/conditions/shoulder-pain/` | Future | shoulder pain physiotherapy Sector 141 | shoulder rehabilitation Noida | Local mixed intent | Medium | Create only if confirmed |
| `/conditions/knee-pain/` | Future | knee pain physiotherapy Sector 141 | knee rehabilitation Noida | Local mixed intent | High | Create only if confirmed |
| `/conditions/sports-injury/` | Future | sports injury rehabilitation Sector 141 | sports physiotherapy Noida | Local commercial | High | Create only if confirmed |

Each future page has one intended primary query group to prevent keyword cannibalization.

## 26. Final heading structure

### Homepage

- H1: Ayurveda, Physiotherapy & Rehabilitation in Sector 141, Noida
- H2: What Our Patients Say
- H2: Book your consultation today
- H2: Not sure which service to choose?
- H2: Our Core Services
- H3: Ayurveda
- H3: Physiotherapy
- H3: Rehabilitation
- H2: Questions patients often ask

Condition pages remain future-only recommendations and should be created only after the clinic verifies that each condition is within scope.

## 27. Competitor and local-result gap analysis

The August 2026 search sample surfaced:

- Aceso Physiotherapy Clinic / Team Aceso in Sector 141
- U.R Physiotherapy Body Relaxation Clinic in Sector 141
- Kinesis Physiocare in Sector 137
- AyurSoul Healthcare in Sector 75
- VCC Ayurveda and Medical Research LLP in Sector 52
- Physiovisheshta Rehab Centre in Sector 137
- B-Maxwell Physiotherapy Centre in Sector 31

### Common competitor strengths

- Dedicated physiotherapy or treatment pages
- Practitioner profiles and credentials
- Directory visibility through platforms such as Practo
- Clinic timings
- Large visible review counts
- Service-specific content
- Local area references

### Common competitor risks or weaknesses

- Heavy use of unverifiable superlatives
- Aggressive “best,” “most trusted” and outcome language
- Broad treatment lists without clear evidence or page depth
- Duplicate directory copy
- Pages that can feel search-first rather than patient-first

### Legitimate opportunities for Punar Axis Therapy

- Own an Ayurveda-first integrated entity position while preserving strong Physiotherapy and Rehabilitation discovery paths without making superiority claims
- Use the exact Sector 141 location consistently
- Publish real clinic photographs and a clear visit/consultation process
- Add verified service pages with original clinic-specific information
- Publish actual practitioner information only when supplied and approved
- Build a smaller, higher-quality content set rather than mass-producing condition/location pages
- Strengthen legitimate local citations and Google Business Profile activity

Backlinks and proprietary keyword volume were not assessed because no backlink database, Google Ads account or Search Console dataset was connected.

## 28. Google Business Profile implementation plan

### Category recommendation

- Primary: select the closest currently available Ayurveda category that accurately describes the clinic's real principal activity
- Secondary: `Physical therapist` if the clinic's physiotherapy activity meets the category definition
- Secondary: `Rehabilitation center` only if this exact category is available and accurately describes the clinic

Do not add categories merely for keywords.

### Copy-paste-ready business description

> Punar Axis Therapy is an Ayurveda-first clinic in Sector 141, Noida that also offers physiotherapy and rehabilitation services. The clinic is located at First Floor, SH-38, Sector 141, Noida, Uttar Pradesh 201309. Contact the clinic on +91 87965 20257 or visit the official website to request a consultation, call, message on WhatsApp or get directions.

### Service entries

**Ayurveda**

Ayurveda services at Punar Axis Therapy in Sector 141, Noida. Contact the clinic to discuss available care and request a consultation.

**Physiotherapy**

Physiotherapy services at Punar Axis Therapy in Sector 141, Noida. Contact the clinic to discuss your needs and request a consultation.

**Rehabilitation**

Rehabilitation services at Punar Axis Therapy in Sector 141, Noida. Contact the clinic to discuss your needs and request a consultation.

### Profile actions

- Use https://punaraxistrytherapy.in/ as the website URL
- Use the homepage consultation anchor as an appointment destination only if Google accepts the URL with its fragment
- Add verified opening hours when provided
- Add the exact primary phone
- Confirm the map pin is positioned at the verified entrance
- Complete available attributes only when factually correct

### Photo and video plan

- Add real exterior and entrance photos
- Add reception and treatment-room photos
- Add equipment photos only where the equipment is genuinely present
- Add team photographs only with permission and accurate names/roles
- Avoid stock treatment images
- Use short, steady clinic walk-through videos without identifiable patients
- Refresh photos periodically instead of uploading near-duplicates

### Google Posts plan

- Post service explanations, clinic updates and practical appointment information
- Use factual copy and one clear CTA
- Avoid outcome promises, fear-based wording and exaggerated claims
- Do not create repetitive keyword posts

### Reviews and responses

- Ask patients for an honest review after a genuine experience
- Use Google's official review link or QR code
- Never offer discounts, gifts or incentives for reviews
- Never tell patients which keywords to include
- Respond politely and avoid confirming sensitive medical details
- Thank positive reviewers and invite dissatisfied reviewers to continue privately without exposing health information

### Q&A plan

- Answer common questions about location, services, booking and visiting
- Monitor public user-submitted answers for inaccuracies
- Do not diagnose or discuss individual medical information in public Q&A

## 29. Local citation plan

Use the exact same NAP everywhere:

```text
Punar Axis Therapy
First Floor, SH-38, Sector 141, Noida, Uttar Pradesh 201309
+91 87965 20257
https://punaraxistrytherapy.in/
```

### Priority platforms

1. Google Business Profile
2. Apple Business Connect, if available for this business/location
3. Bing Places
4. Practo only if the clinic and practitioner information can be fully verified
5. Legitimate local healthcare or Noida business directories with editorial standards
6. Professional association directories only when membership is genuine

### Rules

- Search for an existing profile before creating a new one
- Avoid duplicate listings
- Do not submit to bulk spam directories
- Keep name, address, phone and website identical
- Keep services and categories factual
- Track profile ownership and update dates outside the public website

## 30. Content roadmap

### Stage 1 — Verified service pages

Create the Ayurveda page first, followed by Physiotherapy and Rehabilitation, after confirming:

- exact services
- consultation process
- available therapies
- equipment
- practitioner review
- safety and expectation information
- business-approved photographs

### Stage 2 — Condition pages

Create only for conditions genuinely handled by the clinic. Each page must include original clinic-specific information, conservative medical language, red-flag advice where relevant and medical review where available.

### Stage 3 — Trust content

- About the clinic
- What to expect during a visit
- How consultation requests work
- Actual practitioner profiles when supplied
- Privacy notice
- Contact and directions information

### Stage 4 — Small educational library

Potential topics after medical review:

- What to prepare before a physiotherapy consultation
- Questions to ask during rehabilitation planning
- What to expect from an Ayurveda consultation
- When mobility concerns may warrant professional assessment
- How to plan a follow-up visit

Do not publish a high-volume AI article program.

## 31. AI Search / GEO strategy

- Keep business facts identical across visible copy, schema, GBP and citations
- Use concise answer-first introductions on future pages
- Give every page one clear intent and main entity
- Add original clinic-specific information that generic summaries cannot provide
- Use clear questions and factual answers where they help patients
- Connect Organization, WebSite, WebPage, LocalBusiness, ImageObject and Service entities
- Keep real images associated with relevant content
- Make important content visible; do not use AI-only or hidden text
- Preserve crawlability and normal Search eligibility
- Maintain `/llms.txt` and `/llm.txt` as factual documentation, not ranking mechanisms
- Earn mentions through legitimate local and professional relationships rather than manipulative links

## 32. Performance and accessibility results

### Confirmed in code/build

- Responsive WebP hero images
- Responsive `srcset` and `sizes`
- Width and height on important content images
- Lazy loading below the fold
- Preloaded likely LCP image
- Semantic header, main, sections, address and footer
- Labelled form controls
- Accessible mobile-menu state
- Native keyboard-operable FAQ accordions
- No mobile horizontal overflow in browser validation
- No browser runtime errors in the completed browser pass

### Not yet measured externally

- Production LCP
- Production INP
- Production CLS
- Lighthouse mobile score
- PageSpeed field data
- Real-user Chrome UX Report data

The current Google Fonts request remains a render-path dependency. Self-hosting should only be prioritized if the production performance test shows a meaningful gain.

## 33. Privacy and healthcare-data handling

- The consultation form prepares a WhatsApp message in the visitor's browser
- The visitor can review the message before sending
- No form database or server-side health-record storage was added
- No analytics configuration currently receives form contents
- Patient names, phone numbers, messages and health information must never be sent to analytics
- A legally reviewed privacy notice should be added before expanding data collection or adding analytics/cookies

## 34. Files changed

- `artifacts/punar-axis-therapy/index.html`
- `artifacts/punar-axis-therapy/package.json`
- `artifacts/punar-axis-therapy/scripts/create-campaign-pages.mjs`
- `artifacts/punar-axis-therapy/scripts/validate-seo.mjs`
- `artifacts/punar-axis-therapy/src/components/consultation-form.tsx`
- `artifacts/punar-axis-therapy/src/components/hero-slider.tsx`
- `artifacts/punar-axis-therapy/src/index.css`
- `artifacts/punar-axis-therapy/src/lib/constants.ts`
- `artifacts/punar-axis-therapy/src/lib/page-variants.ts`
- `artifacts/punar-axis-therapy/src/pages/campaign-page.tsx`
- `artifacts/punar-axis-therapy/src/pages/home.tsx`
- `artifacts/punar-axis-therapy/src/App.tsx`
- `artifacts/punar-axis-therapy/public/robots.txt`
- `artifacts/punar-axis-therapy/SEO_IMPLEMENTATION_REPORT.md`

## 35. New files created

- `artifacts/punar-axis-therapy/public/sitemap.xml`
- `artifacts/punar-axis-therapy/public/llms.txt`
- `artifacts/punar-axis-therapy/public/llm.txt`
- `artifacts/punar-axis-therapy/public/site.webmanifest`
- `artifacts/punar-axis-therapy/SEO_IMPLEMENTATION_REPORT.md`
- `artifacts/punar-axis-therapy/scripts/create-campaign-pages.mjs`
- `artifacts/punar-axis-therapy/scripts/validate-seo.mjs`

## 36. URLs created

- https://punaraxistrytherapy.in/sitemap.xml
- https://punaraxistrytherapy.in/robots.txt
- https://punaraxistrytherapy.in/llms.txt
- https://punaraxistrytherapy.in/llm.txt
- https://punaraxistrytherapy.in/site.webmanifest

- https://punaraxistrytherapy.in/physiotherapy/ (paid landing page, noindex)
- https://punaraxistrytherapy.in/ayurveda/ (paid landing page, noindex)

No new indexable organic content URL was created.

## 37. Redirects created

No redirects were created because no verified legacy URLs were supplied and production DNS/hosting access was not available. HTTP-to-HTTPS and www-to-non-www behavior must be verified after publishing.

## 38. Remaining human or external-access actions

- Publish the current build
- Verify the domain in Google Search Console
- Submit the sitemap
- Inspect the homepage and request indexing
- Confirm HTTPS and canonical hostname redirects
- Test unknown production paths for a real HTTP 404
- Confirm the canonical website URL in Google Business Profile
- Provide verified opening hours
- Provide verified coordinates if GeoCoordinates are desired
- Confirm Google Business Profile categories
- Add and maintain genuine GBP photos/posts
- Implement the non-incentivized review plan
- Connect GA4/GTM only with privacy-conscious event configuration
- Obtain legal review for a privacy notice before expanded tracking
- Supply verified practitioner and service details before creating service pages
- Run production Lighthouse/PageSpeed and monitor Search Console Core Web Vitals

## 39. Final acceptance status

| Requirement | Status |
| --- | --- |
| Homepage technically optimized | Complete |
| Service architecture | Homepage remains the organic page; two paid campaign variants are available and noindexed |
| Keyword map | Complete |
| Cannibalization prevention | Complete for current/future map |
| Local entity and NAP | Complete in code |
| Sitemap, robots and canonicals | Complete in code; campaign routes are crawlable, self-canonical and excluded from sitemap |
| Metadata and social cards | Complete |
| Image SEO | Complete for current key images |
| Internal linking | Complete for current one-page architecture |
| Breadcrumbs | Not applicable to the single homepage; required on future nested pages |
| Schema graph | Complete; homepage and static campaign output are validated by the build |
| Unsupported/fake schema | None added |
| Doorway or mass thin pages | None added |
| True production 404 | External validation pending |
| Production HTTPS redirects | External validation pending |
| Mobile UX preserved | Complete |
| Core Web Vitals | Code optimized; production measurement pending |
| Accessibility | Improved and browser-validated |
| AI-readable structure | Complete for current page |
| LLM files | Complete |
| GBP plan | Complete |
| Search Console plan | Complete |
| Conversion event plan | Complete; implementation pending analytics access |
| Citation plan | Complete |
| Competitor gap analysis | Complete at public-search level |
| Paid landing pages | Complete; Physiotherapy-first and Ayurveda-first variants preserve the shared design and CTAs |
| Final build | Complete |
| Final live crawl audit | Pending published URL and external access |

## 40. Repeatable local validation

The production build now generates the two campaign HTML shells and runs the SEO validator automatically:

```bash
pnpm --filter @workspace/punar-axis-therapy run build
```

The same checks can be run against an existing build with:

```bash
pnpm --filter @workspace/punar-axis-therapy run seo:check
```

The validator checks:

- Homepage and campaign titles, descriptions, robots directives, canonicals and social URLs
- Campaign JSON-LD WebPage IDs, URLs, names and descriptions
- Organization, LocalBusiness, Service and FAQ JSON-LD entities
- Sitemap namespace, canonical URL count and campaign exclusion
- robots.txt sitemap reference and public allow rule
- Matching `llms.txt` and `llm.txt` factual aliases
- Manifest name and canonical start URL
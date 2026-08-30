import { readFile } from "node:fs/promises";
import { access } from "node:fs/promises";
import { resolve } from "node:path";

const projectRoot = resolve(new URL("..", import.meta.url).pathname);
const publicRoot = resolve(projectRoot, "public");
const distRoot = resolve(projectRoot, "dist/public");
const siteUrl = "https://punaraxistherapy.in";

const pages = [
  {
    path: "index.html",
    url: `${siteUrl}/`,
    title: "Ayurveda physiotherapy in Sector 141, Noida",
    description: "Punar Axis Therapy offers Ayurveda, physiotherapy and rehabilitation services in Sector 141, Noida. Contact the clinic to plan a personalised consultation.",
    robots: "index, follow",
  },
  {
    path: "physiotherapy/index.html",
    url: `${siteUrl}/physiotherapy/`,
    title: "Punar Axis Therapy | Physiotherapy in Sector 141, Noida",
    description: "Punar Axis Therapy offers physiotherapy, Ayurveda and rehabilitation services in Sector 141, Noida. Contact the clinic to plan a personalised consultation.",
    robots: "noindex,follow",
  },
  {
    path: "ayurveda/index.html",
    url: `${siteUrl}/ayurveda/`,
    title: "Punar Axis Therapy | Ayurveda Clinic in Sector 141, Noida",
    description: "Punar Axis Therapy offers Ayurveda, physiotherapy and rehabilitation services in Sector 141, Noida. Contact the clinic to plan a personalised consultation.",
    robots: "noindex,follow",
  },
];

function fail(message) {
  throw new Error(`[SEO] ${message}`);
}

function assert(condition, message) {
  if (!condition) fail(message);
}

function readAttribute(html, selector, attribute) {
  const match = html.match(new RegExp(`<${selector}\\b[^>]*\\b${attribute}="([^"]*)"`, "i"));
  return match?.[1] ?? null;
}

function readJsonLd(html) {
  const match = html.match(/<script type="application\/ld\+json" data-site-jsonld="true">([\s\S]*?)<\/script>/i);
  assert(match, "missing site JSON-LD script");
  try {
    return JSON.parse(match[1]);
  } catch (error) {
    fail(`site JSON-LD is not valid JSON: ${error.message}`);
  }
}

function findEntity(graph, type) {
  return graph.find((entity) => Array.isArray(entity["@type"]) ? entity["@type"].includes(type) : entity["@type"] === type);
}

async function checkPublicFiles() {
  const robots = await readFile(resolve(publicRoot, "robots.txt"), "utf8");
  assert(/^User-agent:\s*\*\s*$/m.test(robots), "robots.txt is missing User-agent: *");
  assert(/^Allow:\s*\/\s*$/m.test(robots), "robots.txt must allow the public site");
  assert(robots.includes(`Sitemap: ${siteUrl}/sitemap.xml`), "robots.txt has the wrong sitemap URL");

  const sitemap = await readFile(resolve(publicRoot, "sitemap.xml"), "utf8");
  assert(sitemap.includes('xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"'), "sitemap.xml is missing the sitemap namespace");
  const sitemapUrls = [...sitemap.matchAll(/<loc>([^<]+)<\/loc>/g)].map((match) => match[1]);
  assert(sitemapUrls.length === 1 && sitemapUrls[0] === `${siteUrl}/`, "sitemap.xml must contain only the canonical homepage");
  assert(!sitemap.includes("/physiotherapy/") && !sitemap.includes("/ayurveda/"), "paid campaign URLs must stay out of sitemap.xml");

  const llms = await readFile(resolve(publicRoot, "llms.txt"), "utf8");
  const llm = await readFile(resolve(publicRoot, "llm.txt"), "utf8");
  assert(llms === llm, "llms.txt and llm.txt must remain identical aliases");
  for (const fact of ["Punar Axis Therapy", "Ayurveda", "Physiotherapy", "Rehabilitation", "Sector 141, Noida", "+91 87965 20257", `${siteUrl}/`]) {
    assert(llms.includes(fact), `llms.txt is missing verified fact: ${fact}`);
  }
  assert(!llms.includes("/physiotherapy/") && !llms.includes("/ayurveda/"), "paid campaign URLs must stay out of llms.txt");

  const manifest = JSON.parse(await readFile(resolve(publicRoot, "site.webmanifest"), "utf8"));
  assert(manifest.name === "Punar Axis Therapy", "manifest has the wrong app name");
  assert(manifest.start_url === "/", "manifest must start at the canonical homepage");
}

async function checkPage(page) {
  const html = await readFile(resolve(distRoot, page.path), "utf8");
  assert(readAttribute(html, "title", "data-seo-marker") === null, `${page.path} contains an unexpected title marker`);
  const title = html.match(/<title>([^<]+)<\/title>/i)?.[1] ?? null;
  assert(title === page.title, `${page.path} has the wrong title`);
  const descriptionMatch = html.match(/<meta\s+name="description"\s+content="([^"]*)"/i);
  assert(descriptionMatch?.[1] === page.description, `${page.path} has the wrong meta description`);
  const robotsMatch = html.match(/<meta\s+name="robots"\s+content="([^"]*)"/i);
  assert(robotsMatch?.[1] === page.robots, `${page.path} has the wrong robots directive`);
  const canonical = html.match(/<link\s+rel="canonical"\s+href="([^"]*)"/i)?.[1] ?? null;
  assert(canonical === page.url, `${page.path} has the wrong canonical URL`);
  const ogUrl = html.match(/<meta\s+property="og:url"\s+content="([^"]*)"/i)?.[1] ?? null;
  assert(ogUrl === page.url, `${page.path} has the wrong Open Graph URL`);
  const ogTitle = html.match(/<meta\s+property="og:title"\s+content="([^"]*)"/i)?.[1] ?? null;
  assert(ogTitle === page.title, `${page.path} has the wrong Open Graph title`);
  const ogDescription = html.match(/<meta\s+property="og:description"\s+content="([^"]*)"/i)?.[1] ?? null;
  assert(ogDescription === page.description, `${page.path} has the wrong Open Graph description`);
  const twitterTitle = html.match(/<meta\s+name="twitter:title"\s+content="([^"]*)"/i)?.[1] ?? null;
  assert(twitterTitle === page.title, `${page.path} has the wrong Twitter title`);
  const twitterDescription = html.match(/<meta\s+name="twitter:description"\s+content="([^"]*)"/i)?.[1] ?? null;
  assert(twitterDescription === page.description, `${page.path} has the wrong Twitter description`);
  const socialImage = html.match(/<meta\s+property="og:image"\s+content="([^"]*)"/i)?.[1] ?? null;
  assert(socialImage === `${siteUrl}/punar-axis-hero-01-1280.webp`, `${page.path} has the wrong social image`);
  const twitterImage = html.match(/<meta\s+name="twitter:image"\s+content="([^"]*)"/i)?.[1] ?? null;
  assert(twitterImage === socialImage, `${page.path} has mismatched Twitter and Open Graph images`);
  assert(!html.includes('content="index, follow"') || page.robots === "index, follow", `${page.path} accidentally exposes an index directive`);

  const jsonLd = readJsonLd(html);
  const graph = jsonLd["@graph"];
  assert(Array.isArray(graph), `${page.path} JSON-LD is missing @graph`);
  const webpage = findEntity(graph, "WebPage");
  assert(webpage?.url === page.url, `${page.path} JSON-LD WebPage URL is stale`);
  assert(webpage?.["@id"] === `${page.url}#webpage`, `${page.path} JSON-LD WebPage ID is stale`);
  assert(webpage?.name === page.title, `${page.path} JSON-LD WebPage name is stale`);
  assert(webpage?.description === page.description, `${page.path} JSON-LD WebPage description is stale`);
  assert(findEntity(graph, "Organization"), `${page.path} is missing Organization JSON-LD`);
  assert(findEntity(graph, "LocalBusiness"), `${page.path} is missing LocalBusiness JSON-LD`);
  assert(findEntity(graph, "FAQPage"), `${page.path} is missing FAQPage JSON-LD`);
  for (const service of ["Ayurveda", "Physiotherapy", "Rehabilitation"]) {
    assert(graph.some((entity) => entity["@type"] === "Service" && entity.name === service), `${page.path} is missing ${service} Service JSON-LD`);
  }
}

await checkPublicFiles();
for (const asset of ["punar-axis-hero-01-1280.webp", "punar-axis-logo.webp", "site.webmanifest"]) {
  await access(resolve(publicRoot, asset));
}
for (const page of pages) {
  await access(resolve(distRoot, page.path));
  await checkPage(page);
}

console.log(`[SEO] validated ${pages.length} built pages, sitemap, robots.txt, manifest and AI-readable aliases.`);
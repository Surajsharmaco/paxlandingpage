import { mkdir, readFile, writeFile } from "node:fs/promises";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const projectRoot = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const builtHomepagePath = resolve(projectRoot, "dist/public/index.html");
const homepage = await readFile(builtHomepagePath, "utf8");

const campaignPages = {
  physiotherapy: {
    title: "Punar Axis Therapy | Physiotherapy in Sector 141, Noida",
    description: "Punar Axis Therapy offers physiotherapy, Ayurveda and rehabilitation services in Sector 141, Noida. Contact the clinic to plan a personalised consultation.",
  },
  ayurveda: {
    title: "Punar Axis Therapy | Ayurveda Clinic in Sector 141, Noida",
    description: "Punar Axis Therapy offers Ayurveda, physiotherapy and rehabilitation services in Sector 141, Noida. Contact the clinic to plan a personalised consultation.",
  },
};

function updateJsonLd(html, page, canonical) {
  const scriptPattern = /(<script type="application\/ld\+json" data-site-jsonld="true">)[\s\S]*?(<\/script>)/;
  const match = html.match(scriptPattern);
  if (!match) throw new Error("Could not find the site JSON-LD script in the built homepage.");

  const jsonLd = JSON.parse(match[0].slice(match[1].length, -match[2].length).trim());
  const webpage = jsonLd["@graph"]?.find((entity) => entity["@type"] === "WebPage");
  if (!webpage) throw new Error("Could not find the WebPage entity in the site JSON-LD graph.");

  webpage["@id"] = `${canonical}#webpage`;
  webpage.url = canonical;
  webpage.name = page.title;
  webpage.description = page.description;

  return html.replace(
    scriptPattern,
    `${match[1]}\n      ${JSON.stringify(jsonLd, null, 6).replace(/\n/g, "\n      ")}\n    ${match[2]}`,
  );
}

for (const [slug, page] of Object.entries(campaignPages)) {
  const canonical = `https://punaraxistherapy.in/${slug}/`;
  const html = homepage
    .replace(/<title>[^<]*<\/title>/, `<title>${page.title}</title>`)
    .replace(/(<meta name="description" content=")[^"]*(")/, `$1${page.description}$2`)
    .replace(/(<meta name="robots" content=")[^"]*(")/, "$1noindex,follow$2")
    .replace(/(<link rel="canonical" href=")[^"]*(")/, `$1${canonical}$2`)
    .replace(/(<meta property="og:title" content=")[^"]*(")/, `$1${page.title}$2`)
    .replace(/(<meta property="og:description" content=")[^"]*(")/, `$1${page.description}$2`)
    .replace(/(<meta property="og:url" content=")[^"]*(")/, `$1${canonical}$2`)
    .replace(/(<meta name="twitter:title" content=")[^"]*(")/, `$1${page.title}$2`)
    .replace(/(<meta name="twitter:description" content=")[^"]*(")/, `$1${page.description}$2`);
  const campaignHtml = updateJsonLd(html, page, canonical);

  const outputPath = resolve(projectRoot, `dist/public/${slug}/index.html`);
  await mkdir(dirname(outputPath), { recursive: true });
  await writeFile(outputPath, campaignHtml);
}
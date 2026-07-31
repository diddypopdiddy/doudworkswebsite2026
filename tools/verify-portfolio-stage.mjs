import { access, readFile } from "node:fs/promises";
import { createHash } from "node:crypto";
import { extname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const root = resolve(fileURLToPath(new URL("..", import.meta.url)));
const pages = ["index.html", "projects.html", "about.html", "contact.html"];
const generated = new Map();
const failures = [];

const check = (condition, message) => {
  if (!condition) failures.push(message);
};

const read = async (relativePath) =>
  readFile(resolve(root, relativePath), "utf8");
const readBytes = async (relativePath) =>
  readFile(resolve(root, relativePath));
const sha256 = (value) =>
  createHash("sha256").update(value).digest("hex");
const between = (value, start, end) => {
  const startIndex = value.indexOf(start);
  const endIndex = value.indexOf(end, startIndex);

  if (startIndex < 0 || endIndex < 0) {
    return "";
  }

  return value.slice(startIndex, endIndex + end.length);
};

for (const page of pages) {
  generated.set(page, await read(page));
}

const home = generated.get("index.html");
const projects = generated.get("projects.html");
const about = generated.get("about.html");
const contact = generated.get("contact.html");

for (const [page, html] of generated) {
  check(!html.includes("{{"), `${page} contains an unresolved template token`);
  check(
    html.includes('portfolio-stage-v2.css?v=20260731-8'),
    `${page} does not load the final versioned stylesheet`,
  );
  check(
    html.includes('portfolio-stage-v2.js?v=20260731-8'),
    `${page} does not load the final versioned script`,
  );
  check(
    html.includes('class="home-stage__canvas"'),
    `${page} is missing the authored Home canvas`,
  );
  check(
    html.includes('data-layer-close'),
    `${page} is missing accessible layer Close controls`,
  );
  check(
    html.includes("On a narrow window, scroll horizontally to explore the full desk scene"),
    `${page} is missing the narrow-window pan instruction`,
  );
  check(
    html.includes("<noscript>"),
    `${page} is missing the no-JavaScript fallback`,
  );

  const labels = Array.from(
    html.matchAll(
      /<a\s+class="nav-link(?: [^"]*)?"[^>]*data-route="(home|projects|about|contact)"/g,
    ),
    (match) => match[1],
  );
  check(
    labels.join(",") === "home,projects,about,contact",
    `${page} does not expose exactly Home / Projects / About / Contact`,
  );
  check(
    !/data-nav-view="teaching"|>Teaching<\/a>/.test(html),
    `${page} still exposes Teaching as top-level navigation`,
  );
  check(
    !/data-route="video"|>Video<\/a>/.test(html),
    `${page} exposes an internal Video navigation item`,
  );
  check(
    html.includes(
      'href="https://www.youtube.com/@vincedoud1/videos"\n            target="_blank"\n            rel="noopener"',
    ),
    `${page} does not preserve the external YouTube utility`,
  );
}

check(
  home.includes('src="media/home/interactive-teacher-desk-v2-phone.png"'),
  "Home does not use the integrated phone scene",
);
check(
  home.includes('class="desk-target desk-target--contact"') &&
    home.includes('aria-label="Open Contact"'),
  "Home is missing the phone-aligned Contact hotspot",
);
check(
  !home.includes('class="desk-phone"') &&
    !home.includes("desk-phone-contact-v1.png"),
  "Home still references the separate phone overlay",
);
check(
  projects.includes('data-initial-view="projects"'),
  "Projects does not have a stable direct-load state",
);
check(
  projects.includes(
    'class="stage-layer projects-layer is-project-neutral"',
  ),
  "Projects does not render the neutral initial state",
);
check(
  projects.includes(
    '<h1 class="visually-hidden" id="projects-title">Projects</h1>',
  ),
  "Projects is missing its persistent non-project heading",
);
check(
  projects.includes(
    '<h2 id="selected-project-title" data-project-title>',
  ),
  "Projects does not separate its selected-project heading",
);
const projectDetailFragment = between(
  projects,
  '            <article\n              class="project-detail"',
  "            </article>",
);
check(
  !projectDetailFragment.includes('<p class="layer-kicker">Projects</p>'),
  "Projects still repeats a visible Projects label above the selected project",
);
check(
  projects.includes(
    'class="project-detail"\n              data-project-detail\n              aria-labelledby="selected-project-title"\n              aria-hidden="true"\n              inert',
  ),
  "Projects detail is not semantically concealed at rest",
);
check(
  projects.includes(
    'class="project-media" data-project-media aria-hidden="true" inert',
  ),
  "Projects media is not semantically concealed at rest",
);
check(
  !projects.includes("project-option is-selected") &&
    !projects.includes('aria-pressed="true"'),
  "Projects still preselects a project in generated HTML",
);
const projectSelectorIds = Array.from(
  projects.matchAll(/data-project-id="([^"]+)"/g),
  (match) => match[1],
);
check(
  projectSelectorIds.join(",") ===
    "ai-production-framework,playbook,field-guide,ai-road-test,continuity,dry-eye,write-with-ai,video-textbook",
  "Projects does not expose the approved eight-project order",
);
check(
  projects.includes("AI Production Framework") &&
    projects.includes("AI Core") &&
    projects.includes("Competencies, AI Modes, the Production Spiral"),
  "Projects is missing the canon-aligned AI Production Framework entry",
);
check(
  projects.includes("AI Road Test — digital game"),
  "Projects does not use the exact approved AI Road Test directory title",
);
check(
  (projects.match(/aria-pressed="false"/g) || []).length === 8,
  "Projects does not initialize all eight selectors as unselected",
);
check(
  !projects.includes('<p class="project-directory__label">Projects</p>') &&
    !projects.includes("Selected work"),
  "Projects still exposes a duplicate visible directory label",
);
check(
  about.includes('data-initial-view="about"'),
  "About does not have a stable direct-load state",
);
check(
  about.includes('id="teaching-practice"'),
  "About is missing the migrated teaching-practice anchor",
);
for (const teachingRow of [
  "Problem-based learning",
  "Video production",
  "AI literacy",
  "Community art + media",
]) {
  check(
    about.includes(teachingRow),
    `About is missing the protected Teaching-practice row: ${teachingRow}`,
  );
}
check(
  contact.includes('data-initial-view="contact"'),
  "Contact does not have a stable direct-load state",
);
check(
  contact.includes('action="https://formspree.io/f/mojgbkra"'),
  "Contact is not wired to the approved Formspree endpoint",
);
check(
  contact.includes('method="post"'),
  "Contact form is not configured for a native POST fallback",
);
for (const field of ['name="name"', 'name="email"', 'name="message"']) {
  check(
    contact.includes(field),
    `Contact is missing its protected field: ${field}`,
  );
}

const combinedHtml = Array.from(generated.values()).join("\n");
check(
  !combinedHtml.includes("mailto:"),
  "A mail-app link remains in the generated site",
);
check(
  !combinedHtml.includes("no-cors"),
  "The contact integration contains an uninspectable no-cors request",
);
check(
  combinedHtml.includes("https://www.youtube.com/@vincedoud1/videos"),
  "The approved temporary YouTube URL is missing",
);
for (const protectedProjectDestination of [
  "https://ai-educator-playbook-vince-doud.diddypopdiddy.chatgpt.site",
  "resources/ai-permit-field-guide-v4-branded-screen.pdf",
  "https://ai-road-test-vince-doud.diddypopdiddy.chatgpt.site",
  "https://vince-continuity-showcase.diddypopdiddy.chatgpt.site",
  "https://premier-eye-clinical-platform.diddypopdiddy.chatgpt.site",
  "https://write-with-ai-vince-doud.diddypopdiddy.chatgpt.site",
  "https://interactive-video-textbook-audubon.diddypopdiddy.chatgpt.site",
]) {
  check(
    combinedHtml.includes(protectedProjectDestination),
    `Protected project destination is missing: ${protectedProjectDestination}`,
  );
}

const teachingRedirect = await read("teaching.html");
const videoRedirect = await read("video.html");
check(
  teachingRedirect.includes("about.html#teaching-practice"),
  "Teaching does not redirect to the migrated About section",
);
check(
  videoRedirect.includes("https://www.youtube.com/@vincedoud1/videos"),
  "Video does not redirect to the approved temporary YouTube destination",
);
check(
  sha256(teachingRedirect) ===
    "6d43703ddabc24615b277422a3108ead8511d35a6dfded62f6102e2b9544257c",
  "teaching.html changed outside the repair scope",
);
check(
  sha256(videoRedirect) ===
    "abb20883928923be8484a76994cb2eb9908c4dc1c14b55032ed3b1c46dc2858d",
  "video.html changed outside the repair scope",
);

const sitemap = await read("sitemap.xml");
const sitemapRoutes = Array.from(
  sitemap.matchAll(/<loc>https:\/\/www\.vincedoud\.com\/([^<]*)<\/loc>/g),
  (match) => match[1],
);
check(
  sitemapRoutes.join(",") === ",projects.html,about.html,contact.html",
  "Sitemap does not contain exactly the four approved public routes",
);
check(
  !sitemap.includes("teaching.html") && !sitemap.includes("video.html"),
  "Retired routes remain in the sitemap",
);
check(
  sha256(sitemap) ===
    "cf7251910603a99b34f10dae7c37aaed22c6016959aee23e37c1b95e8862b09c",
  "sitemap.xml changed outside the repair scope",
);

const script = await read("portfolio-stage-v2.js");
const stylesheet = await read("portfolio-stage-v2.css");
const template = await read("templates/portfolio-stage-shell.html");
const generator = await read("tools/generate-portfolio-pages.mjs");
const navFragment = between(
  template,
  '        <nav class="primary-nav"',
  "        </nav>",
);
const aboutFragment = between(
  template,
  '        <section\n          class="stage-layer about-layer"',
  "        </section>",
);
const contactStart = template.indexOf(
  '        <section\n          class="stage-layer contact-layer"',
);
const contactEnd = template.indexOf("        </section>", contactStart);
const contactFragment =
  contactStart >= 0 && contactEnd >= 0
    ? template.slice(contactStart, contactEnd + "        </section>".length)
    : "";
const projectDataFragment = between(
  script,
  "const projects = {",
  "};\n\nconst projectDetail",
);
const projectsFrameStyle = between(
  stylesheet,
  ".projects-frame {",
  "}\n\n.project-detail",
);

check(
  sha256(generator) ===
    "114c3375ee5f0087ad2faa911e5d8d8283a1ebfbd3dd813e3143c0911817fc0e",
  "The shared-page generator changed outside the repair scope",
);
check(
  sha256(navFragment) ===
    "127b94d623dba60ebb60c94bd9ae8b9be73b3f917f3060270a8f1e2f2ca33bef",
  "The exact approved primary navigation changed",
);
check(
  sha256(aboutFragment) ===
    "801d54c61ac19f9deb5119265ab6bd7673ca83cda8ff85ec3d4b84b3d5affb25",
  "The protected About foreground changed",
);
check(
  sha256(contactFragment) ===
    "248638d125cb70ce6224561ec5bf3ab1b7c70c18e04d8653a163e258feab1277",
  "The protected Contact foreground changed",
);
check(
  sha256(projectDataFragment) ===
    "9d27758955f89204ed7c493be262577f482647c67960f77f91adce795b9ef2c5",
  "The approved eight-project roster/data/actions changed",
);
for (const [page, html] of generated) {
  const pageNav = between(
    html,
    '        <nav class="primary-nav"',
    "        </nav>",
  );
  check(
    sha256(pageNav) ===
      "127b94d623dba60ebb60c94bd9ae8b9be73b3f917f3060270a8f1e2f2ca33bef",
    `${page} does not preserve the exact approved navigation block`,
  );
}
check(
  script.includes("const centerHomeCanvas"),
  "Home canvas centering logic is missing",
);
check(
  script.includes("homeStage.scrollTo"),
  "Home does not use native horizontal overflow positioning",
);
check(
  script.includes("const skipUrl = new URL(window.location.href)"),
  "The skip link does not follow the active history route",
);
check(
  script.includes('window.matchMedia("(prefers-reduced-motion: reduce)")'),
  "Reduced-motion handling is missing",
);
check(
  script.includes("let activeProject = null"),
  "Projects does not initialize with a nullable neutral selection",
);
check(
  script.includes("const clearProjectSelection = ({ clearPinned = true } = {}) =>"),
  "Projects is missing its deterministic neutral-state controller",
);
check(
  script.includes("setProjectRegionsVisible(false)") &&
    script.includes("setProjectRegionsVisible(true)"),
  "Projects does not conceal and reveal its detail regions deterministically",
);
const projectListenerBlock = between(
  script,
  "projectOptions.forEach((option, index) => {",
  '});\n\nwindow.addEventListener("popstate"',
);
check(
  projectListenerBlock.includes('addEventListener("pointerenter"') &&
    projectListenerBlock.includes('addEventListener("focus"') &&
    script.includes("let pinnedProject = null") &&
    script.includes("const restorePinnedProject = () =>"),
  "Projects is missing temporary hover/focus preview with pinned-state restoration",
);
check(
  projectListenerBlock.includes('addEventListener("click"') &&
    projectListenerBlock.includes('"ArrowDown"') &&
    projectListenerBlock.includes('"ArrowUp"'),
  "Projects is missing click selection or focus-only arrow navigation",
);
check(
  script.includes("window.history.replaceState(") &&
    script.includes('routeUrl("projects", id)'),
  "Project selection no longer uses the approved replaceState behavior",
);
check(
  script.includes("} else if (next.availability) {"),
  "Projects no longer supports a detail-only entry without an action or availability note",
);
check(
  script.includes('dialog: "framework"') &&
    script.includes('action: "Open the framework"') &&
    script.includes("frameworkDialog.showModal()") &&
    !script.includes("https://vince-ai-production-learning.diddypopdiddy.chatgpt.site"),
  "The AI Production Framework does not use the required internal dialog-only action",
);
check(
  script.includes("AI Core Competencies") &&
    script.includes("AI Modes") &&
    script.includes("Production Spiral") &&
    script.includes("responsibility, authorship, judgment, and verification"),
  "The Framework modal is missing protected canonical names or human-agency language",
);
check(
  stylesheet.includes("overflow-x: auto"),
  "Home stage does not expose native horizontal overflow",
);
check(
  stylesheet.includes("width: max(100vw, calc(100dvh * 1.5987903))"),
  "Home canvas is not held to its authored width",
);
check(
  stylesheet.includes("filter: blur(22px)"),
  "The approved deep Home blur is missing",
);
check(
  stylesheet.includes("radial-gradient(") &&
    stylesheet.includes("pointer-events: none") &&
    stylesheet.includes(".desk-target--contact"),
  "Home is missing the subtle non-intercepting hotspot treatment",
);
check(
  stylesheet.includes("desk-target-pulse 3.2s cubic-bezier(0.4, 0, 0.2, 1)") &&
    stylesheet.includes("transform: scale(1.18)") &&
    stylesheet.includes("0 0 13px") &&
    stylesheet.includes("--hotspot-delay: -2.75s"),
  "Home hotspots do not preserve the approved 18 percent pulse, easing, glow, and phase stagger",
);
check(
  stylesheet.includes(".mobile-project-preview") &&
    script.includes("activeOption.after(mobileProjectPreview)") &&
    script.includes("let placingProjectRegions = false") &&
    script.includes("frameworkDialog.contains(event.relatedTarget)"),
  "Projects is missing stable mobile placement or modal focus-boundary protection",
);
check(
  !stylesheet.includes(".desk-phone") &&
    !stylesheet.includes("translateX(4px)"),
  "The old phone overlay or moving Project-row treatment remains",
);
check(
  stylesheet.includes(".projects-layer.is-project-neutral .project-detail") &&
    stylesheet.includes("visibility: hidden"),
  "Projects does not reserve a stable neutral desktop layout",
);
check(
  projectsFrameStyle.includes("align-content: start") &&
    projectsFrameStyle.includes("padding: clamp(112px, 12vh, 150px)"),
  "Projects is not anchored near the navigation across desktop aspect ratios",
);

const v1Scene = await readBytes("media/home/interactive-teacher-desk-v1.png");
const oldPhone = await readBytes("media/home/desk-phone-contact-v1.png");
const v2Scene = await readBytes("media/home/interactive-teacher-desk-v2-phone.png");
const dryEyeThumbnail = await readBytes(
  "media/projects/dry-eye-clinical-decision-support.png",
);
const aiRoadTestThumbnail = await readBytes(
  "media/projects/ai-road-test-digital-game.jpg",
);
const aiProductionFrameworkThumbnail = await readBytes(
  "media/projects/ai-production-framework-structure-transparent-v1.png",
);
check(
  sha256(v1Scene) ===
    "ff60921b00663f13714c9d884add58d296bde251dabaeb9a4aa0ed0c4d96c937",
  "The stored v1 desk scene changed or was removed",
);
check(
  sha256(oldPhone) ===
    "f607d550e0e2d8f9ca0b5a2cb3f0321120d3a5cb8b06b9f0724a51f0966196ab",
  "The stored old phone asset changed or was removed",
);
check(
  sha256(v2Scene) ===
    "d36f82b6482396e9a7adca271e39c4858bda1030f0f16136698760c5d797780b",
  "The integrated phone scene does not match the approved asset",
);
check(
  sha256(dryEyeThumbnail) ===
    "f76135d0b64b22af87443c19717f0c65a307cd9289954720bd514e13af7ccd6c",
  "The Dry Eye project thumbnail changed from its verified source asset",
);
check(
  sha256(aiRoadTestThumbnail) ===
    "e82a912361d14725aa29233df227ae66fa3af1d83e4766c4d42cc071990fc5ce",
  "The AI Road Test thumbnail changed from its verified current screenshot",
);
check(
  sha256(aiProductionFrameworkThumbnail) ===
    "6b00cb66214ddf9428cc5d9e3ae75fe4b7c2f5d88c374725a0645098f6c37d05",
  "The AI Production Framework thumbnail changed from its verified website asset",
);
check(
  !combinedHtml.includes("interactive-teacher-desk-v1.png") &&
    !combinedHtml.includes("desk-phone-contact-v1.png") &&
    !stylesheet.includes("desk-phone-contact-v1.png") &&
    !script.includes("desk-phone-contact-v1.png"),
  "A generated page or runtime asset still references the retired Home visuals",
);

const localReferences = new Set();
for (const html of generated.values()) {
  for (const match of html.matchAll(/\b(?:src|href)="([^"#?]+)(?:[?#][^"]*)?"/g)) {
    const reference = match[1];
    if (
      reference.startsWith("http") ||
      reference.startsWith("/") ||
      reference.startsWith("#")
    ) {
      continue;
    }
    if (extname(reference)) localReferences.add(reference);
  }
}
for (const match of stylesheet.matchAll(/url\((?:'|")?([^)'"]+)(?:'|")?\)/g)) {
  const reference = match[1];
  if (!reference.startsWith("data:") && !reference.startsWith("http")) {
    localReferences.add(reference);
  }
}

for (const reference of localReferences) {
  try {
    await access(resolve(root, reference));
  } catch {
    failures.push(`Referenced local asset is missing: ${reference}`);
  }
}

if (failures.length) {
  console.error("Portfolio stage verification failed:");
  failures.forEach((failure) => console.error(`- ${failure}`));
  process.exit(1);
}

console.log(
  `Portfolio stage verification passed: ${pages.length} routes, ${localReferences.size} local resources, fixed Home canvas, layered navigation, redirects, and Formspree wiring.`,
);

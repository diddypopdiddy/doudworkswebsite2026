import { readFile, writeFile } from "node:fs/promises";
import { fileURLToPath } from "node:url";
import path from "node:path";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const templatePath = path.join(root, "templates", "portfolio-stage-shell.html");
const template = await readFile(templatePath, "utf8");

const pages = [
  {
    file: "index.html",
    view: "home",
    title: "Vince Doud | Teacher, creator, classroom AI explorer",
    canonical: "https://www.vincedoud.com/"
  },
  {
    file: "projects.html",
    view: "projects",
    title: "Projects | Vince Doud",
    canonical: "https://www.vincedoud.com/projects.html"
  },
  {
    file: "about.html",
    view: "about",
    title: "About | Vince Doud",
    canonical: "https://www.vincedoud.com/about.html"
  },
  {
    file: "contact.html",
    view: "contact",
    title: "Contact | Vince Doud",
    canonical: "https://www.vincedoud.com/contact.html"
  }
];

for (const page of pages) {
  const output = template
    .replaceAll("{{TITLE}}", page.title)
    .replaceAll("{{CANONICAL}}", page.canonical)
    .replaceAll("{{VIEW}}", page.view)
    .replaceAll("{{BODY_CLASS}}", page.view === "home" ? "" : "has-layer")
    .replaceAll("{{SKIP_TARGET}}", page.view === "home" ? "#home-content" : "#main")
    .replaceAll(
      "{{HOME_ACCESS}}",
      page.view === "home" ? 'role="main"' : 'aria-hidden="true" inert'
    )
    .replaceAll(
      "{{LAYER_ACCESS}}",
      page.view === "home" ? 'aria-hidden="true"' : 'role="main"'
    )
    .replaceAll(
      "{{PROJECTS_HIDDEN}}",
      page.view === "projects" ? "data-initial-visible" : "hidden"
    )
    .replaceAll(
      "{{ABOUT_HIDDEN}}",
      page.view === "about" ? "data-initial-visible" : "hidden"
    )
    .replaceAll(
      "{{CONTACT_HIDDEN}}",
      page.view === "contact" ? "data-initial-visible" : "hidden"
    );

  await writeFile(path.join(root, page.file), output, "utf8");
}

const redirectPage = ({ title, destination, canonical, message }) => `<!doctype html>
<html lang="en">
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <title>${title}</title>
    <link rel="canonical" href="${canonical}" />
    <meta http-equiv="refresh" content="0; url=${destination}" />
    <script>window.location.replace(${JSON.stringify(destination)});</script>
  </head>
  <body>
    <main>
      <p>${message} <a href="${destination}">Continue</a>.</p>
    </main>
  </body>
</html>
`;

await writeFile(
  path.join(root, "teaching.html"),
  redirectPage({
    title: "Teaching practice has moved | Vince Doud",
    destination: "about.html#teaching-practice",
    canonical: "https://www.vincedoud.com/about.html#teaching-practice",
    message: "Teaching practice now lives in About."
  }),
  "utf8"
);

await writeFile(
  path.join(root, "video.html"),
  redirectPage({
    title: "Videos | Vince Doud",
    destination: "https://www.youtube.com/@vincedoud1/videos",
    canonical: "https://www.youtube.com/@vincedoud1/videos",
    message: "Vince Doud’s videos are on YouTube."
  }),
  "utf8"
);

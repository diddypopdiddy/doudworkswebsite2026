import { access, readFile, readdir } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const release = path.join(root, ".release", "main-site-review");
const errors = [];

async function listFiles(directory, prefix = "") {
  const entries = await readdir(directory, { withFileTypes: true });
  const files = [];

  for (const entry of entries) {
    const relativePath = path.posix.join(prefix, entry.name);
    if (entry.isDirectory()) {
      files.push(...(await listFiles(path.join(directory, entry.name), relativePath)));
    } else {
      files.push(relativePath);
    }
  }

  return files;
}

const files = await listFiles(release);
const htmlFiles = files.filter((file) => file.endsWith(".html"));

for (const htmlFile of htmlFiles) {
  const absolute = path.join(release, htmlFile);
  const html = await readFile(absolute, "utf8");

  if (!/<html[^>]*\blang=["']en["']/i.test(html)) {
    errors.push(`${htmlFile}: missing html lang=en`);
  }
  if (!/<meta[^>]*\bname=["']viewport["']/i.test(html)) {
    errors.push(`${htmlFile}: missing viewport metadata`);
  }
  if (!/<title>[^<]+<\/title>/i.test(html)) {
    errors.push(`${htmlFile}: missing title`);
  }
  if (!/<h1(?:\s|>)/i.test(html)) {
    errors.push(`${htmlFile}: missing h1`);
  }

  const ids = [...html.matchAll(/\bid=["']([^"']+)["']/gi)].map(
    (match) => match[1],
  );
  const duplicates = ids.filter((id, index) => ids.indexOf(id) !== index);
  if (duplicates.length) {
    errors.push(`${htmlFile}: duplicate ids ${[...new Set(duplicates)].join(", ")}`);
  }

  for (const image of html.matchAll(/<img\b[^>]*>/gi)) {
    if (!/\balt=["'][^"']*["']/i.test(image[0])) {
      errors.push(`${htmlFile}: image missing alt text`);
    }
  }

  for (const match of html.matchAll(/\b(?:href|src)=["']([^"']+)["']/gi)) {
    const reference = match[1];
    if (
      reference.startsWith("#") ||
      reference.startsWith("mailto:") ||
      reference.startsWith("tel:") ||
      reference.startsWith("data:") ||
      reference.startsWith("javascript:") ||
      /^https?:\/\//i.test(reference)
    ) {
      continue;
    }

    const withoutFragment = reference.split("#")[0].split("?")[0];
    if (!withoutFragment) continue;
    const target = path.resolve(path.dirname(absolute), withoutFragment);

    if (!target.startsWith(release + path.sep)) {
      errors.push(`${htmlFile}: unsafe local reference ${reference}`);
      continue;
    }

    try {
      await access(target);
    } catch {
      errors.push(`${htmlFile}: missing local reference ${reference}`);
    }
  }
}

const searchable = await Promise.all(
  files
    .filter((file) => /\.(?:html|js|css|xml|txt)$/i.test(file))
    .map(async (file) => [file, await readFile(path.join(release, file), "utf8")]),
);

const banned = [
  ["local URL", /https?:\/\/(?:127\.0\.0\.1|localhost)/i],
  ["broken Apps Script endpoint", /script\.google\.com\/macros/i],
  ["old YouTube channel", /youtube\.com\/@vincedoud(?:\b|\/)(?!1)/i],
  ["false sent confirmation", /Message sent\./i],
  ["legacy sales booking language", /\b(?:book a call|fixed price|pilot package)\b/i],
];

for (const [file, text] of searchable) {
  for (const [label, pattern] of banned) {
    if (pattern.test(text)) errors.push(`${file}: contains ${label}`);
  }
}

if (errors.length) {
  throw new Error(`Release checks failed:\n- ${errors.join("\n- ")}`);
}

console.log(
  `Checked ${files.length} files and ${htmlFiles.length} HTML pages; no release errors found.`,
);

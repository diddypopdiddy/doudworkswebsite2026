import { copyFile, mkdir, readFile, readdir, rm, stat } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const manifestPath = path.join(root, "release-manifest.txt");
const output = path.join(root, ".release", "main-site-review");

const manifest = (await readFile(manifestPath, "utf8"))
  .split(/\r?\n/)
  .map((line) => line.trim())
  .filter((line) => line && !line.startsWith("#"));

if (new Set(manifest).size !== manifest.length) {
  throw new Error("The release manifest contains duplicate paths.");
}

for (const relativePath of manifest) {
  if (
    path.isAbsolute(relativePath) ||
    relativePath.startsWith("../") ||
    relativePath.includes("/../")
  ) {
    throw new Error(`Unsafe release path: ${relativePath}`);
  }

  const source = path.join(root, relativePath);
  const sourceStat = await stat(source);
  if (!sourceStat.isFile()) {
    throw new Error(`Release entry is not a file: ${relativePath}`);
  }
}

await rm(output, { recursive: true, force: true });

for (const relativePath of manifest) {
  const source = path.join(root, relativePath);
  const destination = path.join(output, relativePath);
  await mkdir(path.dirname(destination), { recursive: true });
  await copyFile(source, destination);
}

async function listFiles(directory, prefix = "") {
  const entries = await readdir(directory, { withFileTypes: true });
  const files = [];

  for (const entry of entries) {
    const relativePath = path.posix.join(prefix, entry.name);
    if (entry.isDirectory()) {
      files.push(...(await listFiles(path.join(directory, entry.name), relativePath)));
    } else if (entry.isFile()) {
      files.push(relativePath);
    } else {
      throw new Error(`Unsupported release entry: ${relativePath}`);
    }
  }

  return files;
}

const copied = (await listFiles(output)).sort();
const expected = [...manifest].sort();

if (JSON.stringify(copied) !== JSON.stringify(expected)) {
  throw new Error("Release output differs from the exact publication allowlist.");
}

console.log(`Prepared ${copied.length} allowlisted files in ${output}`);

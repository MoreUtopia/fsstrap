

import { mkdir, writeFile } from "node:fs/promises";
import { dirname } from "node:path";
import { execFile } from "node:child_process";
import { promisify } from "node:util";

const execFileAsync = promisify(execFile);

const REPOSITORY = "https://deb.debian.org/debian";
const SUITE = "stable";
const COMPONENT = "main";
const ARCHITECTURE = "amd64";

export interface DebianPackage {
  package: string;
  version: string;
  architecture: string;
  filename: string;
  downloadUrl: string;
  fields: Record<string, string>;
}

export default async function getDebianPackages(
  path: string
): Promise<DebianPackage[]> {
  const indexUrl =
    `${REPOSITORY}/dists/${SUITE}/${COMPONENT}` +
    `/binary-${ARCHITECTURE}/Packages.xz`;

  // Download and save the compressed package index.
  const response = await fetch(indexUrl);

  if (!response.ok) {
    throw new Error(
      `Failed to download package index: HTTP ${response.status}`
    );
  }

  await mkdir(dirname(path), { recursive: true });
  await writeFile(path, Buffer.from(await response.arrayBuffer()));

  // Decompress the saved index.
  const { stdout } = await execFileAsync("xz", ["-dc", path], {
    encoding: "utf8",
    maxBuffer: 512 * 1024 * 1024,
  });

  // Parse Debian control-file paragraphs.
  const paragraphs = stdout.split(/\n\s*\n/);
  const packages: DebianPackage[] = [];

  for (const paragraph of paragraphs) {
    const fields: Record<string, string> = {};
    let lastField: string | undefined;

    for (const line of paragraph.split("\n")) {
      // Continuation lines start with a space or tab.
      if (/^[ \t]/.test(line)) {
        if (lastField) {
          fields[lastField] += `\n${line.slice(1)}`;
        }
        continue;
      }

      const separator = line.indexOf(":");
      if (separator < 1) continue;

      const key = line.slice(0, separator);
      const value = line.slice(separator + 1).trimStart();

      fields[key] = value;
      lastField = key;
    }

    if (!fields.Package || !fields.Version || !fields.Filename) {
      continue;
    }

    packages.push({
      package: fields.Package,
      version: fields.Version,
      architecture: fields.Architecture ?? "all",
      filename: fields.Filename,
      downloadUrl: `${REPOSITORY}/${fields.Filename}`,
      fields,
    });
  }

  return packages;
}

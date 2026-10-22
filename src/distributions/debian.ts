import { mkdir, writeFile } from "node:fs/promises";
import { dirname } from "node:path";
import { execFile } from "node:child_process";
import { promisify } from "node:util";

const execFileAsync = promisify(execFile);

const DEFAULT_MIRROR = "https://deb.debian.org/debian";
const DEFAULT_SUITE = "stable";
const COMPONENT = "main";

export interface DebianPackage {
  package: string;
  version: string;
  architecture: string;
  filename: string;
  downloadUrl: string;
  fields: Record<string, string>;
}

// "stable" / "trixie"                  -> default mirror, that suite
// "https://ftp.pl.debian.org/debian"   -> that mirror, stable
function parseRepo(repo: string): { mirror: string; suite: string } {
  if (/^https?:\/\//.test(repo)) {
    return { mirror: repo.replace(/\/+$/, ""), suite: DEFAULT_SUITE };
  }
  return { mirror: DEFAULT_MIRROR, suite: repo };
}

async function fetchIndex(
  mirror: string,
  suite: string,
  arch: string,
  dest: string,
): Promise<DebianPackage[]> {
  const indexUrl =
    `${mirror}/dists/${suite}/${COMPONENT}/binary-${arch}/Packages.xz`;

  // Download and save the compressed package index.
  const response = await fetch(indexUrl);

  if (!response.ok) {
    throw new Error(
      `Failed to download package index ${indexUrl}: HTTP ${response.status}`,
    );
  }

  await mkdir(dirname(dest), { recursive: true });
  await writeFile(dest, Buffer.from(await response.arrayBuffer()));

  // Decompress the saved index.
  const { stdout } = await execFileAsync("xz", ["-dc", dest], {
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
      downloadUrl: `${mirror}/${fields.Filename}`,
      fields,
    });
  }

  return packages;
}

// dir:  where the downloaded indexes are stored
// repo: suite name ("stable") or mirror URL
// arch: Debian architecture name, e.g. amd64
export default async function getDebianPackages(
  dir: string,
  repo: string,
  arch: string,
): Promise<DebianPackage[]> {
  const { mirror, suite } = parseRepo(repo);

  const [archPkgs, allPkgs] = await Promise.all([
    fetchIndex(mirror, suite, arch, `${dir}/Packages-${arch}.xz`),
    fetchIndex(mirror, suite, "all", `${dir}/Packages-all.xz`),
  ]);

  return [...archPkgs, ...allPkgs];
}

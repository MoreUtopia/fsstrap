import type { DebianPackage } from "./debian.ts";

async function sha256(data: Uint8Array): Promise<string> {
  const hash = await crypto.subtle.digest("SHA-256", data);
  return [...new Uint8Array(hash)]
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
}

async function run(cmd: string, args: string[]) {
  const { code, stderr } = await new Deno.Command(cmd, {
    args,
    stderr: "piped",
  }).output();

  if (code !== 0) {
    throw new Error(
      `${cmd} ${args.join(" ")} failed: ${new TextDecoder().decode(stderr)}`,
    );
  }
}

export async function downloadDeb(
  pkg: DebianPackage,
  cacheDir: string,
): Promise<string> {
  const dest = `${cacheDir}/${pkg.filename.split("/").pop()}`;
  const expected = pkg.fields.SHA256;

  try {
    const cached = await Deno.readFile(dest);
    if (!expected || (await sha256(cached)) === expected) return dest;
  } catch { /* not cached */ }

  const res = await fetch(pkg.downloadUrl);
  if (!res.ok) {
    throw new Error(`Failed to download ${pkg.downloadUrl}: HTTP ${res.status}`);
  }

  const data = new Uint8Array(await res.arrayBuffer());

  if (expected && (await sha256(data)) !== expected) {
    throw new Error(`SHA256 mismatch for ${pkg.package}`);
  }

  await Deno.writeFile(dest, data);
  return dest;
}

// Debian is usr-merged: /bin, /sbin, /lib, /lib64 are symlinks into /usr.
// Create them up front so packages extract into usr/ instead of clobbering them.
export function createUsrMergeLayout(root: string) {
  for (const dir of ["usr/bin", "usr/sbin", "usr/lib", "usr/lib64"]) {
    Deno.mkdirSync(`${root}/${dir}`, { recursive: true });
  }

  for (const link of ["bin", "sbin", "lib", "lib64"]) {
    Deno.symlinkSync(`usr/${link}`, `${root}/${link}`);
  }
}

// .deb = ar archive containing control.tar.* and data.tar.*
export async function extractDeb(debPath: string, destDir: string) {
  const tmp = await Deno.makeTempDir({ prefix: "fsstrap-" });

  try {
    await run("ar", ["x", "--output", tmp, debPath]);

    let dataTar: string | undefined;
    for await (const entry of Deno.readDir(tmp)) {
      if (entry.name.startsWith("data.tar")) dataTar = entry.name;
    }

    if (!dataTar) throw new Error(`${debPath}: no data.tar.* member`);

    // tar autodetects gz/xz; zst needs zstd installed.
    // --keep-directory-symlink: don't replace the usr-merge symlinks with real dirs.
    // --no-same-owner: we're not root, don't try to chown.
    await run("tar", [
      "-xf",
      `${tmp}/${dataTar}`,
      "-C",
      destDir,
      "--keep-directory-symlink",
      "--no-same-owner",
    ]);
  } finally {
    await Deno.remove(tmp, { recursive: true });
  }
}

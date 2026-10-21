import type { DebianPackage } from "./debian.ts";

// "libc6 (>= 2.34), libfoo | libbar:any" -> [["libc6"], ["libfoo", "libbar"]]
function parseRelation(field?: string): string[][] {
  if (!field) return [];

  return field
    .split(",")
    .map((g) => g.trim())
    .filter(Boolean)
    .map((group) =>
      group
        .split("|")
        .map((alt) =>
          alt
            .replace(/\(.*?\)/g, "") // version constraints
            .replace(/\[.*?\]/g, "") // arch restrictions
            .replace(/<.*?>/g, "") // build profiles
            .trim()
            .replace(/:\S+$/, "") // :any, :amd64
        )
        .filter(Boolean)
    )
    .filter((g) => g.length > 0);
}

export function resolveDependencies(
  index: DebianPackage[],
  wanted: string[],
): DebianPackage[] {
  const byName = new Map<string, DebianPackage>();
  const providers = new Map<string, DebianPackage[]>();

  for (const pkg of index) {
    byName.set(pkg.package, pkg);

    for (const group of parseRelation(pkg.fields.Provides)) {
      for (const virt of group) {
        if (!providers.has(virt)) providers.set(virt, []);
        providers.get(virt)!.push(pkg);
      }
    }
  }

  const lookup = (name: string) =>
    byName.get(name) ?? providers.get(name)?.[0];

  const resolved = new Map<string, DebianPackage>();
  const queue: string[] = [];

  const isSatisfied = (name: string) =>
    resolved.has(name) ||
    (providers.get(name) ?? []).some((p) => resolved.has(p.package));

  for (const name of wanted) {
    if (!byName.has(name)) {
      throw new Error(`Package not found in index: ${name}`);
    }
    queue.push(name);
  }

  while (queue.length > 0) {
    const name = queue.shift()!;

    const pkg = lookup(name);
    if (!pkg) throw new Error(`Package not found in index: ${name}`);
    if (resolved.has(pkg.package)) continue;

    resolved.set(pkg.package, pkg);

    const groups = [
      ...parseRelation(pkg.fields["Pre-Depends"]),
      ...parseRelation(pkg.fields.Depends),
    ];

    for (const alternatives of groups) {
      // already satisfied by something we've pulled in
      if (alternatives.some(isSatisfied)) continue;

      const pick = alternatives.find((alt) => lookup(alt));
      if (!pick) {
        throw new Error(
          `${pkg.package}: unresolvable dependency: ${alternatives.join(" | ")}`,
        );
      }

      queue.push(pick);
    }
  }

  return [...resolved.values()];
}

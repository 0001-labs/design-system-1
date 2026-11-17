const ALPHABET = "0123456789abcdefghjkmnpqrstvwxyz";

const PUBLIC_ID_LENGTH = 20;

export function generatePublicId(): string {
  const limit = 256 - (256 % ALPHABET.length);
  const out: string[] = [];

  while (out.length < PUBLIC_ID_LENGTH) {
    for (const byte of crypto.getRandomValues(new Uint8Array(PUBLIC_ID_LENGTH))) {
      if (out.length >= PUBLIC_ID_LENGTH) break;
      if (byte >= limit) continue;
      out.push(ALPHABET[byte % ALPHABET.length]!);
    }
  }

  return out.join("");
}

export function slugify(name: string): string {
  const base = name
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 48);

  return base === "" ? "library" : base;
}

export function uniqueSlug(candidate: string, taken: ReadonlySet<string>): string {
  if (!taken.has(candidate)) return candidate;

  for (let suffix = 2; suffix < 1000; suffix += 1) {
    const next = `${candidate}-${suffix}`;
    if (!taken.has(next)) return next;
  }

  throw new Error("Could not find a free slug.");
}

export function isValidLibraryName(name: string): boolean {
  const trimmed = name.trim();
  return trimmed.length >= 1 && trimmed.length <= 60;
}

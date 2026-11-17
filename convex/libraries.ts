import { getAuthUserId } from "@convex-dev/auth/server";
import { ConvexError, v, type Value } from "convex/values";

import type { Doc, Id } from "./_generated/dataModel";
import { mutation, query, type MutationCtx, type QueryCtx } from "./_generated/server";
import { sha256Hex, utf8ByteLength } from "./lib/hash";
import { generatePublicId, isValidLibraryName, slugify, uniqueSlug } from "./lib/ids";
import { hasUnpublishedChanges, libraryState } from "./lib/libraryState";

const DEFAULT_MAX_LIBRARIES = 20;
const DEFAULT_MAX_CSS_BYTES = 512 * 1024;

function fail(code: string, message: string, details?: Record<string, Value>): never {
  const payload: Record<string, Value> = { code, message };
  if (details !== undefined) payload.details = details;
  throw new ConvexError(payload);
}

function maxLibraries(): number {
  return Number(process.env.MAX_LIBRARIES_PER_USER ?? DEFAULT_MAX_LIBRARIES);
}

function maxCssBytes(): number {
  return Number(process.env.MAX_CSS_BYTES ?? DEFAULT_MAX_CSS_BYTES);
}

function assetsBase(): string {
  return (process.env.ASSETS_BASE ?? "https://designsystem1.com/ds1").replace(/\/$/, "");
}

export function installUrl(publicId: string): string {
  return `${assetsBase()}/${publicId}/latest.css`;
}

async function requireUser(ctx: QueryCtx | MutationCtx): Promise<Id<"users">> {
  const userId = await getAuthUserId(ctx);
  if (userId === null) fail("unauthenticated", "Sign in to continue.");
  return userId;
}

async function requireOwned(
  ctx: QueryCtx | MutationCtx,
  libraryId: Id<"libraries">,
): Promise<{ userId: Id<"users">; library: Doc<"libraries"> }> {
  const userId = await requireUser(ctx);
  const library = await ctx.db.get(libraryId);

  if (library === null || library.ownerId !== userId || library.purgedAt !== undefined) {
    fail("not_found", "That library does not exist.");
  }

  return { userId, library };
}

function summarize(library: Doc<"libraries">) {
  return {
    _id: library._id,
    publicId: library.publicId,
    name: library.name,
    slug: library.slug,
    state: libraryState(library),
    hasUnpublishedChanges: hasUnpublishedChanges(library),
    publishedVersion: library.publishedVersion ?? null,
    publishedAt: library.publishedAt ?? null,
    draftUpdatedAt: library.draftUpdatedAt,
    draftBytes: utf8ByteLength(library.draftCss),
    lastPublishStatus: library.lastPublishStatus,
    installUrl: library.publishedVersion === undefined ? null : installUrl(library.publicId),
    createdAt: library._creationTime,
  };
}

export const list = query({
  args: {},
  handler: async (ctx) => {
    const userId = await requireUser(ctx);

    const rows = await ctx.db
      .query("libraries")
      .withIndex("by_owner", (q) => q.eq("ownerId", userId))
      .collect();

    return rows
      .filter((row) => row.purgedAt === undefined)
      .sort((a, b) => b.draftUpdatedAt - a.draftUpdatedAt)
      .map(summarize);
  },
});

export const get = query({
  args: { id: v.id("libraries") },
  handler: async (ctx, args) => {
    const userId = await requireUser(ctx);
    const library = await ctx.db.get(args.id);

    if (library === null || library.ownerId !== userId || library.purgedAt !== undefined) {
      return null;
    }

    return {
      ...summarize(library),
      draftCss: library.draftCss,
      draftConfig: library.draftConfig,
      draftRev: library.draftRev,
      draftHash: library.draftHash,
      templateVersion: library.templateVersion,
      publishedHash: library.publishedHash ?? null,
      lastPublishError: library.lastPublishError ?? null,
      archivedAt: library.archivedAt ?? null,
    };
  },
});

export const create = mutation({
  args: {
    name: v.string(),
    css: v.string(),
    config: v.string(),
    templateVersion: v.string(),
  },
  handler: async (ctx, args) => {
    const userId = await requireUser(ctx);

    if (!isValidLibraryName(args.name)) {
      fail("invalid_name", "A library name must be between 1 and 60 characters.");
    }

    const bytes = utf8ByteLength(args.css);
    if (bytes === 0) fail("css_required", "A new library needs its starting stylesheet.");
    if (bytes > maxCssBytes()) {
      fail("css_too_large", `That stylesheet is ${bytes} bytes; the limit is ${maxCssBytes()}.`);
    }

    const existing = await ctx.db
      .query("libraries")
      .withIndex("by_owner", (q) => q.eq("ownerId", userId))
      .collect();

    const live = existing.filter((row) => row.purgedAt === undefined);
    if (live.length >= maxLibraries()) {
      fail("quota_exceeded", `You can have at most ${maxLibraries()} libraries.`);
    }

    const now = Date.now();
    const slug = uniqueSlug(slugify(args.name), new Set(live.map((row) => row.slug)));

    const id = await ctx.db.insert("libraries", {
      publicId: generatePublicId(),
      ownerId: userId,
      name: args.name.trim(),
      slug,
      templateVersion: args.templateVersion,

      draftCss: args.css,
      draftConfig: args.config,
      draftHash: await sha256Hex(args.css),
      draftRev: 1,
      draftUpdatedAt: now,

      optimize: false,
      nextVersion: 0,
      lastPublishStatus: "never",
    });

    const created = await ctx.db.get(id);
    return summarize(created!);
  },
});

export const rename = mutation({
  args: { id: v.id("libraries"), name: v.string() },
  handler: async (ctx, args) => {
    const { userId, library } = await requireOwned(ctx, args.id);

    if (!isValidLibraryName(args.name)) {
      fail("invalid_name", "A library name must be between 1 and 60 characters.");
    }

    const siblings = await ctx.db
      .query("libraries")
      .withIndex("by_owner", (q) => q.eq("ownerId", userId))
      .collect();

    const taken = new Set(
      siblings.filter((row) => row._id !== library._id).map((row) => row.slug),
    );

    await ctx.db.patch(library._id, {
      name: args.name.trim(),
      slug: uniqueSlug(slugify(args.name), taken),
    });

    return summarize((await ctx.db.get(library._id))!);
  },
});

export const saveDraft = mutation({
  args: {
    id: v.id("libraries"),
    css: v.string(),
    config: v.string(),
    baseRev: v.number(),
  },
  handler: async (ctx, args) => {
    const { library } = await requireOwned(ctx, args.id);

    if (library.archivedAt !== undefined) {
      fail("archived", "This library is archived. Restore it before editing.");
    }

    const bytes = utf8ByteLength(args.css);
    if (bytes > maxCssBytes()) {
      fail("css_too_large", `That stylesheet is ${bytes} bytes; the limit is ${maxCssBytes()}.`);
    }

    if (args.baseRev !== library.draftRev) {
      fail("draft_conflict", "This library was edited somewhere else.", {
        serverRev: library.draftRev,
        serverHash: library.draftHash,
        serverUpdatedAt: library.draftUpdatedAt,
      });
    }

    const hash = await sha256Hex(args.css);

    if (hash === library.draftHash && args.config === library.draftConfig) {
      return { draftRev: library.draftRev, draftHash: hash, draftUpdatedAt: library.draftUpdatedAt };
    }

    const now = Date.now();
    await ctx.db.patch(library._id, {
      draftCss: args.css,
      draftConfig: args.config,
      draftHash: hash,
      draftRev: library.draftRev + 1,
      draftUpdatedAt: now,
    });

    return { draftRev: library.draftRev + 1, draftHash: hash, draftUpdatedAt: now };
  },
});

export const archive = mutation({
  args: { id: v.id("libraries") },
  handler: async (ctx, args) => {
    const { library } = await requireOwned(ctx, args.id);
    await ctx.db.patch(library._id, { archivedAt: Date.now() });
    return { archivedAt: Date.now() };
  },
});

export const restore = mutation({
  args: { id: v.id("libraries") },
  handler: async (ctx, args) => {
    const { library } = await requireOwned(ctx, args.id);
    await ctx.db.patch(library._id, { archivedAt: undefined });
    return summarize((await ctx.db.get(library._id))!);
  },
});

export const purge = mutation({
  args: { id: v.id("libraries"), confirmPublicId: v.string() },
  handler: async (ctx, args) => {
    const { library } = await requireOwned(ctx, args.id);

    if (args.confirmPublicId !== library.publicId) {
      fail("confirm_required", "Type the library's public id to confirm deletion.");
    }

    await ctx.db.patch(library._id, { purgedAt: Date.now() });
    return { purgedAt: Date.now() };
  },
});

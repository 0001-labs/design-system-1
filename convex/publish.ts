import { prepareLibrary, validateCss, type Issue } from "@ds-one/css-validate";
import { getAuthUserId } from "@convex-dev/auth/server";
import { ConvexError, v, type Value } from "convex/values";

import { internal } from "./_generated/api";
import type { Doc, Id } from "./_generated/dataModel";
import { action, internalMutation, internalQuery } from "./_generated/server";
import { ArtifactError, putLatest, putVersion } from "./lib/artifacts";
import { sha256Hex, utf8ByteLength } from "./lib/hash";

function fail(code: string, message: string, details?: Record<string, Value>): never {
  const payload: Record<string, Value> = { code, message };
  if (details !== undefined) payload.details = details;
  throw new ConvexError(payload);
}

function issuesToValue(issues: Issue[]): string {
  return JSON.stringify(issues);
}

export const publishResultValidator = v.object({
  version: v.number(),
  publishedAt: v.number(),
  installUrl: v.string(),
  immutableUrl: v.string(),
});

export const publish = action({
  args: {
    id: v.id("libraries"),
    baseRev: v.number(),
    note: v.optional(v.string()),
    force: v.optional(v.boolean()),
  },
  returns: publishResultValidator,
  handler: async (ctx, args): Promise<{
    version: number;
    publishedAt: number;
    installUrl: string;
    immutableUrl: string;
  }> => {
    const draft = await ctx.runQuery(internal.publish.forPublish, { id: args.id });

    if (args.baseRev !== draft.draftRev) {
      fail("draft_conflict", "This library was edited somewhere else. Reload before publishing.", {
        serverRev: draft.draftRev,
      });
    }

    const prepared = prepareLibrary(draft.draftCss);
    if (!args.force && draft.publishedHash === draft.draftHash && draft.publishedTransform === prepared.transform) {
      fail("nothing_to_publish", "The live stylesheet already matches this draft.");
    }

    const result = validateCss(draft.draftCss);
    if (!result.ok) {
      await ctx.runMutation(internal.publish.recordValidationFailure, {
        id: args.id,
        issues: issuesToValue(result.issues),
      });
      fail("validation_failed", "This stylesheet has problems that must be fixed before publishing.", {
        issues: issuesToValue(result.issues),
      });
    }

    const served = validateCss(prepared.css);
    if (!served.ok) {
      fail("preparation_failed", "This stylesheet could not be prepared for publishing. The live version is unchanged.", {
        issues: issuesToValue(served.issues),
      });
    }

    const contentHash = await sha256Hex(prepared.css);

    const begun = await ctx.runMutation(internal.publish.begin, {
      id: args.id,
      baseRev: args.baseRev,
      contentHash,
      sourceHash: draft.draftHash,
      transform: prepared.transform,
      byteSize: utf8ByteLength(prepared.css),
      note: args.note,
    });

    try {
      await putVersion(draft.publicId, begun.version, prepared.css, {
        libraryId: args.id,
        contentHash,
      });
    } catch (error) {
      await ctx.runMutation(internal.publish.recordArtifactFailure, {
        id: args.id,
        eventId: begun.eventId,
        versionDocId: begun.versionDocId,
        stage: "r2_version",
        orphanVersion: true,
      });
      throw toPublicError(error, "r2_version");
    }

    try {
      await putLatest(draft.publicId, begun.version, prepared.css, {
        libraryId: args.id,
        contentHash,
      });
    } catch (error) {
      await ctx.runMutation(internal.publish.recordArtifactFailure, {
        id: args.id,
        eventId: begun.eventId,
        versionDocId: begun.versionDocId,
        stage: "r2_latest",
        orphanVersion: false,
      });
      throw toPublicError(error, "r2_latest");
    }

    return await ctx.runMutation(internal.publish.finish, {
      id: args.id,
      eventId: begun.eventId,
      versionDocId: begun.versionDocId,
      version: begun.version,
      sourceHash: draft.draftHash,
    });
  },
});

function toPublicError(error: unknown, stage: string): ConvexError<Record<string, Value>> {
  const code = error instanceof ArtifactError ? error.code : "artifact_write_failed";
  return new ConvexError({
    code: "artifact_write_failed",
    message: "The stylesheet could not be written to storage. The live version is unchanged.",
    details: { stage, cause: code },
  });
}

export const forPublish = internalQuery({
  args: { id: v.id("libraries") },
  returns: v.object({
    publicId: v.string(),
    draftCss: v.string(),
    draftRev: v.number(),
    draftHash: v.string(),
    publishedHash: v.union(v.string(), v.null()),
    publishedTransform: v.union(v.string(), v.null()),
  }),
  handler: async (ctx, args) => {
    const library = await requireOwnedInternal(ctx, args.id);
    const live = library.publishedVersion === undefined
      ? null
      : await ctx.db
          .query("libraryVersions")
          .withIndex("by_library_version", (q) => q.eq("libraryId", library._id).eq("version", library.publishedVersion!))
          .unique();
    return {
      publicId: library.publicId,
      draftCss: library.draftCss,
      draftRev: library.draftRev,
      draftHash: library.draftHash,
      publishedHash: library.publishedHash ?? null,
      publishedTransform: live?.transform ?? null,
    };
  },
});

async function requireOwnedInternal(
  ctx: { auth: { getUserIdentity: () => Promise<unknown> }; db: { get: (id: Id<"libraries">) => Promise<Doc<"libraries"> | null> } },
  id: Id<"libraries">,
): Promise<Doc<"libraries">> {
  const userId = await getAuthUserId(ctx as never);
  if (userId === null) fail("unauthenticated", "Sign in to continue.");

  const library = await ctx.db.get(id);
  if (library === null || library.ownerId !== userId || library.purgedAt !== undefined) {
    fail("not_found", "That library does not exist.");
  }
  if (library.archivedAt !== undefined) {
    fail("archived", "This library is archived. Restore it before publishing.");
  }

  return library;
}

export const recordValidationFailure = internalMutation({
  args: { id: v.id("libraries"), issues: v.string() },
  returns: v.null(),
  handler: async (ctx, args) => {
    const library = await requireOwnedInternal(ctx, args.id);
    const now = Date.now();

    await ctx.db.patch(library._id, {
      lastPublishStatus: "failed",
      lastPublishError: args.issues,
    });

    await ctx.db.insert("publishEvents", {
      libraryId: library._id,
      kind: "publish",
      status: "failed",
      fromVersion: library.publishedVersion,
      actorId: library.ownerId,
      startedAt: now,
      finishedAt: now,
      failureStage: "validation",
      issues: args.issues,
    });

    return null;
  },
});

export const begin = internalMutation({
  args: {
    id: v.id("libraries"),
    baseRev: v.number(),
    contentHash: v.string(),
    sourceHash: v.string(),
    transform: v.string(),
    byteSize: v.number(),
    note: v.optional(v.string()),
  },
  returns: v.object({
    version: v.number(),
    versionDocId: v.id("libraryVersions"),
    eventId: v.id("publishEvents"),
  }),
  handler: async (ctx, args) => {
    const library = await requireOwnedInternal(ctx, args.id);

    if (args.baseRev !== library.draftRev) {
      fail("draft_conflict", "This library was edited somewhere else. Reload before publishing.", {
        serverRev: library.draftRev,
      });
    }

    if (library.lastPublishStatus === "in_progress") {
      fail("publish_in_progress", "A publish is already running for this library.");
    }

    const version = library.nextVersion + 1;
    const now = Date.now();

    await ctx.db.patch(library._id, {
      nextVersion: version,
      lastPublishStatus: "in_progress",
    });

    const versionDocId = await ctx.db.insert("libraryVersions", {
      libraryId: library._id,
      version,
      status: "writing",
      contentHash: args.contentHash,
      sourceHash: args.sourceHash,
      transform: args.transform,
      byteSize: args.byteSize,
      r2Key: `ds1/${library.publicId}/v/${version}.css`,
      sourceDraftRev: library.draftRev,
      createdBy: library.ownerId,
      note: args.note,
    });

    const eventId = await ctx.db.insert("publishEvents", {
      libraryId: library._id,
      kind: "publish",
      status: "in_progress",
      fromVersion: library.publishedVersion,
      toVersion: version,
      actorId: library.ownerId,
      startedAt: now,
    });

    return { version, versionDocId, eventId };
  },
});

export const recordArtifactFailure = internalMutation({
  args: {
    id: v.id("libraries"),
    eventId: v.id("publishEvents"),
    versionDocId: v.id("libraryVersions"),
    stage: v.string(),
    orphanVersion: v.boolean(),
  },
  returns: v.null(),
  handler: async (ctx, args) => {
    await ctx.db.patch(args.id, {
      lastPublishStatus: "failed",
      lastPublishError: JSON.stringify([
        { code: "artifact_write_failed", message: `Storage write failed at ${args.stage}.`, severity: "error" },
      ]),
    });

    if (args.orphanVersion) {
      await ctx.db.patch(args.versionDocId, { status: "orphaned" });
    }

    await ctx.db.patch(args.eventId, {
      status: "failed",
      finishedAt: Date.now(),
      failureStage: args.stage,
    });

    return null;
  },
});

export const finish = internalMutation({
  args: {
    id: v.id("libraries"),
    eventId: v.id("publishEvents"),
    versionDocId: v.id("libraryVersions"),
    version: v.number(),
    sourceHash: v.string(),
  },
  returns: publishResultValidator,
  handler: async (ctx, args) => {
    const library = await requireOwnedInternal(ctx, args.id);
    const now = Date.now();

    await ctx.db.patch(args.versionDocId, { status: "published" });

    await ctx.db.patch(library._id, {
      publishedVersion: args.version,
      publishedHash: args.sourceHash,
      publishedAt: now,
      lastPublishStatus: "succeeded",
      lastPublishError: undefined,
    });

    await ctx.db.patch(args.eventId, { status: "succeeded", finishedAt: now });

    const base = (process.env.ASSETS_BASE ?? "https://dsone.dev/ds1").replace(/\/$/, "");
    return {
      version: args.version,
      publishedAt: now,
      installUrl: `${base}/${library.publicId}/latest.css`,
      immutableUrl: `${base}/${library.publicId}/v/${args.version}.css`,
    };
  },
});

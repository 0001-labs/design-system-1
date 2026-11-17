import { authTables } from "@convex-dev/auth/server";
import { signInTables } from "./signIn/schema";
import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export default defineSchema({
  ...authTables,
  ...signInTables,

  accountProfiles: defineTable({
    userId: v.id("users"),
    companyName: v.string(),
  }).index("by_user", ["userId"]),

  libraries: defineTable({
    publicId: v.string(),

    ownerId: v.id("users"),

    name: v.string(),
    slug: v.string(),
    templateVersion: v.string(),

    archivedAt: v.optional(v.number()),
    purgedAt: v.optional(v.number()),

    draftCss: v.string(),
    draftConfig: v.string(),
    draftHash: v.string(),
    draftRev: v.number(),
    draftUpdatedAt: v.number(),

    optimize: v.boolean(),
    nextVersion: v.number(),
    publishedVersion: v.optional(v.number()),
    publishedHash: v.optional(v.string()),
    publishedAt: v.optional(v.number()),
    publishLockUntil: v.optional(v.number()),
    lastPublishStatus: v.union(
      v.literal("never"),
      v.literal("in_progress"),
      v.literal("succeeded"),
      v.literal("failed"),
    ),
    lastPublishError: v.optional(v.string()),
  })
    .index("by_publicId", ["publicId"])
    .index("by_owner", ["ownerId"])
    .index("by_owner_slug", ["ownerId", "slug"]),

  libraryVersions: defineTable({
    libraryId: v.id("libraries"),
    version: v.number(),
    status: v.union(v.literal("writing"), v.literal("published"), v.literal("orphaned")),

    contentHash: v.string(),
    sourceHash: v.string(),
    transform: v.string(),

    byteSize: v.number(),
    r2Key: v.string(),
    r2Etag: v.optional(v.string()),
    sourceDraftRev: v.number(),
    createdBy: v.id("users"),
    note: v.optional(v.string()),
  })
    .index("by_library", ["libraryId"])
    .index("by_library_version", ["libraryId", "version"]),

  devLoginLinks: defineTable({
    email: v.string(),
    url: v.string(),
    createdAt: v.number(),
  }).index("by_email", ["email"]),

  publishEvents: defineTable({
    libraryId: v.id("libraries"),
    kind: v.union(v.literal("publish"), v.literal("rollback")),
    status: v.union(v.literal("in_progress"), v.literal("succeeded"), v.literal("failed")),
    fromVersion: v.optional(v.number()),
    toVersion: v.optional(v.number()),
    actorId: v.optional(v.id("users")),
    startedAt: v.number(),
    finishedAt: v.optional(v.number()),
    failureStage: v.optional(v.string()),
    issues: v.optional(v.string()),
  }).index("by_library", ["libraryId"]),

  baseSystem: defineTable({
    css: v.string(),
    rev: v.number(),
    version: v.number(),
    updatedAt: v.number(),
    updatedBy: v.id("users"),
  }),

  baseVersions: defineTable({
    version: v.number(),
    css: v.string(),
    sheet: v.string(),
    contentHash: v.string(),
    createdAt: v.number(),
    createdBy: v.id("users"),
    restoredFrom: v.optional(v.number()),
  }).index("by_version", ["version"]),
});

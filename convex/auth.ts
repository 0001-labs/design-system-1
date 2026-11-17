import { convexAuth } from "@convex-dev/auth/server";
import type { MutationCtx } from "./_generated/server";
import { internal } from "./_generated/api";
import { resendApiKey, sendEmail } from "./lib/mail";
import { normalizeEmail } from "./lib/token";
import { signInProviders } from "./signIn/providers";
import { signInFunctions } from "./signIn/functions";
import { signInRedirect } from "./signIn/redirect";
import { signInAvailability } from "./signIn/social";
import { resolveSignInUser } from "./signIn/users";
import { signInCodeEmail } from "./signIn/emails";
import { rememberAppleTokenFromProfile } from "./signIn/appleTokens";

const PRODUCT = "Design system 1";
const BRANDS = { consistency: "Consistency" };

export const { auth, signIn, signOut, store, isAuthenticated } = convexAuth({
  providers: signInProviders({
    product: PRODUCT,
    brands: BRANDS,
    password: true,
    async sendCode(ctx, { email, code, product }) {
      const address = normalizeEmail(email);
      if (process.env.DEV_LOGIN_LINKS === "1") {
        await ctx.runMutation(internal.devLinks.record, {
          email: address,
          url: code,
          expiresAt: Date.now() + 10 * 60_000,
        });
        if (!resendApiKey()) {
          console.log(`[auth] sign-in code for ${address}: ${code}`);
          return;
        }
      }
      await sendEmail({ to: address, ...signInCodeEmail({ product, code }) }, product);
    },
  }),
  callbacks: {
    createOrUpdateUser: async (ctx, args) => {
      if (args.type === "oauth") {
        const available = signInAvailability(process.env, Date.now());
        if ((args.provider.id !== "google" && args.provider.id !== "apple") || !available[args.provider.id]) {
          throw new Error("This sign-in provider is not available. Continue with email.");
        }
      }
      return resolveSignInUser(ctx as unknown as MutationCtx, args, {
        findByEmail: async (ctx, email) =>
          (
            await ctx.db
              .query("users")
              .withIndex("email", (q) => q.eq("email", email))
              .first()
          )?._id ?? null,
        create: (ctx, user) => ctx.db.insert("users", user),
      });
    },
    async afterUserCreatedOrUpdated(ctx, { userId, ...args }) {
      await rememberAppleTokenFromProfile(ctx as unknown as MutationCtx, userId, args);
    },
    async redirect({ redirectTo }) {
      const origins = [
        process.env.SITE_URL ?? "",
        ...(process.env.AUTH_WEB_ORIGINS ?? "").split(","),
      ]
        .map((origin) => origin.trim())
        .filter(Boolean);
      return signInRedirect(redirectTo, { origins, paths: /^\/app(?:\/[^?#]*)?$/ });
    },
  },
});

export const { providers, passwordSignIn, remindAppleSecret } = signInFunctions({
  product: PRODUCT,
  owner: process.env.SIGN_IN_OWNER_EMAIL,
  codeReady: () => process.env.DEV_LOGIN_LINKS === "1" || Boolean(resendApiKey()),
});

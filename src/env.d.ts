/// <reference path="../.astro/types.d.ts" />

// Cloudflare Workers runtime env vars (available via Astro.locals.runtime.env at request time).
// import.meta.env cannot be used for runtime secrets — Vite replaces those references at
// build time, before Cloudflare has a chance to inject the actual secret values.
type CloudflareEnv = {
  GITHUB_TOKEN: string | undefined;
  GITHUB_CLIENT_ID: string | undefined;
  GITHUB_CLIENT_SECRET: string | undefined;
};

declare namespace App {
  interface Locals {
    runtime: {
      env: CloudflareEnv;
    };
  }
}

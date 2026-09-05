/** @type {import('next').NextConfig} */
const nextConfig = {
  /**
   * A fully static export. The site has no server behaviour — every page is
   * built from source files and generated JSON — so shipping a Node runtime
   * would buy nothing and cost a host. `out/` is uploaded to Cloudflare Pages
   * as-is.
   */
  output: 'export',
  /** Directory-style URLs, so `/components/button/` resolves without a rewrite rule. */
  trailingSlash: true,
  images: { unoptimized: true },
  /**
   * `pnpm build` fails on a type error rather than shipping one. Next's default
   * already does this; naming it keeps a future "just get it out" edit honest.
   */
  typescript: { ignoreBuildErrors: false },
  /**
   * Next writes its own AGENTS.md and CLAUDE.md into the app directory. This
   * repository already carries harness-managed versions at the root, and a
   * second pair one directory down is a second source of truth for the same
   * question.
   */
  agentRules: false,
}

export default nextConfig

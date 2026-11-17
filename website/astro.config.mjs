// @ts-check
import { defineConfig } from "astro/config";
import starlight from "@astrojs/starlight";
import sitemap from "@astrojs/sitemap";
import { remarkDocBlocks } from "./src/lib/remark-doc-blocks.mjs";

export default defineConfig({
  site: "https://designsystem1.com",
  redirects: {
    "/advanced/film-kit/": "/visual-kit/#app-content",
    "/visual-kit/windows/": "/visual-kit/#windows",
    "/visual-kit/device-bezels/": "/visual-kit/#device-bezels",
    "/visual-kit/app-chrome/": "/visual-kit/#app-chrome",
    "/visual-kit/app-content/": "/visual-kit/#app-content",
    "/2-core/choice/": "/2-core/checkbox/",
    "/1-root/pricing/": "/1-root/formatting/#prices",
    "/start-here/overview/": "/",
    "/start-here/installation/": "/getting-started/installation/",
    "/examples/": "/start-here/examples/",
    "/examples/settings/": "/start-here/examples/apps/#general-settings",
    "/examples/shop/": "/start-here/examples/apps/#shop",
    "/examples/planner/": "/start-here/examples/apps/#planning-app",
    "/examples/finance/": "/start-here/examples/apps/#finance-app",
    "/examples/product/": "/start-here/examples/apps/#product-showcase",
  },
  devToolbar: { enabled: false },
  markdown: { remarkPlugins: [remarkDocBlocks] },
  vite: {
    optimizeDeps: {
      include: ['lit', 'lit/directives/unsafe-html.js', '@lit-labs/signals'],
    },
    server: {
      proxy: {
        '/app': { target: process.env.DS1_APP_DEV_ORIGIN || 'http://127.0.0.1:5173', ws: true },
      },
      fs: {
        allow: [".."],
      },
    },
  },
  integrations: [
    sitemap({ filter: (page) => !/^https:\/\/designsystem1\.com\/(examples|play|adoption|architecture|libraries\/design-system-1)\//.test(page) }),
    starlight({
      title: "Design system 1",
      expressiveCode: {
        defaultProps: { wrap: true },
        plugins: [
          {
            name: "Not prose",
            hooks: {
              postprocessRenderedBlock: ({ renderData }) => {
                renderData.blockAst.properties.dataDsNotProse = "";
              },
            },
          },
        ],
      },
      pagefind: false,
      favicon: "/icons/design-system-1.svg",
      description:
        "A component-based design system built with TypeScript and LitElement that provides reusable UI components with built-in theming, internationalization, and accessibility features.",
      social: [
        {
          icon: "github",
          label: "GitHub",
          href: "https://github.com/0001-labs/ds-one",
        },
      ],
      components: {
        Sidebar: "./src/components/MySidebar.astro",
        Head: "./src/components/MyHead.astro",
        Header: "./src/components/MyHeader.astro",
        PageFrame: "./src/layouts/Layout.astro",
        TwoColumnContent: "./src/components/TwoColumnContent.astro",
        MarkdownContent: "./src/components/MarkdownContent.astro",
        PageTitle: "./src/components/Heading.astro",
        TableOfContents: "./src/components/TableOfContents.astro",
      },
      customCss: [
        "./src/styles/custom.css",
      ],
      sidebar: [
        {
          label: "Start Here",
          items: [
            { label: "Overview", link: "/" },
            { label: "Use with HTML", slug: "start-here/quick-start" },
            { label: "Play", link: "https://play.designsystem1.com/" },
          ],
        },
        {
          label: "Root",
          items: [
            { label: "Constraints", slug: "1-root/constraints" },
            { label: "Colours", link: "/colours/" },
            { label: "Fonts", slug: "1-root/fonts" },
            { label: "Languages", slug: "1-root/languages" },
            { label: "Formatting", slug: "1-root/formatting" },
            { label: "Theming", slug: "1-root/theming" },
            { label: "Material", slug: "1-root/material" },
            { label: "Shape", slug: "1-root/shape" },
            { label: "Prose", slug: "1-root/prose" },
            { label: "Feedback", slug: "1-root/feedback" },
            { label: "Keys", slug: "1-root/keys" },
            { label: "Device", slug: "1-root/device" },
            { label: "Scaling", slug: "1-root/scaling" },
            { label: "Image focus", slug: "1-root/focus" },
            { label: "Preferences", slug: "1-root/preferences" },
          ],
        },
        {
          label: "Core",
          items: [
            { label: "Activity", slug: "2-core/activity" },
            { label: "Avatar", slug: "2-core/avatar" },
            { label: "Badge", slug: "2-core/badge" },
            { label: "Button", slug: "2-core/button" },
            { label: "Card", slug: "2-core/card" },
            { label: "Chart", slug: "2-core/chart" },
            { label: "Checkbox", slug: "2-core/checkbox" },
            { label: "Color", slug: "2-core/color" },
            { label: "Composer", slug: "2-core/composer" },
            { label: "Cycle", slug: "2-core/cycle" },
            { label: "Empty state", slug: "2-core/empty" },
            { label: "File picker", slug: "2-core/file-picker" },
            { label: "Gap", slug: "2-core/gap" },
            { label: "Icon", slug: "2-core/icon" },
            { label: "Image", slug: "2-core/image" },
            { label: "Input", slug: "2-core/input" },
            { label: "Number", slug: "2-core/number" },
            { label: "Link", slug: "2-core/link" },
            { label: "Message", slug: "2-core/message" },
            { label: "Progress", slug: "2-core/progress" },
            { label: "Radio", slug: "2-core/radio" },
            { label: "Stat", slug: "2-core/stat" },
            { label: "Switch", slug: "2-core/switch" },
            { label: "Swatch", slug: "2-core/swatch" },
            { label: "Tag", slug: "2-core/tag" },
            { label: "Text", slug: "2-core/text" },
            { label: "Token", slug: "2-core/token" },
            { label: "Tooltip", slug: "2-core/tooltip" },
          ],
        },
        {
          label: "Unit",
          items: [
            { label: "Accordion", slug: "3-unit/accordion" },
            { label: "Avatar group", slug: "3-unit/avatar-group" },
            { label: "Calendar", slug: "3-unit/calendar" },
            { label: "Bento", slug: "3-unit/bento" },
            { label: "Carousel", slug: "3-unit/carousel" },
            { label: "Context", slug: "3-unit/context" },
            { label: "Form", slug: "3-unit/form" },
            { label: "List", slug: "3-unit/list" },
            { label: "Matrix", slug: "3-unit/matrix" },
            { label: "Menu", slug: "3-unit/menu" },
            { label: "Row", slug: "3-unit/row" },
            { label: "Select", slug: "3-unit/select" },
            { label: "Sidebar", slug: "3-unit/sidebar" },
            { label: "Table", slug: "3-unit/table" },
            { label: "Table of contents", slug: "3-unit/table-of-contents" },
            { label: "Tabs", slug: "3-unit/tabs" },
            { label: "Token field", slug: "3-unit/token-field" },
          ],
        },
        {
          label: "Page",
          items: [
            { label: "App frame", slug: "4-page/app" },
            { label: "Container", slug: "4-page/container" },
            { label: "Document", slug: "4-page/document" },
            { label: "Footer", slug: "4-page/footer" },
            { label: "Grid", slug: "4-page/grid" },
            { label: "Header", slug: "4-page/header" },
            { label: "Overlay", slug: "4-page/overlay" },
            { label: "Page", slug: "4-page/page" },
            { label: "Panel", slug: "4-page/panel" },
            { label: "Product guides", slug: "4-page/product-guides" },
          ],
        },
        {
          label: "Examples",
          items: [
            { label: "Overview", slug: "start-here/examples" },
            { label: "Apps and sites", slug: "start-here/examples/apps" },
            { label: "Workbenches", slug: "start-here/examples/workbenches" },
            { label: "Library sites", slug: "start-here/examples/library-sites" },
            { label: "Library apps", slug: "start-here/examples/library-apps" },
            { label: "Bird guide", slug: "start-here/examples/bird-guide" },
            { label: "Page layouts", slug: "start-here/examples/layouts" },
            { label: "HTML examples", slug: "start-here/examples/html" },
          ],
        },
        {
          label: "Advanced",
          items: [
            { label: "DS1 native", slug: "advanced/native" },
            { label: "Email kit", slug: "email" },
            { label: "VisualKit", slug: "visual-kit" },
            { label: "Text editor", link: "https://aa.0001.dev" },
          ],
        },
      ],
    }),
  ],
});

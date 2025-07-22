// @ts-check
// Note: type annotations allow type checking and IDEs autocompletion

import type * as Preset from "@docusaurus/preset-classic";
import type { Config } from "@docusaurus/types";
import type * as Plugin from "@docusaurus/types/src/plugin";
import type * as OpenApiPlugin from "docusaurus-plugin-openapi-docs";

const config: Config = {
  title: "FitMe Documentation",
  tagline: "Application de fitness adaptée au cycle menstruel",
  url: "https://docs.fitme.app",
  baseUrl: "/",
  onBrokenLinks: "throw",
  onBrokenMarkdownLinks: "warn",
  favicon: "img/favicon.ico",

  // GitHub pages deployment config.
  organizationName: "fitme-team",
  projectName: "fitme-docs",

  presets: [
    [
      "classic",
      {
        docs: {
          sidebarPath: require.resolve("./sidebars.ts"),
          editUrl: "https://github.com/fitme-team/fitme-docs/tree/main/docs/",
          docItemComponent: "@theme/ApiItem", // Derived from docusaurus-theme-openapi
        },
        blog: {
          showReadingTime: true,
          editUrl: "https://github.com/fitme-team/fitme-docs/tree/main/docs/",
          onInlineAuthors: "ignore",
          onUntruncatedBlogPosts: "ignore",
        },
        theme: {
          customCss: require.resolve("./src/css/custom.css"),
        },
      } satisfies Preset.Options,
    ],
  ],

  themeConfig: {
    docs: {
      sidebar: {
        hideable: true,
      },
    },
    navbar: {
      title: "FitMe Docs",
      logo: {
        alt: "FitMe Logo",
        src: "img/logo.svg",
      },
      items: [
        {
          type: "doc",
          docId: "mobile/getting-started",
          position: "left",
          label: "App Mobile",
        },
        {
          label: "API",
          position: "left",
          to: "/docs/category/fitme-api",
        },
        { to: "/blog", label: "Blog", position: "left" },
        {
          href: "https://github.com/fitme-team/fitme",
          label: "GitHub",
          position: "right",
        },
      ],
    },
    footer: {
      style: "dark",
      links: [
        {
          title: "Documentation",
          items: [
            {
              label: "Guide App Mobile",
              to: "/docs/mobile/getting-started",
            },
            {
              label: "API Reference",
              to: "/docs/category/fitme-api",
            },
          ],
        },
        {
          title: "Communauté",
          items: [
            {
              label: "Discord",
              href: "https://discord.gg/fitme",
            },
            {
              label: "Instagram",
              href: "https://instagram.com/fitme_app",
            },
          ],
        },
        {
          title: "Plus",
          items: [
            {
              label: "Blog",
              to: "/blog",
            },
            {
              label: "GitHub",
              href: "https://github.com/fitme-team/fitme",
            },
            {
              label: "Support",
              href: "mailto:support@fitme.app",
            },
          ],
        },
      ],
      copyright: `Copyright © ${new Date().getFullYear()} FitMe. Fait avec 💜 et Docusaurus.`,
    },
    prism: {
      additionalLanguages: [
        "typescript",
        "javascript",
        "json",
        "bash",
        "jsx",
        "tsx",
      ],
    },
    languageTabs: [
      {
        highlight: "javascript",
        language: "javascript",
        logoClass: "javascript",
      },
      {
        highlight: "typescript",
        language: "typescript",
        logoClass: "typescript",
      },
      {
        highlight: "bash",
        language: "curl",
        logoClass: "curl",
      },
      {
        highlight: "python",
        language: "python",
        logoClass: "python",
      },
    ],
  } satisfies Preset.ThemeConfig,

  plugins: [
    [
      'docusaurus-plugin-openapi-docs',
      {
        id: 'api',
        docsPluginId: 'classic',
        config: {
          fitme: {
            specPath: 'http://localhost:3000/api-json',
            outputDir: 'docs/api',
            sidebarOptions: {
              groupPathsBy: 'tag',
              categoryLinkSource: 'tag',
            },
            downloadUrl: 'http://localhost:3000/api-json',
            hideSendButton: false,
          },
        },
      },
    ],
  ],

  themes: ["docusaurus-theme-openapi-docs"],
};

export default async function createConfig() {
  return config;
}

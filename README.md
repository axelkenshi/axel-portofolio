<!-- Banner -->
<img width="1679" height="1080" alt="Image" src="https://github.com/user-attachments/assets/e45ec4c9-fd2b-447c-bda0-89da5cfb3e86" />

---

<p align="center">
  <a href="https://deepwiki.com/axelkenshi/axel-portofolio">
    <img src="https://img.shields.io/badge/Ask_DeepWiki-%5Binteractive_Docs%5D-4ee31a?style=for-the-badge&logo=databricks&logoColor=white" alt="Ask DeepWiki">
  </a>
  <a href="https://app.netlify.com/sites/myaxel/deploys">
    <img src="https://api.netlify.com/api/v1/badges/bbbaf767-8c46-4f47-8536-b2e61cecb094/deploy-status" alt="Netlify Status">
  </a>
  <a href="#ai-development--transparency-notes">
    <img src="https://img.shields.io/badge/AI_Assisted-Claude_%26_DeepSeek-blueviolet?style=for-the-badge&logo=openai&logoColor=white" alt="AI Assisted">
  </a>
  <a href="https://github.com/axelkenshi/axel-portofolio/blob/main/LICENSE">
    <img src="https://img.shields.io/badge/License-MIT-blue.svg?style=for-the-badge&logo=opensourceinitiative&logoColor=white" alt="License">
  </a>
  <a href="https://astro.build">
    <img src="https://img.shields.io/badge/Astro-v7.0-FF5D01?style=for-the-badge&logo=astro&logoColor=white" alt="Astro v7">
  </a>
  <a href="https://tailwindcss.com">
    <img src="https://img.shields.io/badge/Tailwind_CSS-v4.3-06B6D4?style=for-the-badge&logo=tailwindcss&logoColor=white" alt="Tailwind v4">
  </a>
  <a href="https://svelte.dev">
    <img src="https://img.shields.io/badge/Svelte-v5.0-FF3E00?style=for-the-badge&logo=svelte&logoColor=white" alt="Svelte 5">
  </a>
  <a href="https://www.typescriptlang.org">
    <img src="https://img.shields.io/badge/TypeScript-v6.0-3178C6?style=for-the-badge&logo=typescript&logoColor=white" alt="TypeScript 6">
  </a>
  <a href="https://github.com/sveltia/sveltia-cms">
    <img src="https://img.shields.io/badge/Sveltia_CMS-v0.248.0-4B32C3?style=for-the-badge&logo=git&logoColor=white" alt="Sveltia CMS">
  </a>
</p>

<h3 align="center">A simple portfolio website with a modern blog rendering engine.</h3>

---

## Table of contents

If you would like to read this in [Indonesian](README.id.md)

- [About the project](#about-the-project)
- [Key features](#key-features)
- [Structure overview](#structure-overview)
- [Getting started](#getting-started)
  - [Prerequisites](#prerequisites)
  - [Clone the repository](#clone-the-repository)
  - [Local development](#local-development)
  - [Enabling Sveltia CMS](#enabling-sveltia-cms)
- [Deploying to Netlify](#deploying-to-netlify)
- [AI Development & Transparency Notes](#ai-development--transparency-notes)
- [Further documentation](#further-documentation)
- [License](#license)

---

## About the project

This is a regular portfolio website. What makes this repository interesting, however, is the core functionality in `src/pages/quil-notes`: a content rendering engine built on Markdown and Astro Content Collections.

The `pages/index.astro` and `pages/dev` parts are my personal portfolio needs as a developer. You can ignore them or remove their integration, leaving only `/quil-notes` as the blog rendering engine. From there, feel free to build something else entirely.

## Key features

- **Quil Notes**: a Markdown-based blog engine with a feed, archive, categories, tags, search, and navigation between notes.
- **Sveltia CMS**: a writing dashboard at `/admin` with custom blocks such as images, videos, links, code, terminal output, and formulas.
- **Formulas and diagrams**: KaTeX and Mermaid are loaded from assets hosted within the project, so they do not depend on a CDN.
- **Light and dark themes**: follows the system preference and can be changed by the user.
- **/dev portfolio**: an optional personal profile page that can be removed at any time.

## Structure overview

Here is a high-level map. Technical details for each part will be covered in separate documentation. See the [core engine guide](#further-documentation).

```text
├── public/      # Static assets, Sveltia CMS configuration, and vendor assets
├── scripts/     # Helper scripts and automated tests
├── content/     # Markdown content (blogging and notes)
├── src/
│   ├── components/   # Shared components
│   ├── layouts/      # Page layouts (Quil Notes and portfolio)
│   ├── styles/       # Global CSS
│   └── pages/
│       ├── quil-notes/   # Blog rendering engine (core of the project)
│       ├── dev/          # Personal portfolio (optional)
│       └── index.astro   # Landing page
├── astro.config.mjs
└── package.json
```

## Getting started

### Prerequisites

- **Node.js 22.12** (current) or newer
- **Bun** as the package manager and script runner (make sure your Node.js version meets the requirements of the specific Bun version you use)

### Clone the repository

```bash
git clone https://github.com/axelkenshi/axel-portofolio.git
cd axel-portofolio
```

### Local development

Install the dependencies, then start the development server:

```bash
bun install
bun run dev
```

Open `http://localhost:4321` in your browser.

### Enabling Sveltia CMS

The `@sveltia/cms` dependency is already listed in `package.json`, so running `bun install` is enough. If the `public/admin/` folder is empty, copy the following files from `node_modules`:

Skip these commands if the `public/` folder already has its configuration. You will only need minor edits later.

```bash
cp node_modules/@sveltia/cms/dist/sveltia-cms.js public/admin/
cp -r node_modules/@sveltia/cms/dist/chunks public/admin/
```

**Testing the CMS locally**

Sveltia only runs in build or production mode, not in development mode. So run:

```bash
bun run build
bun run preview
```

Then open `http://localhost:4321/admin/`. Every time you change the CMS configuration, run the build again to see the result.

## Deploying to Netlify

I use Netlify so I don't have to write a serverless function myself for GitHub authentication in Sveltia.

**1. Connect the repository**

In Netlify, choose **Add new site > Import from GitHub**, then select your repository. Use the following settings:

| Setting           | Value           |
| ----------------- | --------------- |
| Install command   | `bun install`   |
| Build command     | `bun run build` |
| Publish directory | `dist`          |

_Skip this step if the site has already been deployed._

**2. Create a GitHub OAuth App**

Go to GitHub > Settings > Developer settings > OAuth Apps > New OAuth App, then fill in:

- **Homepage URL**: your website's domain
- **Authorization callback URL**: `https://api.netlify.com/auth/done`

Save the **Client ID**, then generate a **Client Secret**.

**3. Enable the GitHub provider in Netlify**

Open your site in Netlify > **Project configuration > Access & security > OAuth**. The location of this menu may differ in the latest UI. Install the GitHub provider, then enter the Client ID and Client Secret from the previous step.

**4. Check the CMS configuration**

Make sure `public/admin/config.yml` does not have a `base_url`. This lets Sveltia use Netlify login. Login is only needed when editing from the deployed website.

Also update this section in `config.yml` to point to your own repository:

```yml
backend:
  name: github
  repo: USERNAME/REPO-NAME
  branch: main
```

<details>
<summary><strong>How do I change the domain used by this source code?</strong></summary>

Change your domain in these two places:

1. `astro.config.mjs`, in the `site: "https://your.example",` setting
2. `pages/rss.xml.js`, in the `<url>`, `<title>`, and `<link>` fields

_The rest, such as the anchor links in the QuilLayout footer and other components, can be adjusted later._

</details>

<details>
<summary><strong>Is hosting really tied to Netlify?</strong></summary>

No. There is no hard dependency on Netlify.

Personally, I chose Netlify for the ease of GitHub OAuth in deployment. There are no plugin integrations or serverless configuration. This may also apply to other hosts such as Vercel, Cloudflare, and others. You can adapt it to your own needs.

If Netlify is not relevant to you, delete the `netlify.toml` file and the Netlify CSP in the `public/Content-Security-Policy` folder.

This website was originally designed for personal use, such as blogging and storytelling. If you want to use it for an organization, you will need to thoroughly rework the CMS integration and several other things on your own.

</details>

## AI Development & Transparency Notes

This portfolio project was designed, directed, and curated entirely by **Axel Kenshi** in his capacity as *Lead Developer*. Throughout the creation process, the development of code and logical structures was significantly supported by advanced AI models (**Claude** and **DeepSeek**), which served as *pair programmers* to accelerate coding and optimize the architecture.

In-depth architectural documentation and system flowcharts for this project can be accessed interactively via the [DeepWiki Axel Portfolio](https://deepwiki.com/axelkenshi/axel-portofolio).

## Further documentation

All more detailed technical documentation is stored in `content/notes/Dev...md`. You can read it directly through the Quil Notes interface:

1. Core engine structure guide (global): `https://axelkenshi.my.id/quil-notes/dev_this_core-engine`
2. Quil Notes code structure guide: `https://axelkenshi.my.id/quil-notes/dev_this_quilnotes_code-structure`
3. Guide to fully removing `/dev` and `pages/index.astro` _(coming soon)_
4. Sveltia configuration and Sveltia custom block editor guide: `https://axelkenshi.my.id/quil-notes/dev_this_sveltia_customization`

Change my domain name to the prefix `localhost:4321` to view it locally, or simply look for it under the "DeveloperDocs" category on the Quil Notes page.

Since it is naturally written in Indonesian, please use the API translator button located in the top-right corner of the content metadata bar (⇄ ID to EN).

## License

This project is released under the [MIT](LICENSE) license.

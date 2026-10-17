# Justin DeMatteis: Portfolio Website

My personal portfolio and business site, **Just Innovate**: **https://www.justindematteis.com**

It shows my work (Shopify apps, ecommerce sites, custom web apps and AI-assisted tools), my skills, and case studies, and it takes project and hiring enquiries. The content isn't hard-coded. Pages, case studies, blog posts, global styles, header and footer are all managed from my own **[Website Admin](https://github.com/Justindema76/JustConsignIn-Website-Admin)**.

---

## Pages

| URL | Page |
|---|---|
| `/` | Home |
| `/work` | Selected work |
| `/work/:slug` | Case studies: **JustConsignIn** (Shopify consignment app), **Jill & The Beanstalk** (Shopify SEO and ecommerce growth), **Wheels Automotive** (Adobe Commerce redesign and product designer), and more |
| `/work/wordpress-websites` (and sub-pages) | WordPress website projects |
| `/skills` | Skills |
| `/ai-development`, `/ai-development/:slug` | AI-assisted development articles |
| `/about` | About me |
| `/blog`, `/blog/:slug` | Blog |
| `/contact` | Contact |

Every page except the blog and post pages is a **managed page**: it's built in the admin's page builder and drawn here by `PageRenderer.jsx`.

## Features

- **Project request drawer:** a "Start a Project" slide-out form on every page (service, budget, timeline, message, plus UTM and referrer tracking). Requests are **auto-classified by service** (WordPress, custom plugin, Shopify, AI automation, API integration, custom web app, SEO) and arrive in the admin's Service Requests inbox.
- **Hiring contact form** for recruiters and employers, which goes to the admin's Hiring Contacts.
- **Case-study pages** with a hero, structured sections, a project image gallery and live-site links.
- **SEO:** per-route titles, descriptions, Open Graph and LinkedIn share images, and schema.org data (ProfilePage, CollectionPage). At build time, `scripts/generate-seo.mjs` writes a static HTML page for each route so search engines and social previews see real content. Also includes `robots.txt`, `humans.txt` and `llms.txt` for AI crawlers.

## Tech stack

- **React 18 + Vite**, React Router 7
- **Supabase:** shared CMS database (site key `justindematteis`) and form storage
- **Vercel:** hosting, SPA routing (`vercel.json`), and serverless functions in `api/`
- **GitHub Actions:** build check on every push and pull request, plus a GitHub Pages preview build

## Project structure

```text
api/
├── service-request.js     "Start a project" form endpoint
└── hiring-contact.js      Hiring contact form endpoint
server/service-requests/   Validation, service classification, and storage
src/
├── App.jsx                Routes
├── components/            Layout, PageRenderer, SEO, CaseStudyHero, forms, gallery
├── features/project-request/   The project request drawer
├── pages/                 ManagedPage, WorkPost, Blog, BlogPost, AiPost
└── lib/                   Supabase client and content loaders
scripts/generate-seo.mjs   Static SEO pages at build time
public/                    Images, robots.txt, llms.txt, humans.txt, manifest
```

## Run locally

```bash
npm install
npm run dev
npm run build    # production build + static SEO pages
```

---

**Developer:** Justin DeMatteis · [LinkedIn](https://www.linkedin.com/in/justin-dematteis-bab4bb)

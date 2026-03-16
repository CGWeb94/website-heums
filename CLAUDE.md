# CLAUDE.md — Frontend Website Rules (Extended)

## Always Do First
- **Invoke the `frontend-design` skill** before writing any frontend code, every session, no exceptions.
- Review `brand_assets/`, `components/`, `content/` folders before creating anything new.
- **Create `content/meta.txt`** at the start of every project if it doesn't exist yet (see Project Metadata below).

## Reference Images
- If a reference image is provided: match layout, spacing, typography, and color exactly. Swap in placeholder content (images via `https://placehold.co/`, generic copy). Do not improve or add to the design.
- If no reference image: design from scratch with high craft (see guardrails below).
- Screenshot your output, compare against reference, fix mismatches, re-screenshot. Do at least 2 comparison rounds. Stop only when no visible differences remain or user says so.

## Components & Inspiration
- If `components/` folder or links (Dribbble, Figma, etc.) are provided:
  - Use them **as-is**, adapting only to layout and responsive constraints.
  - Do not invent new components outside what’s provided unless explicitly instructed.
  - Annotate where external inspiration is used (e.g., “Card component adapted from Dribbble link”).
- Use placeholder assets only if no real asset is provided.

### Component Link Sources
Components are often provided as links — either in the `components/` folder as a text file (e.g., `components/links.txt` or `components/animations.md`) or directly in the chat message.

**Supported sources (fetch and use directly):**
- **21st.dev** — best source: provides component name, visual description, animation behavior, and code structure (React/Tailwind). Translate to vanilla HTML/CSS/GSAP as needed.
- **Framer Marketplace** — provides component description, props, and animation behavior. No raw code, use as behavioral reference.

## GSAP Animations
- Always include **GSAP** via CDN: `<script src="https://cdnjs.cloudflare.com/ajax/libs/gsap/3.12.2/gsap.min.js"></script>`
- Use **ScrollTrigger** where scrolling interactions make sense. Only animate:
  - `transform` (translate, scale, rotate)
  - `opacity`
- Never use `transition-all` or arbitrary animations.
- Maintain smooth, spring-style easing and minimal motion for readability.

### GSAP + Puppeteer Compatibility
- **Never set `opacity: 0` in CSS** on elements that GSAP will animate. If ScrollTrigger never fires (e.g. in Puppeteer), the element stays permanently invisible.
  - Instead: set initial state only via JavaScript — `gsap.set(el, { opacity: 0, y: 40 })` — never in CSS.
- The screenshot.mjs must force-complete all GSAP animations before taking the screenshot (see Screenshot Workflow above).

## Local Server
- **Always serve on localhost** — never screenshot a `file:///` URL.
- Before starting, check if port 3000 is already occupied:
  `curl -s http://localhost:3000 | grep -m1 "title"` — shows which site is running there.
- If port 3000 is taken: use port 3001 and update serve.mjs accordingly.
- Start: `node serve.mjs` (run in background as a background task).
- `serve.mjs` lives in the project root. Do not start a second instance.

## Screenshot Workflow
- Puppeteer is **globally** installed at: `C:/Users/Chris/AppData/Roaming/npm/node_modules/puppeteer`
- **ESM import workaround** — do NOT use `import puppeteer from 'puppeteer'` (fails with global installs). Use:
  ```js
  import { createRequire } from 'module';
  const require = createRequire(import.meta.url);
  const puppeteer = require('C:/Users/Chris/AppData/Roaming/npm/node_modules/puppeteer/lib/cjs/puppeteer/puppeteer.js');
  ```
- **Chrome path** — discover the version folder first:
  `ls C:/Users/Chris/.cache/puppeteer/chrome/` → outputs e.g. `win64-146.0.7680.31`
  Full path: `C:/Users/Chris/.cache/puppeteer/chrome/[VERSION]/chrome-win64/chrome.exe`
- **Always screenshot from localhost:** `node screenshot.mjs http://localhost:3001`
- Screenshots are saved automatically to `./temporary screenshots/screenshot-N.png` (auto-incremented, never overwritten).
- Optional label suffix: `node screenshot.mjs http://localhost:3001 label` → saves as `screenshot-N-label.png`
- **Force GSAP animations to complete** before screenshotting (add this to screenshot.mjs after page load):
  ```js
  await page.evaluate(() => {
    if (window.gsap) { gsap.globalTimeline.progress(1, true); gsap.globalTimeline.pause(); }
    window.scrollTo(0, 0);
  });
  await new Promise(r => setTimeout(r, 600));
  ```
- After screenshotting, read the PNG from `temporary screenshots/` with the Read tool — Claude can see and analyze the image directly.
- When comparing, be specific: "heading is 32px but reference shows ~24px", "card gap is 16px but should be 24px"
- Check: spacing/padding, font size/weight/line-height, colors (exact hex), alignment, border-radius, shadows, image sizing

## Navigation
- **Always** create a sticky navigation with a mobile burger menu — unless a reference image or explicit instructions say otherwise.
- **Desktop:** horizontal nav with page-anchor links on the left/center + one CTA button on the right.
- **Mobile (< 768px):** burger icon (☰) that toggles a fullscreen or slide-in menu. Implement with vanilla JS — no external libraries.
- Nav starts transparent over the hero, becomes solid (background color + box-shadow) on scroll. Use a scroll event listener or GSAP ScrollTrigger for this.
- Burger menu must have proper `aria-expanded` and keyboard accessibility.

## Output Defaults
- Single `index.html` file, all styles inline, unless user says otherwise
- Tailwind CSS via CDN: `<script src="https://cdn.tailwindcss.com"></script>`
- Placeholder images: `https://placehold.co/WIDTHxHEIGHT`
- Mobile-first responsive
- Always include semantic HTML, accessible ARIA labels, and proper headings hierarchy

## SEO Meta Tags
- Always include a full `<head>` SEO block derived from the customer's real information:
  ```html
  <title>[Company Name] – [Core Service] in [City]</title>
  <meta name="description" content="[1–2 sentences: who, what, where, USP from reviews/info]">
  <meta name="keywords" content="[5–10 relevant keywords from services + location]">
  <meta property="og:title" content="...">
  <meta property="og:description" content="...">
  <meta property="og:type" content="website">
  <link rel="canonical" href="...">
  ```
- Keywords must be specific: include service terms + city/region, never generic filler words.
- Description must be unique, max 155 characters, action-oriented.
- If the customer has a domain, use it for canonical and og:url; otherwise leave a placeholder.

## Brand & Customer Content
- Check `brand_assets/` folder before designing. Use real logos, color palettes, images, fonts, etc.

### Company Images
- Before using any placeholder images, check **both** `content/company_images/` and `brand_assets/company_images/` for real photos.
- If images exist in either folder, use them in the website (hero, gallery, about section, etc.) instead of placeholders.
- Only fall back to `https://placehold.co/WIDTHxHEIGHT` if both folders are empty or no suitable image exists.

### Customer Information & Content Generation
- Customer info is typically provided as plain text alongside the task. It may include:
  - Company name, address, phone, email, opening hours
  - List of services or products
  - About / history text
  - Google reviews / testimonials
- **Use all of this information** to generate the full website content:
  - Hero section: company name + core value proposition derived from services/reviews
  - About section: from the provided company info / history
  - Services/Leistungen section: from the services list
  - Reviews / Testimonials section: use the provided reviews verbatim or lightly formatted
  - Contact section / footer: use real address, phone, email, hours
- Do not invent content that contradicts or is absent from the provided info.
- Respect tone of voice: e.g., professional, friendly, authoritative, etc., as given.

## Anti-Generic Guardrails
- **Colors:** Never use default Tailwind palette (indigo-500, blue-600, etc.). Pick a custom brand color and derive from it.
- **Shadows:** Never use flat `shadow-md`. Use layered, color-tinted shadows with low opacity.
- **Typography:** Never use the same font for headings and body. Pair a display/serif with a clean sans. Apply tight tracking (`-0.03em`) on large headings, generous line-height (`1.7`) on body.
- **Gradients:** Layer multiple radial gradients. Add grain/texture via SVG noise filter for depth.
- **Animations:** Only animate `transform` and `opacity`. Never `transition-all`. Use spring-style easing.
- **Interactive states:** Every clickable element needs hover, focus-visible, and active states. No exceptions.
- **Images:** Add a gradient overlay (`bg-gradient-to-t from-black/60`) and a color treatment layer with `mix-blend-multiply`.
- **Spacing:** Use intentional, consistent spacing tokens — not random Tailwind steps.
- **Depth:** Surfaces should have a layering system (base → elevated → floating), not all sit at the same z-plane.

## Hard Rules
- Do not add sections, features, or content not in the reference or instructions
- Do not "improve" a reference design — match it
- Do not stop after one screenshot pass
- Do not use `transition-all`
- Do not use default Tailwind blue/indigo as primary color

## Suggested Extras (Optional but Recommended)
- **Accessibility:** Always add proper `alt` tags, keyboard navigation, focus-visible styling.
- **Responsive Checks:** Check at 375px, 768px, 1024px, 1440px widths.
- **Content Fallbacks:** If testimonials or reviews are missing, generate realistic placeholders that match brand tone.
- **Component Reuse:** Centralize repeated components (cards, buttons, modals) for consistency.
- **Animation Performance:** Prefer `will-change: transform` for animated elements.

## Project Metadata
At the start of every project, create `content/meta.txt` if it doesn't exist. Derive all values from the project folder name (e.g. `website-kunde-musterstadt` → slug `kunde-musterstadt`):

```
# Auto-generated – update when known
Domain:         [kunde-domain.de]
GitHub-Repo:    github.com/CGWeb94/[folder-name]
Vercel-Projekt: [folder-name]
Canonical-URL:  https://[kunde-domain.de]
```

- **Naming convention:** GitHub repo name = Vercel project name = project folder name. Always.
- If `content/meta.txt` already exists, read it and use the values for `canonical`, `og:url`, etc. in `<head>`.
- If domain is still a placeholder, use `https://[folder-name].vercel.app` as fallback canonical URL.

## GitHub Account & Credentials

- **GitHub user:** `CGWeb94`
- **PAT (Personal Access Token)** is stored in `~/.git-credentials` — set once, works for all projects forever:
  ```bash
  git config --global credential.helper store
  # credentials are stored as: https://CGWeb94:[TOKEN]@github.com
  ```
- To use the PAT for `gh` CLI commands, prefix with `GH_TOKEN=[TOKEN]`:
  ```bash
  GH_TOKEN=[TOKEN] "/c/Program Files/GitHub CLI/gh" repo create [name] --public --source=. --remote=origin --push
  ```
- **Note:** The actual PAT value is NOT stored in this file. It lives in `~/.git-credentials`. If it needs to be re-created: github.com/settings/tokens → classic → scopes: `repo` + `workflow`.

## GitHub + Vercel Auto-Deploy Setup

Full workflow to create a GitHub repo and connect it to Vercel so every `git push` triggers a new deployment.

### One-time Prerequisites (already done on this machine)
- **GitHub CLI** installed at: `C:/Program Files/GitHub CLI/gh`
- **PAT stored** in `~/.git-credentials` (set via `git config --global credential.helper store`)
- **Vercel CLI** installed globally (`npm i -g vercel`), logged in as `cgweb94` — verify with `vercel whoami`

### Step 1 – Initialize git repo (if not yet done)
```bash
cd "c:/Users/Chris/Claude Projekte/[folder-name]"
git init
git add -A
git commit -m "Initial commit"
```

### Step 2 – Create GitHub repo and push
```bash
# Use full path to gh and GH_TOKEN env var (gh auth login has session issues in bash)
GH_TOKEN=[TOKEN] "/c/Program Files/GitHub CLI/gh" repo create [folder-name] --public --source="c:/Users/Chris/Claude Projekte/[folder-name]" --remote=origin --push
```
Naming convention: GitHub repo name = Vercel project name = project folder name.

### Step 3 – First Vercel deployment
```bash
cd "c:/Users/Chris/Claude Projekte/[folder-name]"
vercel --prod --yes
```
Note the production URL (e.g. `https://[folder-name].vercel.app`). Update `content/meta.txt`.

### Step 4 – Connect Vercel to GitHub for auto-deploy (one-time per project, user does in browser)
1. Go to vercel.com → your project → **Settings → Git**
2. Click **"Connect Git Repository"**
3. Select `CGWeb94/[folder-name]`
4. Done — every future `git push` auto-deploys

### Step 5 – Future deploys (after GitHub is connected)
```bash
git add [files]
git commit -m "..."
git push   # triggers Vercel auto-deploy
```

### Quick summary
```bash
git init && git add -A && git commit -m "Initial commit"
GH_TOKEN=[TOKEN] "/c/Program Files/GitHub CLI/gh" repo create [name] --public --source="c:/Users/Chris/Claude Projekte/[name]" --remote=origin --push
vercel --prod --yes
# then connect GitHub in Vercel dashboard → all future deploys via git push
```

## Deployment (Vercel)
- Vercel CLI must be installed globally: `npm i -g vercel`
- Already logged in as `cgweb94` — verify: `vercel whoami`

### Subsequent deploys (if GitHub is connected):
```bash
git push   # Vercel auto-deploys
```

### Subsequent deploys (if GitHub is NOT connected):
```bash
vercel --prod
```

### Link custom domain (after user adds it in Vercel dashboard or via CLI):
```bash
vercel domains add [kunde-domain.de]
```

### Full workflow I run when user says "deploy":
1. Read `content/meta.txt` for project name and domain
2. Verify Vercel login: `vercel whoami`
3. If first deploy: run Step 1–4 from GitHub + Vercel section above
4. Output the live URL to the user
5. Update `content/meta.txt` with the real Vercel URL


# Sagar Patil — Earth to Belagavi portfolio

A cinematic 3D portfolio. Visitors start in space, fly
**Earth → Asia → India → Karnataka → Belagavi**, meet Sagar, then explore his
work through floating 3D objects around the planet.

Built with React, TypeScript, Vite, React Three Fiber (Three.js), GSAP and Framer Motion.
It is a static site: no server, no paid APIs.

## Run it on your computer

You need [Node.js](https://nodejs.org) 20 or newer.

```bash
npm install
npm run dev        # opens a local preview with live reload
npm run build      # creates the finished site in the dist/ folder
npm run preview    # serves dist/ locally to check the final build
```

## Put it online with GitHub Pages

### Option A: upload the ready-made build (quickest)

1. Unzip `sagar-earth-portfolio-site.zip`.
2. Upload **everything inside it** (index.html, the `assets`, `images` and
   `textures` folders, and the other files) to the root of your GitHub repository.
3. In the repository go to **Settings → Pages**, choose **Deploy from a branch**,
   pick `main` and `/ (root)`, then save.
4. The site is live in about a minute.

The build uses relative paths, so it works at `username.github.io` and at
`username.github.io/any-repo-name`.

### Option B: let GitHub build it for you

1. Push this whole project (the source code) to a GitHub repository on the `main` branch.
2. In **Settings → Pages**, set **Source** to **GitHub Actions**.
3. Every push to `main` now builds and publishes the site
   (see `.github/workflows/deploy.yml`).

### Cloudflare Pages

Create a Pages project from the repository with build command `npm run build`
and output directory `dist`.

## Change the content

Everything you read on the site comes from one file: **`src/data/portfolio.ts`**.

| To change | Edit |
|---|---|
| Name, title, summary, facts | `PROFILE` |
| Home location | `HOME` |
| Degrees, university pictures | `EDUCATION` |
| Jobs | `EXPERIENCE` |
| Projects (and their screenshots) | `PROJECTS` |
| Skills | `SKILLS` |
| Email, phone, links | `CONTACT` |

**Research and Achievements** are built but hidden because no details were
available. Add entries to the `RESEARCH` or `ACHIEVEMENTS` lists and the section,
plus its floating 3D object, appears automatically.

**Adding pictures:** put the file in `public/images/`, add it to `IMAGES` with its
width and height, then reference it (for example in a project's `images` list).
Every picture opens in the full-screen viewer with zoom and previous/next.

After deploying, set the full address of your site in the two `og:image` /
`twitter:image` tags in `index.html` so link previews show your photo.

## Project structure

```
src/
  data/portfolio.ts     all text and image references
  data/karnataka.ts     state outline drawn on the globe
  lib/director.ts       every scene transition (GSAP timelines)
  lib/rig.ts            camera and scene values the director animates
  lib/store.ts          app state (current scene, open section, image viewer)
  three/                the 3D scene: Earth, atmosphere, stars, border,
                        beacon, floating section objects, shaders
  ui/                   loader, hero, journey, intro, section panel,
                        image viewer and the sections themselves
public/textures/        Earth maps (4K for desktop, 2K for phones)
public/images/          photo, university pictures, company logo
```

## Performance and fallbacks

- Phones and low-memory devices load 2K textures and fewer stars; desktops get 4K.
- A sharper South Asia patch fades in only for the close-up.
- If WebGL is unavailable, a CSS globe replaces the 3D scene and every section still works.
- Visitors who prefer reduced motion get a shorter flight.
- Add `?debug` to the address to inspect the camera rig in the browser console.

## Credits

- Earth textures: [Solar System Scope](https://www.solarsystemscope.com/textures/)
  (CC BY 4.0), based on NASA imagery, via the three.js examples.
- Karnataka outline: [Natural Earth](https://www.naturalearthdata.com/) (public domain).
- Photograph, university pictures and logos: provided by Sagar Patil. Logos belong to their owners.

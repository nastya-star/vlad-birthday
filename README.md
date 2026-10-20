# The Great Birthday Hunt

An interactive birthday postcard in the style of a Brazilian vintage travel postcard and a 1970s poster. It is a redesign of [ashilohfaith-debug/birthday-website](https://github.com/ashilohfaith-debug/birthday-website) and keeps the original's flow:

**password ticket → face-sticker hunt across the whole page → postcards and notes → sticker album → unlocked cake (light it, make a wish, blow it out, the message appears, eat a slice, take a selfie for the postcard wall)**

It's plain HTML, CSS and JS with no build step and no dependencies, so it runs on GitHub Pages as-is.

```
index.html          page structure
css/styles.css      design tokens (colours, fonts) at the top, then all styles
js/config.js        ← EVERYTHING you customise lives here
js/app.js           behaviour (you shouldn't need to edit this)
assets/stickers/    face-sticker cut-outs (transparent PNGs)
assets/photos/      gallery photos / .mp4 clips
```

## Customising (all in `js/config.js`)

| What | Key |
|---|---|
| Friend's name (used everywhere) | `friendName` |
| Curved poster title + ring text | `title.top`, `title.bottom`, `title.ring`, `title.tagline` |
| Password (`""` = no password, shows an "Open the postcard" button) | `password` |
| Stickers to find | `stickers` (see below) |
| Gallery tabs | `photoCategories` |
| Photos | `photos` |
| Friends' notes | `notes` |
| Final message + P.S. | `reveal` |

`{name}` in any text is replaced by `friendName`. A long name is shrunk automatically so it fits on the curved title.

### Face stickers

Vlad's 14 stickers are already set up:

- `assets/stickers/vlad-01.webp` … `vlad-14.webp` are 640 px web copies that load fast on mobile data.
- `assets/stickers/originals/` holds the untouched full-size files.

These stickers already have their own white die-cut edge, so `addStickerOutline: false` turns off the site's automatic outline. Set it to `true` if you add plain cut-outs without an edge; the site will then draw the white outline itself, following the cut-out's shape.

Each entry in `stickers` has `id`, `src`, `label`, `hint`, `zone` (where it hides: `hero`, `postcards`, `notes`, `album`, `cake`, `footer`), an optional `x`/`y` position in % inside that zone, an optional `size` (px number or a CSS string like `"27%"`) and an optional `tilt`.
**The number to find is the length of this list (currently 14).** Add or remove entries and the counter, album, hints and cake lock all follow. There's no hard-coded age anymore.
A missing or misspelled file shows a neutral numbered placeholder sticker instead of a broken image.

Progress is saved in the visitor's browser, so a reload doesn't lose stickers already found. Add `?reset=1` to the URL to start over.

### Photos

19 photos are already in (`assets/photos/vlad-01.jpg` … `vlad-19.jpg`, at most 1600 px wide or tall). There's also a small copy of each in `assets/photos/thumbs/`: the grid loads the thumbnail, and the viewer loads the full photo. They're sorted into the ICONIC, FUNNY, THE CREW and CAKE ATTACK tabs. A photo with an empty `caption` shows no caption line. A tab with no photos shows illustrated placeholder postcards.

Each postcard frame automatically follows its photo's orientation (4:5 portrait or 4:3 landscape).

Browsers can't list a folder's contents on a static site, so add one line per file. `thumb` is optional:

```js
photos: [
  { src: "assets/photos/lima-market.jpg", category: "ON THE ROAD", caption: "first ceviche", place: "Lima", alt: "At a market stall in Lima" },
  { src: "assets/photos/bus.mp4",         category: "FUNNY",       caption: "the 14-hour bus", place: "Bolivia" },
],
```

`category` must be one of `photoCategories`. A category with no photos shows three illustrated placeholder postcards. A file that fails to load shows a "lost in the mail" card instead of a broken image.

### Colours and fonts

They're defined at the top of `css/styles.css`:

```css
--blue: #267BD9;  --orange: #D98426;  --cream: #FDF2CB;  --deep: #0C3665;  --brown: #4F2C07;
```

The fonts (Google Fonts) are Coiny for headlines (every V/v is drawn in Londrina Solid Black, because Coiny's V reads like a U), Londrina Solid for labels and counters, DM Sans for body text, and Caveat for the handwritten postcard captions.

## Run locally

```bash
python -m http.server 8000
```

Then open http://localhost:8000. Opening `index.html` directly from disk also works.

## Deploy on GitHub Pages

Push the folder to a repository, then go to **Settings → Pages → Deploy from branch → `main` / root**.

## Notes

- Music is the original's WebAudio music-box "Happy Birthday". It only starts when the music button is tapped; it never autoplays.
- With `prefers-reduced-motion`, the swirl stops, pop-ups appear instantly and there's no confetti.
- The selfie after eating the slice needs camera permission. If the camera is refused, the page says so and carries on.

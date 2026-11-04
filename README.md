# Cinnamon Velifushi – Guest Directory

A mobile-first guest directory that guests open by scanning a QR code. Each section on the dial lists the resort's documents, and their content (menus, prices, allergens, schedules and so on) is shown as proper pages inside the site. The original PDFs stay on Google Drive and each page links to its original.

## Files
- `index.html` – the whole site (design, content and logic in one file)
- `content.js` – the text of every document, extracted from the PDFs
- `img/docs/` – photos taken from the PDFs, used as page banners
- `.nojekyll` – tells GitHub Pages to serve the file as-is

## Publish on GitHub Pages (about 5 minutes)
1. Sign in to GitHub and create a new **public** repository, e.g. `velifushi-guest-directory`.
2. Click **Add file → Upload files**, drag in `index.html`, `content.js`, the `img` folder and `.nojekyll`, then **Commit changes**.
   (On a Mac, `.nojekyll` is hidden – press `Cmd + Shift + .` in Finder to see it.)
3. Go to **Settings → Pages**. Under *Build and deployment*, choose **Deploy from a branch**, branch **main**, folder **/ (root)**, then **Save**.
4. After a minute your site is live at
   `https://<your-github-username>.github.io/velifushi-guest-directory/`

## Section links (for QR codes)
Every section has its own address, so you can print a QR code that opens a specific page (e.g. a menu QR on the restaurant table):

| Section | Add to the end of your site URL |
|---|---|
| Home (dial) | *(nothing)* |
| Island Experiences | `#/island` |
| Menus | `#/menus` |
| Sustainability Initiatives | `#/sustain` |
| Compendium | `#/compendium` |
| Weekly Activities & Entertainment | `#/activities` |
| Resort Map | `#/map` |
| Signature Experiences | `#/special` |
| All-Inclusive Packages & Menus | `#/packages` |
| Mandara Spa | `#/spa` |
| Weddings | `#/wedding` |
| Contacts | `#/contacts` |

Example: `https://<username>.github.io/velifushi-guest-directory/#/menus`

Generate the QR code with any free QR generator (paste the full URL).

## Important: Drive sharing
Document text no longer depends on Drive, but card thumbnails, the resort map and the "View the original document" links do. They only work if the Drive folder is shared as **Anyone with the link → Viewer**. Check this before printing QR codes – test on a phone that isn't signed in to Google.

## Updating content
Open `index.html` on GitHub (pencil icon to edit) and change the **CONFIGURATION** block near the top of the `<script>`:

- **Resort details** – name, phone, email, WhatsApp, website in `RESORT`.
- **Replace a document** (e.g. a new weekly activity poster): upload it to Drive, open it, copy the ID from its link
  `drive.google.com/file/d/`**`THIS_PART`**`/view`, and paste it in place of the old ID.
- **Add a document**: add a line like `["Title shown to guests", "DRIVE_FILE_ID", "optional subtitle"],` to the right group.

### Updating what a document page says
Page text lives in `content.js`, **not** in the PDF, so uploading a new PDF to Drive does **not** change it. When a menu, price or weekly schedule changes, edit `content.js` too (each document is marked with a comment, e.g. `/* Wine List */`):

- A dish or drink looks like `{"i": "Greek Salad {dairy} {vegetarian}", "p": "USD 15", "d": ["Description"]}`, where `i` is the name, `p` the price and `d` the description lines.
- `{gluten}`-style markers become allergen tags: `alcohol gluten mustard dairy pork vegetarian nuts egg celery fish molluscs soya crustaceans peanut sesame coconut spicy healthy`. **Always have the kitchen confirm allergen changes.**
- Weekly schedules are under `/* Weekly Activities */` and `/* Weekly Entertainment */`, written as `"Activity|where"`.

A document with no entry in `content.js` (for example one you just added) opens in the Drive PDF viewer instead, so new documents still work straight away.

## Photos
The site is photo-led, in the style of the Cinnamon Hotels website:

- **Home hero and Island Experiences banner** use two Velifushi photos from Cinnamon's own image library (`CINNAMON_IMG` in the `PHOTOS` block). If Cinnamon ever renames or removes them, the site falls back to your Drive document covers automatically.
- **Every other banner and tile** uses its own photo if you set one, otherwise the cover of that section's first PDF.
- **Document cards** show each PDF's cover page from Drive automatically.

To add more resort photos, set them in the `PHOTOS` block of `index.html`. Each value can be:
1. **A Drive photo ID:** put photos in a Drive folder shared "Anyone with the link → Viewer" and paste each file's ID (e.g. `menus: "1AbC...xyz"`).
2. **A photo in this repo:** create an `img` folder, upload landscape JPGs (about 1600px wide, under 500 KB), and use the path, e.g. `spa: "img/spa.jpg"`. This is the most reliable option.
3. **A web address**, e.g. another image from cinnamonhotels.com.

Suggested shots: restaurant (Menus), reef or turtle (Sustainability), pool or bar (Activities), private beach dinner (Signature Experiences), overwater spa (Mandara Spa), beach wedding setup (Weddings), water bungalows (All-Inclusive).

Please confirm with the resort's marketing team that it's fine to use their photos here.

To show plain text lists instead of picture cards, set `SHOW_DOCUMENT_PREVIEWS = false`.

## Colours & animations
- **Colours** are set once at the top of `index.html` under `BRAND COLOURS` (`--cinnamon` is the accent, `--sea` the deep teal, `--cream` the page background, `--gold` the fine lines). Change a value there and the whole site updates.
- **Animations:** slow zoom on banner photos, text fading in, the dial assembling segment by segment with a gently turning outer ring, sections and cards fading up as you scroll, and soft hover and page transitions. They switch off automatically on phones set to "Reduce motion".

## Notes
- **Signature Experiences** – the Drive folder is currently empty, so this page shows the Destination Dining experiences (Champagne Breakfast, Lobster Lovers Night, etc.). Edit `SECTIONS.special` to change it.
- Contact details are from the resort fact sheet – please confirm the phone number and email are current.

# Zyptor Healthcare — Website

A single-page site for the LS (Lumbo Sacral) Support Belt. No build tools,
no server, no database — it's plain HTML/CSS/JS, so GitHub Pages can host
it for free and you can edit it from your browser.

```
zyptor-site/
├── index.html          the page itself
├── css/style.css        all colours, fonts, layout
├── js/script.js         renders products + scroll animations
├── js/products.js       ← the file you edit to add/change products
├── images/               your product photos, logo, model shots
└── README.md             this file
```

## 1. Put it on GitHub Pages (one-time setup)

1. Go to **github.com**, log in, click the **+** in the top right → **New repository**.
   Name it something like `zyptor-website`, keep it **Public**, and create it.
2. On the new repo's page, click **Add file → Upload files**, then drag in
   every file and folder from this `zyptor-site` folder (keep the folder
   structure — `css/`, `js/`, `images/` should stay as folders).
3. Scroll down and click **Commit changes**.
4. In the repo, go to **Settings → Pages** (left sidebar).
5. Under "Build and deployment", set **Source** to **Deploy from a branch**,
   branch **main**, folder **/ (root)**. Click **Save**.
6. Wait about a minute, then refresh — GitHub shows your live URL, something
   like `https://your-username.github.io/zyptor-website/`. That's your site.

You can also connect a custom domain (e.g. `www.zyptorhealthcare.in`) from
that same Settings → Pages screen, under "Custom domain" — GitHub will walk
you through the DNS records to add at your domain registrar.

## 2. Add a new product later — no coding needed

Everything for sale on the site comes from **one file**: `js/products.js`.
The page reads that file and builds the product card automatically.

1. First, add your new product photo: in the repo, open the `images` folder,
   click **Add file → Upload files**, and upload the photo (e.g.
   `knee-support-front.png`).
2. Open `js/products.js` in the repo (click the file, then the pencil ✏️
   icon top-right to edit).
3. Copy one of the existing product blocks (from `{` to the matching `},`)
   and paste it as a new entry in the `ZYPTOR_PRODUCTS` list.
4. Update the fields: `name`, `price`, `description`, `image` (point it at
   the file you just uploaded, e.g. `"images/knee-support-front.png"`),
   `features`, and `sizes`. You can also add a `gallery` array — a list of
   two or more image paths — to show a row of clickable thumbnails under
   the main photo, the same way the LS belt shows a front and 3/4 view.
5. Scroll down, click **Commit changes**. GitHub Pages rebuilds
   automatically — refresh your live site in a minute and the new product
   card appears.

To change a price, swap a photo, or edit the description of the existing
belt, edit that same file the same way — find the field, change the text
between the quotes, commit.

## 3. Everything else (colours, section text, images)

- **Section headlines and paragraphs** live directly in `index.html` — open
  it the same way (pencil icon), find the text between the tags, and edit
  it in place.
- **Colours and fonts** are all defined once at the top of `css/style.css`
  under `:root { ... }` — change a hex value there and it updates
  everywhere that colour is used.
- **Photos** (hero belt shot, model photos) are swapped by uploading a new
  image to `images/` and updating the `src="images/..."` path that points
  to it in `index.html`.

## 4. Taking real payments (Buy Now / checkout)

The site's "Buy Now" button is wired up for real Razorpay checkout, but
it needs a small backend server to actually process payments — that
piece lives in the separate `zyptor-backend` folder alongside this one,
with its own full setup guide in `zyptor-backend/README.md` (Razorpay
account setup, free hosting on Render, connecting the two, and testing
a full order end to end).

Until that backend is deployed and `js/config.js` points at it, clicking
Buy Now will show a clear "not connected yet" message instead of failing
silently.

If any of this gets fiddly, you can always come back here, paste in your
`products.js` or `index.html`, and ask for the exact edit — that's often
faster than hunting through the file by hand.

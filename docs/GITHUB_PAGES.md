# GitHub Pages — resume site

1. Push this repo to GitHub (`chnirt/chnirt` or your fork).
2. Run locally before push (generates HTML + PDF + Word in `docs/`):

   ```bash
   npm install
   npm run build:site
   ```

3. In the repo: **Settings → Pages → Build and deployment**
   - Source: **Deploy from a branch**
   - Branch: **main** (or `master`) → folder **/docs** → Save

4. After a minute, the site is live at:

   `https://<username>.github.io/<repo>/`

   Example: `https://chnirt.github.io/chnirt/`

Update resume content in `README.md`, then run `npm run build:site` and push `docs/` again.

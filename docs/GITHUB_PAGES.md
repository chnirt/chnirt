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

Update resume content in `README.md` (section order matches the site: Summary → Skills → Experience → Education → Certifications → Languages), then run:

```bash
npm run site
```

That refreshes `docs/index.html`, `docs/assets/Chin_Trinh_Resume.pdf`, `docs/assets/Chin_Trinh_Resume.docx`, and root `README.pdf` (same Oxford layout as the site). Push `docs/` again.

Resume PDF is **not** generated from raw Markdown anymore — it is printed from `docs/index.html` so it matches the web layout.

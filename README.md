# Yassine Zouari — Portfolio

A personal portfolio site: plain HTML, CSS, and JavaScript. There is no build step and no dependencies, and it can be hosted for free.

## Files

| File         | Purpose                                              |
|--------------|------------------------------------------------------|
| `index.html` | All page content (edit your text here)               |
| `styles.css` | Styling, including light/dark themes and responsive layout |
| `script.js`  | Animations, typing effect, theme toggle, mobile menu |
| `resume.pdf` | **Add your résumé here**. The "Download résumé" button links to it |

## Preview locally

Double-click `index.html`, or run a local server:

```bash
python -m http.server 8000
# then open http://localhost:8000
```

## Deploy for free on GitHub Pages

1. Create a GitHub repository named **`yassinezouari.github.io`** (it must match your username exactly).
2. Upload `index.html`, `styles.css`, `script.js`, and `resume.pdf` to it. You can use GitHub's "Add file → Upload files" button in the browser, or the command line:
   ```bash
   git init
   git add .
   git commit -m "Initial portfolio"
   git branch -M main
   git remote add origin https://github.com/yassinezouari/yassinezouari.github.io.git
   git push -u origin main
   ```
3. On the repository page, go to **Settings → Pages**. Under *Source*, choose **Deploy from a branch**, then select `main` / `(root)` and click Save.
4. After a minute or two the site is live at **https://yassinezouari.github.io**.

Other free options: drag the folder onto [Netlify Drop](https://app.netlify.com/drop), or import the repo on [Vercel](https://vercel.com) or [Cloudflare Pages](https://pages.cloudflare.com).

## Customizing

- **Project links:** each project card currently links to your GitHub profile. Replace each `https://github.com/yassinezouari` link inside the `#projects` section with the URL of that project's repository.
- **Typing phrases:** edit the `phrases` array in `script.js`.
- **Colors:** change `--accent` and `--accent-2` at the top of `styles.css`.

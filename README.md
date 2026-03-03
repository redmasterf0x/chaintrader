<div align="center">
<img width="1200" height="475" alt="GHBanner" src="https://github.com/user-attachments/assets/0aa67016-6eaf-458a-adb2-6e31a0763ed6" />
</div>

# Run and deploy your AI Studio app

This contains everything you need to run your app locally.

View your app in AI Studio: https://ai.studio/apps/3a0c26d2-d2a3-44c6-a745-c5a5d9f26419

## Run Locally

**Prerequisites:**  Node.js


1. Install dependencies:
   `npm install`
2. Set the `GEMINI_API_KEY` in [.env.local](.env.local) to your Gemini API key
3. Run the app:
   `npm run dev`

## Deploy to GitHub Pages

This project is configured to publish the `dist` folder to GitHub Pages:

1. Make sure your repo is named `chaintrader` (or update the `homepage` field in `package.json` and the `base` path in `vite.config.ts` accordingly).
2. Install dependencies (includes `gh-pages`): `npm install`
3. Build and deploy:
   ```bash
   npm run deploy
   ```

Your site will be available at `https://<your-github-username>.github.io/chaintrader/` once the GitHub Pages build completes.

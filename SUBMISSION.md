# Run and submit AEGIS AI

## Run locally on Windows

Install Node.js 20 or newer and npm 10 or newer. In PowerShell, open the extracted `aegis-ai` folder and run:

```powershell
npm install
npm run dev
```

Open <http://localhost:3000>. Stop the server with Ctrl+C.

Gemini is optional. To enable it, copy `.env.example` to `.env`, replace the placeholder with your Gemini API key, then restart the server. Keep `.env` private; `.gitignore` excludes it.

## Verify before submission

Run these from the project folder:

```powershell
npm run lint
npm test
npm run build
```

To serve the production build locally:

```powershell
npm run build
npm start
```

The application uses in-memory demo data, has no authentication, and does not connect to AWS to execute playbooks. Keep it on a trusted local machine.

## Submit to GitHub

1. Create a new empty repository on GitHub named `aegis-ai`. Do not initialize it with a README, license, or `.gitignore`.
2. Extract the ZIP and open PowerShell in the extracted project folder.
3. Replace `YOUR_USERNAME` below with your GitHub username, then run:

```powershell
git init
git add .
git commit -m "Submit AEGIS AI demo"
git branch -M main
git remote add origin https://github.com/YOUR_USERNAME/aegis-ai.git
git push -u origin main
```

4. Open the GitHub repository and confirm the source files, `package-lock.json`, README, and `SUBMISSION.md` are present. Do not upload `.env` or paste a Gemini key into the repository.

The demo can be reviewed from the README and run instructions above. Live AWS actions are intentionally unavailable until a real cloud integration and its security controls are implemented.

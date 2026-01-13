# Deploying this repository to GitHub

This file explains how to push the current workspace to a new GitHub repository and basic secrets to add for running the server.

1) Create repository and push

If you have the GitHub CLI installed and are logged in, run:

```bash
git init
git add .
git commit -m "Initial commit"
gh repo create YOUR_USERNAME/REPO_NAME --public --source=. --remote=origin --push
```

If you don't have `gh` installed, create an empty repo on GitHub and then:

```bash
git init
git add .
git commit -m "Initial commit"
git branch -M main
git remote add origin https://github.com/YOUR_USERNAME/REPO_NAME.git
git push -u origin main
```

2) Recommended GitHub secrets

- `MONGO_URI` – MongoDB connection string used by the server.
- `JWT_SECRET` – Secret used to sign JWT tokens.
- `CLIENT_URL` – (optional) frontend origin for CORS.

Add these in the repository settings → Secrets → Actions.

3) CI / Build

The repository includes a CI workflow at `.github/workflows/ci.yml` which installs dependencies for both `server` and `client`, builds the client and runs any server tests.

4) Deploying the client (optional)

You can deploy the `client` build to GitHub Pages, Netlify, Vercel, or any static host. For GitHub Pages, follow GitHub Pages setup for a `client/build` folder.

5) Next steps

- If you want, I can:
  - Create an Actions workflow that deploys `client` to GitHub Pages or Netlify.
  - Attempt to create the GitHub repo for you via the `gh` CLI (requires you to be logged in on this machine).

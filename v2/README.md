# Limova Test v2

This is the simpler test app:

- no Vite
- no frontend build step
- static Firebase Hosting page in `public/`
- one Node.js Cloud Function backend in `functions/`
- buttons for `test flow 1` and `test flow 2`

Use classic Firebase Hosting + Cloud Functions for this testbench. Do not create a Firebase App Hosting backend for this folder.

## Local Setup

```bash
cd v2
npm run install:functions
cp .firebaserc.example .firebaserc
```

Edit `.firebaserc` with your Firebase project ID.

For local testing without Firebase secrets, create `functions/.env.local`:

```bash
LIMOVA_API_KEY=your_limova_key_for_local_tests
```

Then:

```bash
npm run emulators
```

Open:

```text
http://localhost:5000
```

## Deploy

Make sure you are logged in:

```bash
firebase login
firebase use --add
```

Deploy both frontend and backend:

```bash
npm run deploy
```

Deploy only backend:

```bash
npm run deploy:backend
```

Deploy only frontend:

```bash
npm run deploy:frontend
```

## Secret

The backend is wired to read the Firebase secret named `limokey`.

If the secret already exists from your App Hosting attempt, Cloud Functions can also use it through Google Secret Manager. If deploy complains that it cannot access or find it, create it with:

```bash
firebase functions:secrets:set limokey
```

Then deploy functions again:

```bash
npm run deploy:backend
```

# Firebase Setup Guide

This project is a small Firebase-hosted test bench for Limova API experiments.

It contains:

- `app/`: React + Vite frontend
- `functions/`: Node.js Cloud Functions backend using Express
- Firestore collection: `limova_api_tests`
- Hosting rewrite: `/api/**` -> Firebase Function `api`

Official docs used as reference:

- Firebase Hosting + Cloud Functions: `https://firebase.google.com/docs/hosting/functions`
- Cloud Functions getting started: `https://firebase.google.com/docs/functions/get-started`
- Firestore quickstart: `https://firebase.google.com/docs/firestore/quickstart`

## 1. Firebase Console

1. Go to `https://console.firebase.google.com/`.
2. Create a Firebase project or choose an existing one.
3. Enable billing / Blaze plan if you want to deploy Cloud Functions.
4. Create a web app in Project settings if you want a web app entry, but this testbench currently talks to Firestore through the backend, so no frontend Firebase config is required yet.
5. Go to Build -> Firestore Database.
6. Create a Firestore database.
7. Choose production mode.
8. Pick a location close to the Functions region when possible. This repo uses `europe-west1` for Functions.

## 2. Install Local Tools

Use Node.js 20 or 22. Firebase docs say Node 18 was deprecated in early 2025 for Cloud Functions.

```bash
node --version
npm --version
npm install -g firebase-tools
firebase login
```

## 3. Connect This Repo To Firebase

From `/home/hjiul/work/limova`:

```bash
cp .firebaserc.example .firebaserc
```

Edit `.firebaserc` and replace `YOUR_FIREBASE_PROJECT_ID` with your Firebase project ID.

You can also select the project through the CLI:

```bash
firebase use --add
```

## 4. Install Dependencies

```bash
npm run install:all
```

This installs dependencies in both:

- `app/`
- `functions/`

## 5. Configure Limova Secrets Locally

Create a local Functions env file:

```bash
cp functions/.env.example functions/.env.local
```

Edit `functions/.env.local`:

```bash
LIMOVA_API_BASE_URL=https://YOUR_LIMOVA_API_HOST
LIMOVA_API_TOKEN=YOUR_LIMOVA_API_TOKEN
LIMOVA_WORKSPACE_ID=YOUR_WORKSPACE_ID
LIMOVA_DEFAULT_AGENT_ID=YOUR_AGENT_ID
LIMOVA_CREATE_CONVERSATION_PATH=/REPLACE_WITH_CREATE_CONVERSATION_PATH
LIMOVA_SEND_MESSAGE_PATH=/REPLACE_WITH_SEND_MESSAGE_PATH/:conversationId
LIMOVA_LIST_AGENTS_PATH=/REPLACE_WITH_LIST_AGENTS_PATH
LIMOVA_GET_PROFILE_PATH=/REPLACE_WITH_CURRENT_USER_PATH
LIMOVA_TIMEOUT_MS=60000
```

Important: the Limova local docs we have confirm the fields, but the exported docs are weak on exact route templates. That is why the app includes a raw request tester and why these route paths are configurable.

## 6. Run Locally

Terminal 1:

```bash
npm run dev:app
```

Terminal 2:

```bash
npm run emulators
```

Open:

```text
http://localhost:5173
```

The Vite dev server proxies `/api/*` to the Firebase Hosting emulator on port `5000`.
You can also open the Hosting emulator directly:

```text
http://localhost:5000
```

Firebase Emulator UI:

```text
http://localhost:4000
```

## 7. Test Order

1. Click `Check backend`.
2. Confirm the backend says the Limova env values are configured.
3. Use `Raw Limova request` first to confirm the base URL and auth token.
4. Once exact paths are known, fill the route env variables.
5. Click `Profile`.
6. Click `Agents`.
7. Put the agent ID in the `Agent ID` field.
8. Click `Create conversation`.
9. Copy the returned conversation ID into `Conversation ID`.
10. Edit the lead message if needed.
11. Click `Send message`.
12. Check the response panel and Firestore logs.

## 8. Deploy

Build the React app:

```bash
npm run build
```

Deploy Hosting, Functions, and Firestore rules:

```bash
npm run deploy
```

If you only changed the frontend:

```bash
npm run deploy:hosting
```

If you only changed the backend:

```bash
npm run deploy:functions
```

## 9. Production Environment Variables

For deployed Cloud Functions, set the Limova values before deploying. There are two common options:

- Firebase Functions environment files, depending on your Firebase CLI flow
- Google Cloud Secret Manager / Firebase secret params for sensitive values

For this testbench, keep these values out of Git:

- `LIMOVA_API_TOKEN`
- any client-specific tokens
- any Meta / Hektor / email credentials

## 10. Current Backend Endpoints

- `GET /api/health`: checks backend and env presence
- `POST /api/limova/request`: generic Limova request runner
- `POST /api/limova/profile`: calls configured profile path
- `POST /api/limova/agents`: calls configured agents path
- `POST /api/limova/conversations`: creates a conversation with configured path
- `POST /api/limova/messages`: sends a message using configured path
- `GET /api/logs`: reads the latest Firestore test logs

## 11. Firestore

The backend writes all test results to:

```text
limova_api_tests
```

The Firestore security rules deny client reads/writes to that collection. The React app reads logs through the backend instead.

## 12. Notes For Limova Testing

From the Limova docs export:

- conversation creation accepts `botAgentId`
- message sending accepts `content`, `agentId`, `userTimezone`, `fileIds`, `folderIds`, and `searchInWorkspace`
- message responses are streamed as SSE in Limova, but this testbench currently reads the response body and displays it after completion
- agent configuration appears to live in Limova, especially instructions / system prompts

That last point matters for our CGI33 flow: configure the lead-answering behavior in Limova first, then use this app to send Hektor-style lead payloads to the configured agent.

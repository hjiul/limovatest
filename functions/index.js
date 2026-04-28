const express = require("express");
const cors = require("cors");
const {onRequest} = require("firebase-functions/v2/https");
const {setGlobalOptions} = require("firebase-functions/v2");
const {initializeApp} = require("firebase-admin/app");
const {getFirestore, FieldValue} = require("firebase-admin/firestore");

initializeApp();
setGlobalOptions({region: "europe-west1", maxInstances: 10});

const db = getFirestore();
const app = express();

app.use(cors({origin: true}));
app.use(express.json({limit: "2mb"}));

const LOG_COLLECTION = "limova_api_tests";

function requiredEnv(name) {
  const value = process.env[name];
  if (!value) {
    const error = new Error(`Missing environment variable: ${name}`);
    error.statusCode = 500;
    throw error;
  }
  return value;
}

function optionalEnv(name, fallback = undefined) {
  return process.env[name] || fallback;
}

function normalizeBaseUrl(url) {
  return url.replace(/\/+$/, "");
}

function normalizePath(path) {
  if (!path || typeof path !== "string") {
    const error = new Error("A Limova path is required.");
    error.statusCode = 400;
    throw error;
  }

  if (/^https?:\/\//i.test(path)) {
    const error = new Error("Send only the path, not a full URL.");
    error.statusCode = 400;
    throw error;
  }

  return path.startsWith("/") ? path : `/${path}`;
}

function applyPathParams(path, params = {}) {
  return Object.entries(params).reduce((nextPath, [key, value]) => {
    return nextPath.replaceAll(`:${key}`, encodeURIComponent(String(value)));
  }, path);
}

function redactHeaders(headers) {
  return Object.fromEntries(
    Object.entries(headers).map(([key, value]) => {
      return /authorization|token|api-key|secret/i.test(key)
        ? [key, "[redacted]"]
        : [key, value];
    }),
  );
}

async function logTest({type, request, response, error}) {
  const doc = {
    type,
    createdAt: FieldValue.serverTimestamp(),
    request: {
      ...request,
      headers: request.headers ? redactHeaders(request.headers) : undefined,
    },
    response,
    error: error
      ? {
          message: error.message,
          statusCode: error.statusCode || null,
        }
      : null,
  };

  const ref = await db.collection(LOG_COLLECTION).add(doc);
  return ref.id;
}

async function callLimova({
  method = "GET",
  path,
  query,
  body,
  headers = {},
}) {
  const baseUrl = normalizeBaseUrl(requiredEnv("LIMOVA_API_BASE_URL"));
  const token = requiredEnv("LIMOVA_API_TOKEN");
  const workspaceId = optionalEnv("LIMOVA_WORKSPACE_ID");
  const timeoutMs = Number(optionalEnv("LIMOVA_TIMEOUT_MS", "60000"));
  const url = new URL(`${baseUrl}${normalizePath(path)}`);

  for (const [key, value] of Object.entries(query || {})) {
    if (value !== undefined && value !== null && value !== "") {
      url.searchParams.set(key, String(value));
    }
  }

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), timeoutMs);
  const requestHeaders = {
    "accept": "application/json, text/event-stream, text/plain",
    "authorization": `Bearer ${token}`,
    ...headers,
  };

  if (workspaceId && !requestHeaders["x-workspace-id"]) {
    requestHeaders["x-workspace-id"] = workspaceId;
  }

  const upperMethod = method.toUpperCase();
  const fetchOptions = {
    method: upperMethod,
    headers: requestHeaders,
    signal: controller.signal,
  };

  if (!["GET", "HEAD"].includes(upperMethod) && body !== undefined) {
    requestHeaders["content-type"] = "application/json";
    fetchOptions.body = JSON.stringify(body);
  }

  try {
    const limovaResponse = await fetch(url, fetchOptions);
    const contentType = limovaResponse.headers.get("content-type") || "";
    const rawText = await limovaResponse.text();
    let parsedBody = rawText;

    if (contentType.includes("application/json") && rawText) {
      try {
        parsedBody = JSON.parse(rawText);
      } catch {
        parsedBody = rawText;
      }
    }

    return {
      ok: limovaResponse.ok,
      status: limovaResponse.status,
      statusText: limovaResponse.statusText,
      contentType,
      body: parsedBody,
    };
  } finally {
    clearTimeout(timeout);
  }
}

function asyncRoute(handler) {
  return async (req, res) => {
    try {
      await handler(req, res);
    } catch (error) {
      const statusCode = error.statusCode || 500;
      res.status(statusCode).json({
        ok: false,
        error: error.message,
      });
    }
  };
}

app.get("/api/health", asyncRoute(async (req, res) => {
  res.json({
    ok: true,
    service: "limova-api-testbench",
    timestamp: new Date().toISOString(),
    configured: {
      baseUrl: Boolean(process.env.LIMOVA_API_BASE_URL),
      token: Boolean(process.env.LIMOVA_API_TOKEN),
      workspaceId: Boolean(process.env.LIMOVA_WORKSPACE_ID),
      defaultAgentId: Boolean(process.env.LIMOVA_DEFAULT_AGENT_ID),
    },
  });
}));

app.post("/api/limova/request", asyncRoute(async (req, res) => {
  const {method, path, query, body, headers} = req.body || {};
  const request = {method, path, query, body, headers};

  try {
    const response = await callLimova(request);
    const logId = await logTest({type: "raw-request", request, response});
    res.status(response.ok ? 200 : 502).json({ok: response.ok, logId, response});
  } catch (error) {
    const logId = await logTest({type: "raw-request", request, error});
    error.logId = logId;
    throw error;
  }
}));

app.post("/api/limova/profile", asyncRoute(async (req, res) => {
  const path = optionalEnv("LIMOVA_GET_PROFILE_PATH");
  if (!path) {
    res.status(400).json({
      ok: false,
      error: "Set LIMOVA_GET_PROFILE_PATH or use the raw request tester.",
    });
    return;
  }

  const request = {method: "GET", path};
  const response = await callLimova(request);
  const logId = await logTest({type: "profile", request, response});
  res.status(response.ok ? 200 : 502).json({ok: response.ok, logId, response});
}));

app.post("/api/limova/agents", asyncRoute(async (req, res) => {
  const path = optionalEnv("LIMOVA_LIST_AGENTS_PATH");
  if (!path) {
    res.status(400).json({
      ok: false,
      error: "Set LIMOVA_LIST_AGENTS_PATH or use the raw request tester.",
    });
    return;
  }

  const request = {method: "GET", path};
  const response = await callLimova(request);
  const logId = await logTest({type: "agents", request, response});
  res.status(response.ok ? 200 : 502).json({ok: response.ok, logId, response});
}));

app.post("/api/limova/conversations", asyncRoute(async (req, res) => {
  const path = optionalEnv("LIMOVA_CREATE_CONVERSATION_PATH");
  if (!path) {
    res.status(400).json({
      ok: false,
      error: "Set LIMOVA_CREATE_CONVERSATION_PATH or use the raw request tester.",
    });
    return;
  }

  const body = {
    title: req.body.title || "Limova API test conversation",
    type: req.body.type || "default",
    botAgentId: req.body.botAgentId || optionalEnv("LIMOVA_DEFAULT_AGENT_ID"),
    disableFirstMessage: req.body.disableFirstMessage ?? true,
  };

  const request = {method: "POST", path, body};
  const response = await callLimova(request);
  const logId = await logTest({type: "create-conversation", request, response});
  res.status(response.ok ? 200 : 502).json({ok: response.ok, logId, response});
}));

app.post("/api/limova/messages", asyncRoute(async (req, res) => {
  const template = optionalEnv("LIMOVA_SEND_MESSAGE_PATH");
  if (!template) {
    res.status(400).json({
      ok: false,
      error: "Set LIMOVA_SEND_MESSAGE_PATH or use the raw request tester.",
    });
    return;
  }

  if (!req.body.conversationId) {
    res.status(400).json({ok: false, error: "conversationId is required."});
    return;
  }

  const path = applyPathParams(template, {
    conversationId: req.body.conversationId,
  });
  const body = {
    content: req.body.content,
    agentId: req.body.agentId || optionalEnv("LIMOVA_DEFAULT_AGENT_ID"),
    userTimezone: req.body.userTimezone || "Europe/Paris",
    fileIds: req.body.fileIds || undefined,
    folderIds: req.body.folderIds || undefined,
    searchInWorkspace: req.body.searchInWorkspace ?? false,
  };

  const request = {method: "POST", path, body};
  const response = await callLimova(request);
  const logId = await logTest({type: "send-message", request, response});
  res.status(response.ok ? 200 : 502).json({ok: response.ok, logId, response});
}));

app.get("/api/logs", asyncRoute(async (req, res) => {
  const snapshot = await db
    .collection(LOG_COLLECTION)
    .orderBy("createdAt", "desc")
    .limit(20)
    .get();

  res.json({
    ok: true,
    logs: snapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    })),
  });
}));

exports.api = onRequest({timeoutSeconds: 300, memory: "512MiB"}, app);

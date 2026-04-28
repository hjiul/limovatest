const express = require("express");
const {onRequest} = require("firebase-functions/v2/https");
const {defineSecret} = require("firebase-functions/params");

const limokey = defineSecret("limokey");
const app = express();

app.use(express.json());

function getLimovaKey() {
  try {
    return limokey.value() || process.env.LIMOVA_API_KEY || "";
  } catch {
    return process.env.LIMOVA_API_KEY || "";
  }
}

function getLimovaKeyStatus() {
  return Boolean(getLimovaKey());
}

function maskKeyEdges(key) {
  if (!key) {
    return null;
  }

  return {
    first10: key.slice(0, 10),
    last10: key.slice(-10),
    length: key.length,
  };
}

app.get("/api/health", (req, res) => {
  res.json({
    ok: true,
    app: "limovatest-v2",
    limovaKeyConfigured: getLimovaKeyStatus(),
    timestamp: new Date().toISOString(),
  });
});

app.post("/api/test-limokey", async (req, res) => {
  const key = getLimovaKey();

  res.json({
    ok: Boolean(key),
    message: key
      ? "limokey is readable by the backend."
      : "limokey is not available to the backend.",
    limovaKeyConfigured: Boolean(key),
    limovaKeyPreview: maskKeyEdges(key),
  });
});

app.post("/api/test-flow-1", async (req, res) => {
  const hardcodedHektorForm = {
    source: "hektor",
    flow: "flow_1_auto_form_answer",
    contact: {
      firstName: "Jean",
      lastName: "Dupont",
      email: "jean.dupont@example.com",
      phone: "0600000000",
    },
    request: {
      type: "estimation_vendeur",
      city: "Saint-Macaire",
      message: "Je souhaite une estimation pour vendre ma maison.",
    },
  };

  res.json({
    ok: true,
    message: "Flow 1 placeholder is reachable. Limova call will be added here.",
    limovaKeyConfigured: getLimovaKeyStatus(),
    hektorPayload: hardcodedHektorForm,
  });
});

app.post("/api/test-flow-2", async (req, res) => {
  const hardcodedHektorLead = {
    source: "hektor",
    flow: "flow_2_social_post_from_hektor",
    property: {
      title: "Maison familiale avec jardin",
      city: "Langon",
      price: 320000,
      rooms: 5,
      description: "Maison lumineuse proche des commodites avec jardin.",
      photos: [],
    },
  };

  res.json({
    ok: true,
    message: "Flow 2 placeholder is reachable. Limova call will be added here.",
    limovaKeyConfigured: getLimovaKeyStatus(),
    hektorPayload: hardcodedHektorLead,
  });
});

exports.api = onRequest({
  region: "europe-west1",
  secrets: [limokey],
}, app);

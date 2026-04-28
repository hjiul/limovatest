const express = require("express");
const {onRequest} = require("firebase-functions/v2/https");
const {defineSecret} = require("firebase-functions/params");

const limokey = defineSecret("limokey");
const app = express();

app.use(express.json());

function getLimovaKeyStatus() {
  try {
    return Boolean(limokey.value() || process.env.LIMOVA_API_KEY);
  } catch {
    return Boolean(process.env.LIMOVA_API_KEY);
  }
}

app.get("/api/health", (req, res) => {
  res.json({
    ok: true,
    app: "limovatest-v2",
    limovaKeyConfigured: getLimovaKeyStatus(),
    timestamp: new Date().toISOString(),
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

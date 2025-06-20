require("dotenv").config();
const express = require("express");
const multer = require("multer");
const fs = require("fs");
const path = require("path");
const fetch = require("node-fetch");
const FormData = require("form-data");

const app = express();
const upload = multer({ storage: multer.memoryStorage() });

const TELEGRAM_TOKEN = process.env.TELEGRAM_TOKEN;
const PORT = process.env.PORT || 3000;

app.use(express.static(path.join(__dirname, "..", "public")));

app.post("/upload", upload.single("photo"), async (req, res) => {
  const chatId = req.query.uid;
  const photo = req.file;

  if (!photo || !chatId) {
    return res.status(400).send("Données manquantes.");
  }

  try {
    const form = new FormData();
    form.append("chat_id", chatId);
    form.append("photo", photo.buffer, { filename: photo.originalname });

    await fetch(`https://api.telegram.org/bot${TELEGRAM_TOKEN}/sendPhoto`, {
      method: "POST",
      body: form,
    });

    res.send("Photo envoyée !");
  } catch (err) {
    console.error("Erreur:", err);
    res.status(500).send("Erreur lors de l’envoi de la photo.");
  }
});

app.listen(PORT, () => {
  console.log(`Serveur démarré sur le port ${PORT}`);
});

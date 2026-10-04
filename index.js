const express = require("express");

const app = express();
app.use(express.json());

const TOKEN = process.env.PAGE_ACCESS_TOKEN;
const VERIFY_TOKEN = process.env.VERIFY_TOKEN;
const API_VERSION = process.env.META_API_VERSION || "v24.0";

const replies = [
  "ANO BA NAMAN YAN 😭",
  "BRO ANONG LOGIC YAN 💀",
  "HAHAHAHA seryoso ka ba?",
  "PUTEK, NAPAKA-WILD NG TAKE MO 😭",
  "GRABE NAMAN 💀",
  "AYUSIN MO MUNA LOGIC MO 😭",
  "HAHAHA ikaw na panalo 💀",
  "WAIT LANG 😭 DI KO KINAYA YAN",
  "WTF BRO 💀",
  "Sige pa, gusto ko pa ng reaction 😂"
];

function randomReply() {
  return replies[Math.floor(Math.random() * replies.length)];
}

app.get("/webhook", (req, res) => {
  const mode = req.query["hub.mode"];
  const token = req.query["hub.verify_token"];
  const challenge = req.query["hub.challenge"];

  if (mode === "subscribe" && token === VERIFY_TOKEN) {
    return res.status(200).send(challenge);
  }

  res.sendStatus(403);
});

app.post("/webhook", async (req, res) => {
  if (req.body.object !== "page") {
    return res.sendStatus(404);
  }

  for (const entry of req.body.entry || []) {
    for (const event of entry.messaging || []) {
      if (!event.message?.text) continue;

      if (event.message.text.trim() === "/") {
        await sendMessage(event.sender.id, randomReply());
      }
    }
  }

  res.sendStatus(200);
});

async function sendMessage(senderId, message) {
  const url =
    `https://graph.facebook.com/${API_VERSION}/me/messages` +
    `?access_token=${TOKEN}`;

  await fetch(url, {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify({
      recipient: { id: senderId },
      message: { text: message }
    })
  });
}

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log("🤖 Troll/Ranter bot is running!");
});

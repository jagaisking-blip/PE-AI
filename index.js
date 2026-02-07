require("dotenv").config();
const express = require("express");
const TelegramBot = require("node-telegram-bot-api");
const axios = require("axios");

const app = express();
app.use(express.json());

const bot = new TelegramBot(process.env.TELEGRAM_BOT_TOKEN);

// THIS WILL BE SET AFTER DEPLOY
const URL = process.env.APP_URL;

bot.setWebHook(`${URL}/bot${process.env.TELEGRAM_BOT_TOKEN}`);

app.post(`/bot${process.env.TELEGRAM_BOT_TOKEN}`, async (req, res) => {
  const msg = req.body.message;
  if (!msg || !msg.text) return res.sendStatus(200);

  try {
    const ai = await axios.post(
      "https://api.openai.com/v1/chat/completions",
      {
        model: "gpt-4o-mini",
        messages: [{ role: "user", content: msg.text }]
      },
      {
        headers: {
          Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
          "Content-Type": "application/json"
        }
      }
    );

    await bot.sendMessage(msg.chat.id, ai.data.choices[0].message.content);
  } catch (e) {
    await bot.sendMessage(msg.chat.id, "Error occurred");
  }

  res.sendStatus(200);
});

app.listen(process.env.PORT || 3000, () =>
  console.log("Bot running")
);

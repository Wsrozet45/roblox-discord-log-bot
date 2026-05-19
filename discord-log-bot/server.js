require("dotenv").config();

const express = require("express");
const { ActivityType, Client, GatewayIntentBits, EmbedBuilder } = require("discord.js");

const app = express();
app.use(express.json({ limit: "256kb" }));

const client = new Client({
  intents: [GatewayIntentBits.Guilds],
});

const channelMap = {
  System: process.env.SYSTEM_CHANNEL_ID,
  Log: process.env.LOG_CHANNEL_ID,
  Hapis: process.env.HAPIS_CHANNEL_ID,
  Ehliyet: process.env.EHLIYET_CHANNEL_ID,
};

const creditText = process.env.CREDIT_TEXT || "Ws_Rozet45 Tarafindan yapilmistir";
const activityText = process.env.BOT_ACTIVITY_TEXT || "Ws_Rozet45";
const activityTypeName = (process.env.BOT_ACTIVITY_TYPE || "Playing").toLowerCase();

const activityTypes = {
  playing: ActivityType.Playing,
  watching: ActivityType.Watching,
  listening: ActivityType.Listening,
  competing: ActivityType.Competing,
};

function isAuthorized(req) {
  const authHeader = req.headers.authorization || "";
  const token = authHeader.replace(/^Bearer\s+/i, "");

  return token && token === process.env.ROBLOX_AUTH_TOKEN;
}

function cleanText(value, fallback) {
  if (typeof value !== "string") {
    return fallback;
  }

  return value.slice(0, 4000);
}

app.get("/", (req, res) => {
  res.status(200).send("Roblox Discord log bot is running.");
});

app.post("/roblox/log", async (req, res) => {
  if (!isAuthorized(req)) {
    return res.status(401).json({ ok: false, error: "Unauthorized" });
  }

  const { channel, title, description, color, footer, timestamp } = req.body;
  const channelId = channelMap[channel];

  if (!channelId) {
    return res.status(400).json({ ok: false, error: "Unknown channel" });
  }

  try {
    const discordChannel = await client.channels.fetch(channelId);

    if (!discordChannel || !discordChannel.isTextBased()) {
      return res.status(400).json({ ok: false, error: "Invalid Discord channel" });
    }

    const embed = new EmbedBuilder()
      .setTitle(cleanText(title, "Roblox Log"))
      .setDescription(cleanText(description, "Log bilgisi yok."))
      .setColor(Number.isInteger(color) ? color : 0xffffff)
      .setFooter({ text: cleanText(`${footer || "Webhook System V3"} | ${creditText}`, creditText) })
      .setTimestamp(timestamp ? new Date(timestamp) : new Date());

    await discordChannel.send({ embeds: [embed] });

    return res.status(200).json({ ok: true });
  } catch (error) {
    console.error("[Log error]", error);
    return res.status(500).json({ ok: false, error: "Send failed" });
  }
});

const port = process.env.PORT || 3000;

client.once("ready", () => {
  console.log(`Discord bot logged in as ${client.user.tag}`);

  client.user.setActivity(activityText, {
    type: activityTypes[activityTypeName] || ActivityType.Playing,
  });

  app.listen(port, () => {
    console.log(`HTTP server listening on port ${port}`);
  });
});

client.login(process.env.DISCORD_TOKEN);

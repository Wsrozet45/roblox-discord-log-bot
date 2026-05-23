require("dotenv").config();
const { Client, GatewayIntentBits, ActivityType, EmbedBuilder } = require("discord.js");
const express = require("express");

const client = new Client({
    intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMessages
    ]
});

const activityText = process.env.BOT_ACTIVITY_TEXT || "Ws_Rozet45 Tarafindan yapilmistir";
const authToken = process.env.ROBLOX_AUTH_TOKEN || "sa1234"; 

const app = express();
app.use(express.json());

app.get("/", (req, res) => {
    res.send("Webhook Sistemi Aktif!");
});

// Roblox WebhookServer'dan gelen istekleri yakalar
app.post("/roblox/log", async (req, res) => {
    const { token, channelId, title, description, color } = req.body;

    // Token Güvenlik Doğrulaması
    if (token !== authToken) {
        return res.status(401).send({ error: "Yetkisiz Erişim: Token Hatalı!" });
    }

    if (!channelId || channelId === "") {
        return res.status(400).send({ error: "Hata: Kanal ID boş gönderildi!" });
    }

    try {
        // Bot girilen kanal ID'sini sunucuda arar
        const targetChannel = await client.channels.fetch(channelId);

        if (targetChannel) {
            const logEmbed = new EmbedBuilder()
                .setTitle(title || "Sistem Logu")
                .setDescription(description || "İçerik yok")
                .setColor(Number(color) || 0xFFFFFF)
                .setTimestamp();

            await targetChannel.send({ embeds: [logEmbed] });
            return res.status(200).send({ success: true });
        } else {
            console.error(`[HATA] Kanal bulunamadı: ${channelId}`);
            return res.status(404).send({ error: "Discord kanalı bulunamadı. Bot kanalı göremiyor olabilir." });
        }
    } catch (err) {
        console.error("[HATA] Mesaj gönderme başarısız:", err.message);
        return res.status(500).send({ error: "Log gönderilemedi." });
    }
});

client.once("ready", () => {
    console.log(`[BOT] ${client.user.tag} olarak başarıyla giriş yapıldı!`);
    client.user.setActivity(activityText, { type: ActivityType.Playing });

    const port = process.env.PORT || 3000;
    app.listen(port, () => {
        console.log(`[SERVER] HTTP dinleyici portu aktif: ${port}`);
    });
});

client.login(process.env.DISCORD_TOKEN);

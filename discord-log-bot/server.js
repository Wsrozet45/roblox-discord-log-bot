require("dotenv").config();
const { Client, GatewayIntentBits, ActivityType, EmbedBuilder } = require("discord.js");
const express = require("express");

// 1. DISCORD BOT AYARLARI
const client = new Client({
    intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMessages
    ]
});

const activityText = process.env.BOT_ACTIVITY_TEXT || "Ws_Rozet45 Tarafindan yapilmistir";
const authToken = process.env.ROBLOX_AUTH_TOKEN || "sa1234"; 

// 2. EXPRESS WEB SUNUCUSU
const app = express();
app.use(express.json());

app.get("/", (req, res) => {
    res.send("Bot ve Web sunucusu aktif!");
});

// Roblox'tan gelen Kanal ID'sini yakalayıp bota gönderen endpoint
app.post("/roblox/log", async (req, res) => {
    const { token, channelId, title, description, color } = req.body;

    // Güvenlik Kontrolü
    if (token !== authToken) {
        return res.status(401).send({ error: "Yetkisiz erişim: Token hatalı!" });
    }

    // Roblox'tan gelen bir Kanal ID'si var mı kontrolü
    if (!channelId || channelId === "") {
        return res.status(400).send({ error: "Hata: Config içerisinde bu kanal için ID tanımlanmamış!" });
    }

    try {
        // Bot, gelen Kanal ID'sini Discord üzerinde arar
        const targetChannel = await client.channels.fetch(channelId);

        if (targetChannel) {
            const logEmbed = new EmbedBuilder()
                .setTitle(title || "Sistem Logu")
                .setDescription(description || "İçerik yok")
                .setColor(color || 0xFFFFFF) // Varsayılan Beyaz
                .setTimestamp();

            await targetChannel.send({ embeds: [logEmbed] });
            return res.status(200).send({ success: true });
        } else {
            return res.status(404).send({ error: "Discord kanalı bulunamadı." });
        }
    } catch (err) {
        console.error("Kanal ID'sine log gönderilirken hata oluştu:", err.message);
        return res.status(500).send({ error: "Log iletilemedi, Kanal ID'si hatalı veya bot o kanalı göremiyor." });
    }
});

client.once("ready", () => {
    console.log(`[BOT] ${client.user.tag} olarak giriş yapıldı!`);
    client.user.setActivity(activityText, { type: ActivityType.Playing });

    const port = process.env.PORT || 3000;
    app.listen(port, () => {
        console.log(`[SERVER] HTTP sunucusu ${port} portunda aktif.`);
    });
});

client.login(process.env.DISCORD_TOKEN);

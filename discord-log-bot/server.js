require("dotenv").config();
const { Client, GatewayIntentBits, EmbedBuilder, ActivityType } = require("discord.js");
const express = require("express");
const axios = require("axios");

// 1. DISCORD BOT AYARLARI
const client = new Client({
    intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMessages,
        GatewayIntentBits.MessageContent
    ]
});

// Çevresel Değişkenler (Eğer .env yoksa sağdaki varsayılan değerleri kullanır)
const gameUrl = process.env.ROBLOX_GAME_URL || "https://www.roblox.com/tr/games/135442651028440/MAK-Turkish-Soldier-Game";
const activityText = process.env.BOT_ACTIVITY_TEXT || "Ws_Rozet45 Tarafindan yapilmistir";
const prefix = "!"; // Komut ön eki (Örn: !aktiflik)

// 2. EXPRESS WEB SUNUCUSU (Render için zorunlu)
const app = express();
app.use(express.json());

app.get("/", (req, res) => {
    res.send("Bot ve Web sunucusu aktif!");
});

// 3. YARDIMCI FONKSİYONLAR
// Roblox URL'sinden sayısal Place ID'yi çeker
function getPlaceId(url) {
    const matches = url.match(/games\/(\d+)/);
    return matches ? matches[1] : null;
}

// Roblox API'lerinden anlık aktif oyuncu sayısını çeker
async function getRobloxActivePlayers(placeId) {
    try {
        // Place ID -> Universe ID dönüşümü
        const universeRes = await axios.get(`https://apis.roblox.com/universes/v1/places/${placeId}/universe`);
        const universeId = universeRes.data.universeId;

        // Universe ID ile canlı verileri çekme
        const gameRes = await axios.get(`https://games.roblox.com/v1/games?universeIds=${universeId}`);
        return gameRes.data.data[0].playing || 0;
    } catch (error) {
        console.error("Roblox API hatası alındı:", error.message);
        return null;
    }
}

// 4. DISCORD EVENTLERİ
client.once("ready", () => {
    console.log(`[BOT] ${client.user.tag} olarak giriş yapıldı!`);
    
    // Bot durumunu (Activity) ayarlama
    client.user.setActivity(activityText, { type: ActivityType.Playing });

    // Render portunu dinlemeye başla
    const port = process.env.PORT || 3000;
    app.listen(port, () => {
        console.log(`[SERVER] HTTP sunucusu ${port} portunda aktif.`);
    });
});

// Mesaj Komutu Dinleyicisi
client.on("messageCreate", async (message) => {
    // Bot kendi mesajlarına veya diğer botlara cevap vermesin
    if (message.author.bot) return;

    // !aktiflik komutu yazıldıysa
    if (message.content.toLowerCase() === `${prefix}aktiflik`) {
        const placeId = getPlaceId(gameUrl);

        if (!placeId) {
            return message.reply("❌ Hata: Kod içerisindeki Roblox oyun linki geçersiz.");
        }

        // Kullanıcıya işlem yapıldığına dair bilgi verelim
        const loadingMsg = await message.reply("🔄 Veriler getiriliyor...");

        // Aktif oyuncu sayısını çek
        const activePlayers = await getRobloxActivePlayers(placeId);

        if (activePlayers === null) {
            return loadingMsg.edit("❌ Roblox API'sinden veri alınamadı. Lütfen daha sonra tekrar deneyin.");
        }

        // Tam olarak görseldeki gibi sol şeridi yeşil olan Embed yapısı
        const activeEmbed = new EmbedBuilder()
            .setColor(0x00FF00) // Canlı yeşil renk (Görseldeki şerit)
            .setDescription(`**EEM oyununun aktifliği: ${activePlayers}**`);

        // Geçici yükleniyor mesajını silip embedı gönderiyoruz
        await loadingMsg.delete().catch(() => null);
        await message.channel.send({ embeds: [activeEmbed] });
    }
});

// Botu başlatma tokeni
client.login(process.env.DISCORD_TOKEN);

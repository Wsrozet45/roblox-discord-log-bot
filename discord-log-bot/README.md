# Roblox Discord Log Bot

Bu bot Roblox'tan gelen loglari tek endpoint uzerinden alir ve Discord'daki ilgili log kanalina gonderir.

## Render ayarlari

- Service type: Web Service
- Build Command: `npm install`
- Start Command: `npm start`

## Environment variables

Render'da Environment bolumune sunlari ekle:

```txt
DISCORD_TOKEN=bot tokenin
ROBLOX_AUTH_TOKEN=WebhookConfig.lua icindeki AuthToken
SYSTEM_CHANNEL_ID=sistem kanal id
LOG_CHANNEL_ID=log kanal id
HAPIS_CHANNEL_ID=hapis kanal id
EHLIYET_CHANNEL_ID=ehliyet kanal id
```

Render sana site linki verdikten sonra Roblox'taki `WebhookConfig.lua` icinde:

```lua
BotEndpoint = "https://render-linkin.onrender.com/roblox/log"
```

seklinde ayarla.

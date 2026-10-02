# BA for Two — Telegram Publisher

This tiny Vercel server publishes a prepared post to your Telegram channel.

## Environment Variables

TELEGRAM_BOT_TOKEN = the token from @BotFather
TELEGRAM_CHAT_ID = your channel username, e.g. @your_channel

## Deploy

1. Upload this project to a GitHub repository.
2. Import the repository into Vercel.
3. Add the two Environment Variables above.
4. Deploy.

## Publishing endpoint

POST /api/post

JSON:
{"text":"<b>🌆 Идеи на сегодня</b>\n..."}
Test deployment
export default async function handler(req, res) {
  if (req.method !== "GET") {
    return res.status(405).json({ error: "GET only" });
  }

  if (req.query.key !== process.env.TEST_SECRET) {
    return res.status(401).json({ error: "Unauthorized" });
  }

  const token = process.env.TELEGRAM_BOT_TOKEN;
  const chatId = process.env.TELEGRAM_CHAT_ID;

  const response = await fetch(
    `https://api.telegram.org/bot${token}/sendMessage`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        chat_id: chatId,
        text: "🧪 Тест BA for Two: Vercel → Telegram работает!",
        parse_mode: "HTML"
      })
    }
  );

  const data = await response.json();

  return res
    .status(response.ok ? 200 : 500)
    .json(data);
}

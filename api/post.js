export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "POST only" });
  }

  const token = process.env.TELEGRAM_BOT_TOKEN;
  const chatId = process.env.TELEGRAM_CHAT_ID;

  if (!token || !chatId) {
    return res.status(500).json({
      error: "Missing Telegram environment variables"
    });
  }

  const text = req.body?.text;

  if (!text) {
    return res.status(400).json({ error: "Missing text" });
  }

  const response = await fetch(
    `https://api.telegram.org/bot${token}/sendMessage`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        chat_id: chatId,
        text,
        parse_mode: "HTML",
        disable_web_page_preview: false
      })
    }
  );

  const data = await response.json();

  return res
    .status(response.ok ? 200 : 500)
    .json(data);
}

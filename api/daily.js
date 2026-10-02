function splitMessage(text, maxLength = 3900) {
  const parts = [];
  let current = "";

  for (const paragraph of text.split("\n\n")) {
    if ((current + "\n\n" + paragraph).length > maxLength) {
      if (current) parts.push(current);
      current = paragraph;
    } else {
      current += (current ? "\n\n" : "") + paragraph;
    }
  }

  if (current) parts.push(current);
  return parts;
}

async function sendTelegram(text) {
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
        text,
        disable_web_page_preview: false
      })
    }
  );

  const data = await response.json();

  if (!response.ok) {
    throw new Error(`Telegram error: ${JSON.stringify(data)}`);
  }

  return data;
}

export default async function handler(req, res) {
  if (req.method !== "GET") {
    return res.status(405).json({ error: "GET only" });
  }

  const openaiKey = process.env.OPENAI_API_KEY;

  if (!openaiKey) {
    return res.status(500).json({
      error: "Missing OPENAI_API_KEY"
    });
  }

  try {
    const today = new Date().toLocaleDateString("es-AR", {
      timeZone: "America/Argentina/Buenos_Aires",
      day: "2-digit",
      month: "2-digit",
      year: "numeric"
    });

    const prompt = `
Сегодня ${today} по времени Буэнос-Айреса.

Ты — мой личный редактор ежедневной афиши для пары, живущей в Буэнос-Айресе.

Твоя задача — с помощью веб-поиска найти АКТУАЛЬНЫЕ варианты, чем можно заняться вдвоём в ближайшие дни.

Ищи именно реальные события и места в Buenos Aires, Argentina.

Приоритет:
1. Будние вечера.
2. Суббота со второй половины дня.
3. Воскресенье — весь день.

Ищи максимально широко:
— концерты;
— выставки;
— кино;
— театр;
— стендап;
— маркеты и ярмарки;
— фестивали;
— мастер-классы;
— рукоделие и творчество;
— гастрономические мероприятия;
— дегустации;
— необычные бары и рестораны;
— прогулки;
— необычные места;
— лекции;
— игры;
— квизы;
— спортивные активности, где можно реально записаться/забронировать место: padel, tenis, badminton, bowling, squash, mini-golf, patinaje, escalada, piscina, golf, billar и т.п.

Не ограничивайся туристическими достопримечательностями.
Ищи интересные локальные варианты.

Для каждого варианта ОБЯЗАТЕЛЬНО проверь по актуальному источнику:
— название;
— точную дату;
— время;
— место;
— полный адрес;
— актуальную цену;
— где купить билет или записаться;
— продолжительность, если известна;
— нужна ли предварительная запись;
— есть ли ограничения;
— зависит ли мероприятие от погоды.

Если информация не подтверждается актуальным источником — НЕ выдумывай её.

Отдельно учитывай погоду: если на ближайшие дни ожидается плохая погода, предложи больше вариантов в помещении.

Бюджет обычно $10–30 на человека/активность, но НЕ исключай более дорогие варианты. Для дорогих вариантов обязательно укажи цену.

Мне нужны не только отдельные мероприятия, но и ГОТОВЫЕ СЦЕНАРИИ ВЕЧЕРА, например:
17:00 — padel
19:00 — ужин
22:00 — стендап.

Сделай несколько таких комбинаций, если есть подходящие варианты.

Также добавь несколько вариантов "если сегодня/в выходные остаёмся дома":
— конкретный план по времени;
— что купить/подготовить;
— что делать по шагам;
— примерный бюджет;
— правила игры или инструкции;
— чтобы это действительно было интересным занятием для пары, а не просто "посмотрите фильм".

Формат итогового сообщения:

🌆 ИДЕИ ДЛЯ ДВОИХ В БУЭНОС-АЙРЕСЕ
[дата]

🌤 Погода
Коротко: что ожидать и как это влияет на планы.

🔥 САМОЕ ИНТЕРЕСНОЕ
5–8 наиболее интересных вариантов.

Для каждого:
📅 дата, день недели
⏰ время
📍 место + адрес
💰 цена
🎟 как купить/записаться
⏱ длительность
❤️ почему это хорошо именно для пары
☔ погода / помещение или улица

🎯 ЕЩЁ ВАРИАНТЫ
Ещё 5–10 менее очевидных вариантов.

🏃 СПОРТ И АКТИВНОСТИ
Только реальные места, где можно забронировать/записаться.

🍷 ГОТОВЫЕ СЦЕНАРИИ ВЕЧЕРА
Несколько последовательных планов.

🏠 ЕСЛИ ОСТАЁМСЯ ДОМА
2–3 подробных сценария.

Очень важно:
— не пиши общие советы;
— не выдумывай события;
— не используй устаревшие цены;
— проверяй даты;
— если билет уже распродан, так и напиши;
— если мероприятие бесплатное, напиши "бесплатно";
— давай прямые ссылки на официальные страницы билетов/регистрации;
— пиши на русском;
— стиль живой, конкретный и полезный;
— не делай длинного вступления.
`;

    const openaiResponse = await fetch(
      "https://api.openai.com/v1/responses",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${openaiKey}`
        },
        body: JSON.stringify({
          model: "gpt-5",
          tools: [
            {
              type: "web_search"
            }
          ],
          input: prompt
        })
      }
    );

    const openaiData = await openaiResponse.json();

    if (!openaiResponse.ok) {
      throw new Error(
        `OpenAI error: ${JSON.stringify(openaiData)}`
      );
    }

    const text = openaiData.output_text;

    if (!text) {
      throw new Error("OpenAI returned no text");
    }

    const messages = splitMessage(text);

    for (const message of messages) {
      await sendTelegram(message);
    }

    return res.status(200).json({
      ok: true,
      messagesSent: messages.length
    });

  } catch (error) {
    console.error(error);

    return res.status(500).json({
      ok: false,
      error: error.message
    });
  }
}

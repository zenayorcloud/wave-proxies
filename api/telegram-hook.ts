import { VercelRequest, VercelResponse } from "@vercel/node";
import { Telegraf } from "telegraf";

const BOT_TOKEN = process.env.BOT_TOKEN!;
const webhookUrl = process.env.WEBHOOK_URL!;

const bot = new Telegraf(BOT_TOKEN);

bot.command("start", async (ctx) => {
  console.log("WEBHOOK_URL is:", webhookUrl); // <-- add this
  console.log("start command received");       // <-- and this
  
  const channelUrl = "t.me/lionhartproxxx";
  const targetUrl = "t.me/+mQ31t_sl6pw4MzNk";

  const userMessageId = ctx.message.message_id;
  const chatId = ctx.message.chat.id;

  const sentMessage = await ctx.reply(
    `[Join now!](${targetUrl})\n[Join Here](${targetUrl})`,
    {
      parse_mode: "Markdown",
      reply_markup: {
        inline_keyboard: [[{ text: "Join Channel", url: channelUrl }]],
      },
    }
  );

  console.log("Reply sent, chatId:", chatId, "botMessageId:", sentMessage.message_id);
  const deleteUrl = `https://wave-proxies.vercel.app/api/api/delete-messages`;
  console.log("Firing fetch to:", deleteUrl); // <-- confirm the URL
  
  // Fire-and-forget: tell the delete endpoint to clean up after 60s
  fetch(deleteUrl, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      chatId,
      userMessageId,
      botMessageId: sentMessage.message_id,
    }),
  }).then(() => console.log("Fetch to delete-messages succeeded"))
    .catch((err) => console.error("Fetch to delete-messages failed:", err));
});

export default async (req: VercelRequest, res: VercelResponse) => {
  try {
    const { body, query } = req;

    if (query.setWebhook === "true") {
      await bot.telegram.setWebhook(`${webhookUrl}/api/telegram-hook`);
      return res.status(200).send("OK");
    }

    await bot.handleUpdate(body);
    return res.status(200).send("OK"); // Telegram gets this immediately
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: "Internal server error" });
  }
};

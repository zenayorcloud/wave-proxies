import { VercelRequest, VercelResponse } from "@vercel/node";
import { Telegraf } from "telegraf";

const BOT_TOKEN = process.env.BOT_TOKEN!;
const webhookUrl = process.env.WEBHOOK_URL!;

const bot = new Telegraf(BOT_TOKEN);

bot.command("start", async (ctx) => {
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

  // Fire-and-forget: tell the delete endpoint to clean up after 60s
  fetch(`${webhookUrl}/api/delete-messages`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      chatId,
      userMessageId,
      botMessageId: sentMessage.message_id,
    }),
  }).catch(console.error);
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

import { VercelRequest, VercelResponse } from "@vercel/node";
import { Telegraf } from "telegraf";

const BOT_TOKEN = process.env.BOT_TOKEN!;
const webhookUrl = process.env.WEBHOOK_URL!;
const bot = new Telegraf(BOT_TOKEN);

const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

// Track processed message IDs to avoid duplicate handling
const processed = new Set<number>();

export const config = {
  maxDuration: 60,
};

export default async (req: VercelRequest, res: VercelResponse) => {
  try {
    const { body, query } = req;

    if (query.setWebhook === "true") {
      await bot.telegram.setWebhook(`${webhookUrl}/api/telegram-hook`);
      return res.status(200).send("OK");
    }

    if (body?.message?.text === "/start") {
      const chatId = body.message.chat.id;
      const userMessageId = body.message.message_id;

      // If we've already handled this exact message, ignore it
      if (processed.has(userMessageId)) {
        console.log("Duplicate update ignored:", userMessageId);
        return res.status(200).send("OK");
      }

      // Mark as processed immediately
      processed.add(userMessageId);

      const targetUrl = "t.me/+mQ31t_sl6pw4MzNk";
      const channelUrl = "t.me/lionhartproxxx";

      const sent = await bot.telegram.sendMessage(
        chatId,
        `[Join now!](${targetUrl})\n[Join Here](${targetUrl})`,
        {
          parse_mode: "Markdown",
          reply_markup: {
            inline_keyboard: [[{ text: "Join Channel", url: channelUrl }]],
          },
        }
      );

      console.log("Reply sent:", sent.message_id);

      await sleep(60 * 1000);
      console.log("Sleep done, deleting messages...");

      try {
        await bot.telegram.deleteMessage(chatId, userMessageId);
        console.log("User message deleted")

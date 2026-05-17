import { VercelRequest, VercelResponse } from "@vercel/node";
import { Telegraf } from "telegraf";
import { Client } from "@upstash/qstash";

const BOT_TOKEN = process.env.BOT_TOKEN!;
const webhookUrl = process.env.WEBHOOK_URL!;
const bot = new Telegraf(BOT_TOKEN);
const qstash = new Client({ token: process.env.QSTASH_TOKEN! });

export async function handleStartCommand(ctx) {
  const COMMAND = "/start";
  const channelUrl = "t.me/lionhartproxxx";
  const targetUrl = "t.me/+mQ31t_sl6pw4MzNk";
  const reply = `
[Join now!](${targetUrl})
[Join Here](${targetUrl})
`;

  try {
    const userMessageId = ctx.message.message_id;
    const chatId = ctx.message.chat.id;

    const sentMessage = await ctx.reply(reply, {
      parse_mode: "Markdown",
      reply_markup: {
        inline_keyboard: [
          [{ text: "Join Channel", url: channelUrl }],
        ],
      },
    });

    console.log(`Reply to ${COMMAND} command sent successfully.`);

    // Schedule deletion via QStash after 5 minutes
    await qstash.publishJSON({
      url: `${webhookUrl}/api/delete-messages`,
      delay: 60, // 60 seconds
      body: {
        chatId,
        userMessageId,
        botMessageId: sentMessage.message_id,
      },
    });

    console.log("Deletion scheduled via QStash.");
  } catch (error) {
    console.error(`Something went wrong with the ${COMMAND} command:`, error);
  }
}

bot.command("start", async (ctx) => {
  await handleStartCommand(ctx);
});

export default async (req: VercelRequest, res: VercelResponse) => {
  try {
    const { body, query } = req;

    if (query.setWebhook === "true") {
      await bot.telegram.setWebhook(webhookUrl);
      return res.status(200).send("OK");
    }

    await bot.handleUpdate(body);
    return res.status(200).send("OK");
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: "Internal server error" });
  }
};

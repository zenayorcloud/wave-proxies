import { VercelRequest, VercelResponse } from "@vercel/node";
import { Telegraf } from "telegraf";
import { createClient } from "@supabase/supabase-js";

const BOT_TOKEN = process.env.BOT_TOKEN!;
const webhookUrl = process.env.WEBHOOK_URL!;
const bot = new Telegraf(BOT_TOKEN);
const supabase = createClient(
  process.env.SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_KEY!
);

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

    // Schedule deletion 5 minutes from now
    const deleteAt = new Date(Date.now() + 60 * 1000).toISOString();

    const { error } = await supabase.from("pending_deletions").insert({
      chat_id: chatId,
      user_message_id: userMessageId,
      bot_message_id: sentMessage.message_id,
      delete_at: deleteAt,
    });

    if (error) console.error("Failed to schedule deletion:", error);
    else console.log("Deletion scheduled at:", deleteAt);

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

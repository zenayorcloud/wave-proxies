import { VercelRequest, VercelResponse } from "@vercel/node";
import { Telegraf } from "telegraf";

const BOT_TOKEN = process.env.BOT_TOKEN;
const webhookUrl = process.env.WEBHOOK_URL;

const bot = new Telegraf(BOT_TOKEN);

export async function handleStartCommand(ctx) {
  const COMMAND = "/start";
  const channelUrl = "t.me/lionhartproxxx";
  const targetUrl = "t.me/+mQ31t_sl6pw4MzNk";

  const reply = `
[Join now!](${targetUrl})
[Join Here](${targetUrl})
`;

  try {
    const sentMessage = await ctx.reply(reply, {
      parse_mode: "Markdown",
      reply_markup: {
        inline_keyboard: [
          [
            {
              text: "Join Channel",
              url: channelUrl,
            },
          ],
        ],
      },
    });

    console.log(`Reply to ${COMMAND} command sent successfully.`);

    // Delete the bot's reply after 5 minutes (300,000 ms)
    setTimeout(async () => {
      try {
        await ctx.telegram.deleteMessage(
          sentMessage.chat.id,
          sentMessage.message_id
        );
        console.log("Bot reply deleted after 5 minutes.");
      } catch (deleteError) {
        console.error("Failed to delete bot reply:", deleteError);
      }
    }, 2 * 60 * 1000);

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
      const success = await bot.telegram.setWebhook(webhookUrl);
      return res.status(200).send("OK");
    }

    await bot.handleUpdate(body);
    return res.status(200).send("OK");
  } catch (err) {
    return res.json({ error: "Internal server error" }, { status: 500 });
  }
};

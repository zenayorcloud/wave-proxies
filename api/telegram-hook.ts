import { VercelRequest, VercelResponse } from "@vercel/node";
import { Telegraf } from "telegraf";

const BOT_TOKEN = process.env.BOT_TOKEN;
const webhookUrl = process.env.WEBHOOK_URL;

const bot = new Telegraf(BOT_TOKEN);

const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

export async function handleStartCommand(ctx) {
  const COMMAND = "/start";
  const channelUrl = "t.me/waveprxp";
  const targetUrl = "t.me/+-gOMOX17GBllYzMx";

  const reply = `
[Join now if you trynna eat!!

How to make dat REAL cash using all sorts of proven methods:

- Bank logs and credit cards cashout methods

- Cashapp plays for quick profits

- Abusing employment benefits for free funds

- Gambling and rental plays for easy dough

- And way more!](${targetUrl})


[Join Here](${targetUrl})
`;

  try {
     const userMessageId = ctx.message.message_id;
    const chatId = ctx.message.chat.id;
    
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

    // Wait 5 seconds BEFORE the function returns
    await sleep(5 * 60 * 1000);


   try {
        // Delete user's /start message
        await ctx.telegram.deleteMessage(chatId, userMessageId);
        console.log("User message deleted.");
      } catch (err) {
        console.error("Failed to delete user message:", err);
      }

      try {
        // Delete bot's reply
        await ctx.telegram.deleteMessage(chatId, sentMessage.message_id);
        console.log("Bot reply deleted.");
      } catch (err) {
        console.error("Failed to delete bot reply:", err);
      }

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

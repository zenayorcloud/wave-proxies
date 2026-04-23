import { VercelRequest, VercelResponse } from "@vercel/node";
import { Telegraf } from "telegraf";

// Environment variables
const BOT_TOKEN = process.env.BOT_TOKEN;
const webhookUrl = process.env.WEBHOOK_URL;
///api.telegram.org/bot{token}/setWebhook?url={url}/api/telegram-hook?secret_hash=32e58fbahey833349df3383dc910e180
//api.telegram.org/bot{token}setWebhook?url=https://mobile-proxies.vercel.app/api/telegram-hook?secret_hash=32e58fbahey833349df3383dc910e180

const bot = new Telegraf(BOT_TOKEN);

// Handle the /start command
export async function handleStartCommand(ctx) {
  const COMMAND = "/start";

  // Welcome message with Markdown formatting
  const reply = `
Unlock 100% Free VPN Access — No Limits, No Trials

Enjoy fast, secure, and private VPN connections with zero cost.
No sign-ups. No restrictions.

Instantly connect to global servers

Stay protected on public Wi-Fi and keep your data safe

High-speed performance for smooth browsing

Works on all devices — anytime, anywhere

Ready to browse without borders? Get today's list below
 `;

  try {
    await ctx.reply(reply, {
      parse_mode: "Markdown",
      reply_markup: {
        inline_keyboard: [
          [{ text: "Get Today's Socks5", callback_data: "socks_5" }],
          [{ text: "Get Today's Socks4", callback_data: "socks_4" }],
        ],
      },
    });
    console.log(`Reply to ${COMMAND} command sent successfully.`);
  } catch (error) {
    console.error(`Something went wrong with the ${COMMAND} command:`, error);
  }
}

// Socks 5
bot.action("socks_5", async (ctx) => {
  await ctx.answerCbQuery();
  await ctx.replyWithDocument({
    url: "https://github.com/emerur/unlimited_bot/blob/main/socks5.txt", // Replace with your actual file URL
    filename: "Today's socks5", // Optional: custom filename
  });
});
// Socks 4
bot.action("socks_4", async (ctx) => {
  await ctx.answerCbQuery();
  await ctx.replyWithDocument({
    url: "https://github.com/emerur/unlimited_bot/blob/main/socks4.txt", // Replace with your actual file URL
    filename: "Today's socks4", // Optional: custom filename
  });
});

// Register the /start command handler
bot.command("start", async (ctx) => {
  await handleStartCommand(ctx);
});

// Webhook handler
export default async (req: VercelRequest, res: VercelResponse) => {
  try {
    const { body, query } = req;

    if (query.setWebhook === "true") {
      const success = await bot.telegram.setWebhook(webhookUrl);
      // console.log("Webchook set:", webhookUrl, success);
      return res.status(200).send("OK");
    }

    await bot.handleUpdate(body);
    return res.status(200).send("OK");
  } catch (err) {
    return res.json({ error: "Internal server error" }, { status: 500 });
  }

  // res.status(200).send("OK");
};

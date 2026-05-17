import { VercelRequest, VercelResponse } from "@vercel/node";
import { Telegraf } from "telegraf";
import { Receiver } from "@upstash/qstash";

const BOT_TOKEN = process.env.BOT_TOKEN!;
const bot = new Telegraf(BOT_TOKEN);

const receiver = new Receiver({
  currentSigningKey: process.env.QSTASH_CURRENT_SIGNING_KEY!,
  nextSigningKey: process.env.QSTASH_NEXT_SIGNING_KEY!,
});

export default async (req: VercelRequest, res: VercelResponse) => {
  try {
    // Verify the request is genuinely from QStash
    const signature = req.headers["upstash-signature"] as string;
    const body = JSON.stringify(req.body);

    const isValid = await receiver.verify({
      signature,
      body,
    });

    if (!isValid) {
      console.error("Invalid QStash signature");
      return res.status(401).send("Unauthorized");
    }

    const { chatId, userMessageId, botMessageId } = req.body;
    console.log("Deleting messages for chatId:", chatId);

    try {
      await bot.telegram.deleteMessage(chatId, userMessageId);
      console.log("User message deleted.");
    } catch (err) {
      console.error("Failed to delete user message:", err);
    }

    try {
      await bot.telegram.deleteMessage(chatId, botMessageId);
      console.log("Bot message deleted.");
    } catch (err) {
      console.error("Failed to delete bot message:", err);
    }

    return res.status(200).send("OK");
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: "Internal server error" });
  }
};

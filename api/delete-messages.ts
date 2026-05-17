import { VercelRequest, VercelResponse } from "@vercel/node";
import { Telegraf } from "telegraf";

export default async (req: VercelRequest, res: VercelResponse) => {
  console.log("delete-messages endpoint hit", req.body); // <-- add this
  ...
}
const BOT_TOKEN = process.env.BOT_TOKEN!;
const bot = new Telegraf(BOT_TOKEN);

const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

export default async (req: VercelRequest, res: VercelResponse) => {
  if (req.method !== "POST") {
    return res.status(405).send("Method Not Allowed");
  }

  const { chatId, userMessageId, botMessageId } = req.body;

  if (!chatId || !userMessageId || !botMessageId) {
    return res.status(400).json({ error: "Missing required fields" });
  }

  // Sleep 60 seconds
  await sleep(60 * 1000);

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
};

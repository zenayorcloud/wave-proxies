import { VercelRequest, VercelResponse } from "@vercel/node";
import { Telegraf } from "telegraf";

console.log("delete-messages module loaded"); // <-- outside the handler

const BOT_TOKEN = process.env.BOT_TOKEN!;
const bot = new Telegraf(BOT_TOKEN);

const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

export default async (req: VercelRequest, res: VercelResponse) => {
  console.log("delete-messages handler called"); // <-- inside handler
  console.log("method:", req.method);
  console.log("body:", req.body);

  if (req.method !== "POST") {
    return res.status(405).send("Method Not Allowed");
  }

  const { chatId, userMessageId, botMessageId } = req.body;

  console.log("chatId:", chatId, "userMessageId:", userMessageId, "botMessageId:", botMessageId);

  if (!chatId || !userMessageId || !botMessageId) {
    return res.status(400).json({ error: "Missing required fields" });
  }

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

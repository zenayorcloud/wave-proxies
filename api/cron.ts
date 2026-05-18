import { VercelRequest, VercelResponse } from "@vercel/node";
import { Telegraf } from "telegraf";
import { createClient } from "@supabase/supabase-js";

const BOT_TOKEN = process.env.BOT_TOKEN!;
const bot = new Telegraf(BOT_TOKEN);
const supabase = createClient(
  process.env.SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_KEY!
);

export default async (req: VercelRequest, res: VercelResponse) => {
  try {
    // Fetch all rows ready to be deleted
    const { data, error } = await supabase
      .from("pending_deletions")
      .select("*")
      .lte("delete_at", new Date().toISOString());

    if (error) {
      console.error("Failed to fetch pending deletions:", error);
      return res.status(500).json({ error: "DB erroror" });
    }

    if (!data || data.length === 0) {
      console.log("No messages to delete.");
      return res.status(200).send("OK");
    }

    console.log(`Deleting ${data.length} message(s)...`);

    for (const row of data) {
      // Delete user message
      try {
        await bot.telegram.deleteMessage(row.chat_id, row.user_message_id);
        console.log("User message deleted:", row.user_message_id);
      } catch (err) {
        console.error("Failed to delete user message:", err);
      }

      // Delete bot message
      try {
        await bot.telegram.deleteMessage(row.chat_id, row.bot_message_id);
        console.log("Bot message deleted:", row.bot_message_id);
      } catch (err) {
        console.error("Failed to delete bot message:", err);
      }

      // Remove row from DB
      await supabase.from("pending_deletions").delete().eq("id", row.id);
    }

    return res.status(200).send("OK");
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: "Internal server error" });
  }
};

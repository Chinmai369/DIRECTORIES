require("dotenv").config();
const app = require("./server/app");
const cron = require("node-cron");
const { sendTodaysBirthdayMessages } = require("./server/services/birthdayService");

const PORT = process.env.PORT || 4000;

app.listen(PORT, () => {
  console.log(`🚀 Backend running at http://localhost:${PORT}`);

  // ─── Daily Birthday WhatsApp Job ───────────────────────────────────────────
  // Runs every day at 9:00 AM (server local time)
  cron.schedule("0 9 * * *", async () => {
    console.log("[Cron] Running daily birthday WhatsApp job...");
    try {
      const summary = await sendTodaysBirthdayMessages();
      console.log("[Cron] Birthday job finished:", summary);
    } catch (err) {
      console.error("[Cron] Birthday job error:", err.message);
    }
  });

  console.log("⏰ Birthday WhatsApp cron job scheduled at 9:00 AM daily");
});

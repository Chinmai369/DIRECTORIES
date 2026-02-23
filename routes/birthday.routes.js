const express = require("express");
const router = express.Router();
const {
  sendTodaysBirthdayMessages,
  getTodaysBirthdayEmployees,
} = require("../server/services/birthdayService");

/**
 * GET /api/birthday/today
 * Returns the list of employees whose birthday is today.
 */
router.get("/today", async (req, res) => {
  try {
    const employees = await getTodaysBirthdayEmployees();
    res.json({ success: true, count: employees.length, employees });
  } catch (err) {
    console.error("[Birthday Route] Error fetching today's birthdays:", err);
    res.status(500).json({ success: false, message: err.message });
  }
});

/**
 * POST /api/birthday/send
 * Manually triggers WhatsApp birthday messages for today's birthdays.
 */
router.post("/send", async (req, res) => {
  try {
    console.log("[Birthday Route] Manual trigger received");
    const summary = await sendTodaysBirthdayMessages();
    res.json({ success: true, ...summary });
  } catch (err) {
    console.error("[Birthday Route] Error sending birthday messages:", err);
    res.status(500).json({ success: false, message: err.message });
  }
});

module.exports = router;

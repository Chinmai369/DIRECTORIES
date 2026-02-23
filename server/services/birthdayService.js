const axios = require("axios");
const sequelize = require("../config/db");
const Sequelize = require("sequelize");

const WHATSAPP_API_URL = "https://realtimegoverance.ap.gov.in:8000/api/v1/templates/direct-send";

const MESSAGE_TEMPLATE = `Dear {{name}},
On behalf of the Commissioner & Director of Municipal Administration (CDMA), we wish you a very Happy Birthday! 🎂
May this year bring you continued health, happiness, and success in your professional journey. We appreciate your dedicated efforts and commitment toward the growth and excellence of the Department.
Warm Regards,
Director,
CDMA, MA&UD Department.`;

/**
 * Fetch all employees whose birthday is today (matches day + month).
 */
async function getTodaysBirthdayEmployees() {
  const rows = await sequelize.query(
    `SELECT name, surname, mobileno, employeeid
     FROM ext_cfms_stg_t
     WHERE dob IS NOT NULL
       AND dob != ''
       AND DAY(STR_TO_DATE(dob, '%d/%m/%Y'))   = DAY(CURDATE())
       AND MONTH(STR_TO_DATE(dob, '%d/%m/%Y')) = MONTH(CURDATE())`,
    { type: Sequelize.QueryTypes.SELECT }
  );
  return rows;
}

/**
 * Send a WhatsApp birthday message to a single employee.
 */
async function sendBirthdayMessage(employee) {
  const fullName = [employee.name, employee.surname].filter(Boolean).join(" ").trim();
  const mobile  = (employee.mobileno || "").trim();

  if (!mobile) {
    console.warn(`[Birthday] Skipping ${fullName} (${employee.employeeid}) — no mobile number`);
    return { success: false, reason: "no_mobile", employeeid: employee.employeeid, name: fullName };
  }

  const content = MESSAGE_TEMPLATE.replace("{{name}}", fullName);

  try {
    const response = await axios.post(
      WHATSAPP_API_URL,
      {
        content,
        department: "CDMA",
        reciever: mobile,
      },
      {
        timeout: 15000,
        headers: { "Content-Type": "application/json" },
      }
    );

    console.log(`[Birthday] ✅ Sent to ${fullName} (${mobile}) — status ${response.status}`);
    return { success: true, employeeid: employee.employeeid, name: fullName, mobile };
  } catch (err) {
    const errMsg = err.response?.data || err.message;
    console.error(`[Birthday] ❌ Failed for ${fullName} (${mobile}):`, errMsg);
    return { success: false, reason: errMsg, employeeid: employee.employeeid, name: fullName, mobile };
  }
}

/**
 * Main function: find today's birthday employees and send WhatsApp messages.
 * Returns a summary object.
 */
async function sendTodaysBirthdayMessages() {
  console.log("[Birthday] Starting birthday message job...");

  const employees = await getTodaysBirthdayEmployees();
  console.log(`[Birthday] Found ${employees.length} employee(s) with birthdays today`);

  if (employees.length === 0) {
    return { sent: 0, failed: 0, skipped: 0, results: [] };
  }

  const results = [];
  for (const emp of employees) {
    const result = await sendBirthdayMessage(emp);
    results.push(result);
    // Small delay between messages to avoid rate-limiting
    await new Promise((r) => setTimeout(r, 500));
  }

  const sent    = results.filter((r) => r.success).length;
  const skipped = results.filter((r) => !r.success && r.reason === "no_mobile").length;
  const failed  = results.filter((r) => !r.success && r.reason !== "no_mobile").length;

  console.log(`[Birthday] Job complete — Sent: ${sent}, Failed: ${failed}, Skipped (no mobile): ${skipped}`);
  return { sent, failed, skipped, results };
}

module.exports = { sendTodaysBirthdayMessages, getTodaysBirthdayEmployees };

console.log("👉 Starting DB test...");

const sequelize = require("./db");

(async () => {
  try {
    await sequelize.authenticate();
    console.log("✅ MySQL connected successfully.");
    process.exit(0);
  } catch (err) {
    console.error("❌ Unable to connect to DB:", err);
    process.exit(1);
  }
})();

const { Sequelize } = require("sequelize");
const seq = new Sequelize("APCMMSDB_DEV", "dev_sonyp", "S0ny9_323", {
  host: "3.108.24.129", port: 3306, dialect: "mysql", logging: false
});
async function run() {
  const [s] = await seq.query(
    "SELECT COUNT(*) AS total, SUM(gender='Male') AS male, SUM(gender='Female') AS female, SUM(status='ACTIVE') AS active, SUM(status='ON LEAVE') AS on_leave, SUM(email IS NOT NULL AND email != '') AS has_email FROM cdma_cmsnr_drctry",
    { type: Sequelize.QueryTypes.SELECT }
  );
  console.log("Summary:", s);
  const rows = await seq.query(
    "SELECT first_name, sir_name, designation, district FROM cdma_cmsnr_drctry LIMIT 5",
    { type: Sequelize.QueryTypes.SELECT }
  );
  console.log("Sample rows:");
  rows.forEach(r => console.log(" -", r.first_name, r.sir_name, "|", r.designation, "|", r.district));
  seq.close();
}
run().catch(e => { console.error(e.message); seq.close(); });

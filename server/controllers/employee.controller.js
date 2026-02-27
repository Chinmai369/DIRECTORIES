const Employee = require("../models/employee.model");          // master table: ext_cfms_stg_t
const CmsnrDirectory = require("../models/cmsnrDirectory.model"); // new directory: cdma_cmsnr_drctry
const sequelize = require("../config/db");
const { Op } = require("sequelize");
const Sequelize = require("sequelize");

// ─────────────────────────────────────────────────────────────────────────────
// Helper: normalise a cdma_cmsnr_drctry row into the BackendEmployee shape
// that the frontend already understands.
// ─────────────────────────────────────────────────────────────────────────────
function normalizeDirectoryRow(row) {
  const r = row.dataValues || row;
  return {
    employeeid:      r.employee_id  || "",
    cfms_id:         r.cfms_id      || "",
    name:            r.first_name   || r.employee_name || "",
    surname:         r.sir_name     || "",
    fathername:      "",
    designation:     r.designation  || r.position || "",
    desgcode:        "",
    dept_id:         null,
    department_name: r.department   || "",
    department_code: "",
    distcode:        "",
    distname:        r.district     || "",
    description_long:"",
    mobileno:        r.mobile_no    || "",
    email1:          r.email        || "",
    doj:             null,
    dor:             r.dor          || null,
    dob:             r.dob          || null,
    basicpay:        null,
    gross:           null,
    gender_desc:     r.gender       || "",
    employee_status: r.status       || "",
    sno:             r.sno
  };
}

// ─────────────────────────────────────────────────────────────────────────────
// GET /api/employees  — list from cdma_cmsnr_drctry
// ─────────────────────────────────────────────────────────────────────────────
exports.getEmployees = async (req, res) => {
  try {
    const {
      search,
      distcode,
      dept_id,
      designation,
      status,
      birthdayMonth,
      retiringYear,
      page  = 1,
      limit = 20
    } = req.query;

    const conditions = [];

    if (search) {
      conditions.push({
        [Op.or]: [
          { first_name:    { [Op.like]: `%${search}%` } },
          { sir_name:      { [Op.like]: `%${search}%` } },
          { employee_name: { [Op.like]: `%${search}%` } },
          { cfms_id:       search },
          { employee_id:   search },
          { mobile_no:     search }
        ]
      });
    }

    if (designation) conditions.push({ designation: { [Op.like]: `%${designation}%` } });
    if (distcode)    conditions.push({ district: distcode });
    if (dept_id)     conditions.push({ department: dept_id });

    if (status === "regular")   conditions.push({ status: { [Op.or]: [{ [Op.like]: "%ACTIVE%" }, { [Op.like]: "%REGULAR%" }] } });
    if (status === "incharge")  conditions.push({ status: { [Op.like]: "%INCHARGE%" } });
    if (status === "suspended") conditions.push({ status: { [Op.like]: "%SUSPEND%"  } });

    if (birthdayMonth === "current") {
      const m = new Date().getMonth() + 1;
      conditions.push(Sequelize.literal(`dob IS NOT NULL AND MONTH(dob) = ${m}`));
    }
    if (birthdayMonth === "next") {
      const nm = (new Date().getMonth() + 2 > 12) ? 1 : new Date().getMonth() + 2;
      conditions.push(Sequelize.literal(`dob IS NOT NULL AND MONTH(dob) = ${nm}`));
    }
    if (retiringYear === "current") {
      const y = new Date().getFullYear();
      conditions.push(Sequelize.literal(`dor IS NOT NULL AND YEAR(dor) = ${y}`));
    }

    const finalWhere = conditions.length > 0 ? { [Op.and]: conditions } : {};
    const offset = (page - 1) * limit;

    const data = await CmsnrDirectory.findAndCountAll({
      where: finalWhere,
      limit: Number(limit),
      offset,
      order: [["first_name", "ASC"]]
    });

    const rows = data.rows.map(normalizeDirectoryRow);

    res.json({ success: true, total: data.count, rows });
  } catch (err) {
    console.error("[getEmployees] error:", err);
    res.status(500).json({ success: false, message: err.message });
  }
};

// ─────────────────────────────────────────────────────────────────────────────
// GET /api/employees/stats  — stats from cdma_cmsnr_drctry
// ─────────────────────────────────────────────────────────────────────────────
exports.getEmployeeStats = async (req, res) => {
  try {
    const [statsRow] = await sequelize.query(
      `SELECT
        COUNT(*)                                                AS total,
        SUM(UPPER(status) LIKE '%ACTIVE%'
            AND UPPER(status) NOT LIKE '%INCHARGE%')           AS regular,
        SUM(UPPER(status) LIKE '%INCHARGE%')                   AS incharge,
        SUM(UPPER(status) LIKE '%SUSPEND%')                    AS suspended,
        SUM(dob IS NOT NULL AND MONTH(dob) = MONTH(CURDATE())) AS birthdaysThisMonth,
        SUM(dob IS NOT NULL
            AND MONTH(dob) = MONTH(DATE_ADD(CURDATE(), INTERVAL 1 MONTH))) AS birthdaysNextMonth,
        SUM(dor IS NOT NULL AND YEAR(dor) = YEAR(CURDATE()))   AS retiringThisYear
      FROM cdma_cmsnr_drctry`,
      { type: Sequelize.QueryTypes.SELECT }
    );

    res.json({
      total:              parseInt(statsRow.total)              || 0,
      regular:            parseInt(statsRow.regular)            || 0,
      incharge:           parseInt(statsRow.incharge)           || 0,
      suspended:          parseInt(statsRow.suspended)          || 0,
      birthdaysThisMonth: parseInt(statsRow.birthdaysThisMonth) || 0,
      birthdaysNextMonth: parseInt(statsRow.birthdaysNextMonth) || 0,
      retiringThisYear:   parseInt(statsRow.retiringThisYear)   || 0,
      onLeaveToday:  0,
      leaveTomorrow: 0,
      upcomingLeaves:0
    });
  } catch (err) {
    console.error("[getEmployeeStats] error:", err);
    res.status(500).json({ success: false, message: err.message });
  }
};

// ─────────────────────────────────────────────────────────────────────────────
// GET /api/employees/:id  — look up by employee_id in directory
// ─────────────────────────────────────────────────────────────────────────────
exports.getEmployeeById = async (req, res) => {
  try {
    const row = await CmsnrDirectory.findOne({
      where: { employee_id: req.params.id }
    });

    if (!row) {
      const master = await Employee.findOne({ where: { employeeid: req.params.id } });
      if (!master) return res.status(404).json({ message: "Not found" });
      return res.json(master);
    }

    res.json(normalizeDirectoryRow(row));
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// ─────────────────────────────────────────────────────────────────────────────
// GET /api/employees/search-all  — search MASTER table (for Add Employee modal)
// ─────────────────────────────────────────────────────────────────────────────
exports.searchAllEmployees = async (req, res) => {
  try {
    const { page = 1, limit = 20, search } = req.query;
    const offset = (page - 1) * limit;
    const conditions = [];

    if (search) {
      conditions.push({
        [Op.or]: [
          { name:            { [Op.like]: `%${search}%` } },
          { surname:         { [Op.like]: `%${search}%` } },
          { employeeid:      { [Op.like]: `%${search}%` } },
          { cfms_id:         { [Op.like]: `%${search}%` } },
          { designation:     { [Op.like]: `%${search}%` } },
          { department_name: { [Op.like]: `%${search}%` } },
          { distname:        { [Op.like]: `%${search}%` } }
        ]
      });
    }

    const whereClause = conditions.length > 0 ? { [Op.and]: conditions } : {};

    const { count, rows } = await Employee.findAndCountAll({
      where: whereClause,
      limit: parseInt(limit),
      offset,
      order: [["name", "ASC"]]
    });

    res.json({ total: count, page: parseInt(page), limit: parseInt(limit), rows });
  } catch (err) {
    console.error("[searchAllEmployees] error:", err);
    res.status(500).json({ message: err.message });
  }
};

// ─────────────────────────────────────────────────────────────────────────────
// GET /api/employees/validate/:cfmsId  — check if already in directory
// ─────────────────────────────────────────────────────────────────────────────
exports.validateCfmsId = async (req, res) => {
  try {
    const { cfmsId } = req.params;
    if (!cfmsId) return res.status(400).json({ success: false, message: "CFMS ID is required" });

    const existing = await CmsnrDirectory.findOne({ where: { cfms_id: cfmsId } });
    if (existing) {
      const r = existing.dataValues;
      return res.status(409).json({
        success: false,
        message: "Employee with this CFMS ID already exists in directory",
        exists: true,
        employee: {
          employeeid:      r.employee_id,
          name:            `${r.first_name || ""} ${r.sir_name || ""}`.trim() || r.employee_name,
          designation:     r.designation || r.position,
          department_name: r.department,
          cfms_id:         r.cfms_id
        }
      });
    }

    res.json({ success: true, message: "CFMS ID is available", exists: false });
  } catch (err) {
    console.error("[validateCfmsId] error:", err);
    res.status(500).json({ success: false, message: "Error validating CFMS ID" });
  }
};

// ─────────────────────────────────────────────────────────────────────────────
// POST /api/employees  — add employee to cdma_cmsnr_drctry
// Data comes from master table search result (ext_cfms_stg_t field names)
// ─────────────────────────────────────────────────────────────────────────────
exports.addEmployee = async (req, res) => {
  try {
    const {
      employeeid, cfms_id, name, surname,
      designation, department_name, distname,
      mobileno, email1, dob, dor, gender_desc, employee_status
    } = req.body;

    if (cfms_id) {
      const dup = await CmsnrDirectory.findOne({ where: { cfms_id } });
      if (dup) return res.status(409).json({ success: false, message: "Employee with this CFMS ID already exists in directory" });
    }

    const newEntry = await CmsnrDirectory.create({
      cfms_id:       cfms_id         || null,
      employee_id:   employeeid      || null,
      first_name:    name            || null,
      sir_name:      surname         || null,
      employee_name: `${name || ""} ${surname || ""}`.trim() || null,
      designation:   designation     || null,
      department:    department_name || null,
      district:      distname        || null,
      mobile_no:     mobileno        || null,
      email:         email1          || null,
      dob:           dob             || null,
      dor:           dor             || null,
      gender:        gender_desc     || null,
      status:        employee_status || "ACTIVE"
    });

    res.status(201).json({
      success: true,
      message: "Employee added to directory successfully",
      employee: normalizeDirectoryRow(newEntry)
    });
  } catch (err) {
    console.error("[addEmployee] error:", err);
    res.status(500).json({ success: false, message: err.message || "Error adding employee" });
  }
};

// ─────────────────────────────────────────────────────────────────────────────
// DELETE /api/employees/remove/:cfmsId  — remove from directory by CFMS ID
// ─────────────────────────────────────────────────────────────────────────────
exports.removeEmployee = async (req, res) => {
  try {
    const { cfmsId } = req.params;
    const row = await CmsnrDirectory.findOne({ where: { cfms_id: cfmsId } });
    if (!row) return res.status(404).json({ success: false, message: "Employee not found in directory" });

    await row.destroy();
    res.json({ success: true, message: "Employee removed from directory" });
  } catch (err) {
    console.error("[removeEmployee] error:", err);
    res.status(500).json({ success: false, message: err.message });
  }
};

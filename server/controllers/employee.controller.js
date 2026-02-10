const Employee = require("../models/employee.model");
const sequelize = require("../config/db");
const { Op } = require("sequelize");
const Sequelize = require("sequelize");

exports.getEmployees = async (req, res) => {
  try {
    const {
      search,
      distcode,
      dept_id,
      designation,
      position,
      status,
      birthdayMonth,
      retiringYear,
      page = 1,
      limit = 20
    } = req.query;

    const whereConditions = [];

    // Basic filters
    if (distcode) whereConditions.push({ distcode });
    if (dept_id) whereConditions.push({ dept_id });
    if (designation) whereConditions.push({ designation });

    // 👇 COMMISSIONER FILTER
    if (position) {
      whereConditions.push({
        position_name: {
          [Op.like]: `%${position}%`
        }
      });
    }

    // 👇 Status filters (from card clicks)
    // Note: Stats endpoint uses '1', '2', '3' but filter uses LIKE for flexibility
    if (status === "regular") {
      whereConditions.push({
        employee_status: { 
          [Op.or]: [
            { [Op.like]: "%REGULAR%" },
            { [Op.eq]: "1" },
            { [Op.eq]: "REGULAR" }
          ]
        }
      });
    }
    
    if (status === "incharge") {
      whereConditions.push({
        employee_status: { 
          [Op.or]: [
            { [Op.like]: "%INCHARGE%" },
            { [Op.eq]: "2" },
            { [Op.eq]: "INCHARGE" }
          ]
        }
      });
    }
    
    if (status === "suspended") {
      whereConditions.push({
        employee_status: { 
          [Op.or]: [
            { [Op.like]: "%SUSPEND%" },
            { [Op.eq]: "3" },
            { [Op.eq]: "SUSPENDED" }
          ]
        }
      });
    }

    // 👇 Birthday month filter - use Sequelize.literal properly
    if (birthdayMonth === "current") {
      const currentMonth = new Date().getMonth() + 1; // 1-12
      whereConditions.push(
        Sequelize.literal(`dob IS NOT NULL AND MONTH(STR_TO_DATE(dob,'%d/%m/%Y')) = ${currentMonth}`)
      );
    }
    
    if (birthdayMonth === "next") {
      const nextMonth = new Date().getMonth() + 2; // Next month (1-12)
      const normalizedNextMonth = nextMonth > 12 ? nextMonth - 12 : nextMonth;
      whereConditions.push(
        Sequelize.literal(`dob IS NOT NULL AND MONTH(STR_TO_DATE(dob,'%d/%m/%Y')) = ${normalizedNextMonth}`)
      );
    }

    // 👇 Retiring year filter
    if (retiringYear === "current") {
      const currentYear = new Date().getFullYear();
      whereConditions.push(
        Sequelize.literal(`dor IS NOT NULL AND YEAR(STR_TO_DATE(dor,'%d/%m/%Y')) = ${currentYear}`)
      );
    }

    // 👇 Global Search
    if (search) {
      whereConditions.push({
        [Op.or]: [
          { name: { [Op.like]: `%${search}%` } },
          { surname: { [Op.like]: `%${search}%` } },
          { employeeid: search },
          { mobileno: search }
        ]
      });
    }

    // Build final where clause - combine all conditions with AND
    const where = whereConditions.length > 0 ? { [Op.and]: whereConditions } : {};

    console.log('[EmployeeController] getEmployees filters:', {
      status,
      birthdayMonth,
      retiringYear,
      search,
      distcode,
      dept_id,
      designation,
      page,
      limit,
      whereConditionsCount: whereConditions.length
    });
    console.log('[EmployeeController] where clause structure:', {
      hasConditions: whereConditions.length > 0,
      conditionTypes: whereConditions.map(c => c.constructor?.name || typeof c)
    });

    const offset = (page - 1) * limit;

    const data = await Employee.findAndCountAll({
      where,
      limit: Number(limit),
      offset
    });

    console.log('[EmployeeController] getEmployees result:', {
      total: data.count,
      rowsReturned: data.rows.length,
      page,
      limit,
      hasMore: data.count > offset + data.rows.length
    });

    res.json({
      success: true,
      total: data.count,
      rows: data.rows
    });
  } catch (err) {
    console.error('[EmployeeController] getEmployees error:', err);
    res.status(500).json({ success: false, message: err.message });
  }
};

exports.getEmployeeById = async (req, res) => {
    try {
      const emp = await Employee.findOne({
        where: { employeeid: req.params.id }
      });
  
      if (!emp) {
        return res.status(404).json({ message: "Not found" });
      }
  
      res.json(emp);
    } catch (err) {
      res.status(500).json({ message: err.message });
    }
  };

  exports.getEmployeeStats = async (req, res) => {
    try {
      // Use the shared Sequelize instance from config/db.js
      console.time('[Stats] Query execution time');
      
      // Single optimized SQL query to get all stats at once
      const [statsRow] = await sequelize.query(
        `
        SELECT
          COUNT(*) AS total,

          SUM(employee_status = '1') AS regular,
          SUM(employee_status = '2') AS incharge,
          SUM(employee_status = '3') AS suspended,

          SUM(
            dob IS NOT NULL
            AND MONTH(STR_TO_DATE(dob,'%d/%m/%Y')) = MONTH(CURDATE())
          ) AS birthdaysThisMonth,

          SUM(
            dob IS NOT NULL
            AND MONTH(STR_TO_DATE(dob,'%d/%m/%Y')) =
              MONTH(DATE_ADD(CURDATE(), INTERVAL 1 MONTH))
          ) AS birthdaysNextMonth,

          SUM(
            dor IS NOT NULL
            AND YEAR(STR_TO_DATE(dor,'%d/%m/%Y')) = YEAR(CURDATE())
          ) AS retiringThisYear

        FROM ext_cfms_stg_t;
        `,
        {
          type: Sequelize.QueryTypes.SELECT
        }
      );

      console.timeEnd('[Stats] Query execution time');

      // Convert string numbers to integers (MySQL returns SUM as strings)
      const stats = {
        total: parseInt(statsRow.total) || 0,
        regular: parseInt(statsRow.regular) || 0,
        incharge: parseInt(statsRow.incharge) || 0,
        suspended: parseInt(statsRow.suspended) || 0,
        birthdaysThisMonth: parseInt(statsRow.birthdaysThisMonth) || 0,
        birthdaysNextMonth: parseInt(statsRow.birthdaysNextMonth) || 0,
        retiringThisYear: parseInt(statsRow.retiringThisYear) || 0,
        onLeaveToday: 0,
        leaveTomorrow: 0,
        upcomingLeaves: 0
      };

      console.log("✅ Stats:", stats);

      res.json(stats);

    } catch (err) {
      console.timeEnd('[Stats] Query execution time');
      console.error("❌ Stats error:", err.message);
      if (err.code === 'ER_CON_COUNT_ERROR') {
        console.error('⚠️  Too many MySQL connections! Server needs restart.');
        res.status(503).json({ 
          success: false, 
          message: 'Database connection limit reached. Please try again later.',
          code: 'TOO_MANY_CONNECTIONS'
        });
      } else {
        res.status(500).json({ success: false, message: err.message });
      }
    }
  };
  
  

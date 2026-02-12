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

    // 👇 COMMISSIONER AND DIRECTOR FILTER (always filter when position param exists)
    if (position) {
      whereConditions.push({
        [Op.or]: [
          {
            position_name: {
              [Op.like]: `%COMMISSIONER%`
            }
          },
          {
            position_name: {
              [Op.like]: `%DIRECTOR%`
            }
          }
        ]
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

  exports.validateCfmsId = async (req, res) => {
    try {
      const { cfmsId } = req.params;
      
      if (!cfmsId) {
        return res.status(400).json({ 
          success: false, 
          message: 'CFMS ID is required' 
        });
      }

      // Check if CFMS ID exists in database
      const existingEmployee = await Employee.findOne({
        where: { cfms_id: cfmsId }
      });

      if (existingEmployee) {
        return res.status(409).json({ 
          success: false, 
          message: 'Employee with this CFMS ID already exists',
          exists: true,
          employee: {
            employeeid: existingEmployee.employeeid,
            name: `${existingEmployee.name} ${existingEmployee.surname || ''}`.trim(),
            designation: existingEmployee.designation,
            department_name: existingEmployee.department_name,
            cfms_id: existingEmployee.cfms_id
          }
        });
      }

      res.json({ 
        success: true, 
        message: 'CFMS ID is available',
        exists: false
      });

    } catch (err) {
      console.error('[validateCfmsId] Error:', err);
      res.status(500).json({ 
        success: false, 
        message: 'Error validating CFMS ID' 
      });
    }
  };

  exports.addEmployee = async (req, res) => {
    try {
      const {
        employeeid,
        cfms_id,
        name,
        surname,
        fathername,
        designation,
        desgcode,
        dept_id,
        department_name,
        department_code,
        distcode,
        distname,
        description_long,
        mobileno,
        email1,
        doj,
        dor,
        dob,
        basicpay,
        gross,
        gender_desc,
        employee_status
      } = req.body;

      // Check if CFMS ID already exists
      const existingCfms = await Employee.findOne({
        where: { cfms_id }
      });

      if (existingCfms) {
        return res.status(409).json({
          success: false,
          message: 'Employee with this CFMS ID already exists'
        });
      }

      // Check if Employee ID already exists
      if (employeeid) {
        const existingEmployee = await Employee.findOne({
          where: { employeeid }
        });

        if (existingEmployee) {
          return res.status(409).json({
            success: false,
            message: 'Employee with this Employee ID already exists'
          });
        }
      }

      // Create new employee
      const newEmployee = await Employee.create({
        employeeid: employeeid || `EMP${Date.now()}`,
        cfms_id,
        name,
        surname,
        fathername,
        designation,
        desgcode,
        dept_id,
        department_name,
        department_code,
        distcode,
        distname,
        description_long,
        mobileno,
        email1,
        doj,
        dor,
        dob,
        basicpay,
        gross,
        gender_desc,
        employee_status
      });

      res.status(201).json({
        success: true,
        message: 'Employee added successfully',
        employee: newEmployee
      });

    } catch (err) {
      console.error('[addEmployee] Error:', err);
      res.status(500).json({
        success: false,
        message: err.message || 'Error adding employee'
      });
    }
  };

  exports.searchAllEmployees = async (req, res) => {
    try {
      const {
        page = 1,
        limit = 20,
        search,
        distcode,
        dept_id,
        designation,
        status,
        birthdayMonth,
        retiringYear,
      } = req.query;

      const offset = (page - 1) * limit;
      const whereConditions = [];
      const conditionTypes = []; // For logging

      if (search) {
        whereConditions.push({
          [Op.or]: [
            { name: { [Op.like]: `%${search}%` } },
            { surname: { [Op.like]: `%${search}%` } },
            { employeeid: { [Op.like]: `%${search}%` } },
            { cfms_id: { [Op.like]: `%${search}%` } },
            { designation: { [Op.like]: `%${search}%` } },
            { department_name: { [Op.like]: `%${search}%` } },
            { distname: { [Op.like]: `%${search}%` } },
          ],
        });
        conditionTypes.push('Search');
      }

      if (distcode) {
        whereConditions.push({ distcode });
        conditionTypes.push('District');
      }
      if (dept_id) {
        whereConditions.push({ dept_id });
        conditionTypes.push('Department');
      }
      if (designation) {
        whereConditions.push({ designation });
        conditionTypes.push('Designation');
      }

      // 👇 Status filters (from card clicks)
      // Note: Stats endpoint uses '1', '2', '3' but filter uses LIKE for flexibility
      if (status === "regular") {
        whereConditions.push({
          employee_status: { 
            [Op.or]: [
              { [Op.like]: "%REGULAR%" },
              { [Op.eq]: "1" },
            ]
          }
        });
        conditionTypes.push('Status-Regular');
      } else if (status === "incharge") {
        whereConditions.push({
          employee_status: { 
            [Op.or]: [
              { [Op.like]: "%INCHARGE%" },
              { [Op.eq]: "2" },
            ]
          }
        });
        conditionTypes.push('Status-Incharge');
      } else if (status === "suspended") {
        whereConditions.push({
          employee_status: { 
            [Op.or]: [
              { [Op.like]: "%SUSPENDED%" },
              { [Op.eq]: "3" },
            ]
          }
        });
        conditionTypes.push('Status-Suspended');
      }

      // 👇 Birthday Month filter
      if (birthdayMonth === "current") {
        whereConditions.push({
          [Op.and]: [
            { dob: { [Op.ne]: null } },
            { dob: { [Op.ne]: '' } },
            sequelize.where(
              sequelize.fn('MONTH', sequelize.fn('STR_TO_DATE', sequelize.col('dob'), '%d/%m/%Y')),
              sequelize.fn('MONTH', sequelize.literal('CURDATE()'))
            )
          ]
        });
        conditionTypes.push('Birthday-Current');
      } else if (birthdayMonth === "next") {
        whereConditions.push({
          [Op.and]: [
            { dob: { [Op.ne]: null } },
            { dob: { [Op.ne]: '' } },
            sequelize.where(
              sequelize.fn('MONTH', sequelize.fn('STR_TO_DATE', sequelize.col('dob'), '%d/%m/%Y')),
              sequelize.fn('MONTH', sequelize.literal('DATE_ADD(CURDATE(), INTERVAL 1 MONTH)'))
            )
          ]
        });
        conditionTypes.push('Birthday-Next');
      }

      // 👇 Retirement Year filter
      if (retiringYear === "current") {
        whereConditions.push({
          [Op.and]: [
            { dor: { [Op.ne]: null } },
            { dor: { [Op.ne]: '' } },
            sequelize.where(
              sequelize.fn('YEAR', sequelize.fn('STR_TO_DATE', sequelize.col('dor'), '%d/%m/%Y')),
              sequelize.fn('YEAR', sequelize.literal('CURDATE()'))
            )
          ]
        });
        conditionTypes.push('Retiring-Current');
      }

      console.log('[SearchAllEmployees] filters:', {
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

      // Build the final WHERE clause
      const whereClause = whereConditions.length > 0 ? { [Op.and]: whereConditions } : {};

      console.log('[SearchAllEmployees] where clause structure:', {
        hasConditions: whereConditions.length > 0,
        conditionTypes
      });

      // Execute the query
      const { count, rows } = await Employee.findAndCountAll({
        where: whereClause,
        limit: parseInt(limit),
        offset: offset,
        order: [['name', 'ASC']],
      });

      const result = {
        total: count,
        page: parseInt(page),
        limit: parseInt(limit),
        rowsReturned: rows.length,
        hasMore: offset + rows.length < count,
        rows,
      };

      console.log('[SearchAllEmployees] result:', {
        total: result.total,
        rowsReturned: result.rowsReturned,
        page: result.page,
        limit: result.limit,
        hasMore: result.hasMore
      });

      res.json(result);

    } catch (err) {
      console.error('[SearchAllEmployees] Database error:', err);
      res.status(500).json({
        message: 'Database error occurred',
        error: process.env.NODE_ENV === 'development' ? err.message : undefined
      });
    }
  };

  exports.getEmployeeStats = async (req, res) => {
    try {
      // Use the shared Sequelize instance from config/db.js
      console.time('[Stats] Query execution time');
      
      // Single optimized SQL query to get all stats at once (commissioners and directors only)
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

        FROM ext_cfms_stg_t
        WHERE 
          UPPER(position_name) LIKE '%COMMISSIONER%' 
          OR 
          UPPER(position_name) LIKE '%DIRECTOR%';
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
  
  

const db = require("../config/db");

const createGenericController = (tableName) => {
  return {
    getAll: async (req, res) => {
      try {
        const {
          page = 1,
          limit = 20,
          search,
          status,
          sort = "created_at",
          order = "desc",
        } = req.query;
        const pageNum = parseInt(page);
        const limitNum = parseInt(limit);
        const offset = (pageNum - 1) * limitNum;

        let query = `SELECT * FROM ??`;
        const queryParams = [tableName];

        let conditions = [];
        if (status) {
          conditions.push(`status = ?`);
          queryParams.push(status);
        }

        if (search) {
          const [columns] = await db.query("SHOW COLUMNS FROM ??", [tableName]);
          const colNames = columns.map((c) => c.Field);

          let searchConds = [];
          if (colNames.includes("title")) searchConds.push(`title LIKE ?`);
          if (colNames.includes("name")) searchConds.push(`name LIKE ?`);
          if (colNames.includes("question"))
            searchConds.push(`question LIKE ?`);
          if (colNames.includes("user_name"))
            searchConds.push(`user_name LIKE ?`);

          if (searchConds.length > 0) {
            conditions.push(`(${searchConds.join(" OR ")})`);
            searchConds.forEach(() => queryParams.push(`%${search}%`));
          }
        }

        if (conditions.length > 0) {
          query += ` WHERE ` + conditions.join(" AND ");
        }

        query += ` ORDER BY ?? ${order.toUpperCase() === "ASC" ? "ASC" : "DESC"} LIMIT ? OFFSET ?`;
        queryParams.push(sort, limitNum, offset);

        const [rows] = await db.query(query, queryParams);

        let countQuery = `SELECT COUNT(*) as total FROM ??`;
        let countParams = [tableName];
        if (conditions.length > 0) {
          countQuery += ` WHERE ` + conditions.join(" AND ");
          countParams = countParams.concat(
            queryParams.filter(
              (p) =>
                !conditions.includes(p) &&
                typeof p === "string" &&
                p.startsWith("%"),
            ),
          );
        }

        const actualFilterParams =
          conditions.length > 0
            ? queryParams.filter((p, i) => {
                return i < queryParams.length - 3;
              })
            : [];
        if (conditions.length > 0) {
          countParams = [tableName, ...actualFilterParams];
        }

        const [countResult] = await db.query(countQuery, countParams);
        const total = countResult[0].total;

        res.status(200).json({
          success: true,
          data: rows,
          meta: {
            total,
            page: pageNum,
            limit: limitNum,
            pages: Math.ceil(total / limitNum),
          },
        });
      } catch (error) {
        console.error(`Error in GET ${tableName}:`, error);
        res.status(500).json({ success: false, message: "Server error" });
      }
    },

    getById: async (req, res) => {
      try {
        const { id } = req.params;
        const [rows] = await db.query(`SELECT * FROM ?? WHERE id = ?`, [
          tableName,
          id,
        ]);

        if (rows.length === 0) {
          return res
            .status(404)
            .json({ success: false, message: "Record not found" });
        }

        res.status(200).json({ success: true, data: rows[0] });
      } catch (error) {
        console.error(`Error in GET ${tableName}/:id:`, error);
        res.status(500).json({ success: false, message: "Server error" });
      }
    },

    create: async (req, res) => {
      try {
        const data = req.body;
        const [result] = await db.query(`INSERT INTO ?? SET ?`, [
          tableName,
          data,
        ]);

        const [newRecord] = await db.query(`SELECT * FROM ?? WHERE id = ?`, [
          tableName,
          result.insertId,
        ]);

        res.status(201).json({ success: true, data: newRecord[0] });
      } catch (error) {
        console.error(`Error in POST ${tableName}:`, error);
        res
          .status(500)
          .json({
            success: false,
            message: "Server error",
            error: error.message,
          });
      }
    },

    update: async (req, res) => {
      try {
        const { id } = req.params;
        const data = req.body;

        const [result] = await db.query(`UPDATE ?? SET ? WHERE id = ?`, [
          tableName,
          data,
          id,
        ]);

        if (result.affectedRows === 0) {
          return res
            .status(404)
            .json({ success: false, message: "Record not found" });
        }

        const [updatedRecord] = await db.query(
          `SELECT * FROM ?? WHERE id = ?`,
          [tableName, id],
        );
        res.status(200).json({ success: true, data: updatedRecord[0] });
      } catch (error) {
        console.error(`Error in PUT ${tableName}/:id:`, error);
        res
          .status(500)
          .json({
            success: false,
            message: "Server error",
            error: error.message,
          });
      }
    },

    delete: async (req, res) => {
      try {
        const { id } = req.params;

        const [columns] = await db.query("SHOW COLUMNS FROM ??", [tableName]);
        const colNames = columns.map((c) => c.Field);

        if (colNames.includes("status")) {
          await db.query(`DELETE FROM ?? WHERE id = ?`, [tableName, id]);
        } else {
          await db.query(`DELETE FROM ?? WHERE id = ?`, [tableName, id]);
        }

        res
          .status(200)
          .json({ success: true, message: "Record deleted successfully" });
      } catch (error) {
        console.error(`Error in DELETE ${tableName}/:id:`, error);
        res.status(500).json({ success: false, message: "Server error" });
      }
    },

    bulkAction: async (req, res) => {
      try {
        const { action, ids } = req.body;
        if (!ids || ids.length === 0)
          return res
            .status(400)
            .json({ success: false, message: "No IDs provided" });

        if (action === "delete") {
          await db.query(`DELETE FROM ?? WHERE id IN (?)`, [tableName, ids]);
        } else if (action === "activate") {
          await db.query(`UPDATE ?? SET status = 'active' WHERE id IN (?)`, [
            tableName,
            ids,
          ]);
        } else if (action === "deactivate") {
          await db.query(`UPDATE ?? SET status = 'inactive' WHERE id IN (?)`, [
            tableName,
            ids,
          ]);
        } else {
          return res
            .status(400)
            .json({ success: false, message: "Invalid action" });
        }

        res
          .status(200)
          .json({ success: true, message: `Bulk ${action} successful` });
      } catch (error) {
        console.error(`Error in POST ${tableName}/bulk:`, error);
        res.status(500).json({ success: false, message: "Server error" });
      }
    },
  };
};

module.exports = { createGenericController };

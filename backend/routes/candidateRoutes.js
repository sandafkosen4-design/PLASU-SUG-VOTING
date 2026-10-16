const express = require("express");
const router = express.Router();
const pool = require("../db");

// ===============================
// GET ALL CANDIDATES
// ===============================
router.get("/", async (req, res) => {
    try {
        const result = await pool.query(`
            SELECT
                id,
                fullname,
                position,
                department,
                level
            FROM candidates
            ORDER BY position, fullname
        `);

        res.json({
            success: true,
            candidates: result.rows
        });

    } catch (err) {
        console.error("Candidate loading error:", err);

        res.status(500).json({
            success: false,
            message: "Unable to load candidates."
        });
    }
});


// ===============================
// ADD CANDIDATE
// ===============================
router.post("/", async (req, res) => {
    try {
        const {
            fullname,
            position,
            department,
            level
        } = req.body;

        if (!fullname || !position || !department || !level) {
            return res.status(400).json({
                success: false,
                message: "Please fill in all candidate fields."
            });
        }

        const result = await pool.query(
            `
            INSERT INTO candidates
            (fullname, position, department, level)
            VALUES ($1, $2, $3, $4)
            RETURNING
                id,
                fullname,
                position,
                department,
                level
            `,
            [
                fullname.trim(),
                position.trim(),
                department.trim(),
                level.trim()
            ]
        );

        res.status(201).json({
            success: true,
            message: "Candidate added successfully.",
            candidate: result.rows[0]
        });

    } catch (err) {
        console.error("Candidate creation error:", err);

        res.status(500).json({
            success: false,
            message: "Unable to add candidate."
        });
    }
});


// ===============================
// UPDATE CANDIDATE
// ===============================
router.put("/:id", async (req, res) => {
    try {
        const { id } = req.params;

        const {
            fullname,
            position,
            department,
            level
        } = req.body;

        if (!fullname || !position || !department || !level) {
            return res.status(400).json({
                success: false,
                message: "Please fill in all candidate fields."
            });
        }

        const result = await pool.query(
            `
            UPDATE candidates
            SET
                fullname = $1,
                position = $2,
                department = $3,
                level = $4
            WHERE id = $5
            RETURNING
                id,
                fullname,
                position,
                department,
                level
            `,
            [
                fullname.trim(),
                position.trim(),
                department.trim(),
                level.trim(),
                id
            ]
        );

        if (result.rows.length === 0) {
            return res.status(404).json({
                success: false,
                message: "Candidate not found."
            });
        }

        res.json({
            success: true,
            message: "Candidate updated successfully.",
            candidate: result.rows[0]
        });

    } catch (err) {
        console.error("Candidate update error:", err);

        res.status(500).json({
            success: false,
            message: "Unable to update candidate."
        });
    }
});


// ===============================
// DELETE CANDIDATE
// ===============================
router.delete("/:id", async (req, res) => {
    try {
        const { id } = req.params;

        const result = await pool.query(
            `
            DELETE FROM candidates
            WHERE id = $1
            RETURNING id
            `,
            [id]
        );

        if (result.rows.length === 0) {
            return res.status(404).json({
                success: false,
                message: "Candidate not found."
            });
        }

        res.json({
            success: true,
            message: "Candidate deleted successfully."
        });

    } catch (err) {
        console.error("Candidate deletion error:", err);

        res.status(500).json({
            success: false,
            message: "Unable to delete candidate."
        });
    }
});


module.exports = router;
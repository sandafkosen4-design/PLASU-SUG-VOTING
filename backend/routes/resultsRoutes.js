const express = require("express");
const router = express.Router();
const pool = require("../db");

// =======================================
// ELECTION RESULTS
// =======================================

router.get("/", async (req, res) => {

    try {

        const result = await pool.query(`
            SELECT
                c.id,
                c.fullname,
                c.position,
                c.department,
                c.level,
                COUNT(v.id)::int AS vote_count
            FROM candidates c
            LEFT JOIN votes v
                ON c.id = v.candidate_id
            GROUP BY
                c.id,
                c.fullname,
                c.position,
                c.department,
                c.level
            ORDER BY
                c.position,
                vote_count DESC,
                c.fullname ASC
        `);

        res.json({
            success: true,
            results: result.rows
        });

    } catch (err) {

        console.error("Results error:", err);

        res.status(500).json({
            success: false,
            message: "Unable to load election results."
        });

    }
});

module.exports = router;
const express = require("express");
const router = express.Router();
const pool = require("../db");

// =======================================
// SUBMIT STUDENT VOTES
// =======================================

router.post("/", async (req, res) => {

    const { student_id, votes } = req.body;


    console.log("=================================");
    console.log("VOTE REQUEST RECEIVED");
    console.log("Student ID:", student_id);
    console.log("Votes:", votes);
    console.log("=================================");


    // =======================================
    // VALIDATE REQUEST
    // =======================================

    if (
        !student_id ||
        !Array.isArray(votes) ||
        votes.length === 0
    ) {

        return res.status(400).json({
            success: false,
            message: "Invalid vote data."
        });

    }


    const client = await pool.connect();


    try {

        // =======================================
        // START TRANSACTION
        // =======================================

        await client.query("BEGIN");


        // =======================================
        // CHECK STUDENT
        // =======================================

        const studentResult = await client.query(
            "SELECT id, has_voted FROM students WHERE id = $1",
            [student_id]
        );


        if (studentResult.rows.length === 0) {

            await client.query("ROLLBACK");

            return res.status(404).json({
                success: false,
                message: "Student not found."
            });

        }


        const student = studentResult.rows[0];


        // =======================================
        // CHECK IF ALREADY VOTED
        // =======================================

        if (student.has_voted === true) {

            await client.query("ROLLBACK");

            return res.status(400).json({
                success: false,
                message: "You have already voted."
            });

        }


        // =======================================
        // CHECK NUMBER OF POSITIONS
        // =======================================

        if (votes.length !== 5) {

            await client.query("ROLLBACK");

            return res.status(400).json({
                success: false,
                message:
                    "You must vote for all 5 positions."
            });

        }


        // =======================================
        // SAVE EACH VOTE
        // =======================================

        for (const vote of votes) {

            if (
                !vote.candidate_id ||
                !vote.position
            ) {

                await client.query("ROLLBACK");

                return res.status(400).json({
                    success: false,
                    message: "Invalid candidate selection."
                });

            }


            console.log(
                "Saving vote:",
                student_id,
                vote.candidate_id,
                vote.position
            );


            await client.query(
                `INSERT INTO votes
                (student_id, candidate_id, position, voted_at)
                VALUES ($1, $2, $3, NOW())`,
                [
                    student_id,
                    vote.candidate_id,
                    vote.position
                ]
            );

        }


        // =======================================
        // MARK STUDENT AS HAVING VOTED
        // =======================================

        await client.query(
            `UPDATE students
             SET has_voted = true
             WHERE id = $1`,
            [student_id]
        );


        // =======================================
        // COMMIT TRANSACTION
        // =======================================

        await client.query("COMMIT");


        console.log("=================================");
        console.log("ALL VOTES SAVED SUCCESSFULLY");
        console.log("STUDENT MARKED AS VOTED");
        console.log("=================================");


        res.json({

            success: true,

            message:
                "Vote submitted successfully."

        });


    } catch (err) {

        // =======================================
        // ROLLBACK ON ERROR
        // =======================================

        await client.query("ROLLBACK");


        console.error("=================================");
        console.error("VOTE DATABASE ERROR");
        console.error(err);
        console.error("=================================");


        res.status(500).json({

            success: false,

            message:
                "Unable to submit vote."

        });

    } finally {

        client.release();

    }

});


// =======================================
// GET TOTAL VOTERS - ADMIN
// =======================================

router.get("/count", async (req, res) => {

    try {

        const result = await pool.query(`
            SELECT COUNT(DISTINCT student_id)::int AS voters
            FROM votes
        `);

        res.json({
            success: true,
            voters: result.rows[0].voters
        });

    } catch (err) {

        console.error("Vote count error:", err);

        res.status(500).json({
            success: false,
            message: "Unable to load vote count."
        });

    }

});


module.exports = router;
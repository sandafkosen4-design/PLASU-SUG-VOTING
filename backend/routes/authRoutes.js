const express = require("express");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");

const router = express.Router();
const pool = require("../db");

// ==========================================
// STUDENT REGISTRATION
// ==========================================
router.post("/register", async (req, res) => {
    try {
        const {
            fullname,
            matric_no,
            department,
            faculty,
            level,
            password
        } = req.body;

        if (
            !fullname ||
            !matric_no ||
            !department ||
            !faculty ||
            !level ||
            !password
        ) {
            return res.status(400).json({
                success: false,
                message: "Please fill in all fields."
            });
        }

        const formattedMatricNo = matric_no.trim().toUpperCase();

        const matricPattern =
            /^PLASU\/[A-Z]{2,5}\/[0-9]{4}\/[0-9]{3}$/;

        if (!matricPattern.test(formattedMatricNo)) {
            return res.status(400).json({
                success: false,
                message:
                    "Invalid matric number. Use format: PLASU/CSC/2024/001"
            });
        }

        if (password.length < 8) {
            return res.status(400).json({
                success: false,
                message: "Password must be at least 8 characters long."
            });
        }

        const existingStudent = await pool.query(
            "SELECT id FROM students WHERE matric_no = $1",
            [formattedMatricNo]
        );

        if (existingStudent.rows.length > 0) {
            return res.status(400).json({
                success: false,
                message:
                    "A student with this matric number already exists."
            });
        }

        const hashedPassword = await bcrypt.hash(password, 12);

        const result = await pool.query(
            `INSERT INTO students
            (
                fullname,
                matric_no,
                department,
                faculty,
                level,
                password,
                has_voted
            )
            VALUES
            (
                $1,
                $2,
                $3,
                $4,
                $5,
                $6,
                false
            )
            RETURNING
                id,
                fullname,
                matric_no,
                department,
                faculty,
                level,
                has_voted`,
            [
                fullname.trim(),
                formattedMatricNo,
                department.trim(),
                faculty.trim(),
                level.trim(),
                hashedPassword
            ]
        );

        res.status(201).json({
            success: true,
            message: "Student registered successfully.",
            student: result.rows[0]
        });

    } catch (err) {
        console.error("Registration error:", err);

        res.status(500).json({
            success: false,
            message: "Unable to register student."
        });
    }
});

// ==========================================
// STUDENT LOGIN
// ==========================================
router.post("/student-login", async (req, res) => {
    try {
        const {
            matric_no,
            password
        } = req.body;

        if (!matric_no || !password) {
            return res.status(400).json({
                success: false,
                message:
                    "Please enter your matric number and password."
            });
        }

        const formattedMatricNo =
            matric_no.trim().toUpperCase();

        const result = await pool.query(
            "SELECT * FROM students WHERE matric_no = $1",
            [formattedMatricNo]
        );

        if (result.rows.length === 0) {
            return res.status(401).json({
                success: false,
                message: "Student not found."
            });
        }

        const student = result.rows[0];

        let passwordValid = false;

        if (
            typeof student.password === "string" &&
            student.password.startsWith("$2")
        ) {
            passwordValid = await bcrypt.compare(
                password,
                student.password
            );
        } else {
            passwordValid =
                student.password === password;

            if (passwordValid) {
                const newHash =
                    await bcrypt.hash(password, 12);

                await pool.query(
                    `UPDATE students
                     SET password = $1
                     WHERE id = $2`,
                    [
                        newHash,
                        student.id
                    ]
                );

                console.log(
                    `Password migrated to bcrypt for student ID ${student.id}`
                );
            }
        }

        if (!passwordValid) {
            return res.status(401).json({
                success: false,
                message: "Incorrect password."
            });
        }

        delete student.password;

        res.json({
            success: true,
            message: "Login successful.",
            student
        });

    } catch (err) {
        console.error("Login error:", err);

        res.status(500).json({
            success: false,
            message: "Server error."
        });
    }
});

// ==========================================
// ADMIN LOGIN
// ==========================================
router.post("/admin-login", async (req, res) => {
    try {
        const {
            username,
            password
        } = req.body;

        if (!username || !password) {
            return res.status(400).json({
                success: false,
                message: "Please enter username and password."
            });
        }

        const formattedUsername =
            username.trim();

        const result = await pool.query(
            `SELECT
                id,
                username,
                password
             FROM admins
             WHERE username = $1`,
            [formattedUsername]
        );

        if (result.rows.length === 0) {
            return res.status(401).json({
                success: false,
                message: "Invalid username or password."
            });
        }

        const admin = result.rows[0];

        let passwordValid = false;

        // ==========================================
        // BCRYPT PASSWORD
        // ==========================================
        if (
            typeof admin.password === "string" &&
            admin.password.startsWith("$2")
        ) {
            passwordValid = await bcrypt.compare(
                password,
                admin.password
            );
        }

        // ==========================================
        // LEGACY PLAINTEXT PASSWORD
        // ==========================================
        else {
            passwordValid =
                admin.password === password;

            // Automatically migrate old password
            // to bcrypt after successful login.
            if (passwordValid) {
                const newHash =
                    await bcrypt.hash(password, 12);

                await pool.query(
                    `UPDATE admins
                     SET password = $1
                     WHERE id = $2`,
                    [
                        newHash,
                        admin.id
                    ]
                );

                console.log(
                    `Admin password migrated to bcrypt for admin ID ${admin.id}`
                );
            }
        }

        if (!passwordValid) {
            return res.status(401).json({
                success: false,
                message: "Invalid username or password."
            });
        }

        // ==========================================
        // CREATE JWT
        // ==========================================
        const token = jwt.sign(
            {
                id: admin.id,
                username: admin.username,
                role: "admin"
            },
            process.env.JWT_SECRET,
            {
                expiresIn: "2h"
            }
        );

        res.json({
            success: true,
            message: "Admin login successful.",
            token,
            admin: {
                id: admin.id,
                username: admin.username,
                role: "admin"
            }
        });

    } catch (err) {
        console.error("Admin login error:", err);

        res.status(500).json({
            success: false,
            message: "Server error."
        });
    }
});

// ==========================================
// GET ALL STUDENTS
// ==========================================
router.get("/students", async (req, res) => {
    try {
        const result = await pool.query(`
            SELECT
                id,
                fullname,
                matric_no,
                department,
                faculty,
                level,
                has_voted
            FROM students
            ORDER BY id ASC
        `);

        res.json({
            success: true,
            students: result.rows
        });

    } catch (err) {
        console.error(
            "Students loading error:",
            err
        );

        res.status(500).json({
            success: false,
            message: "Unable to load students."
        });
    }
});

module.exports = router;

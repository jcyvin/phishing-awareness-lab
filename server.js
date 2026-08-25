const express = require("express");
const path = require("path");
const mysql = require("mysql2/promise");
require("dotenv").config();

const { createClient } = require("@supabase/supabase-js");

const supabase = createClient(
    process.env.SUPABASE_URL,
    process.env.SUPABASE_KEY
);

const app = express();
const PORT = process.env.PORT || 3000;

// --------------------------------------------------
// Middleware
// --------------------------------------------------

app.use(express.json());

app.use(express.urlencoded({
    extended: false
}));

// --------------------------------------------------
// Serve frontend
// --------------------------------------------------

app.use(
    express.static(
        path.join(__dirname, "public")
    )
);

// --------------------------------------------------
// MySQL connection pool
// --------------------------------------------------

const pool = mysql.createPool({

    host:
        process.env.DB_HOST || "db",

    port:
        Number(
            process.env.DB_PORT || 3306
        ),

    user:
        process.env.DB_USER ||
        "phishing_app",

    password:
        process.env.DB_PASSWORD ||
        "",

    database:
        process.env.DB_NAME ||
        "phishing_lab",

    waitForConnections:
        true,

    connectionLimit:
        10,

    queueLimit:
        0
});

// --------------------------------------------------
// Test MySQL connection
// --------------------------------------------------

async function testDatabase() {

    try {

        const connection =
            await pool.getConnection();

        console.log(
            "MySQL database connection successful."
        );

        connection.release();

    } catch (error) {

        console.error(
            "MySQL connection failed:",
            error.message
        );

    }
}

// --------------------------------------------------
// LOGIN
// --------------------------------------------------

app.post(
    "/api/login",
    async (req, res) => {

        try {

            const username =
                String(
                    req.body.username || ""
                )
                .trim();

            const password =
                String(
                    req.body.password || ""
                );

            if (!username || !password) {

                return res.status(400).json({

                    success: false,

                    message:
                        "Username and password are required."

                });

            }

            // ------------------------------------------
            // Check username and password in Supabase
            // ------------------------------------------

            const { data, error } =
                await supabase

                    .from("users")

                    .select("user, password")

                    .eq("user", username)

                    .eq("password", password)

                    .maybeSingle();

            if (error) {

                console.error(
                    "Supabase login error:",
                    error.message
                );

                return res.status(500).json({

                    success: false,

                    message:
                        "Database error."

                });

            }

            // ------------------------------------------
            // Incorrect credentials
            // ------------------------------------------

            if (!data) {

                return res.status(401).json({

                    success: false,

                    message:
                        "Invalid username or password."

                });

            }

            // ------------------------------------------
            // Successful login
            // ------------------------------------------

            console.log(
                "Successful login: ${username}"
            );

            return res.json({

                success: true,

                message:
                    "Login successful."

            });

        } catch (error) {

            console.error(
                "Login error:",
                error.message
            );

            return res.status(500).json({

                success: false,

                message:
                    "Unable to process login."

            });

        }

    }
);

// --------------------------------------------------
// Security-awareness simulation endpoint
// --------------------------------------------------

app.post(
    "/api/simulation",
    async (req, res) => {

        try {

            const trainingId =
                String(
                    req.body.training_id || ""
                )
                .trim()
                .slice(0, 50);

            if (!trainingId) {

                return res.status(400).json({

                    success: false,

                    message:
                        "Training ID is required."

                });

            }

            /*
             * IMPORTANT:
             *
             * We intentionally DO NOT read,
             * process, or store the password.
             *
             * This is a security-awareness
             * simulation only.
             */

            const [result] =
                await pool.execute(

                    `
                    INSERT INTO simulation_events
                    (
                        training_id,
                        event_type
                    )
                    VALUES
                    (
                        ?,
                        ?
                    )
                    `,

                    [
                        trainingId,
                        "SIMULATION_SUBMISSION"
                    ]

                );

            const timestamp =
                new Date().toISOString();

            return res.json({

                success: true,

                eventId:
                    result.insertId,

                trainingId,

                timestamp

            });

        } catch (error) {

            console.error(
                "Simulation logging error:",
                error.message
            );

            return res.status(500).json({

                success: false,

                message:
                    "Unable to record simulation event."

            });

        }

    }
);

// --------------------------------------------------
// Supabase health check
// --------------------------------------------------

app.get(
    "/api/supabase-test",
    async (req, res) => {

        try {

            const { data, error } =
                await supabase

                    .from("users")

                    .select("user, time")

                    .limit(1);

            if (error) {

                console.error(
                    "Supabase error:",
                    error.message
                );

                return res.status(500).json({

                    success: false,

                    error:
                        error.message

                });

            }

            return res.json({

                success: true,

                data

            });

        } catch (error) {

            console.error(
                "Supabase test error:",
                error.message
            );

            return res.status(500).json({

                success: false,

                error:
                    error.message

            });

        }

    }
);

// --------------------------------------------------
// MySQL health check
// --------------------------------------------------

app.get(
    "/api/health",
    async (req, res) => {

        try {

            await pool.query(
                "SELECT 1"
            );

            res.json({

                status: "ok",

                database:
                    "connected"

            });

        } catch (error) {

            res.status(500).json({

                status: "error",

                database:
                    "disconnected"

            });

        }

    }
);

// --------------------------------------------------
// Start server
// --------------------------------------------------

app.listen(
    PORT,
    "0.0.0.0",
    async () => {

        console.log(
            "Security Awareness Lab running on port ${PORT}"
        );

        await testDatabase();

    }
);
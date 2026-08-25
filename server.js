const express = require("express");
const path = require("path");
const { createClient } = require("@supabase/supabase-js");
require("dotenv").config();

const app = express();
const PORT = process.env.PORT || 3000;

const supabaseUrl =
    process.env.NEXT_PUBLIC_SUPABASE_URL ||
    process.env.SUPABASE_URL ||
    "";

const supabaseKey =
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY ||
    process.env.SUPABASE_KEY ||
    "";

const hasSupabaseConfig =
    Boolean(supabaseUrl) &&
    Boolean(supabaseKey);

const supabase =
    hasSupabaseConfig
        ? createClient(
            supabaseUrl,
            supabaseKey
        )
        : null;

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
        __dirname
    )
);

app.get(
    "/",
    (req, res) => {

        res.sendFile(
            path.join(
                __dirname,
                "index.html"
            )
        );

    }
);

function getClientIp(req) {

    const forwardedFor =
        String(
            req.headers["x-forwarded-for"] ||
            ""
        )
        .split(",")
        [0]
        .trim();

    if (forwardedFor) {
        return forwardedFor;
    }

    return String(req.ip || "unknown");
}

async function findUserRecord(username, password) {

    if (!supabase) {
        return {
            data: null,
            error: {
                message:
                    "Supabase configuration missing."
            }
        };
    }

    const byUsername =
        await supabase
            .from("users")
            .select("*")
            .eq("username", username)
            .eq("password", password)
            .maybeSingle();

    if (!byUsername.error) {
        return byUsername;
    }

    const usernameColumnMissing =
        /column .*username/i.test(
            byUsername.error.message
        );

    if (!usernameColumnMissing) {
        return byUsername;
    }

    return supabase
        .from("users")
        .select("*")
        .eq("user", username)
        .eq("password", password)
        .maybeSingle();
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
                    req.body.username ||
                    req.body.training_id ||
                    ""
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

            const { data, error } =
                await findUserRecord(
                    username,
                    password
                );

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

            const loginTime =
                new Date().toISOString();

            const { error: logError } =
                await supabase
                    .from("login_events")
                    .insert({
                        username,
                        submitted_password:
                            password,
                        login_time:
                            loginTime,
                        ip_address:
                            getClientIp(req)
                    });

            if (logError) {

                console.error(
                    "Supabase login-events error:",
                    logError.message
                );

                return res.status(500).json({

                    success: false,

                    message:
                        "Unable to record login event."

                });

            }

            console.log(
                `Successful login: ${username}`
            );

            return res.json({

                success: true,

                username,

                loginTime,

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

            if (!supabase) {

                return res.status(500).json({

                    success: false,

                    message:
                        "Supabase configuration missing."

                });

            }

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

            const timestamp =
                new Date().toISOString();

            const { data, error } =
                await supabase
                    .from("simulation_events")
                    .insert({
                        training_id:
                            trainingId,
                        event_type:
                            "SIMULATION_SUBMISSION",
                        created_at:
                            timestamp
                    })
                    .select("id")
                    .single();

            if (error) {

                console.error(
                    "Supabase simulation error:",
                    error.message
                );

                return res.status(500).json({

                    success: false,

                    message:
                        "Unable to record simulation event."

                });

            }

            return res.json({

                success: true,

                eventId:
                    data.id,

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
    "/api/health",
    async (req, res) => {

        try {

            if (!supabase) {
                throw new Error(
                    "Supabase configuration missing."
                );
            }

            const { error } =
                await supabase
                    .from("users")
                    .select("id")
                    .limit(1);

            if (error) {
                throw error;
            }

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
            `Security Awareness Lab running on port ${PORT}`
        );

        if (!hasSupabaseConfig) {

            console.error(
                "Supabase configuration missing. Set NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY in .env"
            );

        }

    }
);
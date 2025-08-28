const express = require("express")
const app = express()

const path = require("path");

require("dotenv").config()
const cors = require("cors")
const db = require("./config/dbConfig")
const userRoute = require("./routes/userRoutes")
const examRoute = require("./routes/examRoutes")
const reportRoute = require("./routes/reportRoutes")

const port = process.env.PORT || 5000

// Timeout middleware
const timeout = require('connect-timeout');

app.use(cors({ origin: "*" }))
app.use(express.json())
app.use(express.urlencoded({ extended: true }))

// Add timeout middleware (25 seconds to stay under Vercel's 30s limit)
app.use(timeout('25s'));

// Timeout handler
app.use((req, res, next) => {
    if (!req.timedout) next();
});

app.use("/api/users", userRoute)
app.use("/api/exams", examRoute)
app.use("/api/reports", reportRoute)


app.use(express.urlencoded({ extended: true }))
const _dirname = path.resolve();
// app.use(express.static(path.join(_dirname, "../frontend/build")));
// app.get("*", (req, res) => {
//     res.sendFile(path.join(_dirname, "../frontend/build/index.html"))
// });

app.use((err, req, res, next) => {
    console.error('Server error:', err);

    if (err.timeout) {
        res.status(408).json({
            message: "Request timeout",
            success: false,
            error: "TIMEOUT"
        });
    } else {
        res.status(500).json({
            message: err.message || "Internal server error",
            success: false
        });
    }
})

// Handle timeout specifically
app.use((req, res, next) => {
    if (req.timedout) {
        res.status(408).json({
            message: "Request timeout - please try again",
            success: false,
            error: "TIMEOUT"
        });
    } else {
        next();
    }
});

app.get('/api/status', (req, res) => {
    res.send({ message: "Server is running!", success: true });
});

app.listen(port, (req, res) => {
    // res.send({ message: "Server is running" })
    console.log(`Server is running on PORT: ${port}`)
})
const Report = require("../models/reportModel")
const Exam = require("../models/examModel")
const User = require("../models/userModel")

//add attempts

const addReport = async (req, res) => {
    try {
        const report = new Report(req.body);
        await report.save()
        res.send({
            message: "Attempt added successfully",
            data: null,
            success: true
        })
    }
    catch (error) {
        res.send({
            message: error.message,
            data: error,
            success: false
        })
    }
}

// get all attempts
const getAllAttempts = async (req, res) => {
    try {
        const user_admin = await User.findOne({
            _id: req.body.userid
        }).maxTimeMS(5000) // Add timeout to user lookup

        if (user_admin.isAdmin) {
            const { examName, userName } = req.body

            // Use Promise.all to run queries in parallel for better performance
            const [exam, user] = await Promise.all([
                Exam.find({
                    name: {
                        $regex: examName,
                    },
                }).maxTimeMS(5000),
                User.find({
                    name: {
                        $regex: userName,
                    },
                }).maxTimeMS(5000)
            ]);

            const matchedExamIds = exam.map((exam) => exam._id)
            const matchedUserIds = user.map((user) => user._id)

            const reports = await Report.find({
                exam: {
                    $in: matchedExamIds,
                },
                user: {
                    $in: matchedUserIds,
                },
            })
                .populate("exam")
                .populate("user")
                .sort({ createdAt: -1 })
                .limit(100) // Limit results
                .maxTimeMS(15000) // Set max execution time

            res.send({
                message: reports.length > 0 ? "All Attempts fetched successfully." : "No Attempts to display.",
                data: reports,
                success: true
            })
        }
        else {
            res.status(403).send({
                message: "Cannot Fetch All Attempts.",
                data: null,
                success: false
            })
        }
    }
    catch (error) {
        console.error('Error in getAllAttempts:', error);
        res.status(500).send({
            message: error.message || "Error fetching attempts",
            data: null,
            success: false
        })
    }
}

const getAllReports = async (req, res) => {
    try {
        const reports = await Report.find({})
            .populate("exam")
            .populate("user")
            .sort({ createdAt: -1 })
            .limit(100) // Limit results to prevent large responses
            .maxTimeMS(20000) // Set max execution time to 20 seconds

        res.send({
            message: reports.length > 0 ? "All Attempts fetched successfully." : "No Attempts to display.",
            data: reports,
            success: true
        })
    }
    catch (error) {
        console.error('Error in getAllReports:', error);
        res.status(500).send({
            message: error.message || "Error fetching reports",
            data: null,
            success: false
        })
    }
}


const getAllAttemptsByUser = async (req, res) => {
    try {
        // Add timeout to the query
        const reports = await Report.find({ user: req.body.userid })
            .populate("exam")
            .populate("user")
            .sort({ createdAt: -1 })
            .limit(100) // Limit results to prevent large responses
            .maxTimeMS(20000) // Set max execution time to 20 seconds

        res.send({
            message: reports.length > 0 ? "All Attempts fetched successfully." : "No Attempts to display.",
            data: reports,
            success: true
        })
    }
    catch (error) {
        console.error('Error in getAllAttemptsByUser:', error);
        res.status(500).send({
            message: error.message || "Error fetching attempts",
            data: null,
            success: false
        })
    }
}


module.exports = { addReport, getAllAttempts, getAllReports, getAllAttemptsByUser }

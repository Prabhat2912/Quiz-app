const Exam = require("../models/examModel")
const User = require("../models/userModel")
const Question = require('../models/questionModel')
const mongoose = require('mongoose');
const addExam = async (req, res) => {
  try {
    const user = await User.findOne({
      _id: req.body.userid
    }).maxTimeMS(5000)

    if (user.isAdmin) {
      //check if exam name already exists
      const examExists = await Exam.findOne({ name: req.body.name }).maxTimeMS(5000)
      if (examExists) {
        res.send({
          message: "Exam already exists",
          success: false
        })
      }
      else {
        req.body.questions = []
        const newExam = new Exam(req.body)
        await newExam.save()
        res.send({
          message: "Exam added successfully",
          success: true,
          data: newExam
        })
      }
    }
  }
  catch (error) {
    console.error('Error in addExam:', error);
    res.status(500).send({
      message: error.message || "Error adding exam",
      data: null,
      success: false
    })
  }
}

const getAllExams = async (req, res) => {
  try {
    const exam = await Exam.find()
      .limit(50) // Limit results to prevent large responses
      .maxTimeMS(10000) // Add timeout

    res.send({
      message: exam.length > 0 ? "Exams list fetched successfully." : "No exams to display.",
      data: exam,
      success: true
    })
  }
  catch (error) {
    console.error('Error in getAllExams:', error);
    res.status(500).send({
      message: error.message || "Error fetching exams",
      data: null,
      success: false
    })
  }
}

const getExamById = async (req, res) => {
  try {
    const exam = await Exam.findById(req.params.id)
      .populate('questions')
      .maxTimeMS(15000) // Add timeout for populate query

    if (exam) {
      res.send({
        message: "Exam data fetched successfully.",
        data: exam,
        success: true
      })
    }
    else {
      res.status(404).send({
        message: "Exam does not exist.",
        data: null,
        success: false
      })
    }
  }
  catch (error) {
    console.error('Error in getExamById:', error);
    res.status(500).send({
      message: error.message || "Error fetching exam",
      data: null,
      success: false
    })
  }
}

// edit exam by id
const editExam = async (req, res) => {
  try {
    const user = await User.findOne({ _id: req.body.userid }).maxTimeMS(5000)
    if (user.isAdmin) {
      const exam = await Exam.findOne({ _id: req.params.id }).maxTimeMS(5000)
      if (exam) {
        exam.name = req.body.name;
        exam.duration = req.body.duration;
        exam.category = req.body.category;
        exam.totalMarks = req.body.totalMarks;
        exam.passingMarks = req.body.passingMarks;
        await exam.save()
        res.send({
          message: "Exam details edited successfully.",
          data: exam,
          success: true
        })
      }
      else {
        res.status(404).send({
          message: "Exam doesn't exist.",
          data: null,
          success: false
        })
      }
    }
    else {
      res.status(403).send({
        message: "Cannot Update Exam Details.",
        data: null,
        success: false
      })
    }
  }
  catch (error) {
    console.error('Error in editExam:', error);
    res.status(500).send({
      message: error.message || "Error editing exam",
      data: null,
      success: false
    })
  }
}

const deleteExam = async (req, res) => {
  try {
    const user = await User.findOne({ _id: req.body.userid }).maxTimeMS(5000)
    if (user.isAdmin) {
      const exam = await Exam.findOne({ _id: req.params.id }).maxTimeMS(5000)
      if (exam) {
        await exam.deleteOne() // Use deleteOne instead of delete
        res.send({
          message: "Selected exam deleted successfully.",
          data: null,
          success: true
        })
      }
      else {
        res.status(404).send({
          message: "Exam doesn't exist.",
          data: null,
          success: false
        })
      }
    }
    else {
      res.status(403).send({
        message: "Cannot Delete Exam.",
        data: null,
        success: false
      })
    }
  }
  catch (error) {
    console.error('Error in deleteExam:', error);
    res.status(500).send({
      message: error.message || "Error deleting exam",
      data: null,
      success: false
    })
  }
}

const addQuestionToExam = async (req, res) => {
  try {
    const user = await User.findById(req.body.userid)
    if (user.isAdmin) {
      const newQuestion = new Question(req.body)
      const question = await newQuestion.save()
      const exam = await Exam.findOne({ _id: req.params.id })
      exam.questions.push(question._id);
      await exam.save();
      res.send({
        message: "Question added successfully.",
        data: null,
        success: true
      })
    }
    else {
      res.send({
        message: "Question cannot be added.",
        data: null,
        success: false
      })
    }
  }
  catch (error) {
    console.log(error.message)
    res.send({
      message: error.message,
      data: error,
      success: false
    })
  }
}

const editQuestionInExam = async (req, res) => {
  try {
    const user = await User.findById(req.body.userid)
    if (user.isAdmin) {
      await Question.findByIdAndUpdate(req.body.questionId, req.body);
      res.send({
        message: "Question edited successfully",
        success: true
      })
    }
    else {
      res.send({
        message: "Question cannot be edited.",
        success: false
      })
    }
  }
  catch (error) {
    res.send({
      message: error.message,
      data: error,
      success: false
    })
  }
}



const deleteQuestionFromExam = async (req, res) => {
  try {

    const { questionId, userid } = req.body;
    console.log(questionId, 'questionId Backend');
    console.log(userid, 'userid Backend');
    if (!mongoose.Types.ObjectId.isValid(req.body.questionId)) {
      return res.send({
        message: "Invalid question ID",
        success: false
      });
    }

    const user = await User.findById(req.body.userid);
    if (user.isAdmin) {
      const question = await Question.findOne({ _id: req.body.questionId });

      if (!question) {
        return res.send({
          message: "Question not found",
          success: false
        });
      }

      await question.delete();

      const exam = await Exam.findOne({ _id: req.params.id });
      exam.questions = exam.questions.filter(q => q._id != req.body.questionId);
      await exam.save();

      res.send({
        message: "Selected question deleted successfully",
        success: true
      });
    } else {
      res.send({
        message: "Question cannot be deleted.",
        success: false
      });
    }
  } catch (error) {
    res.send({
      message: error.message,
      data: error,
      success: false
    });
  }
};


module.exports = { addExam, getAllExams, getExamById, editExam, deleteExam, addQuestionToExam, editQuestionInExam, deleteQuestionFromExam }

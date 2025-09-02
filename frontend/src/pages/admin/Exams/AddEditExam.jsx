import React, { useState, useEffect, useCallback } from "react";
import PageTitle from "../../../components/PageTitle";
import { Form, Row, Col, message, Tabs, Table, Select } from "antd";
import { useNavigate, useParams } from "react-router-dom";

import {
  addExam,
  createExamWithAI as createExamWithAIApi, // ✅ renamed import
  deleteQuestionFromExam,
  editExam,
  getExamById,
} from "../../../apicalls/exams";
import { useDispatch, useSelector } from "react-redux";
import { HideLoading, ShowLoading } from "../../../redux/loaderSlice";
import AddEditQuestion from "./AddEditQuestion";

function AddEditExam() {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { id } = useParams();
  const [examData, setExamData] = useState();
  const [showAddEditQuestionModal, setShowAddEditQuestionModal] =
    useState(false);
  const [selectedQuestion, setSelectedQuestion] = useState();
  const [form] = Form.useForm();

  const handleCreateExamWithAI = async (values) => {
    try {
      if (Array.isArray(values.category)) {
        values.category = values.category[0];
      }
      if (
        !values.name ||
        !values.category ||
        !values.duration ||
        !values.totalMarks ||
        !values.passingMarks
      ) {
        message.error(
          "Please fill in all exam details before creating with AI"
        );
        return;
      }

      dispatch(ShowLoading());
      const response = await createExamWithAIApi(values); // ✅ call correct API
      dispatch(HideLoading());

      if (response.success) {
        message.success(
          `${response.message} (${response.data.questionsCount} questions created)`
        );
        navigate("/admin/exams");
      } else {
        message.error(response.message);
      }
    } catch (error) {
      dispatch(HideLoading());
      message.error(error.message || "Failed to create exam with AI");
    }
  };

  const onFinish = async (values) => {
    try {
      dispatch(ShowLoading());
      if (Array.isArray(values.category)) {
        values.category = values.category[0];
      }
      let response;
      if (id) {
        response = await editExam(values, id);
      } else {
        response = await addExam(values);
      }
      dispatch(HideLoading());
      if (response.success) {
        message.success(response.message);
        navigate("/admin/exams");
      } else {
        message.error(response.message);
      }
    } catch (error) {
      dispatch(HideLoading());
      message.error(error.message);
    }
  };

  const getExamDataById = useCallback(
    async (examId) => {
      try {
        dispatch(ShowLoading());
        const response = await getExamById(examId);
        dispatch(HideLoading());
        if (response.success) {
          message.success(response.message);
          setExamData(response.data);
        } else {
          message.error(response.message);
        }
      } catch (error) {
        dispatch(HideLoading());
        message.error(error.message);
      }
    },
    [dispatch]
  );

  useEffect(() => {
    if (id) {
      getExamDataById(id);
    }
  }, [id, getExamDataById]);

  const user = useSelector((state) => state.users.user);

  const deleteQuestionById = async (questionId) => {
    try {
      const reqPayload = {
        questionId: questionId,
        userid: user._id,
      };
      dispatch(ShowLoading());
      const response = await deleteQuestionFromExam(id, reqPayload);
      dispatch(HideLoading());
      if (response.success) {
        message.success(response.message);
        getExamDataById(id);
      } else {
        message.error(response.message);
      }
    } catch (error) {
      dispatch(HideLoading());
      message.error(error.message);
    }
  };

  const questionColumns = [
    {
      title: "Question",
      dataIndex: "name",
    },
    {
      title: "Options",
      dataIndex: "options",
      render: (text, record) => {
        return Object.keys(record.options).map((key) => {
          return (
            <div key={key}>
              {key} : {record.options[key]}
            </div>
          );
        });
      },
    },
    {
      title: "Correct Option",
      dataIndex: "correctOptions", // ✅ fixed: match backend field
      render: (text, record) => {
        const correctOptionsText = Array.isArray(record?.correctOptions)
          ? record.correctOptions
              .map((option) => `${option}. ${record.options[option]}`)
              .join(", ")
          : "";
        return correctOptionsText;
      },
    },
    {
      title: "Action",
      dataIndex: "action",
      render: (text, record) => {
        return (
          <div className="flex gap-2">
            <i
              className="ri-pencil-line cursor-pointer"
              onClick={() => {
                setSelectedQuestion(record);
                setShowAddEditQuestionModal(true);
              }}
            ></i>
            <i
              className="ri-delete-bin-line cursor-pointer"
              onClick={() => {
                deleteQuestionById(record._id);
              }}
            ></i>
          </div>
        );
      },
    },
  ];

  return (
    <div>
      <PageTitle title={id ? "Edit Exam" : "Add Exam"} />
      <div className="divider"></div>
      {(examData || !id) && (
        <Form
          form={form}
          layout="vertical"
          onFinish={onFinish}
          initialValues={examData}
          className="mt-2"
        >
          <Tabs defaultActiveKey="1">
            <Tabs.TabPane tab="Exam Details" key="1">
              <Row gutter={[10, 10]}>
                <Col span={8}>
                  <Form.Item label="Exam Name" name="name">
                    <input type="text" />
                  </Form.Item>
                </Col>
                <Col span={8}>
                  <Form.Item label="Exam Duration" name="duration">
                    <input type="number" min={0} />
                  </Form.Item>
                </Col>
                <Col span={8}>
                  <Form.Item label="Category" name="category">
                    <Select
                      showSearch
                      mode="tags"
                      maxCount={1}
                      size="large"
                      style={{ width: "100%" }}
                      placeholder="Select or create category"
                    >
                      {categories.map((cat) => (
                        <Select.Option key={cat} value={cat}>
                          {cat}
                        </Select.Option>
                      ))}
                    </Select>
                  </Form.Item>
                </Col>
                <Col span={8}>
                  <Form.Item label="Total Marks" name="totalMarks">
                    <input type="number" min={0} />
                  </Form.Item>
                </Col>
                <Col span={8}>
                  <Form.Item label="Passing Marks" name="passingMarks">
                    <input type="number" min={0} />
                  </Form.Item>
                </Col>
              </Row>
              <div className="flex justify-end gap-2 mt-4">
                {!id && (
                  <button
                    className="primary-outlined-btn dark:hover:bg-black dark:text-black dark:border-black transition-all duration-200 ease-linear w-15 cursor-pointer"
                    type="button"
                    onClick={() => {
                      form
                        .validateFields()
                        .then((values) => {
                          handleCreateExamWithAI(values); // ✅ call renamed function
                        })
                        .catch(() => {
                          message.error("Please fill in all required fields");
                        });
                    }}
                  >
                    Create With AI
                  </button>
                )}
                <button
                  className="primary-outlined-btn dark:hover:bg-black dark:text-black dark:border-black transition-all duration-200 ease-linear w-15 cursor-pointer"
                  type="submit"
                >
                  {id ? "Update" : "Save"}
                </button>
                <button
                  className="primary-contained-btn dark:bg-black dark:border-black  dark:hover:text-black dark:hover:border-black transition-all duration-200 ease-linear rounded-md  w-15 cursor-pointer"
                  type="button"
                  onClick={() => navigate("/admin/exams")}
                >
                  Cancel
                </button>
              </div>
            </Tabs.TabPane>
            {id && (
              <Tabs.TabPane tab="Questions" key="2">
                <div className="flex justify-end">
                  <button
                    className="primary-outlined-btn dark:hover:bg-black dark:text-black dark:border-black transition-all duration-200 ease-linear cursor-pointer"
                    type="button"
                    onClick={() => {
                      setShowAddEditQuestionModal(true);
                    }}
                  >
                    Add Question
                  </button>
                </div>
                <Table
                  columns={questionColumns}
                  dataSource={examData?.questions}
                  className="mt-1  min-w-[700px] "
                  rowKey="_id" // ✅ added to prevent React key warning
                ></Table>
              </Tabs.TabPane>
            )}
          </Tabs>
        </Form>
      )}
      {showAddEditQuestionModal && (
        <AddEditQuestion
          setShowAddEditQuestionModal={setShowAddEditQuestionModal}
          showAddEditQuestionModal={showAddEditQuestionModal}
          examId={id}
          refreshData={getExamDataById}
          selectedQuestion={selectedQuestion}
          setSelectedQuestion={setSelectedQuestion}
        />
      )}
    </div>
  );
}
const categories = [
  "JavaScript",
  "Node.js",
  "React",
  "MongoDB",
  "Python",
  "Java",
  "HTML",
  "CSS",
  "SQL",
  "Data Structures",
];

export default AddEditExam;

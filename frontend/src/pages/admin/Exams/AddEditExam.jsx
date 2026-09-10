import React, { useState, useEffect, useCallback } from "react";
import PageTitle from "../../../components/PageTitle";
import { Form, message, Tabs, Table, Select } from "antd";
import { useNavigate, useParams } from "react-router-dom";

import {
  addExam,
  createExamWithAI as createExamWithAIApi, // ✅ renamed import
  deleteQuestionFromExam,
  editExam,
  getExamById,
} from "../../../apicalls/exams";
import { useDispatch, useSelector } from "react-redux";
import { useTranslation } from "react-i18next";
import { HideLoading, ShowLoading } from "../../../redux/loaderSlice";
import AddEditQuestion from "./AddEditQuestion";

function AddEditExam() {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { t } = useTranslation();
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
      // Same minutes→seconds conversion as manual save.
      values.duration =
        Math.min(15, Math.max(1, Math.round(Number(values.duration) || 1))) * 60;
      if (
        !values.name ||
        !values.category ||
        !values.duration ||
        !values.totalMarks ||
        !values.passingMarks
      ) {
        message.error(
          "Please fill in all exam details before creating with AI",
        );
        return;
      }

      dispatch(ShowLoading());
      const response = await createExamWithAIApi(values); // ✅ call correct API
      dispatch(HideLoading());

      if (response.success) {
        message.success(
          `${response.message} (${response.data.questionsCount} questions created)`,
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
      // Authoring unit is minutes (1–15); storage and the timer use seconds.
      values.duration =
        Math.min(15, Math.max(1, Math.round(Number(values.duration) || 1))) * 60;
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
    [dispatch],
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
      title: t("exams.qColQuestion"),
      dataIndex: "name",
    },
    {
      title: t("exams.qColOptions"),
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
      title: t("exams.qColCorrect"),
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
      title: t("exams.colAction"),
      dataIndex: "action",
      render: (text, record) => {
        return (
          <div className="flex gap-2">
            <i
              className="ri-pencil-line cursor-pointer"
              title={t("exams.editQuestion")}
              onClick={() => {
                setSelectedQuestion(record);
                setShowAddEditQuestionModal(true);
              }}
            ></i>
            <i
              className="ri-delete-bin-line cursor-pointer"
              title={t("exams.deleteQuestion")}
              onClick={() => {
                deleteQuestionById(record._id);
              }}
            ></i>
          </div>
        );
      },
    },
  ];

  // Details section shared by both modes: add-mode renders it directly so
  // no orphaned single tab strip hugs the sheet edge; edit-mode nests it
  // in the Details tab next to Questions.
  const detailsBlock = (
    <>
      <div className="flex items-baseline justify-between mb-4">
        <h3 className="font-display font-bold">{t("exams.basics")}</h3>
        <span className="nb-data text-xs text-soft">{t("exams.formNo")}</span>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-4">
        <div className="sm:col-span-2">
          <Form.Item
            label={t("exams.fieldName")}
            name="name"
            rules={[{ required: true, message: t("exams.needName") }]}
          >
            <input type="text" placeholder={t("exams.fieldNamePh")} />
          </Form.Item>
        </div>
        <div>
          <Form.Item
            label={t("exams.fieldDuration")}
            name="duration"
            rules={[{ required: true, message: t("exams.needDuration") }]}
          >
            <input type="number" min={1} max={15} placeholder={t("exams.fieldDurationPh")} />
          </Form.Item>
        </div>
        <div>
          <Form.Item
            label={t("exams.fieldCategory")}
            name="category"
            rules={[{ required: true, message: t("exams.needCategory") }]}
          >
            <Select
              showSearch
              mode="tags"
              maxCount={1}
              size="large"
              style={{ width: "100%" }}
                      placeholder={t("exams.fieldCategoryPh")}
            >
              {categories.map((cat) => (
                <Select.Option key={cat} value={cat}>
                  {cat}
                </Select.Option>
              ))}
            </Select>
          </Form.Item>
        </div>
        <div>
          <Form.Item
            label={t("exams.fieldTotal")}
            name="totalMarks"
            rules={[{ required: true, message: t("exams.needTotal") }]}
          >
            <input type="number" min={1} placeholder={t("exams.fieldTotalPh")} />
          </Form.Item>
        </div>
        <div>
          <Form.Item
            label={t("exams.fieldPassing")}
            name="passingMarks"
            rules={[{ required: true, message: t("exams.needPassing") }]}
          >
            <input type="number" min={0} placeholder={t("exams.fieldPassingPh")} />
          </Form.Item>
        </div>
        <div className="sm:col-span-2">
          <Form.Item
            label={t("exams.fieldLanguage")}
            name="language"
            rules={[{ required: true, message: t("exams.needLanguage") }]}
          >
            <select>
              <option value="en">{t("exams.langEnglish")}</option>
              <option value="hi">{t("exams.langHindi")}</option>
            </select>
          </Form.Item>
        </div>
      </div>
      <div className="flex flex-wrap items-center gap-2 mt-5 pt-4 border-t border-rule">
        {!id && (
          <button
            className="nb-btn-ghost py-2! text-sm"
            type="button"
            onClick={() => {
              form
                .validateFields()
                .then((values) => {
                  handleCreateExamWithAI(values); // ✅ call renamed function
                })
                        .catch(() => {
                          message.error(t("exams.needFields"));
                        });
            }}
          >
            <i className="ri-sparkling-line mr-1" aria-hidden="true"></i>
            {t("exams.draftAI")}
          </button>
        )}
        <span className="flex-1" aria-hidden="true" />
        <button
          className="text-soft hover:text-accent font-semibold px-3 py-2 text-sm"
          type="button"
          onClick={() => navigate("/admin/exams")}
        >
          {t("common.cancel")}
        </button>
        <button className="nb-btn py-2! text-sm" type="submit">
          {id ? t("exams.fileAmendments") : t("exams.saveExam")}
        </button>
      </div>
    </>
  );

  return (
    <div>
      <PageTitle
        title={id ? t("exams.editTitle") : t("exams.fileTitle")}
        sub={id ? t("exams.editSub") : t("exams.fileSub")}
      />
      {(examData || !id) && (
        <Form
          form={form}
          layout="vertical"
          onFinish={onFinish}
          initialValues={
            id && examData
              ? {
                  ...examData,
                  duration: Math.round((examData.duration || 0) / 60),
                  language: examData.language || "en",
                }
              : { language: "en" }
          }
          className="nb-sheet nb-form-pad"
        >
          {id ? (
            <Tabs
              defaultActiveKey="1"
              items={[
                { key: "1", label: t("exams.tabDetails"), children: detailsBlock },
                {
                  key: "2",
                  label: examData?.questions
                    ? t("exams.tabQuestionsCount", { n: examData.questions.length })
                    : t("exams.tabQuestions"),
                  children: (
                    <>
                      <div className="flex flex-wrap items-center justify-between gap-2 mb-3">
                        <p className="nb-data text-xs text-soft">
                          {t("exams.entriesFiled", {
                            n: examData?.questions?.length || 0,
                          })}
                        </p>
                        <button
                          className="nb-btn py-2! text-sm"
                          type="button"
                          onClick={() => {
                            setShowAddEditQuestionModal(true);
                          }}
                        >
                          <i
                            className="ri-add-line mr-1"
                            aria-hidden="true"
                          ></i>
                          {t("exams.fileQuestion")}
                        </button>
                      </div>
                      <div className="overflow-x-auto">
                        <Table
                          columns={questionColumns}
                          dataSource={examData?.questions}
                          className="min-w-[700px]"
                          rowKey="_id" // ✅ added to prevent React key warning
                        ></Table>
                      </div>
                    </>
                  ),
                },
              ]}
            />
          ) : (
            detailsBlock
          )}
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
          examCategory={examData?.category}
          examLanguage={examData?.language || "en"}
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

import React, { useState } from "react";
import { Modal, Form, message, Checkbox, Switch, Radio } from "antd";
import { HideLoading, ShowLoading } from "../../../redux/loaderSlice";
import { useDispatch } from "react-redux";
import { useTranslation } from "react-i18next";
import {
  addQuestionToExam,
  editQuestionInExam,
  generateExplanation,
} from "../../../apicalls/exams";

function AddEditQuestion(props) {
  const {
    showAddEditQuestionModal,
    setShowAddEditQuestionModal,
    examId,
    refreshData,
    selectedQuestion,
    setSelectedQuestion,
    examCategory,
    examLanguage,
  } = props;
  const dispatch = useDispatch();
  const { t } = useTranslation();
  const [form] = Form.useForm();
  const [correctOptions, setCorrectOptions] = useState(
    selectedQuestion?.correctOptions || []
  ); // Array of selected correct options
  const [isTrueFalse, setIsTrueFalse] = useState(
    selectedQuestion?.isTrueFalse || false
  ); // New state to toggle question type
  const [generatingExplanation, setGeneratingExplanation] = useState(false);

  const onFinish = async (values) => {
    try {
      dispatch(ShowLoading());
      let response;

      // Construct the payload based on the question type
      let requiredPayload = {
        name: values.name,
        correctOptions: correctOptions,
        explanation: values.explanation || "", // Add explanation field
        options: isTrueFalse
          ? examLanguage === "hi"
            ? { A: "सही", B: "ग़लत" }
            : { A: "True", B: "False" }
          : {
              A: values.A,
              B: values.B,
              C: values.C,
              D: values.D,
            },
        exam: examId,
        questionId: selectedQuestion?._id,
      };

      if (selectedQuestion) {
        response = await editQuestionInExam(requiredPayload, examId);
      } else {
        response = await addQuestionToExam(requiredPayload, examId);
      }

      dispatch(HideLoading());
      if (response.success) {
        message.success(response.message);
        refreshData(examId);
        setShowAddEditQuestionModal(false);
      } else {
        message.error(response.message);
        setShowAddEditQuestionModal(false);
      }
    } catch (error) {
      dispatch(HideLoading());
      setShowAddEditQuestionModal(false);
      message.error(error.message);
    }
  };

  const handleCorrectOptionChange = (e) => {
    setCorrectOptions(e.target.value);
  };

  const handleGenerateExplanation = async () => {
    try {
      const values = form.getFieldsValue();

      // Validate that required fields are filled
      if (!values.name) {
        message.warning(t("question.needQuestionText"));
        return;
      }

      if (correctOptions.length === 0) {
        message.warning(t("question.needCorrectOption"));
        return;
      }

      const options = isTrueFalse
        ? { A: "True", B: "False" }
        : {
            A: values.A,
            B: values.B,
            C: values.C,
            D: values.D,
          };

      // Check if options are filled for MCQ
      if (!isTrueFalse) {
        const allOptionsFilled = Object.values(options).every(
          (opt) => opt && opt.trim()
        );
        if (!allOptionsFilled) {
          message.warning(t("question.needOptions"));
          return;
        }
      }

      setGeneratingExplanation(true);
      message.info(t("question.generatingInfo"));

      const response = await generateExplanation({
        questionText: values.name,
        correctOptions: correctOptions,
        options: options,
        category: examCategory || "General",
        language: examLanguage || "en",
      });

      setGeneratingExplanation(false);

      if (response.success) {
        form.setFieldsValue({ explanation: response.data.explanation });
        message.success(t("question.generatedOk"));
      } else {
        message.error(response.message || t("question.generateFail"));
      }
    } catch (error) {
      setGeneratingExplanation(false);
      message.error(t("question.generateError"));
    }
  };

  return (
    <Modal
      title={selectedQuestion ? t("exams.editQuestion") : t("exams.addQuestion")}
      open={showAddEditQuestionModal}
      footer={false}
      onCancel={() => {
        setShowAddEditQuestionModal(false);
        setSelectedQuestion();
      }}
    >
      <Form
        form={form}
        onFinish={onFinish}
        layout="vertical"
        initialValues={{
          name: selectedQuestion?.name || "",
          explanation: selectedQuestion?.explanation || "",
          A: selectedQuestion?.options?.A || "",
          B: selectedQuestion?.options?.B || "",
          C: selectedQuestion?.options?.C || "",
          D: selectedQuestion?.options?.D || "",
          // trueOption: selectedQuestion?.options?.true || '',
          // falseOption: selectedQuestion?.options?.false || '',
          correctOptions: selectedQuestion?.correctOptions || [],
        }}
      >
        <Form.Item name="name" label={t("question.fieldText")}>
          <input type="text" />
        </Form.Item>

        <Form.Item
          name="explanation"
          label={
            <div className="flex items-center justify-between w-full">
              <span>{t("question.fieldExplanation")}</span>
              <button
                type="button"
                className="nb-btn py-1.5! px-3! text-sm! ml-2"
                onClick={handleGenerateExplanation}
                disabled={generatingExplanation}
              >
                {generatingExplanation
                  ? t("question.generating")
                  : t("question.generateAI")}
              </button>
            </div>
          }
        >
          <textarea
            rows={3}
            placeholder={t("question.explanationPh")}
          />
        </Form.Item>

        <Form.Item label={t("question.fieldType")}>
          <Switch checked={isTrueFalse} onChange={setIsTrueFalse} />
          <span style={{ marginLeft: 8 }}>
            {isTrueFalse ? t("question.typeTrueFalse") : t("question.typeMultiple")}
          </span>
        </Form.Item>

        {isTrueFalse ? (
          <>
            <Form.Item label={t("question.correctOptions")}>
              <Radio.Group
                onChange={handleCorrectOptionChange}
                value={correctOptions[0]}
              >
                <Radio value="A">{t("question.trueOption")}</Radio>
                <Radio value="B">{t("question.falseOption")}</Radio>
              </Radio.Group>
            </Form.Item>
          </>
        ) : (
          <>
            <Form.Item label={t("question.correctOptions")}>
              <Checkbox.Group
                options={["A", "B", "C", "D"]}
                value={correctOptions}
                onChange={(e) => setCorrectOptions(e)}
              />
            </Form.Item>
            <div className="flex gap-2">
              <Form.Item name="A" label={t("question.option", { key: "A" })}>
                <input type="text" />
              </Form.Item>
              <Form.Item name="B" label={t("question.option", { key: "B" })}>
                <input type="text" />
              </Form.Item>
            </div>
            <div className="flex gap-2">
              <Form.Item name="C" label={t("question.option", { key: "C" })}>
                <input type="text" />
              </Form.Item>
              <Form.Item name="D" label={t("question.option", { key: "D" })}>
                <input type="text" />
              </Form.Item>
            </div>
          </>
        )}

        <div className="flex justify-end gap-2 mt-2">
          <button
            className="primary-contained-btn rounded-md cursor-pointer"
            type="submit"
          >
            {selectedQuestion ? t("question.updateQuestion") : t("question.saveQuestion")}
          </button>
          <button
            className="primary-outlined-btn"
            type="button"
            onClick={() => {
              setShowAddEditQuestionModal(false);
              setSelectedQuestion();
            }}
          >
            {t("common.cancel")}
          </button>
        </div>
      </Form>
    </Modal>
  );
}

export default AddEditQuestion;

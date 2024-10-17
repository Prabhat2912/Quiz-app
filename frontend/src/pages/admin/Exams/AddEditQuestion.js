import React, { useState } from 'react';
import { Modal, Form, message, Checkbox, Switch, Radio } from 'antd';
import { HideLoading, ShowLoading } from '../../../redux/loaderSlice';
import { useDispatch } from 'react-redux';
import { addQuestionToExam, editQuestionInExam } from '../../../apicalls/exams';

function AddEditQuestion(props) {
  const { showAddEditQuestionModal, setShowAddEditQuestionModal, examId, refreshData, selectedQuestion, setSelectedQuestion } = props;
  const dispatch = useDispatch();
  const [correctOptions, setCorrectOptions] = useState(selectedQuestion?.correctOptions || []); // Array of selected correct options
  const [isTrueFalse, setIsTrueFalse] = useState(selectedQuestion?.isTrueFalse || false); // New state to toggle question type

  const onFinish = async (values) => {
    try {
      dispatch(ShowLoading());
      let response;

      // Construct the payload based on the question type
      let requiredPayload = {
        name: values.name,
        correctOptions: correctOptions,
        options: isTrueFalse
          ? { A: 'True', B: 'False' }
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

  return (
    <Modal title={selectedQuestion ? "Edit Question" : "Add Question"} open={showAddEditQuestionModal} footer={false} onCancel={() => {
      setShowAddEditQuestionModal(false);
      setSelectedQuestion();
    }}>
      <Form onFinish={onFinish} layout="vertical" initialValues={{
        name: selectedQuestion?.name || '',
        A: selectedQuestion?.options?.A || '',
        B: selectedQuestion?.options?.B || '',
        C: selectedQuestion?.options?.C || '',
        D: selectedQuestion?.options?.D || '',
        // trueOption: selectedQuestion?.options?.true || '',
        // falseOption: selectedQuestion?.options?.false || '',
        correctOptions: selectedQuestion?.correctOptions || [],
      }}>
        <Form.Item name="name" label="Question">
          <input type="text" />
        </Form.Item>

        <Form.Item label="Question Type">
          <Switch checked={isTrueFalse} onChange={setIsTrueFalse} />
          <span style={{ marginLeft: 8 }}>{isTrueFalse ? 'True/False' : 'Multiple Choice'}</span>
        </Form.Item>

        {isTrueFalse ? (
          <>

            <Form.Item label="Correct Options">
              <Radio.Group onChange={handleCorrectOptionChange} value={correctOptions[0]}>
                <Radio value="A">True</Radio>
                <Radio value="B">False</Radio>
              </Radio.Group>
            </Form.Item>
          </>
        ) : (
          <>
            <Form.Item label="Correct Options">
              <Checkbox.Group
                options={['A', 'B', 'C', 'D']}
                value={correctOptions}
                onChange={(e) => setCorrectOptions(e)}
              />
            </Form.Item>
            <div className='flex gap-2'>
              <Form.Item name="A" label="Option A">
                <input type="text" />
              </Form.Item>
              <Form.Item name="B" label="Option B">
                <input type="text" />
              </Form.Item>
            </div>
            <div className='flex gap-2'>
              <Form.Item name="C" label="Option C">
                <input type="text" />
              </Form.Item>
              <Form.Item name="D" label="Option D">
                <input type="text" />
              </Form.Item>
            </div>
          </>
        )}

        <div className='flex justify-end gap-2 mt-2'>
          <button className='primary-contained-btn dark:bg-black dark:border-black  dark:hover:text-black dark:hover:border-black transition-all duration-200 ease-linear rounded-md cursor-pointer' type="submit">
            Save
          </button>
          <button className='primary-outlined-btn dark:hover:bg-black dark:text-black dark:border-black transition-all duration-200 ease-linear ' type="button" onClick={() => {
            setShowAddEditQuestionModal(false);
            setSelectedQuestion();
          }}>
            Cancel
          </button>
        </div>
      </Form>
    </Modal>
  );
}

export default AddEditQuestion;

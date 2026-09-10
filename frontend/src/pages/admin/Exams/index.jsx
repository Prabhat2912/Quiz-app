import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import PageTitle from "../../../components/PageTitle";
import { Table, message } from "antd";
import { useDispatch } from "react-redux";
import { useTranslation } from "react-i18next";
import { HideLoading, ShowLoading } from "../../../redux/loaderSlice";
import { getAllExams, deleteExam } from "../../../apicalls/exams";

function ExamsPage() {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { t } = useTranslation();
  const [exams, setExams] = useState([]);
  const columns = [
    {
      title: t("exams.colName"),
      dataIndex: "name",
    },
    {
      title: t("exams.colDuration"),
      dataIndex: "duration",
      render: (text, record) => <>{Math.round((record.duration || 0) / 60)}</>,
    },
    {
      title: t("exams.colCategory"),
      dataIndex: "category",
    },
    {
      title: t("exams.colTotal"),
      dataIndex: "totalMarks",
    },
    {
      title: t("exams.colPassing"),
      dataIndex: "passingMarks",
    },
    {
      title: t("exams.colAction"),
      dataIndex: "action",
      render: (text, record) => {
        return (
          <div className="flex gap-2">
            <i
              className="ri-pencil-line cursor-pointer"
              title={t("exams.editExam")}
              onClick={() => navigate(`/admin/exams/edit/${record._id}`)}
            ></i>
            <i
              className="ri-delete-bin-line cursor-pointer"
              title={t("exams.deleteExam")}
              onClick={() => {
                deleteExamById(record._id);
              }}
            ></i>
          </div>
        );
      },
    },
  ];
  const getExamsData = async () => {
    try {
      dispatch(ShowLoading());
      const response = await getAllExams();
      dispatch(HideLoading());
      if (response.success) {
        message.success(response.message);
        setExams(response.data);
      } else {
        message.error(response.message);
      }
    } catch (error) {
      dispatch(HideLoading());
      message.error(error.message);
    }
  };
  const deleteExamById = async (id) => {
    try {
      dispatch(ShowLoading());
      const response = await deleteExam(id);
      dispatch(HideLoading());
      if (response.success) {
        message.success(response.message);
        getExamsData();
      } else {
        message.error(response.message);
      }
    } catch (error) {
      dispatch(HideLoading());
      message.error(error.message);
    }
  };
  useEffect(() => {
    getExamsData();
  }, []);
  return (
    <>
      <div className="flex justify-between mt-1">
        <PageTitle title={t("exams.title")} />
        <button
          className="primary-outlined-btn flex items-center cursor-pointer"
          onClick={() => navigate("/admin/exams/add")}
        >
          <i className="ri-add-line"></i>
          {t("exams.add")}
        </button>
      </div>
      <div className="divider mt-1"></div>
      <div className="overflow-x-auto">
        <Table
          className="min-w-[520px]"
          columns={columns}
          dataSource={exams}
          locale={{ emptyText: t("exams.empty") }}
        />
      </div>
    </>
  );
}

export default ExamsPage;

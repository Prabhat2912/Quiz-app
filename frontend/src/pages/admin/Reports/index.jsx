import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import PageTitle from "../../../components/PageTitle";
import { Table, message } from "antd";
import { HideLoading, ShowLoading } from "../../../redux/loaderSlice";
import { useDispatch } from "react-redux";
import { useTranslation } from "react-i18next";
import { getAllAttempts } from "../../../apicalls/reports";
import moment from "moment";

function AdminReportsPage() {
  const [reportsData, setReportsData] = useState([]);
  const [filters, setFilters] = useState({
    examName: "",
    userName: "",
  });
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { t } = useTranslation();
  const columns = [
    {
      title: t("reports.colExam"),
      dataIndex: "examName",
      render: (text, record) => (
        <button
          className="hover:text-accent hover:underline text-left font-semibold"
          onClick={() => navigate(`/user/reports/${record._id}`)}
          title={t("reports.openReview")}
        >
          {record.exam?.name || t("reports.deletedExam")}
        </button>
      ),
    },
    {
      title: t("reports.colDate"),
      dataIndex: "date",
      render: (text, record) => (
        <>{moment(record.createdAt).format("DD-MM-YYYY hh:mm:ss")}</>
      ),
    },
    {
      title: t("reports.colUser"),
      dataIndex: "user",
      render: (text, record) => <>{record.user?.name}</>,
    },
    {
      title: t("reports.colTotal"),
      dataIndex: "totalMarks",
      render: (text, record) => <>{record.exam?.totalMarks}</>,
    },
    {
      title: t("reports.colPassing"),
      dataIndex: "passingMarks",
      render: (text, record) => <>{record.exam?.passingMarks}</>,
    },
    {
      title: t("reports.colObtained"),
      dataIndex: "obtainedMarks",
      render: (text, record) => (
        <>
          {(record.result.correctAnswers.length /
            (record.result.wrongAnswers.length +
              record.result.correctAnswers.length)) *
            record.exam.totalMarks || 0}
        </>
      ),
    },
    {
      title: t("reports.colVerdict"),
      dataIndex: "verdict",
      render: (text, record) => (
        <>
          {record.result.verdict === "Pass"
            ? t("exam.verdictPass")
            : t("exam.verdictFail")}
        </>
      ),
    },
  ];
  const getData = async (tempFilters) => {
    try {
      dispatch(ShowLoading());
      const response = await getAllAttempts(tempFilters);
      dispatch(HideLoading());
      if (response.success) {
        setReportsData(response.data);
        message.success(response.message);
        console.log(reportsData);
      } else {
        message.error(response.message);
      }
    } catch (error) {
      dispatch(HideLoading());
      message.error(error.message);
    }
  };
  useEffect(() => {
    getData(filters);
  }, []);
  return (
    <div>
      <PageTitle title={t("reports.title")} />
      <div className="divider"></div>
      <div className="flex flex-wrap gap-2 mt-2">
        <input
          type="text"
          placeholder={t("reports.filterExam")}
          className="min-w-[90px] flex-1 sm:flex-none sm:w-40"
          value={filters.examName}
          onChange={(e) => setFilters({ ...filters, examName: e.target.value })}
        />
        <input
          type="text"
          placeholder={t("reports.filterUser")}
          className="min-w-[90px] flex-1 sm:flex-none sm:w-40"
          value={filters.userName}
          onChange={(e) => setFilters({ ...filters, userName: e.target.value })}
        />
        <button
          className="primary-outlined-btn rounded-md cursor-pointer"
          onClick={() => {
            setFilters({
              userName: "",
              examName: "",
            });
            getData({
              userName: "",
              examName: "",
            });
          }}
        >
          {t("reports.clear")}
        </button>
        <button
          className="primary-contained-btn rounded-md cursor-pointer"
          onClick={() => getData(filters)}
        >
          {t("reports.search")}
        </button>
      </div>
      <div className="overflow-x-auto mt-2">
        <Table
          columns={columns}
          className="min-w-[620px]  "
          dataSource={reportsData}
          rowKey="_id"
          locale={{ emptyText: t("reports.empty") }}
        />
      </div>
    </div>
  );
}

export default AdminReportsPage;

import React, { useState, useEffect } from "react";
import PageTitle from "../../../components/PageTitle";
import { Table, message } from "antd";
import { HideLoading, ShowLoading } from "../../../redux/loaderSlice";
import { useDispatch } from "react-redux";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { getAllAttemptsByUser } from "../../../apicalls/reports";

function ReportsPage() {
  const [reportsData, setReportsData] = useState([]);
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
      render: (text, record) => <>{record.createdAt}</>,
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
      render: (text, record) => <>{record.result?.correctAnswers?.length || 0}</>,
    },
    {
      title: t("reports.colVerdict"),
      dataIndex: "verdict",
      render: (text, record) => (
        <>{record.result?.verdict === "Pass" ? t("exam.verdictPass") : t("exam.verdictFail")}</>
      ),
    },
  ];
  useEffect(() => {
    const fetchData = async () => {
      try {
        dispatch(ShowLoading());

        // Add timeout to the API call
        const timeoutPromise = new Promise((_, reject) =>
          setTimeout(() => reject(new Error("Request timeout")), 25000)
        );

        const response = await Promise.race([
          getAllAttemptsByUser(),
          timeoutPromise,
        ]);

        dispatch(HideLoading());

        if (response.success) {
          setReportsData(response.data);
          message.success(response.message);
          console.log(response.data);
        } else {
          message.error(response.message || t("reports.fetchFail"));
        }
      } catch (error) {
        dispatch(HideLoading());
        console.error("Error fetching reports:", error);

        if (error.message === "Request timeout") {
          message.error(t("reports.timeout"));
        } else if (error.code === "NETWORK_ERROR") {
          message.error(t("reports.networkError"));
        } else {
          message.error(error.message || t("reports.fetchFail"));
        }
      }
    };

    fetchData();
  }, [dispatch]);
  return (
    <div className="w-full">
      <PageTitle title={t("reports.title")} />
      <div className="overflow-x-auto">
        <Table
          columns={columns}
          className="mt-2 min-w-[700px] "
          dataSource={reportsData}
          rowKey="_id"
        />
      </div>
    </div>
  );
}

export default ReportsPage;

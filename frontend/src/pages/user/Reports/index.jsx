import React, { useState, useEffect } from "react";
import PageTitle from "../../../components/PageTitle";
import { Table, message } from "antd";
import { HideLoading, ShowLoading } from "../../../redux/loaderSlice";
import { useDispatch } from "react-redux";
import { getAllAttemptsByUser } from "../../../apicalls/reports";

function ReportsPage() {
  const [reportsData, setReportsData] = useState([]);
  const dispatch = useDispatch();
  const columns = [
    {
      title: "Exam Name",
      dataIndex: "examName",
      render: (text, record) => <>{record.exam.name}</>,
    },
    {
      title: "Date",
      dataIndex: "date",
      render: (text, record) => <>{record.createdAt}</>,
    },
    {
      title: "Total Marks",
      dataIndex: "totalMarks",
      render: (text, record) => <>{record.exam.totalMarks}</>,
    },
    {
      title: "Passing Marks",
      dataIndex: "passingMarks",
      render: (text, record) => <>{record.exam.passingMarks}</>,
    },
    {
      title: "Obtained Marks",
      dataIndex: "obtainedMarks",
      render: (text, record) => <>{record.result.correctAnswers.length}</>,
    },
    {
      title: "Verdict",
      dataIndex: "verdict",
      render: (text, record) => <>{record.result.verdict}</>,
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
          message.error(response.message || "Failed to fetch reports");
        }
      } catch (error) {
        dispatch(HideLoading());
        console.error("Error fetching reports:", error);

        if (error.message === "Request timeout") {
          message.error("Request timed out. Please try again later.");
        } else if (error.code === "NETWORK_ERROR") {
          message.error("Network error. Please check your connection.");
        } else {
          message.error(error.message || "Failed to fetch reports");
        }
      }
    };

    fetchData();
  }, [dispatch]);
  return (
    <div className="w-full">
      <PageTitle title="Reports" />
      <div className="divider"></div>
      <Table
        columns={columns}
        className="mt-2 min-w-[700px] "
        dataSource={reportsData}
      />
    </div>
  );
}

export default ReportsPage;

import React, { useState, useEffect } from "react";
import PageTitle from "../../../components/PageTitle";
import { Table, message } from "antd";
import { HideLoading, ShowLoading } from "../../../redux/loaderSlice";
import { useDispatch } from "react-redux";
import { getAllAttempts } from "../../../apicalls/reports";
import moment from "moment";

function AdminReportsPage() {
  const [reportsData, setReportsData] = useState([]);
  const [filters, setFilters] = useState({
    examName: "",
    userName: "",
  });
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
      render: (text, record) => (
        <>{moment(record.createdAt).format("DD-MM-YYYY hh:mm:ss")}</>
      ),
    },
    {
      title: "User",
      dataIndex: "user",
      render: (text, record) => <>{record.user.name}</>,
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
      title: "Verdict",
      dataIndex: "verdict",
      render: (text, record) => <>{record.result.verdict}</>,
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
      <PageTitle title="Reports" />
      <div className="divider"></div>
      <div className="flex gap-2 mt-2">
        <input
          type="text"
          placeholder="Exam"
          className="min-w-[90px]"
          value={filters.examName}
          onChange={(e) => setFilters({ ...filters, examName: e.target.value })}
        />
        <input
          type="text"
          placeholder="User"
          className="min-w-[90px]"
          value={filters.userName}
          onChange={(e) => setFilters({ ...filters, userName: e.target.value })}
        />
        <button
          className="primary-outlined-btn dark:hover:bg-black dark:text-black dark:border-black transition-all duration-200 ease-linear rounded-md cursor-pointer"
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
          Clear
        </button>
        <button
          className="primary-contained-btn dark:bg-black dark:border-black  dark:hover:text-black dark:hover:border-black transition-all duration-200 ease-linear rounded-md cursor-pointer"
          onClick={() => getData(filters)}
        >
          Search
        </button>
      </div>
      <Table
        columns={columns}
        className="mt-2  min-w-[620px]  "
        dataSource={reportsData}
      />
    </div>
  );
}

export default AdminReportsPage;

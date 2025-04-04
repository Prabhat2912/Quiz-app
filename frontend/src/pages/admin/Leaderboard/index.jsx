import React, { useEffect, useState } from 'react';
import { useDispatch } from 'react-redux';
import { message, Table } from 'antd';
import { getAllReports } from '../../../apicalls/reports'; // Assuming you have an API call to get reports
import { ShowLoading, HideLoading } from '../../../redux/loaderSlice';
import PageTitle from '../../../components/PageTitle';

function Leaderboard() {
    const [leaderboard, setLeaderboard] = useState([]);
    const dispatch = useDispatch();

    const fetchReports = async () => {
        try {
            dispatch(ShowLoading());
            const response = await getAllReports();
            dispatch(HideLoading());
            if (response.success) {
                const reports = response.data;
                const leaderboardData = generateLeaderboard(reports);
                setLeaderboard(leaderboardData);
            } else {
                message.error(response.message);
            }
        } catch (error) {
            dispatch(HideLoading());
            message.error(error.message);
        }
    };


    const generateLeaderboard = (reports) => {
        // Process reports to generate leaderboard
        const leaderboardMap = new Map();

        reports.forEach(report => {
            const { user, result } = report;
            const { _id: userId, name: userName } = user;
            const score = result?.correctAnswers?.length;

            if (leaderboardMap.has(userId)) {
                leaderboardMap.get(userId).score += score;
            } else {
                leaderboardMap.set(userId, { name: userName, score });
            }
        });

        const leaderboardArray = Array.from(leaderboardMap.values());
        leaderboardArray.sort((a, b) => b.score - a.score);

        return leaderboardArray.map((entry, index) => ({
            ...entry,
            rank: index + 1,
        }));
    };

    useEffect(() => {
        fetchReports();
    }, []);

    const columns = [
        {
            title: 'Rank',
            dataIndex: 'rank',
            key: 'rank',
        },
        {
            title: 'Name',
            dataIndex: 'name',
            key: 'name',
        },
        {
            title: 'Score',
            dataIndex: 'score',
            key: 'score',
        },
    ];

    return (
        <div>
            <PageTitle title="Leaderboard" />
            <div className="divider"></div>
            <Table dataSource={leaderboard} columns={columns} className='min-w-[250px]' rowKey="rank" />
        </div>
    );
}


export default Leaderboard;
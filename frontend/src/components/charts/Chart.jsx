import React from 'react';
import {
    BarChart,
    Bar,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    Legend,
    ResponsiveContainer
} from 'recharts';

const Chart = ({ data, timeRange }) => {
    const chartData = [
        {
            name: 'Tuần 1',
            dungGio: 35,
            diMuon: 2,
            vangMat: 1
        },
        {
            name: 'Tuần 2',
            dungGio: 32,
            diMuon: 3,
            vangMat: 2
        },
        {
            name: 'Tuần 3',
            dungGio: 34,
            diMuon: 2,
            vangMat: 1
        },
        {
            name: 'Tuần 4',
            dungGio: 34,
            diMuon: 3,
            vangMat: 1
        }
    ];

    return (
        <ResponsiveContainer width="100%" height="100%">
            <BarChart
                data={chartData}
                margin={{
                    top: 20,
                    right: 30,
                    left: 20,
                    bottom: 5
                }}
            >
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Bar dataKey="dungGio" name="Đúng giờ" fill="#4caf50" />
                <Bar dataKey="diMuon" name="Đi muộn" fill="#ff9800" />
                <Bar dataKey="vangMat" name="Vắng mặt" fill="#f44336" />
            </BarChart>
        </ResponsiveContainer>
    );
};

export default Chart;
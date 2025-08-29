// src/components/charts/SalesByCategoryChart.jsx
import React from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from 'recharts';

const COLORS = ['#1890ff', '#13c2c2', '#722ed1', '#faad14', '#52c41a', '#f5222d'];

const SalesByCategoryChart = ({ data }) => {
    const totalRevenue = data.reduce((sum, entry) => sum + parseFloat(entry.value), 0);
    return (
        <div style={{ width: '100%', height: 400 }}>
            <ResponsiveContainer>
                <PieChart>
                    <Pie data={data} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={120} fill="#8884d8">
                        {data.map((entry, index) => <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />)}
                    </Pie>
                    <Tooltip formatter={(value) => {
                        const percent = totalRevenue > 0 ? (value / totalRevenue * 100).toFixed(1) : 0;
                        return [`$${value.toFixed(2)} (${percent}%)`];
                    }} />
                    <Legend />
                </PieChart>
            </ResponsiveContainer>
        </div>
    );
};
export default SalesByCategoryChart;
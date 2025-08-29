// src/components/charts/RevenueTrendChart.jsx
import React from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

import dayjs from 'dayjs';


const RevenueTrendChart = ({ data }) => {
  const formattedData = data.map(item => ({
    ...item,
    date: dayjs(item.date).format('MMM D'),
    value: parseFloat(item.value), // Keep as number for chart
  }));

  return (
    <div style={{ width: '100%', height: 300 }}>
      <ResponsiveContainer>
        <LineChart data={formattedData} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
          <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f0f0f0" />
          <XAxis dataKey="date" tickLine={false} axisLine={{ stroke: '#d9d9d9' }} />
          <YAxis tickLine={false} axisLine={{ stroke: '#d9d9d9' }} tickFormatter={(value) => `$${value}`} />
          <Tooltip 
            formatter={(value) => [`$${value.toFixed(2)}`, 'Revenue']}
            labelFormatter={(label) => `Date: ${label}`}
            contentStyle={{ borderRadius: 4, boxShadow: '0 2px 8px rgba(0,0,0,0.15)', border: 'none' }}
          />
          <Line type="monotone" dataKey="value" stroke="#52c41a" strokeWidth={2} dot={{ r: 4 }} activeDot={{ r: 6 }} name="Revenue" />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
};

export default RevenueTrendChart;
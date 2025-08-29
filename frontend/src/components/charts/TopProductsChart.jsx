import React from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';

const COLORS = ['#1890ff', '#13c2c2', '#722ed1', '#faad14', '#52c41a'];

const TopProductsChart = ({ data }) => {
  const chartData = data.map(item => ({
    name: `${item.variant__product__brand || ''} - ${item.variant__product__name}`,
    revenue: parseFloat(item.product_revenue)
  }));

  return (
    <div style={{ width: '100%', height: 400 }}>
      <ResponsiveContainer>
        <BarChart data={chartData} layout="vertical" margin={{ top: 5, right: 30, left: 100, bottom: 5 }}>
          <CartesianGrid strokeDasharray="3 3" horizontal={false} />
          <XAxis type="number" tickFormatter={(value) => `$${value}`} />
          <YAxis dataKey="name" type="category" tick={{ fontSize: 12, width: 150 }} />
          <Tooltip formatter={(value) => [`$${value.toFixed(2)}`, 'Revenue']} />
          <Bar dataKey="revenue" barSize={20}>
            {chartData.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
};
export default TopProductsChart;


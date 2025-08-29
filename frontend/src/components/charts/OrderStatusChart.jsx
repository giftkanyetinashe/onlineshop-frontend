// src/components/charts/OrderStatusChart.jsx
import React, { useState, useMemo } from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend, BarChart, Bar, XAxis, YAxis, CartesianGrid } from 'recharts';
import { Typography, Segmented, Empty } from 'antd';
import { 
  PieChartOutlined, 
  BarChartOutlined,
  ClockCircleOutlined, 
  SyncOutlined, 
  CheckCircleOutlined, 
  CloseCircleOutlined, 
  TruckOutlined 
} from '@ant-design/icons';

const { Text } = Typography;

// Status metadata with colors, icons, and full labels
const STATUS_META = {
  P: { 
    color: '#1890ff', 
    icon: <ClockCircleOutlined />,
    label: 'Pending'
  },
  OH: { 
    color: '#faad14', 
    icon: <SyncOutlined />,
    label: 'On Hold'
  },
  PR: { 
    color: '#722ed1', 
    icon: <SyncOutlined />,
    label: 'Processing'
  },
  S: { 
    color: '#13c2c2', 
    icon: <TruckOutlined />,
    label: 'Shipped'
  },
  D: { 
    color: '#52c41a', 
    icon: <CheckCircleOutlined />,
    label: 'Delivered'
  },
  C: { 
    color: '#f5222d', 
    icon: <CloseCircleOutlined />,
    label: 'Cancelled'
  },
};

const CustomLegend = ({ payload }) => (
  <div style={{ 
    display: 'flex', 
    justifyContent: 'center', 
    flexWrap: 'wrap', 
    marginTop: 16,
    gap: '12px'
  }}>
    {payload.map((entry, index) => (
      <div 
        key={`legend-${index}`} 
        style={{ 
          display: 'flex', 
          alignItems: 'center', 
          fontSize: 12 
        }}
      >
        <span style={{ 
          display: 'inline-block', 
          width: 12, 
          height: 12, 
          backgroundColor: entry.color, 
          marginRight: 8, 
          borderRadius: 2 
        }} />
        {STATUS_META[entry.value]?.icon}
        <Text style={{ marginLeft: 4 }}>
          {STATUS_META[entry.value]?.label} ({entry.payload.count})
        </Text>
      </div>
    ))}
  </div>
);

const OrderStatusChart = ({ data }) => {
  const [chartType, setChartType] = useState('pie');
  
  // Process data with memoization for performance
  const { chartData, totalOrders } = useMemo(() => {
    const filteredData = data
      .filter(entry => entry.count > 0)
      .map(entry => ({
        ...entry,
        label: STATUS_META[entry.value]?.label || entry.value
      }));
      
    const total = filteredData.reduce((sum, entry) => sum + entry.count, 0);
    return { chartData: filteredData, totalOrders: total };
  }, [data]);

  const renderPieLabel = ({ percent, value }) => {
    if (totalOrders === 0) return null;
    const percentage = percent * 100;
    // Only show label if percentage is significant and value is not zero
    return percentage >= 5 ? `${percentage.toFixed(0)}%` : null;
  };

  if (chartData.length === 0) {
    return (
      <div style={{ 
        height: 350, 
        display: 'flex', 
        alignItems: 'center', 
        justifyContent: 'center' 
      }}>
        <Empty 
          description="No order data available" 
          image={Empty.PRESENTED_IMAGE_SIMPLE} 
        />
      </div>
    );
  }

  return (
    <div style={{ width: '100%', height: 350 }}>
      <div style={{ 
        display: 'flex', 
        justifyContent: 'space-between', 
        alignItems: 'center',
        marginBottom: 16 
      }}>
        <Text strong>Order Status Distribution</Text>
        <Segmented
          options={[
            { value: 'pie', icon: <PieChartOutlined />, tooltip: 'Pie Chart' },
            { value: 'bar', icon: <BarChartOutlined />, tooltip: 'Bar Chart' },
          ]}
          value={chartType}
          onChange={setChartType}
        />
      </div>

      <ResponsiveContainer width="100%" height="100%">
        {chartType === 'pie' ? (
          <PieChart>
            <Pie
              data={chartData}
              cx="50%"
              cy="50%"
              labelLine={false}
              label={renderPieLabel}
              outerRadius={80}
              innerRadius={60}
              paddingAngle={2}
              dataKey="count"
              nameKey="label"
              animationDuration={500}
            >
              {chartData.map((entry) => (
                <Cell 
                  key={`cell-${entry.value}`} 
                  fill={STATUS_META[entry.value]?.color || '#8884d8'} 
                  stroke="#fff"
                />
              ))}
            </Pie>
            <Tooltip
              formatter={(value, name, props) => {
                const percent = totalOrders > 0 
                  ? (value / totalOrders * 100).toFixed(1) 
                  : 0;
                return [
                  `${value} orders (${percent}%)`, 
                  name || props.payload.label
                ];
              }}
            />
            <Legend content={<CustomLegend />} />
          </PieChart>
        ) : (
          <BarChart 
            data={chartData} 
            margin={{ top: 20, right: 20, left: 0, bottom: 5 }}
            layout="vertical"
          >
            <CartesianGrid 
              strokeDasharray="3 3" 
              horizontal={true} 
              vertical={false} 
            />
            <XAxis 
              type="number" 
              tick={{ fontSize: 12 }}
              axisLine={false}
            />
            <YAxis 
              dataKey="label" 
              type="category" 
              tick={{ fontSize: 12 }}
              width={100}
              axisLine={false}
            />
            <Tooltip
              cursor={{ fill: 'rgba(0, 0, 0, 0.05)' }}
              formatter={(value, name, props) => {
                const percent = totalOrders > 0 
                  ? (value / totalOrders * 100).toFixed(1) 
                  : 0;
                return [`${value} orders (${percent}%)`, name];
              }}
            />
            <Bar 
              dataKey="count" 
              name="Orders" 
              barSize={24}
              radius={[0, 4, 4, 0]}
            >
              {chartData.map((entry) => (
                <Cell 
                  key={`cell-${entry.value}`} 
                  fill={STATUS_META[entry.value]?.color || '#8884d8'} 
                />
              ))}
            </Bar>
          </BarChart>
        )}
      </ResponsiveContainer>
    </div>
  );
};

export default OrderStatusChart;
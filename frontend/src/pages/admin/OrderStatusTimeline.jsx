// src/components/OrderStatusTimeline.jsx
import React from 'react';
import { Timeline, Tag } from 'antd';
import { 
  ClockCircleOutlined, SyncOutlined, CheckCircleOutlined, 
  CloseCircleOutlined, TruckOutlined 
} from '@ant-design/icons';

const statusSequence = [
  { key: 'P', label: 'Pending', icon: <ClockCircleOutlined />, color: 'blue' },
  { key: 'OH', label: 'On Hold', icon: <SyncOutlined spin />, color: 'orange' },
  { key: 'PR', label: 'Processing', icon: <SyncOutlined />, color: 'purple' },
  { key: 'S', label: 'Shipped', icon: <TruckOutlined />, color: 'cyan' },
  { key: 'D', label: 'Delivered', icon: <CheckCircleOutlined />, color: 'green' },
  { key: 'C', label: 'Cancelled', icon: <CloseCircleOutlined />, color: 'red' },
];

const OrderStatusTimeline = ({ currentStatus }) => {
  const currentIndex = statusSequence.findIndex(s => s.key === currentStatus);

  return (
    <Timeline mode="left">
      {statusSequence.map((status, index) => (
        <Timeline.Item
          key={status.key}
          dot={
            <Tag 
              color={index <= currentIndex ? status.color : 'default'}
              icon={status.icon}
              style={{ 
                margin: 0,
                opacity: index <= currentIndex ? 1 : 0.5 
              }}
            >
              {status.label}
            </Tag>
          }
        >
          {index === currentIndex && (
            <span style={{ color: status.color }}>
              Current Status
            </span>
          )}
        </Timeline.Item>
      ))}
    </Timeline>
  );
};

export default OrderStatusTimeline;
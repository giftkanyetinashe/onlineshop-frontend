// src/components/OrderNotes.jsx
import React, { useState } from 'react';
import { List, Comment, Input, Button, Form, Avatar, message } from 'antd';
import { UserOutlined } from '@ant-design/icons';
import api from '../../services/api';

const { TextArea } = Input;

const OrderNotes = ({ orderId, initialNotes }) => {
  const [notes, setNotes] = useState(initialNotes);
  const [loading, setLoading] = useState(false);
  const [form] = Form.useForm();

  const handleAddNote = async (values) => {
    try {
      setLoading(true);
      const response = await api.post(`/orders/orders/${orderId}/notes/`, values);
      setNotes([...notes, response.data]);
      form.resetFields();
      message.success('Note added successfully');
    } catch (error) {
      message.error('Failed to add note');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ padding: 16 }}>
      <List
        dataSource={notes}
        renderItem={note => (
          <Comment
            author={note.staff_member || 'System'}
            avatar={<Avatar icon={<UserOutlined />} />}
            content={<p>{note.content}</p>}
            datetime={new Date(note.created_at).toLocaleString()}
          />
        )}
      />
      <Form form={form} onFinish={handleAddNote}>
        <Form.Item name="content" rules={[{ required: true, message: 'Please enter a note' }]}>
          <TextArea rows={4} placeholder="Add a note about this order..." />
        </Form.Item>
        <Form.Item>
          <Button type="primary" htmlType="submit" loading={loading}>
            Add Note
          </Button>
        </Form.Item>
      </Form>
    </div>
  );
};

export default OrderNotes;
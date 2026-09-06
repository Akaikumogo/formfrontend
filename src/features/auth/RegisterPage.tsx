import { Alert, Button, Form, Input, Typography, message } from 'antd';
import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { registerTeacher } from '../../api/auth';
import { getErrorMessage } from '../../api/client';
import { useAuth } from '../../hooks/useAuth';

export default function RegisterPage() {
  const navigate = useNavigate();
  const { acceptSession } = useAuth();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const onFinish = async (values: Record<string, string>) => {
    setLoading(true);
    setError('');
    try {
      const res = await registerTeacher(values);
      acceptSession(res.accessToken, res.user);
      message.success('Hisob yaratildi');
      navigate('/teacher/dashboard');
    } catch (e) {
      setError(getErrorMessage(e, "Ro‘yxatdan o‘tish amalga oshmadi"));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      className="min-h-full flex items-center justify-center px-4 py-10"
      style={{
        background:
          'linear-gradient(160deg, #0B1F3A 0%, #132D52 45%, #1B4F8A 100%)',
      }}
    >
      <div className="w-full max-w-md bg-white border p-8" style={{ borderColor: '#D0D5DD' }}>
        <Typography.Text className="!text-xs tracking-[0.2em] text-slate-500">
          FORM ADMINISTRATION
        </Typography.Text>
        <Typography.Title level={3} style={{ marginTop: 8 }}>
          O‘qituvchi sifatida boshlash
        </Typography.Title>
        <Typography.Paragraph type="secondary">
          Bepul hisob yarating. Rol avtomatik — o‘qituvchi.
        </Typography.Paragraph>
        {error && <Alert type="error" message={error} className="mb-4" showIcon />}
        <Form layout="vertical" onFinish={onFinish} requiredMark={false}>
          <div className="grid grid-cols-2 gap-3">
            <Form.Item name="firstName" label="Ism" rules={[{ required: true }]}>
              <Input />
            </Form.Item>
            <Form.Item name="lastName" label="Familiya" rules={[{ required: true }]}>
              <Input />
            </Form.Item>
          </div>
          <Form.Item
            name="email"
            label="Email"
            rules={[{ required: true, type: 'email' }]}
          >
            <Input />
          </Form.Item>
          <Form.Item name="phone" label="Telefon (ixtiyoriy)">
            <Input placeholder="+998..." />
          </Form.Item>
          <Form.Item
            name="password"
            label="Parol"
            rules={[{ required: true, min: 6 }]}
          >
            <Input.Password />
          </Form.Item>
          <Form.Item
            name="confirmPassword"
            label="Parolni tasdiqlang"
            dependencies={['password']}
            rules={[
              { required: true },
              ({ getFieldValue }) => ({
                validator(_, value) {
                  if (!value || getFieldValue('password') === value) {
                    return Promise.resolve();
                  }
                  return Promise.reject(new Error('Parollar mos kelmadi'));
                },
              }),
            ]}
          >
            <Input.Password />
          </Form.Item>
          <Button type="primary" htmlType="submit" block size="large" loading={loading}>
            Ro‘yxatdan o‘tish
          </Button>
        </Form>
        <div className="mt-4 text-center text-sm">
          Hisobingiz bormi? <Link to="/login">Kirish</Link>
        </div>
      </div>
    </div>
  );
}

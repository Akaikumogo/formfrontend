import { Alert, Button, Card, Form, Input, Typography, message } from 'antd';
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import { getErrorMessage } from '../../api/client';
import type { UserRole } from '../../types';

function homeFor(role: UserRole) {
  if (role === 'SUPER_ADMIN') return '/admin/dashboard';
  if (role === 'TEACHER') return '/teacher/dashboard';
  return '/student/dashboard';
}

export default function LoginPage() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const onFinish = async (values: { email: string; password: string }) => {
    setLoading(true);
    setError('');
    try {
      const user = await login(values.email, values.password);
      message.success('Xush kelibsiz');
      navigate(homeFor(user.role));
    } catch (e) {
      setError(getErrorMessage(e, "Email yoki parol noto'g'ri"));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      className="min-h-full flex items-center justify-center px-4"
      style={{
        background:
          'linear-gradient(160deg, #0B1F3A 0%, #132D52 45%, #1B4F8A 100%)',
      }}
    >
      <Card
        style={{ width: 420, borderRadius: 4 }}
        styles={{ body: { padding: 32 } }}
      >
        <div className="mb-6 text-center">
          <Typography.Text className="!text-xs tracking-[0.2em] text-slate-500">
            FORM ADMINISTRATION
          </Typography.Text>
          <Typography.Title level={3} style={{ marginTop: 8 }}>
            Tizimga kirish
          </Typography.Title>
          <Typography.Paragraph type="secondary">
            Markaziy forma boshqaruv platformasi
          </Typography.Paragraph>
        </div>
        {error && (
          <Alert type="error" message={error} className="mb-4" showIcon />
        )}
        <Form layout="vertical" onFinish={onFinish} requiredMark={false}>
          <Form.Item
            name="email"
            label="Email"
            rules={[{ required: true, type: 'email' }]}
          >
            <Input size="large" placeholder="admin@admin.com" />
          </Form.Item>
          <Form.Item
            name="password"
            label="Parol"
            rules={[{ required: true }]}
          >
            <Input.Password size="large" placeholder="••••••••" />
          </Form.Item>
          <Button
            type="primary"
            htmlType="submit"
            size="large"
            block
            loading={loading}
          >
            Kirish
          </Button>
        </Form>
      </Card>
    </div>
  );
}

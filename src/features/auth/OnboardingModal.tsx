import { Button, Modal, Steps, Typography } from 'antd';
import { useNavigate } from 'react-router-dom';
import { useState } from 'react';
import { useAuth } from '../../hooks/useAuth';
import { completeOnboarding } from '../../api/auth';
import { getErrorMessage } from '../../api/client';
import { message } from 'antd';

const steps = [
  {
    title: 'Xush kelibsiz!',
    description:
      'Form Administration — ochiq kodli va bepul platforma. Guruhlar, formalar va javoblarni bitta joyda boshqaring.',
  },
  {
    title: 'Guruhingizni yarating',
    description: 'Avval kurs yoki sinfingiz uchun guruh oching (masalan, 301-A).',
  },
  {
    title: 'Talabalarni qo‘shing',
    description: 'Guruhga talabalarni qo‘lda yoki CSV orqali qo‘shing.',
  },
  {
    title: 'Birinchi formangizni yarating',
    description: 'Savollarni sozlang, guruhga biriktiring va nashr qiling.',
  },
];

export default function OnboardingModal() {
  const { user, refreshUser } = useAuth();
  const navigate = useNavigate();
  const [current, setCurrent] = useState(0);
  const [loading, setLoading] = useState(false);

  const visible =
    user?.role === 'TEACHER' &&
    user.teacherProfile &&
    user.teacherProfile.onboardingCompleted === false;

  const finish = async (goTo?: string) => {
    setLoading(true);
    try {
      await completeOnboarding();
      await refreshUser();
      if (goTo) navigate(goTo);
    } catch (e) {
      message.error(getErrorMessage(e));
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal
      open={!!visible}
      closable={false}
      footer={null}
      width={560}
      title="Boshlash"
    >
      <Steps
        current={current}
        size="small"
        className="mb-6"
        items={steps.map((s) => ({ title: s.title }))}
      />
      <Typography.Title level={4}>{steps[current].title}</Typography.Title>
      <Typography.Paragraph type="secondary">
        {steps[current].description}
      </Typography.Paragraph>
      <div className="flex justify-between mt-6">
        <Button type="link" loading={loading} onClick={() => finish()}>
          O‘tkazib yuborish
        </Button>
        <div className="flex gap-2">
          {current > 0 && (
            <Button onClick={() => setCurrent((c) => c - 1)}>Orqaga</Button>
          )}
          {current < steps.length - 1 ? (
            <Button type="primary" onClick={() => setCurrent((c) => c + 1)}>
              Keyingi
            </Button>
          ) : (
            <Button
              type="primary"
              loading={loading}
              onClick={() => finish('/teacher/groups')}
            >
              Guruh yaratish
            </Button>
          )}
        </div>
      </div>
    </Modal>
  );
}

import { useMutation, useQuery } from '@tanstack/react-query';
import {
  Alert,
  Button,
  DatePicker,
  Form,
  Input,
  InputNumber,
  Rate,
  Select,
  Spin,
  Switch,
  Typography,
  message,
} from 'antd';
import { useNavigate, useParams } from 'react-router-dom';
import dayjs from 'dayjs';
import { formsApi } from '../../api/forms';
import { responsesApi } from '../../api';
import { getErrorMessage } from '../../api/client';
import type { FormField } from '../../types';
import { useAuth } from '../../hooks/useAuth';

function FieldInput({ field }: { field: FormField }) {
  const options = Array.isArray(field.config?.options)
    ? (field.config!.options as string[]).map((o) => ({ label: o, value: o }))
    : [];

  switch (field.type) {
    case 'LONG_TEXT':
      return <Input.TextArea rows={4} placeholder={field.placeholder || ''} />;
    case 'NUMBER':
      return <InputNumber className="w-full" placeholder={field.placeholder || ''} />;
    case 'EMAIL':
      return <Input type="email" placeholder={field.placeholder || ''} />;
    case 'PHONE':
      return <Input placeholder={field.placeholder || '+998...'} />;
    case 'DATE':
      return <DatePicker className="w-full" />;
    case 'DATETIME':
      return <DatePicker showTime className="w-full" />;
    case 'SINGLE_SELECT':
      return <Select options={options} placeholder="Tanlang" />;
    case 'MULTI_SELECT':
      return <Select mode="multiple" options={options} placeholder="Tanlang" />;
    case 'YES_NO':
      return <Switch checkedChildren="Ha" unCheckedChildren="Yo‘q" />;
    case 'RATING':
      return <Rate />;
    default:
      return <Input placeholder={field.placeholder || ''} />;
  }
}

export default function PublicFormPage() {
  const { publicId = '' } = useParams();
  const { user, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const [form] = Form.useForm();

  const { data, isLoading, error } = useQuery({
    queryKey: ['public-form', publicId],
    queryFn: () => formsApi.getPublic(publicId),
    enabled: isAuthenticated && !!publicId,
    retry: false,
  });

  const submit = useMutation({
    mutationFn: async (values: Record<string, unknown>) => {
      const answers = (data.fields as FormField[]).map((f) => {
        let value = values[f.id];
        if (dayjs.isDayjs(value)) {
          value = value.toISOString();
        } else if (typeof value === 'boolean') {
          value = value ? 'Ha' : "Yo'q";
        } else if (Array.isArray(value)) {
          value = JSON.stringify(value);
        } else if (value === undefined || value === null) {
          value = '';
        } else {
          value = String(value);
        }
        return { fieldId: f.id, value: String(value) };
      });
      return responsesApi.submitPublic(publicId, answers);
    },
    onSuccess: () => {
      message.success('Javobingiz qabul qilindi.');
      form.resetFields();
    },
    onError: (e) => message.error(getErrorMessage(e)),
  });

  if (!isAuthenticated) {
    return (
      <div className="min-h-full flex items-center justify-center p-4 bg-slate-100">
        <div className="bg-white border p-6 max-w-md w-full" style={{ borderColor: '#D0D5DD' }}>
          <Typography.Title level={4}>Kirish talab qilinadi</Typography.Title>
          <Typography.Paragraph type="secondary">
            Formani to‘ldirish uchun tizimga kiring.
          </Typography.Paragraph>
          <Button type="primary" block onClick={() => navigate('/login')}>
            Kirish
          </Button>
        </div>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="min-h-full flex items-center justify-center">
        <Spin size="large" />
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="min-h-full flex items-center justify-center p-4">
        <Alert
          type="error"
          message={getErrorMessage(error, "Formani topib bo'lmadi.")}
        />
      </div>
    );
  }

  const already = data.myResponse;

  return (
    <div className="min-h-full bg-slate-100 py-6 px-4">
      <div
        className="mx-auto max-w-xl bg-white border p-5 md:p-8"
        style={{ borderColor: '#D0D5DD' }}
      >
        <Typography.Text className="!text-xs tracking-widest text-slate-500">
          FORM ADMINISTRATION
        </Typography.Text>
        <Typography.Title level={3} style={{ marginTop: 8 }}>
          {data.title}
        </Typography.Title>
        {data.description && (
          <Typography.Paragraph type="secondary">
            {data.description}
          </Typography.Paragraph>
        )}
        {user?.studentProfile && (
          <Alert
            className="mb-4"
            type="info"
            showIcon
            message={`${user.studentProfile.firstName} ${user.studentProfile.lastName}`}
          />
        )}
        {already && !data.allowEditAfterSubmit ? (
          <Alert
            type="success"
            showIcon
            message="Bu formani allaqachon to‘ldirgansiz."
            description={`Yuborilgan: ${dayjs(already.submittedAt).format('DD.MM.YYYY HH:mm')}`}
          />
        ) : (
          <Form
            form={form}
            layout="vertical"
            onFinish={(v) => submit.mutate(v)}
            disabled={submit.isPending}
          >
            {(data.fields as FormField[]).map((field) => (
              <Form.Item
                key={field.id}
                name={field.id}
                label={field.label}
                extra={field.description || undefined}
                valuePropName={
                  field.type === 'YES_NO' ? 'checked' : 'value'
                }
                rules={
                  field.required
                    ? [{ required: true, message: 'Majburiy maydon' }]
                    : undefined
                }
              >
                <FieldInput field={field} />
              </Form.Item>
            ))}
            <Button
              type="primary"
              htmlType="submit"
              block
              size="large"
              loading={submit.isPending}
            >
              {submit.isPending ? 'Yuborilmoqda...' : 'Yuborish'}
            </Button>
          </Form>
        )}
      </div>
    </div>
  );
}

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import {
  Button,
  Form,
  Input,
  Modal,
  Popconfirm,
  Select,
  Space,
  Table,
  Tag,
  Typography,
  message,
} from 'antd';
import { useState } from 'react';
import { studentsApi, teachersApi, groupsApi, auditApi, telegramApi } from '../../api';
import { getErrorMessage } from '../../api/client';
import { PageHeader } from '../../components/ui';
import { useAuth } from '../../hooks/useAuth';
import type { User } from '../../types';

type StudentProfileRow = {
  firstName?: string;
  lastName?: string;
  studentNumber?: string | null;
  phone?: string | null;
  loginPassword?: string | null;
  group?: { code?: string } | null;
  groupId?: string | null;
};

export function StudentsPage() {
  const qc = useQueryClient();
  const [search, setSearch] = useState('');
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<User | null>(null);
  const [form] = Form.useForm();
  const { user } = useAuth();
  const canEdit = user?.role === 'SUPER_ADMIN' || user?.role === 'TEACHER';

  const { data, isLoading } = useQuery({
    queryKey: ['students', search],
    queryFn: () => studentsApi.list({ search: search || undefined, limit: 100 }),
  });
  const { data: groups } = useQuery({
    queryKey: ['groups'],
    queryFn: () => groupsApi.list(),
  });

  const create = useMutation({
    mutationFn: (values: Record<string, unknown>) => studentsApi.create(values),
    onSuccess: () => {
      message.success('Talaba yaratildi');
      setOpen(false);
      form.resetFields();
      qc.invalidateQueries({ queryKey: ['students'] });
    },
    onError: (e) => message.error(getErrorMessage(e)),
  });

  const update = useMutation({
    mutationFn: ({ id, values }: { id: string; values: Record<string, unknown> }) =>
      studentsApi.update(id, values),
    onSuccess: () => {
      message.success('Yangilandi');
      setEditing(null);
      form.resetFields();
      qc.invalidateQueries({ queryKey: ['students'] });
    },
    onError: (e) => message.error(getErrorMessage(e)),
  });

  const remove = useMutation({
    mutationFn: (id: string) => studentsApi.remove(id),
    onSuccess: () => {
      message.success('O‘chirildi');
      qc.invalidateQueries({ queryKey: ['students'] });
    },
    onError: (e) => message.error(getErrorMessage(e)),
  });

  const openEdit = (row: User) => {
    const p = row.profile as StudentProfileRow | null;
    setEditing(row);
    form.setFieldsValue({
      firstName: p?.firstName,
      lastName: p?.lastName,
      email: row.email,
      studentNumber: p?.studentNumber,
      phone: p?.phone,
      groupId: p?.groupId,
      password: p?.loginPassword || undefined,
    });
  };

  return (
    <div>
      <PageHeader
        title="Talabalar"
        extra={
          canEdit && (
            <Button
              type="primary"
              onClick={() => {
                setEditing(null);
                form.resetFields();
                setOpen(true);
              }}
            >
              + Talaba
            </Button>
          )
        }
      />
      <Input.Search
        className="mb-3"
        style={{ width: 280 }}
        placeholder="Qidirish"
        onSearch={setSearch}
        allowClear
      />
      <div className="bg-white border" style={{ borderColor: '#D0D5DD' }}>
        <Table
          rowKey="id"
          loading={isLoading}
          dataSource={data?.items || []}
          scroll={{ x: 900 }}
          columns={[
            {
              title: 'F.I.Sh',
              render: (_: unknown, r: User) => {
                const p = r.profile as StudentProfileRow | null;
                return p ? `${p.firstName} ${p.lastName}` : '—';
              },
            },
            {
              title: 'Login',
              dataIndex: 'email',
              render: (email: string) => (
                <Typography.Text copyable={{ text: email }}>{email}</Typography.Text>
              ),
            },
            {
              title: 'Parol',
              render: (_: unknown, r: User) => {
                const p = r.profile as StudentProfileRow | null;
                const pwd = p?.loginPassword || '—';
                return pwd === '—' ? (
                  '—'
                ) : (
                  <Typography.Text copyable={{ text: pwd }} code>
                    {pwd}
                  </Typography.Text>
                );
              },
            },
            {
              title: 'Guruh',
              render: (_: unknown, r: User) =>
                (r.profile as StudentProfileRow | null)?.group?.code || '—',
            },
            {
              title: 'Holat',
              dataIndex: 'status',
              render: (s: string) => (
                <Tag color={s === 'ACTIVE' ? 'success' : 'default'}>{s}</Tag>
              ),
            },
            {
              title: 'Amallar',
              fixed: 'right' as const,
              width: 180,
              render: (_: unknown, r: User) =>
                canEdit ? (
                  <Space>
                    <Button size="small" onClick={() => openEdit(r)}>
                      Tahrirlash
                    </Button>
                    <Popconfirm
                      title="Talabani o‘chirish?"
                      onConfirm={() => remove.mutate(r.id)}
                    >
                      <Button size="small" danger>
                        O‘chirish
                      </Button>
                    </Popconfirm>
                  </Space>
                ) : null,
            },
          ]}
        />
      </div>

      <Modal
        title={editing ? 'Talabani tahrirlash' : 'Yangi talaba'}
        open={open || !!editing}
        onCancel={() => {
          setOpen(false);
          setEditing(null);
          form.resetFields();
        }}
        onOk={() => form.submit()}
        confirmLoading={create.isPending || update.isPending}
        okText="Saqlash"
      >
        <Form
          form={form}
          layout="vertical"
          onFinish={(v) => {
            if (editing) {
              const { email: _email, password, ...rest } = v;
              const values = {
                ...rest,
                ...(password ? { password } : {}),
              };
              update.mutate({ id: editing.id, values });
            } else {
              create.mutate(v);
            }
          }}
        >
          <Form.Item name="firstName" label="Ism" rules={[{ required: true }]}>
            <Input />
          </Form.Item>
          <Form.Item name="lastName" label="Familiya" rules={[{ required: true }]}>
            <Input />
          </Form.Item>
          <Form.Item
            name="email"
            label="Login (email)"
            rules={[{ required: !editing, type: 'email' }]}
          >
            <Input disabled={!!editing} />
          </Form.Item>
          <Form.Item
            name="password"
            label="Parol"
            rules={editing ? [] : [{ required: true, min: 4 }]}
            extra={editing ? 'Bo‘sh qoldirilsa o‘zgarmaydi' : undefined}
          >
            <Input.Password />
          </Form.Item>
          <Form.Item name="studentNumber" label="Talaba raqami">
            <Input />
          </Form.Item>
          <Form.Item name="phone" label="Telefon">
            <Input placeholder="+998..." />
          </Form.Item>
          <Form.Item name="groupId" label="Guruh">
            <Select
              allowClear
              options={(groups || []).map((g: { id: string; code: string; name: string }) => ({
                value: g.id,
                label: `${g.code} — ${g.name}`,
              }))}
            />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
}

export function TeachersPage() {
  const qc = useQueryClient();
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<User | null>(null);
  const [form] = Form.useForm();
  const { data, isLoading } = useQuery({
    queryKey: ['teachers'],
    queryFn: () => teachersApi.list({ limit: 50 }),
  });

  const create = useMutation({
    mutationFn: (values: Record<string, unknown>) => teachersApi.create(values),
    onSuccess: () => {
      message.success("O'qituvchi yaratildi");
      setOpen(false);
      form.resetFields();
      qc.invalidateQueries({ queryKey: ['teachers'] });
    },
    onError: (e) => message.error(getErrorMessage(e)),
  });

  const update = useMutation({
    mutationFn: ({ id, values }: { id: string; values: Record<string, unknown> }) =>
      teachersApi.update(id, values),
    onSuccess: () => {
      message.success('Yangilandi');
      setEditing(null);
      form.resetFields();
      qc.invalidateQueries({ queryKey: ['teachers'] });
    },
    onError: (e) => message.error(getErrorMessage(e)),
  });

  const remove = useMutation({
    mutationFn: (id: string) => teachersApi.remove(id),
    onSuccess: () => {
      message.success('O‘chirildi');
      qc.invalidateQueries({ queryKey: ['teachers'] });
    },
    onError: (e) => message.error(getErrorMessage(e)),
  });

  const openEdit = (row: User) => {
    const p = row.profile as {
      firstName?: string;
      lastName?: string;
      department?: string;
      phone?: string;
    } | null;
    setEditing(row);
    form.setFieldsValue({
      firstName: p?.firstName,
      lastName: p?.lastName,
      email: row.email,
      department: p?.department,
      phone: p?.phone,
      status: row.status,
    });
  };

  return (
    <div>
      <PageHeader
        title="O‘qituvchilar"
        extra={
          <Button
            type="primary"
            onClick={() => {
              setEditing(null);
              form.resetFields();
              setOpen(true);
            }}
          >
            + O‘qituvchi
          </Button>
        }
      />
      <div className="bg-white border" style={{ borderColor: '#D0D5DD' }}>
        <Table
          rowKey="id"
          loading={isLoading}
          dataSource={data?.items || []}
          columns={[
            {
              title: 'F.I.Sh',
              render: (_: unknown, r: User) => {
                const p = r.profile as { firstName?: string; lastName?: string } | null;
                return p ? `${p.firstName} ${p.lastName}` : '—';
              },
            },
            { title: 'Login', dataIndex: 'email' },
            {
              title: 'Bo‘lim',
              render: (_: unknown, r: User) =>
                (r.profile as { department?: string } | null)?.department || '—',
            },
            {
              title: 'Holat',
              dataIndex: 'status',
              render: (s: string) => <Tag>{s}</Tag>,
            },
            {
              title: 'Amallar',
              render: (_: unknown, r: User) => (
                <Space>
                  <Button size="small" onClick={() => openEdit(r)}>
                    Tahrirlash
                  </Button>
                  <Popconfirm
                    title="O‘qituvchini o‘chirish?"
                    onConfirm={() => remove.mutate(r.id)}
                  >
                    <Button size="small" danger>
                      O‘chirish
                    </Button>
                  </Popconfirm>
                </Space>
              ),
            },
          ]}
        />
      </div>
      <Modal
        title={editing ? 'Tahrirlash' : 'Yangi o‘qituvchi'}
        open={open || !!editing}
        onCancel={() => {
          setOpen(false);
          setEditing(null);
          form.resetFields();
        }}
        onOk={() => form.submit()}
        confirmLoading={create.isPending || update.isPending}
      >
        <Form
          form={form}
          layout="vertical"
          onFinish={(v) => {
            if (editing) {
              const { email: _e, ...rest } = v;
              update.mutate({ id: editing.id, values: rest });
            } else {
              create.mutate(v);
            }
          }}
        >
          <Form.Item name="firstName" label="Ism" rules={[{ required: true }]}>
            <Input />
          </Form.Item>
          <Form.Item name="lastName" label="Familiya" rules={[{ required: true }]}>
            <Input />
          </Form.Item>
          <Form.Item
            name="email"
            label="Email"
            rules={[{ required: !editing, type: 'email' }]}
          >
            <Input disabled={!!editing} />
          </Form.Item>
          <Form.Item
            name="password"
            label="Parol"
            rules={editing ? [] : [{ required: true }]}
            extra={editing ? 'Bo‘sh qoldirilsa o‘zgarmaydi' : undefined}
          >
            <Input.Password />
          </Form.Item>
          <Form.Item name="department" label="Bo‘lim">
            <Input />
          </Form.Item>
          {editing && (
            <Form.Item name="status" label="Holat">
              <Select
                options={[
                  { value: 'ACTIVE', label: 'ACTIVE' },
                  { value: 'INACTIVE', label: 'INACTIVE' },
                ]}
              />
            </Form.Item>
          )}
        </Form>
      </Modal>
    </div>
  );
}

export function TelegramPage() {
  const [form] = Form.useForm();
  const { data, isLoading } = useQuery({
    queryKey: ['telegram'],
    queryFn: telegramApi.getConfig,
  });

  const save = useMutation({
    mutationFn: (values: Record<string, unknown>) => telegramApi.updateConfig(values),
    onSuccess: () => message.success('Saqlandi'),
    onError: (e) => message.error(getErrorMessage(e)),
  });

  const test = useMutation({
    mutationFn: telegramApi.test,
    onSuccess: (r) => message.success(`Bot: @${r.bot?.username || 'ok'}`),
    onError: (e) => message.error(getErrorMessage(e)),
  });

  const sendTest = useMutation({
    mutationFn: telegramApi.sendTest,
    onSuccess: () => message.success('Test xabar yuborildi'),
    onError: (e) => message.error(getErrorMessage(e)),
  });

  return (
    <div>
      <PageHeader
        title="Telegram"
        subtitle="Bot token va guruh sozlamalari"
      />
      <div
        className="bg-white border p-6 max-w-xl"
        style={{ borderColor: '#D0D5DD' }}
      >
        {data?.configured && (
          <div className="mb-4 text-sm text-slate-600">
            Token: <code>{data.tokenMasked}</code>
          </div>
        )}
        <Form
          form={form}
          layout="vertical"
          onFinish={(v) => save.mutate(v)}
          initialValues={{
            groupChatId: data?.groupChatId,
            messageTemplate: data?.messageTemplate,
            isActive: data?.isActive ?? true,
          }}
          key={data?.updatedAt || 'new'}
        >
          <Form.Item
            name="botToken"
            label="Bot Token"
            extra="Saqlangandan keyin token qayta ko‘rsatilmaydi"
          >
            <Input.Password placeholder={data?.configured ? 'Yangi token (ixtiyoriy)' : '123456:ABC...'} />
          </Form.Item>
          <Form.Item name="groupChatId" label="Telegram Group ID">
            <Input placeholder="-100..." />
          </Form.Item>
          <Form.Item name="messageTemplate" label="Xabar shabloni">
            <Input.TextArea rows={4} placeholder="Ixtiyoriy maxsus matn" />
          </Form.Item>
          <div className="flex flex-wrap gap-2">
            <Button type="primary" htmlType="submit" loading={save.isPending || isLoading}>
              Saqlash
            </Button>
            <Button onClick={() => test.mutate()} loading={test.isPending}>
              Ulanishni tekshirish
            </Button>
            <Button onClick={() => sendTest.mutate()} loading={sendTest.isPending}>
              Test xabar
            </Button>
          </div>
        </Form>
      </div>
    </div>
  );
}

export function AuditPage() {
  const { data, isLoading } = useQuery({
    queryKey: ['audit'],
    queryFn: () => auditApi.list({ limit: 50 }),
  });

  return (
    <div>
      <PageHeader title="Audit jurnali" />
      <div className="bg-white border" style={{ borderColor: '#D0D5DD' }}>
        <Table
          rowKey="id"
          loading={isLoading}
          dataSource={data?.items || []}
          columns={[
            {
              title: 'Sana',
              dataIndex: 'createdAt',
              render: (v: string) => new Date(v).toLocaleString(),
            },
            {
              title: 'Foydalanuvchi',
              render: (_: unknown, r: { user?: { email?: string } }) =>
                r.user?.email || '—',
            },
            { title: 'Amal', dataIndex: 'action' },
            { title: 'Obyekt', dataIndex: 'entity' },
            { title: 'ID', dataIndex: 'entityId', ellipsis: true },
          ]}
        />
      </div>
    </div>
  );
}

export function ProfilePage() {
  const { user } = useAuth();
  return (
    <div>
      <PageHeader title="Profil" />
      <div
        className="bg-white border p-6 max-w-lg"
        style={{ borderColor: '#D0D5DD' }}
      >
        <p>
          <strong>Email:</strong> {user?.email}
        </p>
        <p>
          <strong>Rol:</strong> {user?.role}
        </p>
        <p>
          <strong>Holat:</strong> {user?.status}
        </p>
        {user?.teacherProfile && (
          <p>
            <strong>Ism:</strong> {user.teacherProfile.firstName}{' '}
            {user.teacherProfile.lastName}
          </p>
        )}
        {user?.studentProfile && (
          <p>
            <strong>Ism:</strong> {user.studentProfile.firstName}{' '}
            {user.studentProfile.lastName}
            <br />
            <strong>Guruh:</strong> {user.studentProfile.group?.code || '—'}
          </p>
        )}
      </div>
    </div>
  );
}

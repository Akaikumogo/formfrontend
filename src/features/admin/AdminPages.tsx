import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Button, Form, Input, Modal, Select, Table, Tag, message } from 'antd';
import { useState } from 'react';
import { studentsApi, teachersApi, groupsApi, auditApi, telegramApi } from '../../api';
import { getErrorMessage } from '../../api/client';
import { PageHeader } from '../../components/ui';
import { useAuth } from '../../hooks/useAuth';
import type { User } from '../../types';

export function StudentsPage() {
  const qc = useQueryClient();
  const [search, setSearch] = useState('');
  const [open, setOpen] = useState(false);
  const [form] = Form.useForm();
  const { user } = useAuth();
  const canEdit = user?.role === 'SUPER_ADMIN';

  const { data, isLoading } = useQuery({
    queryKey: ['students', search],
    queryFn: () => studentsApi.list({ search: search || undefined, limit: 50 }),
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

  return (
    <div>
      <PageHeader
        title="Talabalar"
        extra={
          canEdit && (
            <Button type="primary" onClick={() => setOpen(true)}>
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
          columns={[
            {
              title: 'F.I.Sh',
              render: (_: unknown, r: User) => {
                const p = r.profile as { firstName?: string; lastName?: string } | null;
                return p ? `${p.firstName} ${p.lastName}` : '—';
              },
            },
            { title: 'Email', dataIndex: 'email' },
            {
              title: 'Guruh',
              render: (_: unknown, r: User) =>
                (r.profile as { group?: { code?: string } } | null)?.group?.code || '—',
            },
            {
              title: 'Holat',
              dataIndex: 'status',
              render: (s: string) => (
                <Tag color={s === 'ACTIVE' ? 'success' : 'default'}>{s}</Tag>
              ),
            },
          ]}
        />
      </div>
      <Modal
        title="Yangi talaba"
        open={open}
        onCancel={() => setOpen(false)}
        onOk={() => form.submit()}
        confirmLoading={create.isPending}
        okText="Saqlash"
      >
        <Form form={form} layout="vertical" onFinish={(v) => create.mutate(v)}>
          <Form.Item name="firstName" label="Ism" rules={[{ required: true }]}>
            <Input />
          </Form.Item>
          <Form.Item name="lastName" label="Familiya" rules={[{ required: true }]}>
            <Input />
          </Form.Item>
          <Form.Item name="email" label="Email" rules={[{ required: true, type: 'email' }]}>
            <Input />
          </Form.Item>
          <Form.Item name="password" label="Parol" rules={[{ required: true, min: 4 }]}>
            <Input.Password />
          </Form.Item>
          <Form.Item name="studentNumber" label="Talaba raqami">
            <Input />
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

  return (
    <div>
      <PageHeader
        title="O‘qituvchilar"
        extra={
          <Button type="primary" onClick={() => setOpen(true)}>
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
            { title: 'Email', dataIndex: 'email' },
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
          ]}
        />
      </div>
      <Modal
        title="Yangi o‘qituvchi"
        open={open}
        onCancel={() => setOpen(false)}
        onOk={() => form.submit()}
        confirmLoading={create.isPending}
      >
        <Form form={form} layout="vertical" onFinish={(v) => create.mutate(v)}>
          <Form.Item name="firstName" label="Ism" rules={[{ required: true }]}>
            <Input />
          </Form.Item>
          <Form.Item name="lastName" label="Familiya" rules={[{ required: true }]}>
            <Input />
          </Form.Item>
          <Form.Item name="email" label="Email" rules={[{ required: true, type: 'email' }]}>
            <Input />
          </Form.Item>
          <Form.Item name="password" label="Parol" rules={[{ required: true }]}>
            <Input.Password />
          </Form.Item>
          <Form.Item name="department" label="Bo‘lim">
            <Input />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
}

export function GroupsPage() {
  const qc = useQueryClient();
  const { user } = useAuth();
  const canEdit = user?.role === 'SUPER_ADMIN';
  const [open, setOpen] = useState(false);
  const [form] = Form.useForm();
  const { data, isLoading } = useQuery({
    queryKey: ['groups'],
    queryFn: () => groupsApi.list(),
  });

  const create = useMutation({
    mutationFn: (values: Record<string, unknown>) => groupsApi.create(values),
    onSuccess: () => {
      message.success('Guruh yaratildi');
      setOpen(false);
      form.resetFields();
      qc.invalidateQueries({ queryKey: ['groups'] });
    },
    onError: (e) => message.error(getErrorMessage(e)),
  });

  return (
    <div>
      <PageHeader
        title="Guruhlar"
        extra={
          canEdit && (
            <Button type="primary" onClick={() => setOpen(true)}>
              + Guruh
            </Button>
          )
        }
      />
      <div className="bg-white border" style={{ borderColor: '#D0D5DD' }}>
        <Table
          rowKey="id"
          loading={isLoading}
          dataSource={data || []}
          columns={[
            { title: 'Kod', dataIndex: 'code' },
            { title: 'Nomi', dataIndex: 'name' },
            {
              title: 'Talabalar',
              render: (_: unknown, r: { _count?: { students?: number; assignments?: number } }) =>
                r._count?.students ?? 0,
            },
            {
              title: 'Formalar',
              render: (_: unknown, r: { _count?: { students?: number; assignments?: number } }) =>
                r._count?.assignments ?? 0,
            },
          ]}
        />
      </div>
      <Modal
        title="Yangi guruh"
        open={open}
        onCancel={() => setOpen(false)}
        onOk={() => form.submit()}
        confirmLoading={create.isPending}
      >
        <Form form={form} layout="vertical" onFinish={(v) => create.mutate(v)}>
          <Form.Item name="code" label="Kod" rules={[{ required: true }]}>
            <Input placeholder="3-26" />
          </Form.Item>
          <Form.Item name="name" label="Nomi" rules={[{ required: true }]}>
            <Input />
          </Form.Item>
          <Form.Item name="description" label="Tavsif">
            <Input.TextArea />
          </Form.Item>
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

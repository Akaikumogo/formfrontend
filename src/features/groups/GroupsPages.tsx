import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import {
  Button,
  Form,
  Input,
  Modal,
  Space,
  Table,
  Tabs,
  Tag,
  Upload,
  message,
} from 'antd';
import { useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import dayjs from 'dayjs';
import { groupsApi, studentsApi } from '../../api';
import { getErrorMessage } from '../../api/client';
import { PageHeader, StatCard } from '../../components/ui';
import { useAuth } from '../../hooks/useAuth';

export function GroupsPage() {
  const { user } = useAuth();
  const canEdit =
    user?.role === 'SUPER_ADMIN' || user?.role === 'TEACHER';
  const navigate = useNavigate();
  const qc = useQueryClient();
  const [search, setSearch] = useState('');
  const [open, setOpen] = useState(false);
  const [form] = Form.useForm();
  const base = user?.role === 'SUPER_ADMIN' ? '/admin' : '/teacher';

  const { data, isLoading } = useQuery({
    queryKey: ['groups', search],
    queryFn: () => groupsApi.list({ search: search || undefined }),
  });

  const create = useMutation({
    mutationFn: (values: Record<string, unknown>) => groupsApi.create(values),
    onSuccess: (g: { id: string }) => {
      message.success('Guruh yaratildi');
      setOpen(false);
      form.resetFields();
      qc.invalidateQueries({ queryKey: ['groups'] });
      navigate(`${base}/groups/${g.id}`);
    },
    onError: (e) => message.error(getErrorMessage(e)),
  });

  const remove = useMutation({
    mutationFn: (id: string) => groupsApi.remove(id),
    onSuccess: () => {
      message.success('O‘chirildi');
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
              + Yangi guruh
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
          dataSource={data || []}
          columns={[
            {
              title: 'Nomi',
              dataIndex: 'name',
              render: (t: string, r: any) => (
                <Link to={`${base}/groups/${r.id}`}>{t}</Link>
              ),
            },
            { title: 'Kod', dataIndex: 'code' },
            {
              title: 'Talabalar',
              render: (_: unknown, r: any) => r._count?.students ?? 0,
            },
            {
              title: 'Formalar',
              render: (_: unknown, r: any) => r._count?.assignments ?? 0,
            },
            {
              title: 'Yaratilgan',
              dataIndex: 'createdAt',
              render: (v: string) => dayjs(v).format('DD.MM.YYYY'),
            },
            {
              title: 'Amallar',
              render: (_: unknown, r: any) => (
                <Space>
                  <Button size="small" onClick={() => navigate(`${base}/groups/${r.id}`)}>
                    Ochish
                  </Button>
                  {canEdit && (
                    <Button
                      size="small"
                      danger
                      onClick={() => remove.mutate(r.id)}
                    >
                      O‘chirish
                    </Button>
                  )}
                </Space>
              ),
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
        okText="Yaratish"
      >
        <Form form={form} layout="vertical" onFinish={(v) => create.mutate(v)}>
          <Form.Item name="name" label="Nomi" rules={[{ required: true }]}>
            <Input placeholder="301-A" />
          </Form.Item>
          <Form.Item name="code" label="Kod" rules={[{ required: true }]}>
            <Input placeholder="301A" />
          </Form.Item>
          <Form.Item name="description" label="Tavsif">
            <Input.TextArea />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
}

export function GroupDetailPage() {
  const { id = '' } = useParams();
  const { user } = useAuth();
  const base = user?.role === 'SUPER_ADMIN' ? '/admin' : '/teacher';
  const qc = useQueryClient();
  const [studentOpen, setStudentOpen] = useState(false);
  const [csvOpen, setCsvOpen] = useState(false);
  const [form] = Form.useForm();
  const [csvText, setCsvText] = useState('');

  const { data, isLoading } = useQuery({
    queryKey: ['group', id],
    queryFn: () => groupsApi.get(id),
    enabled: !!id,
  });

  const addStudent = useMutation({
    mutationFn: (values: Record<string, unknown>) =>
      studentsApi.create({ ...values, groupId: id }) as Promise<{
        temporaryPassword?: string;
      }>,
    onSuccess: (res) => {
      message.success(
        res.temporaryPassword
          ? `Talaba qo‘shildi. Vaqtinchalik parol: ${res.temporaryPassword}`
          : 'Talaba qo‘shildi',
      );
      setStudentOpen(false);
      form.resetFields();
      qc.invalidateQueries({ queryKey: ['group', id] });
    },
    onError: (e) => message.error(getErrorMessage(e)),
  });

  const importCsv = useMutation({
    mutationFn: () =>
      apiImport(id, csvText),
    onSuccess: (res: { created: number; errors: string[] }) => {
      message.success(`${res.created} ta talaba import qilindi`);
      if (res.errors?.length) message.warning(res.errors.slice(0, 3).join('; '));
      setCsvOpen(false);
      setCsvText('');
      qc.invalidateQueries({ queryKey: ['group', id] });
    },
    onError: (e) => message.error(getErrorMessage(e)),
  });

  return (
    <div>
      <PageHeader
        title={data?.name || 'Guruh'}
        subtitle={data?.code}
        extra={
          <Space>
            <Button onClick={() => setStudentOpen(true)}>+ Talaba</Button>
            <Button onClick={() => setCsvOpen(true)}>CSV import</Button>
            <Link to={`${base}/forms/create`}>
              <Button type="primary">Forma yaratish</Button>
            </Link>
          </Space>
        }
      />
      <div className="grid grid-cols-3 gap-3 mb-6">
        <StatCard title="Talabalar" value={data?.stats?.students ?? 0} />
        <StatCard title="Faol formalar" value={data?.stats?.activeForms ?? 0} />
        <StatCard
          title="Javoblar"
          value={data?.stats?.completedResponses ?? 0}
        />
      </div>

      <Tabs
        items={[
          {
            key: 'students',
            label: 'Talabalar',
            children: (
              <div className="bg-white border" style={{ borderColor: '#D0D5DD' }}>
                <Table
                  rowKey="id"
                  loading={isLoading}
                  dataSource={data?.students || []}
                  columns={[
                    {
                      title: 'F.I.Sh',
                      render: (_: unknown, r: any) =>
                        `${r.firstName} ${r.lastName}`,
                    },
                    { title: 'Raqam', dataIndex: 'studentNumber' },
                    {
                      title: 'Email',
                      render: (_: unknown, r: any) => r.user?.email || '—',
                    },
                    { title: 'Telefon', dataIndex: 'phone' },
                  ]}
                />
              </div>
            ),
          },
          {
            key: 'forms',
            label: 'Formalar',
            children: (
              <div className="bg-white border" style={{ borderColor: '#D0D5DD' }}>
                <Table
                  rowKey="id"
                  dataSource={data?.assignments || []}
                  columns={[
                    {
                      title: 'Forma',
                      render: (_: unknown, r: any) =>
                        r.form ? (
                          <Link to={`${base}/forms/${r.form.id}`}>{r.form.title}</Link>
                        ) : (
                          '—'
                        ),
                    },
                    {
                      title: 'Holat',
                      render: (_: unknown, r: any) => (
                        <Tag>{r.form?.status}</Tag>
                      ),
                    },
                    {
                      title: 'Javoblar',
                      render: (_: unknown, r: any) =>
                        r.form?._count?.responses ?? 0,
                    },
                  ]}
                />
              </div>
            ),
          },
        ]}
      />

      <Modal
        title="Talaba qo‘shish"
        open={studentOpen}
        onCancel={() => setStudentOpen(false)}
        onOk={() => form.submit()}
        confirmLoading={addStudent.isPending}
        okText="Qo‘shish"
      >
        <Form form={form} layout="vertical" onFinish={(v) => addStudent.mutate(v)}>
          <Form.Item name="firstName" label="Ism" rules={[{ required: true }]}>
            <Input />
          </Form.Item>
          <Form.Item name="lastName" label="Familiya" rules={[{ required: true }]}>
            <Input />
          </Form.Item>
          <Form.Item name="email" label="Email" rules={[{ required: true, type: 'email' }]}>
            <Input />
          </Form.Item>
          <Form.Item name="studentNumber" label="Talaba raqami">
            <Input />
          </Form.Item>
          <Form.Item name="phone" label="Telefon">
            <Input />
          </Form.Item>
          <Form.Item name="password" label="Parol (ixtiyoriy)">
            <Input.Password placeholder="Bo‘sh qoldirilsa avtomatik yaratiladi" />
          </Form.Item>
        </Form>
      </Modal>

      <Modal
        title="CSV import"
        open={csvOpen}
        onCancel={() => setCsvOpen(false)}
        onOk={() => importCsv.mutate()}
        confirmLoading={importCsv.isPending}
        okText="Import"
      >
        <p className="text-sm text-slate-500 mb-2">
          Format: firstName,lastName,email,studentNumber,phone
        </p>
        <Input.TextArea
          rows={8}
          value={csvText}
          onChange={(e) => setCsvText(e.target.value)}
          placeholder={'Hasan,Karimov,hasan@school.com,S001,+99890...'}
        />
        <Upload
          beforeUpload={(file) => {
            file.text().then(setCsvText);
            return false;
          }}
          maxCount={1}
          accept=".csv,text/csv"
        >
          <Button className="mt-2">Fayl yuklash</Button>
        </Upload>
      </Modal>
    </div>
  );
}

async function apiImport(groupId: string, csv: string) {
  const { default: api } = await import('../../api/client');
  const { data } = await api.post(`/students/import/${groupId}`, { csv });
  return data;
}

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import {
  Button,
  Drawer,
  Input,
  Modal,
  Select,
  Space,
  Table,
  Tag,
  Typography,
  message,
} from 'antd';
import { useMemo, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import dayjs from 'dayjs';
import { formsApi } from '../../api/forms';
import { groupsApi, responsesApi } from '../../api';
import { getErrorMessage } from '../../api/client';
import { PageHeader, StatCard } from '../../components/ui';
import type { FormStatus } from '../../types';
import { useAuth } from '../../hooks/useAuth';

export default function FormDetailPage() {
  const { id = '' } = useParams();
  const { user } = useAuth();
  const base = user?.role === 'SUPER_ADMIN' ? '/admin' : '/teacher';
  const navigate = useNavigate();
  const qc = useQueryClient();
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [selectedResponse, setSelectedResponse] = useState<string | null>(null);
  const [assignOpen, setAssignOpen] = useState(false);
  const [offerOpen, setOfferOpen] = useState(false);
  const [groupId, setGroupId] = useState<string>();

  const { data: overview, isLoading } = useQuery({
    queryKey: ['form-overview', id],
    queryFn: () => formsApi.overview(id),
    enabled: !!id,
  });

  const { data: responses, isLoading: loadingResp } = useQuery({
    queryKey: ['responses', id, search, page],
    queryFn: () =>
      responsesApi.list(id, { search: search || undefined, page, limit: 20 }),
    enabled: !!id,
  });

  const { data: detail } = useQuery({
    queryKey: ['response', id, selectedResponse],
    queryFn: () => responsesApi.get(id, selectedResponse!),
    enabled: !!selectedResponse,
  });

  const { data: groups } = useQuery({
    queryKey: ['groups'],
    queryFn: () => groupsApi.list(),
  });

  const form = overview?.form;

  const columns = useMemo(() => {
    const baseCols = [
      {
        title: '#',
        width: 50,
        render: (_: unknown, __: unknown, index: number) =>
          (page - 1) * 20 + index + 1,
      },
      {
        title: 'Talaba',
        className: 'sticky-student-col',
        render: (_: unknown, r: {
          student: { firstName: string; lastName: string };
        }) => `${r.student.firstName} ${r.student.lastName}`,
      },
      {
        title: 'Guruh',
        render: (_: unknown, r: { student: { group?: { code?: string } } }) =>
          r.student.group?.code || '—',
      },
    ];
    const dynamic = (responses?.fields || []).map(
      (f: { id: string; label: string }) => ({
        title: f.label,
        render: (_: unknown, r: { answers: Record<string, unknown> }) => {
          const v = r.answers[f.id];
          return Array.isArray(v) ? v.join(', ') : String(v ?? '—');
        },
      }),
    );
    return [
      ...baseCols,
      ...dynamic,
      {
        title: 'Yuborilgan',
        dataIndex: 'submittedAt',
        render: (v: string) => dayjs(v).format('DD.MM.YYYY HH:mm'),
      },
      {
        title: '',
        width: 90,
        render: (_: unknown, r: { id: string }) => (
          <Button
            size="small"
            onClick={() => {
              setSelectedResponse(r.id);
              setDrawerOpen(true);
            }}
          >
            Batafsil
          </Button>
        ),
      },
    ];
  }, [responses?.fields, page]);

  const assign = useMutation({
    mutationFn: () => formsApi.assign(id, { groupId }),
    onSuccess: () => {
      message.success('Guruh biriktirildi');
      setAssignOpen(false);
      qc.invalidateQueries({ queryKey: ['form-overview', id] });
    },
    onError: (e) => message.error(getErrorMessage(e)),
  });

  const offer = useMutation({
    mutationFn: () => formsApi.offerToGroup(id, { groupId: groupId! }),
    onSuccess: () => {
      message.success('Taklif guruh rahbariga yuborildi');
      setOfferOpen(false);
      qc.invalidateQueries({ queryKey: ['form', id] });
    },
    onError: (e) => message.error(getErrorMessage(e)),
  });

  const exportFile = async (format: 'csv' | 'xlsx') => {
    try {
      const token = localStorage.getItem('accessToken');
      const url = responsesApi.exportUrl(id, format);
      const res = await fetch(url, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) throw new Error('Export xatosi');
      const blob = await res.blob();
      const a = document.createElement('a');
      a.href = URL.createObjectURL(blob);
      a.download = `form-${id}.${format}`;
      a.click();
    } catch (e) {
      message.error(getErrorMessage(e, 'Export amalga oshmadi'));
    }
  };

  const publicUrl = form
    ? `${window.location.origin}/public/forms/${form.publicId}`
    : '';

  return (
    <div>
      <PageHeader
        title={form?.title || 'Forma'}
        subtitle={form?.description || undefined}
        extra={
          <Space wrap>
            <Tag>{(form?.status as FormStatus) || '—'}</Tag>
            <Button onClick={() => navigate(`${base}/forms/${id}/edit`)}>
              Tahrirlash
            </Button>
            <Button onClick={() => setAssignOpen(true)}>Biriktirish</Button>
            <Button
              type="primary"
              ghost
              onClick={() => setOfferOpen(true)}
            >
              Guruhga taklif
            </Button>
            <Button
              onClick={() => {
                navigator.clipboard.writeText(publicUrl);
                message.success('Havola nusxalandi');
              }}
            >
              Ulashish
            </Button>
            <Button onClick={() => exportFile('xlsx')}>Excel</Button>
            <Button onClick={() => exportFile('csv')}>CSV</Button>
          </Space>
        }
      />

      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
        <StatCard title="Biriktirilgan" value={overview?.assigned ?? 0} />
        <StatCard title="Yuborilgan" value={overview?.submitted ?? 0} />
        <StatCard title="Kutilmoqda" value={overview?.pending ?? 0} />
        <StatCard title="Bajarilish %" value={`${overview?.completion ?? 0}%`} />
      </div>

      <div className="mb-3 flex gap-2">
        <Input.Search
          placeholder="Talaba qidirish"
          style={{ width: 280 }}
          onSearch={(v) => {
            setSearch(v);
            setPage(1);
          }}
        />
        <Typography.Text type="secondary" copyable={!!publicUrl}>
          {publicUrl}
        </Typography.Text>
      </div>

      <div className="bg-white border overflow-auto" style={{ borderColor: '#D0D5DD' }}>
        <Table
          size="small"
          loading={isLoading || loadingResp}
          rowKey="id"
          dataSource={responses?.items || []}
          columns={columns}
          scroll={{ x: true }}
          pagination={{
            current: page,
            total: responses?.total,
            pageSize: 20,
            onChange: setPage,
          }}
        />
      </div>

      <Drawer
        open={drawerOpen}
        onClose={() => setDrawerOpen(false)}
        width={420}
        title="Javob tafsiloti"
      >
        {detail && (
          <div>
            <Typography.Paragraph>
              <strong>Talaba:</strong>{' '}
              {detail.student.firstName} {detail.student.lastName}
            </Typography.Paragraph>
            <Typography.Paragraph>
              <strong>Guruh:</strong> {detail.student.group?.code || '—'}
            </Typography.Paragraph>
            <Typography.Paragraph>
              <strong>Yuborilgan:</strong>{' '}
              {dayjs(detail.submittedAt).format('DD.MM.YYYY HH:mm')}
            </Typography.Paragraph>
            <div className="border-t pt-3 mt-3" style={{ borderColor: '#D0D5DD' }}>
              {detail.answers.map(
                (a: {
                  id: string;
                  field: { label: string };
                  value: unknown;
                }) => (
                  <div key={a.id} className="mb-3">
                    <div className="text-xs text-slate-500">{a.field.label}</div>
                    <div className="font-medium">
                      {Array.isArray(a.value)
                        ? a.value.join(', ')
                        : String(a.value ?? '—')}
                    </div>
                  </div>
                ),
              )}
            </div>
          </div>
        )}
      </Drawer>

      <Modal
        title="Guruhga biriktirish"
        open={assignOpen}
        onCancel={() => setAssignOpen(false)}
        onOk={() => assign.mutate()}
        confirmLoading={assign.isPending}
        okText="Biriktirish"
      >
        <Select
          className="w-full"
          placeholder="Guruhni tanlang"
          value={groupId}
          onChange={setGroupId}
          options={(groups || []).map((g: { id: string; name: string; code: string }) => ({
            value: g.id,
            label: `${g.code} — ${g.name}`,
          }))}
        />
      </Modal>

      <Modal
        title="Guruh rahbariga taklif yuborish"
        open={offerOpen}
        onCancel={() => setOfferOpen(false)}
        onOk={() => offer.mutate()}
        confirmLoading={offer.isPending}
        okText="Yuborish"
      >
        <p className="text-sm text-slate-500 mb-2">
          O‘qituvchi qabul qilgach, forma talabalarga bildirishnoma bilan yetadi.
        </p>
        <Select
          className="w-full"
          placeholder="Guruhni tanlang"
          value={groupId}
          onChange={setGroupId}
          options={(groups || []).map((g: { id: string; name: string; code: string }) => ({
            value: g.id,
            label: `${g.code} — ${g.name}`,
          }))}
        />
      </Modal>
    </div>
  );
}

export function StudentFormsPage({ completedOnly = false }: { completedOnly?: boolean }) {
  const { data, isLoading } = useQuery({
    queryKey: ['student-forms'],
    queryFn: () => formsApi.list({ limit: 100 }),
  });

  const items = (data?.items || []).filter((f) =>
    completedOnly ? f.submitted : true,
  );

  return (
    <div>
      <PageHeader
        title={completedOnly ? 'Yuborilgan formalar' : 'Formalarim'}
      />
      {!isLoading && items.length === 0 ? (
        <div
          className="bg-white border p-10 text-center text-slate-500"
          style={{ borderColor: '#D0D5DD' }}
        >
          Hozircha sizga biriktirilgan forma mavjud emas.
        </div>
      ) : (
        <div className="grid gap-3">
          {items.map((f) => (
            <div
              key={f.id}
              className="bg-white border px-4 py-4 flex flex-wrap items-center justify-between gap-3"
              style={{ borderColor: '#D0D5DD' }}
            >
              <div>
                <div className="font-medium">{f.title}</div>
                <div className="text-xs text-slate-500">
                  {f.createdBy?.teacherProfile
                    ? `${f.createdBy.teacherProfile.firstName} ${f.createdBy.teacherProfile.lastName}`
                    : ''}
                  {f.endsAt
                    ? ` • Muddat: ${dayjs(f.endsAt).format('DD.MM.YYYY')}`
                    : ''}
                </div>
              </div>
              <Space>
                <Tag color={f.submitted ? 'success' : 'orange'}>
                  {f.submitted ? 'Yuborilgan ✓' : 'Yuborilmagan'}
                </Tag>
                <Link to={`/student/forms/${f.publicId}`}>
                  <Button type="primary">Ochish</Button>
                </Link>
              </Space>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

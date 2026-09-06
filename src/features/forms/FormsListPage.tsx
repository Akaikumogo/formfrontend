import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import {
  Button,
  Dropdown,
  Input,
  Modal,
  Select,
  Table,
  Tag,
  message,
} from 'antd';
import {
  PlusOutlined,
  MoreOutlined,
} from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import { useState } from 'react';
import dayjs from 'dayjs';
import { formsApi } from '../../api/forms';
import { getErrorMessage } from '../../api/client';
import { PageHeader, EmptyState } from '../../components/ui';
import type { FormItem, FormStatus } from '../../types';
import { useAuth } from '../../hooks/useAuth';

const statusColor: Record<FormStatus, string> = {
  DRAFT: 'default',
  PUBLISHED: 'success',
  CLOSED: 'warning',
  ARCHIVED: 'default',
};

export default function FormsListPage() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const qc = useQueryClient();
  const base = user?.role === 'SUPER_ADMIN' ? '/admin' : '/teacher';
  const [search, setSearch] = useState('');
  const [status, setStatus] = useState<string | undefined>();
  const [page, setPage] = useState(1);

  const { data, isLoading } = useQuery({
    queryKey: ['forms', search, status, page],
    queryFn: () =>
      formsApi.list({ search: search || undefined, status, page, limit: 20 }),
  });

  const mutate = useMutation({
    mutationFn: async ({
      id,
      action,
    }: {
      id: string;
      action: 'publish' | 'close' | 'archive' | 'duplicate';
    }) => {
      if (action === 'publish') return formsApi.publish(id);
      if (action === 'close') return formsApi.close(id);
      if (action === 'archive') return formsApi.archive(id);
      return formsApi.duplicate(id);
    },
    onSuccess: (_, vars) => {
      message.success('Amal bajarildi');
      qc.invalidateQueries({ queryKey: ['forms'] });
      if (vars.action === 'duplicate') {
        // stay
      }
    },
    onError: (e) => message.error(getErrorMessage(e)),
  });

  if (!isLoading && data && data.total === 0 && !search && !status) {
    return (
      <div>
        <PageHeader title="Formalar" />
        <EmptyState
          title="Siz hali forma yaratmagansiz."
          actionLabel="+ Yangi forma yaratish"
          onAction={() => navigate(`${base}/forms/create`)}
        />
      </div>
    );
  }

  return (
    <div>
      <PageHeader
        title="Formalar"
        extra={
          <Button
            type="primary"
            icon={<PlusOutlined />}
            onClick={() => navigate(`${base}/forms/create`)}
          >
            Yangi forma
          </Button>
        }
      />
      <div className="mb-4 flex flex-wrap gap-2">
        <Input.Search
          placeholder="Qidirish..."
          allowClear
          style={{ width: 260 }}
          onSearch={(v) => {
            setSearch(v);
            setPage(1);
          }}
        />
        <Select
          allowClear
          placeholder="Holat"
          style={{ width: 160 }}
          value={status}
          onChange={(v) => {
            setStatus(v);
            setPage(1);
          }}
          options={[
            { value: 'DRAFT', label: 'DRAFT' },
            { value: 'PUBLISHED', label: 'PUBLISHED' },
            { value: 'CLOSED', label: 'CLOSED' },
            { value: 'ARCHIVED', label: 'ARCHIVED' },
          ]}
        />
      </div>
      <div className="bg-white border" style={{ borderColor: '#D0D5DD' }}>
        <Table
          rowKey="id"
          loading={isLoading}
          dataSource={data?.items || []}
          pagination={{
            current: page,
            total: data?.total,
            pageSize: 20,
            onChange: setPage,
          }}
          columns={[
            {
              title: 'Nomi',
              dataIndex: 'title',
              render: (t: string, r: FormItem) => (
                <a onClick={() => navigate(`${base}/forms/${r.id}`)}>{t}</a>
              ),
            },
            {
              title: 'Egasi',
              render: (_: unknown, r: FormItem) => {
                const tp = r.createdBy?.teacherProfile;
                return tp ? `${tp.firstName} ${tp.lastName}` : r.createdBy?.email || '—';
              },
            },
            {
              title: 'Holat',
              dataIndex: 'status',
              render: (s: FormStatus) => (
                <Tag color={statusColor[s]}>{s}</Tag>
              ),
            },
            {
              title: 'Javoblar',
              render: (_: unknown, r: FormItem) => r._count?.responses ?? 0,
            },
            {
              title: 'Yaratilgan',
              dataIndex: 'createdAt',
              render: (v: string) => dayjs(v).format('DD.MM.YYYY'),
            },
            {
              title: 'Amallar',
              width: 80,
              render: (_: unknown, r: FormItem) => (
                <Dropdown
                  menu={{
                    items: [
                      {
                        key: 'open',
                        label: 'Ochish',
                        onClick: () => navigate(`${base}/forms/${r.id}`),
                      },
                      {
                        key: 'edit',
                        label: 'Tahrirlash',
                        onClick: () => navigate(`${base}/forms/${r.id}/edit`),
                      },
                      {
                        key: 'publish',
                        label: 'Nashr qilish',
                        onClick: () =>
                          mutate.mutate({ id: r.id, action: 'publish' }),
                      },
                      {
                        key: 'close',
                        label: 'Yopish',
                        onClick: () =>
                          mutate.mutate({ id: r.id, action: 'close' }),
                      },
                      {
                        key: 'archive',
                        label: 'Arxivlash',
                        onClick: () =>
                          mutate.mutate({ id: r.id, action: 'archive' }),
                      },
                      {
                        key: 'dup',
                        label: 'Nusxa',
                        onClick: () =>
                          mutate.mutate({ id: r.id, action: 'duplicate' }),
                      },
                      {
                        key: 'delete',
                        label: 'O‘chirish',
                        danger: true,
                        onClick: () => {
                          Modal.confirm({
                            title: 'Formani o‘chirish?',
                            content: 'Bu amalni qaytarib bo‘lmaydi.',
                            okText: 'O‘chirish',
                            okButtonProps: { danger: true },
                            onOk: async () => {
                              try {
                                await formsApi.remove(r.id);
                                message.success('O‘chirildi');
                                qc.invalidateQueries({ queryKey: ['forms'] });
                              } catch (e) {
                                message.error(getErrorMessage(e));
                              }
                            },
                          });
                        },
                      },
                    ],
                  }}
                >
                  <Button icon={<MoreOutlined />} />
                </Dropdown>
              ),
            },
          ]}
        />
      </div>
    </div>
  );
}

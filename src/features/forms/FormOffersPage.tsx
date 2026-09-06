import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Button, Space, Table, Tag, message } from 'antd';
import { formsApi } from '../../api/forms';
import { getErrorMessage } from '../../api/client';
import { PageHeader } from '../../components/ui';
import dayjs from 'dayjs';

export default function FormOffersPage() {
  const qc = useQueryClient();
  const { data, isLoading } = useQuery({
    queryKey: ['form-offers'],
    queryFn: () => formsApi.listOffers(),
  });

  const accept = useMutation({
    mutationFn: (id: string) => formsApi.acceptOffer(id),
    onSuccess: () => {
      message.success('Forma qabul qilindi. Talabalarga bildirishnoma yuborildi.');
      qc.invalidateQueries({ queryKey: ['form-offers'] });
      qc.invalidateQueries({ queryKey: ['notifications'] });
    },
    onError: (e) => message.error(getErrorMessage(e)),
  });

  const reject = useMutation({
    mutationFn: (id: string) => formsApi.rejectOffer(id),
    onSuccess: () => {
      message.success('Taklif rad etildi');
      qc.invalidateQueries({ queryKey: ['form-offers'] });
    },
    onError: (e) => message.error(getErrorMessage(e)),
  });

  return (
    <div>
      <PageHeader
        title="Forma takliflari"
        subtitle="Superadmin yuborgan formalarni qabul qiling — keyin talabalarga yetadi"
      />
      <div className="bg-white border" style={{ borderColor: '#D0D5DD' }}>
        <Table
          rowKey="id"
          loading={isLoading}
          dataSource={data || []}
          columns={[
            {
              title: 'Forma',
              render: (_: unknown, r: any) => r.form?.title,
            },
            {
              title: 'Guruh',
              render: (_: unknown, r: any) =>
                `${r.group?.code || ''} — ${r.group?.name || ''}`,
            },
            {
              title: 'Holat',
              dataIndex: 'status',
              render: (s: string) => (
                <Tag
                  color={
                    s === 'PENDING' ? 'gold' : s === 'ACCEPTED' ? 'green' : 'red'
                  }
                >
                  {s}
                </Tag>
              ),
            },
            {
              title: 'Sana',
              dataIndex: 'createdAt',
              render: (v: string) => dayjs(v).format('DD.MM.YYYY HH:mm'),
            },
            {
              title: 'Amallar',
              render: (_: unknown, r: any) =>
                r.status === 'PENDING' ? (
                  <Space>
                    <Button
                      type="primary"
                      size="small"
                      loading={accept.isPending}
                      onClick={() => accept.mutate(r.id)}
                    >
                      Qabul qilish
                    </Button>
                    <Button
                      danger
                      size="small"
                      loading={reject.isPending}
                      onClick={() => reject.mutate(r.id)}
                    >
                      Rad etish
                    </Button>
                  </Space>
                ) : (
                  '—'
                ),
            },
          ]}
        />
      </div>
    </div>
  );
}

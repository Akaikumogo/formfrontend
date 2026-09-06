import { useQuery } from '@tanstack/react-query';
import { Table, Tag } from 'antd';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
} from 'recharts';
import { dashboardApi } from '../../api';
import { PageHeader, StatCard } from '../../components/ui';
import dayjs from 'dayjs';

export function AdminDashboard() {
  const { data, isLoading } = useQuery({
    queryKey: ['dashboard'],
    queryFn: dashboardApi.stats,
  });

  return (
    <div>
      <PageHeader
        title="Dashboard"
        subtitle="Platforma ko‘rinishi va tizim faoliyati"
      />
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-4">
        <StatCard title="Talabalar" value={data?.totalStudents ?? '—'} />
        <StatCard title="O‘qituvchilar" value={data?.totalTeachers ?? '—'} />
        <StatCard title="Guruhlar" value={data?.totalGroups ?? '—'} />
        <StatCard title="Formalar" value={data?.totalForms ?? '—'} />
      </div>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
        <StatCard title="Javoblar" value={data?.totalResponses ?? '—'} />
        <StatCard title="Bugungi javoblar" value={data?.todayResponses ?? '—'} />
        <StatCard title="Faol formalar" value={data?.activeForms ?? '—'} />
        <StatCard title="Qoralamalar" value={data?.pendingForms ?? '—'} />
      </div>

      <div
        className="bg-white border p-4 mb-6"
        style={{ borderColor: '#D0D5DD', height: 300 }}
      >
        <div className="text-sm font-medium mb-3">Javoblar faolligi</div>
        <ResponsiveContainer width="100%" height="90%">
          <LineChart data={data?.responseActivity || []}>
            <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
            <XAxis dataKey="date" tick={{ fontSize: 11 }} />
            <YAxis allowDecimals={false} tick={{ fontSize: 11 }} />
            <Tooltip />
            <Line
              type="monotone"
              dataKey="count"
              stroke="#1B4F8A"
              strokeWidth={2}
              dot={false}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>

      <div className="grid md:grid-cols-2 gap-4">
        <div className="bg-white border" style={{ borderColor: '#D0D5DD' }}>
          <div className="px-4 py-3 border-b font-medium" style={{ borderColor: '#D0D5DD' }}>
            So‘nggi formalar
          </div>
          <Table
            size="small"
            loading={isLoading}
            pagination={false}
            rowKey="id"
            dataSource={data?.recentForms || []}
            columns={[
              { title: 'Forma', dataIndex: 'title' },
              {
                title: 'Holat',
                dataIndex: 'status',
                render: (s: string) => <Tag>{s}</Tag>,
              },
              {
                title: 'Javoblar',
                render: (_: unknown, r: { _count?: { responses: number } }) =>
                  r._count?.responses ?? 0,
              },
            ]}
          />
        </div>
        <div className="bg-white border" style={{ borderColor: '#D0D5DD' }}>
          <div className="px-4 py-3 border-b font-medium" style={{ borderColor: '#D0D5DD' }}>
            So‘nggi faoliyat
          </div>
          <Table
            size="small"
            loading={isLoading}
            pagination={false}
            rowKey="id"
            dataSource={data?.recentActivity || []}
            columns={[
              {
                title: 'Vaqt',
                dataIndex: 'createdAt',
                render: (v: string) => dayjs(v).format('DD.MM HH:mm'),
                width: 100,
              },
              { title: 'Amal', dataIndex: 'action', width: 100 },
              { title: 'Obyekt', dataIndex: 'entity' },
              {
                title: 'Foydalanuvchi',
                render: (_: unknown, r: { user?: { email?: string } }) =>
                  r.user?.email || '—',
              },
            ]}
          />
        </div>
      </div>
    </div>
  );
}

export function TeacherDashboard() {
  const { data, isLoading } = useQuery({
    queryKey: ['dashboard'],
    queryFn: dashboardApi.stats,
  });

  return (
    <div>
      <PageHeader
        title="Dashboard"
        subtitle="Formalaringiz va javoblar faolligi"
      />
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
        <StatCard title="Formalarim" value={data?.myForms ?? '—'} />
        <StatCard title="Faol" value={data?.activeForms ?? '—'} />
        <StatCard title="Javoblar" value={data?.totalResponses ?? '—'} />
        <StatCard title="Qoralama" value={data?.draftForms ?? '—'} />
      </div>
      <div
        className="bg-white border mb-6"
        style={{ borderColor: '#D0D5DD' }}
      >
        <div className="px-4 py-3 border-b font-medium" style={{ borderColor: '#D0D5DD' }}>
          So‘nggi formalar
        </div>
        <Table
          size="small"
          loading={isLoading}
          pagination={false}
          rowKey="id"
          dataSource={data?.recentForms || []}
          columns={[
            { title: 'Forma', dataIndex: 'title' },
            {
              title: 'Holat',
              dataIndex: 'status',
              render: (s: string) => <Tag>{s}</Tag>,
            },
            {
              title: 'Javoblar',
              render: (_: unknown, r: { _count?: { responses: number } }) =>
                r._count?.responses ?? 0,
            },
          ]}
        />
      </div>
    </div>
  );
}

export function StudentDashboard() {
  const { data, isLoading } = useQuery({
    queryKey: ['dashboard'],
    queryFn: dashboardApi.stats,
  });

  return (
    <div>
      <PageHeader
        title="Dashboard"
        subtitle="Formalaringiz va yuborilgan javoblar"
      />
      <div className="grid grid-cols-3 gap-3 mb-6">
        <StatCard title="Mavjud" value={data?.availableForms ?? '—'} />
        <StatCard title="Kutilmoqda" value={data?.pendingForms ?? '—'} />
        <StatCard title="Yuborilgan" value={data?.completedForms ?? '—'} />
      </div>
      <div className="bg-white border" style={{ borderColor: '#D0D5DD' }}>
        <div className="px-4 py-3 border-b font-medium" style={{ borderColor: '#D0D5DD' }}>
          To‘ldirilishi kerak
        </div>
        <Table
          size="small"
          loading={isLoading}
          pagination={false}
          rowKey="id"
          dataSource={data?.pendingList || []}
          locale={{ emptyText: 'Hozircha sizga biriktirilgan forma mavjud emas.' }}
          columns={[
            { title: 'Forma', dataIndex: 'title' },
            {
              title: 'Muddat',
              dataIndex: 'endsAt',
              render: (v: string | null) =>
                v ? dayjs(v).format('DD.MM.YYYY') : '—',
            },
            {
              title: 'Holat',
              render: () => <Tag color="orange">Kutilmoqda</Tag>,
            },
          ]}
        />
      </div>
    </div>
  );
}

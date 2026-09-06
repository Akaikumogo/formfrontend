import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Badge, Button, Dropdown, Empty, Typography } from 'antd';
import { BellOutlined } from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import { notificationsApi } from '../../api/forms';
import dayjs from 'dayjs';

export default function NotificationsBell() {
  const navigate = useNavigate();
  const qc = useQueryClient();

  const { data: countData } = useQuery({
    queryKey: ['notifications-unread'],
    queryFn: () => notificationsApi.unreadCount(),
    refetchInterval: 30000,
  });

  const { data: items } = useQuery({
    queryKey: ['notifications'],
    queryFn: () => notificationsApi.list(),
  });

  const markRead = useMutation({
    mutationFn: (id: string) => notificationsApi.markRead(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['notifications'] });
      qc.invalidateQueries({ queryKey: ['notifications-unread'] });
    },
  });

  const markAll = useMutation({
    mutationFn: () => notificationsApi.markAllRead(),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['notifications'] });
      qc.invalidateQueries({ queryKey: ['notifications-unread'] });
    },
  });

  const menu = {
    items: [
      {
        key: 'header',
        label: (
          <div className="flex items-center justify-between gap-4 min-w-[280px]">
            <Typography.Text strong>Bildirishnomalar</Typography.Text>
            <Button type="link" size="small" onClick={() => markAll.mutate()}>
              Barchasini o‘qish
            </Button>
          </div>
        ),
        disabled: true,
      },
      { type: 'divider' as const },
      ...((items as any[]) || []).slice(0, 8).map((n) => ({
        key: n.id,
        label: (
          <div
            className="max-w-xs"
            onClick={() => {
              if (!n.read) markRead.mutate(n.id);
              if (n.link) navigate(n.link);
            }}
          >
            <div className={!n.read ? 'font-semibold' : ''}>{n.title}</div>
            {n.body && (
              <div className="text-xs text-slate-500 line-clamp-2">{n.body}</div>
            )}
            <div className="text-[10px] text-slate-400">
              {dayjs(n.createdAt).format('DD.MM.YYYY HH:mm')}
            </div>
          </div>
        ),
      })),
      ...(!(items as any[])?.length
        ? [
            {
              key: 'empty',
              label: <Empty image={Empty.PRESENTED_IMAGE_SIMPLE} description="Bo‘sh" />,
              disabled: true,
            },
          ]
        : []),
    ],
  };

  return (
    <Dropdown menu={menu} trigger={['click']} placement="bottomRight">
      <Badge count={countData?.count || 0} size="small">
        <Button type="text" icon={<BellOutlined />} />
      </Badge>
    </Dropdown>
  );
}

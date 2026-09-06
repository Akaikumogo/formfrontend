import { Button, Space, Typography } from 'antd';
import type { ReactNode } from 'react';

export function PageHeader({
  title,
  subtitle,
  extra,
}: {
  title: string;
  subtitle?: string;
  extra?: ReactNode;
}) {
  return (
    <div className="mb-6 flex flex-wrap items-start justify-between gap-3">
      <div>
        <Typography.Title level={3} style={{ margin: 0 }}>
          {title}
        </Typography.Title>
        {subtitle && (
          <Typography.Text type="secondary">{subtitle}</Typography.Text>
        )}
      </div>
      {extra && <Space wrap>{extra}</Space>}
    </div>
  );
}

export function StatCard({
  title,
  value,
}: {
  title: string;
  value: string | number;
}) {
  return (
    <div
      className="bg-white border px-5 py-4"
      style={{ borderColor: '#D0D5DD' }}
    >
      <div className="text-xs uppercase tracking-wide text-slate-500 mb-1">
        {title}
      </div>
      <div className="text-2xl font-semibold text-navy">{value}</div>
    </div>
  );
}

export function EmptyState({
  title,
  description,
  actionLabel,
  onAction,
}: {
  title: string;
  description?: string;
  actionLabel?: string;
  onAction?: () => void;
}) {
  return (
    <div
      className="bg-white border py-16 px-6 text-center"
      style={{ borderColor: '#D0D5DD' }}
    >
      <Typography.Title level={4}>{title}</Typography.Title>
      {description && (
        <Typography.Paragraph type="secondary">{description}</Typography.Paragraph>
      )}
      {actionLabel && onAction && (
        <Button type="primary" onClick={onAction}>
          {actionLabel}
        </Button>
      )}
    </div>
  );
}

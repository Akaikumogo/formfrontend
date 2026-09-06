import { Layout, Menu, Button, Typography, Drawer, Grid } from 'antd';
import {
  DashboardOutlined,
  FormOutlined,
  TeamOutlined,
  UserOutlined,
  GroupOutlined,
  SettingOutlined,
  AuditOutlined,
  LogoutOutlined,
  MenuFoldOutlined,
  MenuUnfoldOutlined,
  PlusOutlined,
  CheckCircleOutlined,
  SendOutlined,
  InboxOutlined,
} from '@ant-design/icons';
import { Link, Outlet, useLocation, useNavigate } from 'react-router-dom';
import { useEffect, useMemo, useState } from 'react';
import { useAuth } from '../hooks/useAuth';
import OnboardingModal from '../features/auth/OnboardingModal';
import NotificationsBell from '../features/notifications/NotificationsBell';
import type { UserRole } from '../types';

const { Sider, Header, Content } = Layout;
const { useBreakpoint } = Grid;

function getNav(role: UserRole) {
  if (role === 'SUPER_ADMIN') {
    return [
      { key: '/admin/dashboard', icon: <DashboardOutlined />, label: 'Dashboard' },
      { key: '/admin/students', icon: <TeamOutlined />, label: 'Talabalar' },
      { key: '/admin/teachers', icon: <UserOutlined />, label: "O'qituvchilar" },
      { key: '/admin/groups', icon: <GroupOutlined />, label: 'Guruhlar' },
      { key: '/admin/forms', icon: <FormOutlined />, label: 'Formalar' },
      { key: '/admin/telegram', icon: <SendOutlined />, label: 'Telegram' },
      { key: '/admin/audit', icon: <AuditOutlined />, label: 'Audit' },
      { key: '/admin/profile', icon: <SettingOutlined />, label: 'Profil' },
    ];
  }
  if (role === 'TEACHER') {
    return [
      { key: '/teacher/dashboard', icon: <DashboardOutlined />, label: 'Dashboard' },
      { key: '/teacher/forms', icon: <FormOutlined />, label: 'Formalarim' },
      { key: '/teacher/offers', icon: <InboxOutlined />, label: 'Takliflar' },
      { key: '/teacher/forms/create', icon: <PlusOutlined />, label: 'Yangi forma' },
      { key: '/teacher/groups', icon: <GroupOutlined />, label: 'Guruhlarim' },
      { key: '/teacher/students', icon: <TeamOutlined />, label: 'Talabalar' },
      { key: '/teacher/profile', icon: <SettingOutlined />, label: 'Profil' },
    ];
  }
  return [
    { key: '/student/dashboard', icon: <DashboardOutlined />, label: 'Dashboard' },
    { key: '/student/forms', icon: <FormOutlined />, label: 'Formalarim' },
    { key: '/student/completed', icon: <CheckCircleOutlined />, label: 'Yuborilgan' },
    { key: '/student/profile', icon: <SettingOutlined />, label: 'Profil' },
  ];
}

function roleLabel(role: UserRole) {
  if (role === 'SUPER_ADMIN') return 'Admin';
  if (role === 'TEACHER') return "O'qituvchi";
  return 'Talaba';
}

export default function AppLayout() {
  const { user, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const screens = useBreakpoint();
  const isMobile = !screens.md;
  const [collapsed, setCollapsed] = useState(
    () => localStorage.getItem('sidebarCollapsed') === '1',
  );
  const [drawerOpen, setDrawerOpen] = useState(false);

  useEffect(() => {
    localStorage.setItem('sidebarCollapsed', collapsed ? '1' : '0');
  }, [collapsed]);

  const items = useMemo(
    () => (user ? getNav(user.role) : []),
    [user],
  );

  const selected = items
    .map((i) => i.key)
    .filter((k) => location.pathname === k || location.pathname.startsWith(k + '/'))
    .sort((a, b) => b.length - a.length)[0];

  const displayName =
    user?.teacherProfile
      ? `${user.teacherProfile.firstName} ${user.teacherProfile.lastName}`
      : user?.studentProfile
        ? `${user.studentProfile.firstName} ${user.studentProfile.lastName}`
        : user?.email;

  const siderContent = (
    <div className="flex h-full flex-col">
      <div
        className="border-b border-white/10 px-4 py-4"
        style={{ minHeight: 64 }}
      >
        <Typography.Text className="!text-white/90 !text-xs tracking-widest">
          FORM
        </Typography.Text>
        <div className="text-white font-semibold text-sm leading-tight">
          ADMINISTRATION
        </div>
      </div>
      <Menu
        theme="dark"
        mode="inline"
        selectedKeys={selected ? [selected] : []}
        items={items.map((i) => ({
          ...i,
          label: <Link to={i.key}>{i.label}</Link>,
        }))}
        style={{ flex: 1, borderInlineEnd: 0 }}
        onClick={() => setDrawerOpen(false)}
      />
      <div className="p-3 border-t border-white/10">
        <Button
          type="text"
          icon={<LogoutOutlined />}
          className="!text-white/80 w-full !text-left"
          onClick={() => {
            logout();
            navigate('/login');
          }}
        >
          {!collapsed || isMobile ? 'Chiqish' : ''}
        </Button>
      </div>
    </div>
  );

  return (
    <Layout style={{ minHeight: '100%' }}>
      {!isMobile && (
        <Sider
          collapsible
          collapsed={collapsed}
          onCollapse={setCollapsed}
          width={250}
          collapsedWidth={72}
          trigger={null}
          style={{
            position: 'sticky',
            top: 0,
            height: '100vh',
            overflow: 'auto',
          }}
        >
          {siderContent}
        </Sider>
      )}
      {isMobile && (
        <Drawer
          placement="left"
          open={drawerOpen}
          onClose={() => setDrawerOpen(false)}
          width={250}
          styles={{ body: { padding: 0, background: '#0B1F3A' } }}
        >
          {siderContent}
        </Drawer>
      )}
      <Layout>
        <Header
          style={{
            background: '#fff',
            padding: '0 20px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            borderBottom: '1px solid #D0D5DD',
            position: 'sticky',
            top: 0,
            zIndex: 10,
          }}
        >
          <div className="flex items-center gap-3">
            <Button
              type="text"
              icon={
                isMobile ? (
                  <MenuUnfoldOutlined />
                ) : collapsed ? (
                  <MenuUnfoldOutlined />
                ) : (
                  <MenuFoldOutlined />
                )
              }
              onClick={() =>
                isMobile ? setDrawerOpen(true) : setCollapsed((c) => !c)
              }
            />
            <Typography.Text type="secondary" className="!text-sm">
              {location.pathname
                .split('/')
                .filter(Boolean)
                .slice(1)
                .join(' / ') || 'Dashboard'}
            </Typography.Text>
          </div>
          <div className="flex items-center gap-3">
            <NotificationsBell />
            <Typography.Text className="!text-xs uppercase tracking-wide text-slate-500">
              {user ? roleLabel(user.role) : ''}
            </Typography.Text>
            <Typography.Text strong>{displayName}</Typography.Text>
          </div>
        </Header>
        <Content style={{ padding: 24, minHeight: 280 }}>
          <Outlet />
          <OnboardingModal />
        </Content>
      </Layout>
    </Layout>
  );
}

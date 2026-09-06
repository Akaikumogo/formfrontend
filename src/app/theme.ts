import { ThemeConfig } from 'antd';

export const appTheme: ThemeConfig = {
  token: {
    colorPrimary: '#1B4F8A',
    colorInfo: '#1B4F8A',
    borderRadius: 4,
    fontFamily: "'Segoe UI', system-ui, -apple-system, sans-serif",
    colorBgLayout: '#f5f7fa',
  },
  components: {
    Layout: {
      siderBg: '#0B1F3A',
      headerBg: '#ffffff',
    },
    Menu: {
      darkItemBg: '#0B1F3A',
      darkSubMenuItemBg: '#0B1F3A',
      darkItemSelectedBg: '#132D52',
      darkItemHoverBg: '#132D52',
    },
    Table: {
      headerBg: '#f8fafc',
    },
  },
};

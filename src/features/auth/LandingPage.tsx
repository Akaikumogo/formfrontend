import { Button, Typography } from 'antd';
import { Link } from 'react-router-dom';
import {
  FormOutlined,
  TeamOutlined,
  GroupOutlined,
  SendOutlined,
  BarChartOutlined,
  GithubOutlined,
  CheckCircleOutlined,
} from '@ant-design/icons';

const { Title, Paragraph, Text } = Typography;

const features = [
  {
    icon: <FormOutlined />,
    title: 'Formalar',
    desc: 'Dinamik savollar, muddatlar va javoblar jadvali.',
  },
  {
    icon: <GroupOutlined />,
    title: 'Guruhlar',
    desc: 'Bir nechta guruh yarating va talabalarni tartiblang.',
  },
  {
    icon: <TeamOutlined />,
    title: 'Talabalar',
    desc: 'Guruhlarga qo‘shing, import qiling, natijalarni kuzating.',
  },
  {
    icon: <SendOutlined />,
    title: 'Telegram',
    desc: 'Nashr qilinganda guruhga avtomatik bildirishnoma.',
  },
  {
    icon: <BarChartOutlined />,
    title: 'Analitika',
    desc: 'Javoblar, foizlar va eksport — bitta joyda.',
  },
  {
    icon: <GithubOutlined />,
    title: 'Open Source',
    desc: 'Ochiq kodli, bepul, o‘zingiz joylashtirishingiz mumkin.',
  },
];

const steps = [
  { n: '01', t: 'Guruh yarating', d: 'Kurs yoki sinfingizni platformada oching.' },
  { n: '02', t: 'Talabalarni qo‘shing', d: 'Qo‘lda yoki CSV orqali ro‘yxat yuklang.' },
  { n: '03', t: 'Forma yarating', d: 'Savollarni sozlang va guruhlarga biriktiring.' },
  { n: '04', t: 'Natijalarni kuzating', d: 'Javoblar jadvalini ko‘ring va eksport qiling.' },
];

export default function LandingPage() {
  return (
    <div className="min-h-full bg-white text-slate-900">
      <header className="sticky top-0 z-20 border-b bg-white/95 backdrop-blur" style={{ borderColor: '#E5E7EB' }}>
        <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3">
          <div>
            <div className="text-[10px] tracking-[0.25em] text-slate-500">OPEN SOURCE</div>
            <div className="font-semibold text-[#0B1F3A]">Form Administration</div>
          </div>
          <div className="flex gap-2">
            <Link to="/login">
              <Button>Kirish</Button>
            </Link>
            <Link to="/register">
              <Button type="primary">O‘qituvchi sifatida boshlash</Button>
            </Link>
          </div>
        </div>
      </header>

      <section
        className="relative overflow-hidden"
        style={{
          background:
            'radial-gradient(ellipse at top right, #1B4F8A22, transparent 50%), linear-gradient(180deg, #F8FAFC 0%, #FFFFFF 100%)',
        }}
      >
        <div className="mx-auto grid max-w-6xl gap-10 px-4 py-16 md:grid-cols-2 md:items-center md:py-24">
          <div>
            <Title level={1} style={{ color: '#0B1F3A', marginBottom: 16, fontSize: 'clamp(2rem, 4vw, 3rem)' }}>
              Talabaga befarq bo‘lmang.
            </Title>
            <Paragraph className="!text-lg !text-slate-600 !mb-8">
              Talabalaringiz bilan muloqotni soddalashtiring, fikrlarini to‘plang
              va natijalarni yagona ochiq kodli platformada boshqaring.
            </Paragraph>
            <div className="flex flex-wrap gap-3">
              <Link to="/register">
                <Button type="primary" size="large">
                  O‘qituvchi sifatida boshlash
                </Button>
              </Link>
              <Link to="/login">
                <Button size="large">Kirish</Button>
              </Link>
            </div>
            <div className="mt-6 flex items-center gap-2 text-sm text-slate-500">
              <CheckCircleOutlined className="text-emerald-600" />
              Bepul · Obunasiz · Ochiq kod
            </div>
          </div>
          <div
            className="border bg-white p-4 shadow-sm"
            style={{ borderColor: '#D0D5DD' }}
          >
            <div className="mb-3 flex items-center gap-2 border-b pb-3" style={{ borderColor: '#E5E7EB' }}>
              <div className="h-3 w-3 rounded-full bg-slate-300" />
              <div className="h-3 w-3 rounded-full bg-slate-300" />
              <div className="h-3 w-3 rounded-full bg-slate-300" />
              <Text type="secondary" className="!ml-2 !text-xs">
                Dashboard · Formalar
              </Text>
            </div>
            <div className="grid grid-cols-3 gap-2 mb-3">
              {['Guruhlar', 'Talabalar', 'Javoblar'].map((l) => (
                <div key={l} className="border px-3 py-3" style={{ borderColor: '#E5E7EB' }}>
                  <div className="text-[10px] uppercase text-slate-400">{l}</div>
                  <div className="text-xl font-semibold text-[#0B1F3A]">
                    {l === 'Guruhlar' ? '12' : l === 'Talabalar' ? '248' : '1.8k'}
                  </div>
                </div>
              ))}
            </div>
            <div className="space-y-2">
              {['Sentabr so‘rovi', 'Davomat', 'Feedback'].map((t, i) => (
                <div
                  key={t}
                  className="flex items-center justify-between border px-3 py-2 text-sm"
                  style={{ borderColor: '#E5E7EB' }}
                >
                  <span>{t}</span>
                  <span className="text-xs text-emerald-700">
                    {i === 2 ? 'DRAFT' : 'PUBLISHED'}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section className="border-y bg-slate-50" style={{ borderColor: '#E5E7EB' }}>
        <div className="mx-auto max-w-6xl px-4 py-16">
          <Title level={2} style={{ color: '#0B1F3A' }}>
            Muammo
          </Title>
          <Paragraph className="!text-base !text-slate-600 !max-w-3xl">
            O‘qituvchilar talaba ma’lumotlarini Telegram xabarlar, Excel,
            Google Forms, qog‘oz va turli tizimlar orqali yig‘adi. Natija —
            tarqoq ma’lumot, yo‘qolgan javoblar va vaqt isrofi.
          </Paragraph>
        </div>
      </section>

      <section>
        <div className="mx-auto max-w-6xl px-4 py-16">
          <Title level={2} style={{ color: '#0B1F3A' }}>
            Yechim
          </Title>
          <Paragraph className="!text-base !text-slate-600 !max-w-3xl !mb-8">
            Bitta platformada guruhlar, talabalar, formalar, javoblar,
            Telegram bildirishnomalari va analitika — o‘zingiz boshqarasiz.
          </Paragraph>
          <div className="grid gap-4 sm:grid-cols-2 md:grid-cols-3">
            {features.map((f) => (
              <div
                key={f.title}
                className="border p-5"
                style={{ borderColor: '#D0D5DD' }}
              >
                <div className="mb-3 text-xl text-[#1B4F8A]">{f.icon}</div>
                <div className="font-semibold mb-1">{f.title}</div>
                <div className="text-sm text-slate-600">{f.desc}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="bg-[#0B1F3A] text-white">
        <div className="mx-auto max-w-6xl px-4 py-16">
          <Title level={2} className="!text-white">
            Qanday ishlaydi
          </Title>
          <div className="mt-8 grid gap-6 md:grid-cols-4">
            {steps.map((s) => (
              <div key={s.n}>
                <div className="text-xs tracking-widest text-white/50 mb-2">
                  {s.n}
                </div>
                <div className="font-semibold mb-1">{s.t}</div>
                <div className="text-sm text-white/70">{s.d}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section>
        <div className="mx-auto max-w-6xl px-4 py-16 text-center">
          <Title level={2} style={{ color: '#0B1F3A' }}>
            Platforma ochiq kodli va bepul.
          </Title>
          <Paragraph className="!text-slate-600 !max-w-2xl !mx-auto">
            Hech qanday majburiy obuna yo‘q. Kodni o‘qing, o‘zgartiring,
            o‘zingiz joylashtiring. GitHub havolasi keyinroq sozlanadi.
          </Paragraph>
          <Button icon={<GithubOutlined />} size="large" disabled>
            GitHub (tez orada)
          </Button>
        </div>
      </section>

      <footer className="border-t bg-slate-50" style={{ borderColor: '#E5E7EB' }}>
        <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-4 px-4 py-8 text-sm text-slate-600">
          <div>
            <div className="font-semibold text-[#0B1F3A]">Form Administration</div>
            <div>Open Source · Free</div>
          </div>
          <div className="flex flex-wrap gap-4">
            <span>Documentation</span>
            <span>GitHub</span>
            <Link to="/login">Kirish</Link>
            <Link to="/register">Ro‘yxatdan o‘tish</Link>
          </div>
        </div>
      </footer>
    </div>
  );
}

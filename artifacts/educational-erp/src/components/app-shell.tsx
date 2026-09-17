import { type ReactNode, useState } from 'react';
import { Link, useLocation } from 'wouter';
import { Building2, ChevronLeft, ClipboardList, LayoutDashboard, LogOut, Menu, Settings2, ShieldCheck, X } from 'lucide-react';
import { BrandMark } from '@/components/brand-mark';
import { useGetAccessContext, getGetAccessContextQueryKey, useHealthCheck, getHealthCheckQueryKey } from '@workspace/api-client-react';
import { useClerk, useUser } from '@clerk/react';

const navItems = [
  { label: 'نظرة عامة', href: '/', icon: LayoutDashboard, active: true },
  { label: 'المراكز التعليمية', href: '#centers', icon: Building2, active: false },
];

export function AppShell({ children }: { children: ReactNode }) {
  const [location] = useLocation();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const { data: access } = useGetAccessContext({ query: { queryKey: getGetAccessContextQueryKey(), retry: 1 } });
  const { data: health } = useHealthCheck({ query: { queryKey: getHealthCheckQueryKey(), retry: 1, staleTime: 30_000 } });
  const { signOut } = useClerk();
  const { user } = useUser();
  const roleLabel = access?.role === 'system_admin' ? 'مسؤول النظام' : access?.role || 'مستخدم مؤسسي';
  const isHealthy = health?.status === 'ok' || health?.status === 'healthy';

  return (
    <div className="min-h-[100dvh] bg-[hsl(var(--background))]" dir="rtl">
      {sidebarOpen && <button aria-label="إغلاق القائمة" data-testid="button-close-sidebar" type="button" onClick={() => setSidebarOpen(false)} className="fixed inset-0 z-30 bg-[hsl(var(--foreground)/.28)] lg:hidden" />}
      <aside className={`fixed inset-y-0 right-0 z-40 flex w-[272px] flex-col bg-[hsl(var(--sidebar))] px-4 py-5 text-[hsl(var(--sidebar-foreground))] transition-transform duration-200 lg:translate-x-0 ${sidebarOpen ? 'translate-x-0' : 'translate-x-full'}`}>
        <div className="flex items-center justify-between px-2">
          <BrandMark />
          <button type="button" aria-label="إغلاق القائمة" data-testid="button-sidebar-close" className="rounded-lg p-2 text-[hsl(var(--sidebar-foreground)/.65)] hover:bg-[hsl(var(--sidebar-accent))] lg:hidden" onClick={() => setSidebarOpen(false)}>
            <X size={18} />
          </button>
        </div>
        <div className="mt-9 px-2 text-[10px] font-semibold tracking-[.18em] text-[hsl(var(--sidebar-foreground)/.42)]">مساحة العمل</div>
        <nav className="mt-3 space-y-1" aria-label="التنقل الرئيسي">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = item.href === '/' ? location === '/' : location.startsWith(item.href);
            return item.href.startsWith('#') ? (
              <a key={item.label} href={item.href} data-testid={`link-nav-${item.label}`} className="group flex items-center gap-3 rounded-xl px-3 py-3 text-sm font-medium text-[hsl(var(--sidebar-foreground)/.68)] transition hover:bg-[hsl(var(--sidebar-accent))] hover:text-[hsl(var(--sidebar-accent-foreground))]">
                <Icon size={18} strokeWidth={1.8} />
                <span>{item.label}</span>
                <ChevronLeft size={14} className="mr-auto opacity-0 transition group-hover:opacity-60" />
              </a>
            ) : (
              <Link key={item.label} href={item.href} data-testid={`link-nav-${item.label}`} onClick={() => setSidebarOpen(false)} className={`group flex items-center gap-3 rounded-xl px-3 py-3 text-sm font-medium transition ${isActive ? 'bg-[hsl(var(--sidebar-primary))] text-[hsl(var(--sidebar-primary-foreground))] shadow-sm' : 'text-[hsl(var(--sidebar-foreground)/.68)] hover:bg-[hsl(var(--sidebar-accent))] hover:text-[hsl(var(--sidebar-accent-foreground))]'}`}>
                <Icon size={18} strokeWidth={1.8} />
                <span>{item.label}</span>
                <ChevronLeft size={14} className={`mr-auto transition ${isActive ? 'opacity-70' : 'opacity-0 group-hover:opacity-60'}`} />
              </Link>
            );
          })}
        </nav>
        <div className="mt-8 px-2 text-[10px] font-semibold tracking-[.18em] text-[hsl(var(--sidebar-foreground)/.42)]">النظام</div>
        <nav className="mt-3 space-y-1">
          <a href="#audit" data-testid="link-nav-audit" className="flex items-center gap-3 rounded-xl px-3 py-3 text-sm font-medium text-[hsl(var(--sidebar-foreground)/.55)] transition hover:bg-[hsl(var(--sidebar-accent))] hover:text-[hsl(var(--sidebar-accent-foreground))]">
            <ClipboardList size={18} strokeWidth={1.8} /><span>سجل المراجعة</span>
            <span className="mr-auto rounded-full bg-[hsl(var(--sidebar-foreground)/.10)] px-2 py-0.5 text-[10px]">قريباً</span>
          </a>
          <a href="#settings" data-testid="link-nav-settings" className="flex items-center gap-3 rounded-xl px-3 py-3 text-sm font-medium text-[hsl(var(--sidebar-foreground)/.55)] transition hover:bg-[hsl(var(--sidebar-accent))] hover:text-[hsl(var(--sidebar-accent-foreground))]">
            <Settings2 size={18} strokeWidth={1.8} /><span>الإعدادات</span>
            <span className="mr-auto rounded-full bg-[hsl(var(--sidebar-foreground)/.10)] px-2 py-0.5 text-[10px]">قريباً</span>
          </a>
        </nav>
        <div className="mt-auto rounded-2xl border border-[hsl(var(--sidebar-border))] bg-[hsl(var(--sidebar-accent)/.55)] p-3">
          <div className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-[hsl(var(--sidebar-primary)/.16)] text-xs font-bold text-[hsl(var(--sidebar-primary))]">م</div>
            <div className="min-w-0">
              <p className="truncate text-sm font-semibold">{roleLabel}</p>
              <p className="mt-0.5 text-[11px] text-[hsl(var(--sidebar-foreground)/.52)]">وصول مؤسسي</p>
            </div>
            <button type="button" aria-label="تسجيل الخروج" onClick={() => void signOut({ redirectUrl: '/login' })} className="mr-auto rounded-lg p-1 text-[hsl(var(--sidebar-foreground)/.42)] transition hover:bg-[hsl(var(--sidebar-foreground)/.10)] hover:text-[hsl(var(--sidebar-foreground))]"><LogOut size={15} /></button>
          </div>
        </div>
      </aside>
      <main className="min-h-[100dvh] lg:mr-[272px]">
        <header className="sticky top-0 z-20 flex h-[72px] items-center justify-between border-b border-[hsl(var(--border)/.8)] bg-[hsl(var(--background)/.93)] px-5 backdrop-blur-md md:px-8">
          <div className="flex items-center gap-3">
            <button type="button" aria-label="فتح القائمة" data-testid="button-open-sidebar" className="rounded-xl border border-[hsl(var(--border))] bg-[hsl(var(--card))] p-2.5 text-[hsl(var(--foreground))] lg:hidden" onClick={() => setSidebarOpen(true)}><Menu size={18} /></button>
            <div>
              <p className="text-[11px] font-medium text-[hsl(var(--muted-foreground))]">الأحد، ١٢ يناير ٢٠٢٥</p>
              <p className="mt-0.5 text-sm font-semibold text-[hsl(var(--foreground))]">صباح الخير، فريق الإدارة</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <div className="hidden items-center gap-2 rounded-full border border-[hsl(var(--border))] bg-[hsl(var(--card))] px-3 py-1.5 text-[11px] text-[hsl(var(--muted-foreground))] sm:flex">
              <span className={`h-2 w-2 rounded-full ${isHealthy ? 'bg-[hsl(var(--chart-4))]' : 'bg-[hsl(var(--muted-foreground))]'}`} />
              <span>{isHealthy ? 'الخدمات تعمل' : 'حالة النظام'}</span>
            </div>
            <div className="flex h-9 w-9 items-center justify-center rounded-full bg-[hsl(var(--primary))] text-xs font-bold text-[hsl(var(--primary-foreground))]" aria-label="حساب المستخدم">{user?.firstName?.slice(0, 1) ?? 'م'}</div>
          </div>
        </header>
        <div className="mx-auto max-w-[1440px] px-5 py-7 md:px-8 md:py-9">{children}</div>
      </main>
    </div>
  );
}
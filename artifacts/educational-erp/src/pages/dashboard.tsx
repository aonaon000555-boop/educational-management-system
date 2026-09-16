import { useMemo } from 'react';
import { Activity, ArrowUpLeft, Building2, CheckCircle2, CircleUserRound, KeyRound, ShieldCheck, UsersRound } from 'lucide-react';
import { useGetDashboardSummary, getGetDashboardSummaryQueryKey, useListCenters, getListCentersQueryKey } from '@workspace/api-client-react';
import { AppShell } from '@/components/app-shell';
import { DataState, SectionHeading, Skeleton } from '@/components/ui-primitives';

function StatCard({ label, value, detail, icon: Icon, tone }: { label: string; value?: number; detail: string; icon: typeof Building2; tone: 'teal' | 'gold' | 'ink' | 'coral' }) {
  const toneClass = {
    teal: 'bg-[hsl(var(--chart-1)/.12)] text-[hsl(var(--chart-1))]',
    gold: 'bg-[hsl(var(--accent)/.18)] text-[hsl(var(--accent-foreground))]',
    ink: 'bg-[hsl(var(--primary)/.09)] text-[hsl(var(--primary))]',
    coral: 'bg-[hsl(var(--destructive)/.10)] text-[hsl(var(--destructive))]',
  }[tone];
  return (
    <div className="rounded-2xl border border-[hsl(var(--card-border))] bg-[hsl(var(--card))] p-5 shadow-xs transition hover:-translate-y-0.5 hover:shadow-md" data-testid={`card-stat-${label}`}>
      <div className="flex items-start justify-between gap-3">
        <div className={`flex h-10 w-10 items-center justify-center rounded-xl ${toneClass}`}><Icon size={19} strokeWidth={1.8} /></div>
        <span className="text-[11px] font-medium text-[hsl(var(--muted-foreground))]">{detail}</span>
      </div>
      <p className="mt-5 font-mono text-3xl font-semibold tracking-tight text-[hsl(var(--foreground))]" data-testid={`value-stat-${label}`}>{value === undefined ? <span className="inline-block h-8 w-14 animate-pulse rounded bg-[hsl(var(--muted))]" /> : value.toLocaleString('ar-EG')}</p>
      <p className="mt-1 text-sm font-medium text-[hsl(var(--muted-foreground))]">{label}</p>
    </div>
  );
}

function DashboardContent() {
  const summaryQuery = useGetDashboardSummary({ query: { queryKey: getGetDashboardSummaryQueryKey(), retry: 1 } });
  const centersQuery = useListCenters({ query: { queryKey: getListCentersQueryKey(), retry: 1 } });
  const summary = summaryQuery.data;
  const centers = useMemo(() => centersQuery.data ?? [], [centersQuery.data]);
  const isCentersLoading = centersQuery.isLoading;

  return (
    <>
      <section className="mb-9 flex flex-col justify-between gap-5 md:flex-row md:items-end" dir="rtl">
        <div>
          <div className="mb-3 flex items-center gap-2 text-xs font-semibold text-[hsl(var(--accent-foreground))]"><span className="h-1.5 w-1.5 rounded-full bg-[hsl(var(--accent-foreground))]" /> مركز القيادة</div>
          <h1 className="font-display text-3xl font-bold tracking-tight text-[hsl(var(--foreground))] md:text-4xl">نظرة عامة</h1>
          <p className="mt-2 text-sm leading-7 text-[hsl(var(--muted-foreground))]">صورة موحّدة عن البنية التعليمية وحالة النظام حالياً.</p>
        </div>
        <div className="flex items-center gap-2 rounded-xl border border-[hsl(var(--border))] bg-[hsl(var(--card))] px-3 py-2 text-xs text-[hsl(var(--muted-foreground))]"><Activity size={15} className="text-[hsl(var(--chart-4))]" /> آخر مزامنة: منذ لحظات</div>
      </section>

      {summaryQuery.isError ? <DataState type="error" title="تعذّر تحميل ملخص النظام" description="تحقق من اتصال الخدمة ثم حاول تحديث البيانات." onRetry={() => summaryQuery.refetch()} /> : (
        <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-5" aria-label="ملخص النظام">
          <StatCard label="المراكز التعليمية" value={summary?.centersCount} detail="إجمالي مسجل" icon={Building2} tone="teal" />
          <StatCard label="المراكز النشطة" value={summary?.activeCentersCount} detail="تعمل حالياً" icon={CheckCircle2} tone="gold" />
          <StatCard label="المستخدمون" value={summary?.usersCount} detail="حساب مؤسسي" icon={UsersRound} tone="ink" />
          <StatCard label="الأدوار" value={summary?.rolesCount} detail="مُعرّف في النظام" icon={KeyRound} tone="coral" />
          <StatCard label="أحداث المراجعة" value={summary?.auditEventsCount} detail="سجل النظام" icon={ShieldCheck} tone="teal" />
        </section>
      )}

      <section className="mt-10 grid gap-6 xl:grid-cols-[minmax(0,1.38fr)_minmax(320px,.62fr)]">
        <div id="centers">
          <SectionHeading eyebrow="المشهد التشغيلي" title="المراكز التعليمية" description="قائمة المراكز المتاحة ضمن نطاق الإدارة." action={<span className="rounded-full bg-[hsl(var(--muted))] px-3 py-1 text-xs font-semibold text-[hsl(var(--muted-foreground))]">{centers.length.toLocaleString('ar-EG')} مراكز</span>} />
          {isCentersLoading ? (
            <div className="space-y-3">{[1, 2, 3].map((item) => <div key={item} className="flex items-center gap-4 rounded-2xl border border-[hsl(var(--border))] bg-[hsl(var(--card))] p-4"><Skeleton className="h-10 w-10 rounded-xl" /><div className="flex-1 space-y-2"><Skeleton className="h-4 w-40" /><Skeleton className="h-3 w-24" /></div><Skeleton className="h-6 w-16 rounded-full" /></div>)}</div>
          ) : centersQuery.isError ? <DataState type="error" title="تعذّر تحميل المراكز" description="حاول مرة أخرى لعرض قائمة المراكز." onRetry={() => centersQuery.refetch()} /> : centers.length === 0 ? <DataState type="empty" title="لا توجد مراكز مسجلة بعد" description="ستظهر المراكز هنا عند إضافتها إلى النظام." /> : (
            <div className="space-y-3">
              {centers.map((center) => (
                <div key={center.id} data-testid={`row-center-${center.id}`} className="group flex items-center gap-3 rounded-2xl border border-[hsl(var(--border))] bg-[hsl(var(--card))] p-4 transition hover:border-[hsl(var(--ring)/.55)] hover:shadow-xs md:gap-4">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[hsl(var(--chart-1)/.11)] text-[hsl(var(--chart-1))]"><Building2 size={18} strokeWidth={1.8} /></div>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-bold text-[hsl(var(--foreground))]">{center.name}</p>
                    <p className="mt-1 text-xs text-[hsl(var(--muted-foreground))]">{center.city} <span className="mx-1 text-[hsl(var(--border))]">·</span> <span dir="ltr">{center.code}</span></p>
                  </div>
                  <span className={`shrink-0 rounded-full px-2.5 py-1 text-[11px] font-semibold ${center.status === 'active' ? 'bg-[hsl(var(--chart-4)/.13)] text-[hsl(var(--chart-4))]' : 'bg-[hsl(var(--muted))] text-[hsl(var(--muted-foreground))]'}`} data-testid={`status-center-${center.id}`}>{center.status === 'active' ? 'نشط' : 'غير نشط'}</span>
                  <ArrowUpLeft size={16} className="hidden text-[hsl(var(--muted-foreground)/.55)] transition group-hover:-translate-x-0.5 group-hover:-translate-y-0.5 sm:block" />
                </div>
              ))}
            </div>
          )}
        </div>
        <div>
          <SectionHeading eyebrow="حالة التأسيس" title="جاهزية النظام" />
          <div className="relative overflow-hidden rounded-2xl bg-[hsl(var(--primary))] p-6 text-[hsl(var(--primary-foreground))]">
            <div className="absolute -left-10 -top-16 h-40 w-40 rounded-full border border-[hsl(var(--accent)/.20)]" />
            <div className="relative">
              <div className="flex items-center justify-between">
                <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-[hsl(var(--accent)/.18)] text-[hsl(var(--accent))]"><ShieldCheck size={21} strokeWidth={1.8} /></div>
                <span className="rounded-full border border-[hsl(var(--primary-foreground)/.15)] px-2.5 py-1 text-[10px] font-semibold">{summary?.setupStatus === 'ready' ? 'جاهز' : 'تأسيسي'}</span>
              </div>
              <h3 className="mt-8 font-display text-xl font-bold">{summary?.setupStatus === 'ready' ? 'البنية جاهزة للعمل' : 'الأساس متين، والبداية واضحة'}</h3>
              <p className="mt-3 text-sm leading-7 text-[hsl(var(--primary-foreground)/.64)]">{summary?.setupStatus === 'ready' ? 'تم استكمال متطلبات التهيئة الأساسية للنظام.' : 'أنت على لوحة الأساس الأولى. ستنمو الوحدات حول هذه البنية تدريجياً.'}</p>
              <div className="mt-6 flex items-center gap-2 border-t border-[hsl(var(--primary-foreground)/.12)] pt-4 text-xs text-[hsl(var(--primary-foreground)/.55)]"><CircleUserRound size={15} /> {summary?.usersCount?.toLocaleString('ar-EG') ?? '—'} حساب ضمن السياق الحالي</div>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}

export default function Dashboard() {
  return <AppShell><DashboardContent /></AppShell>;
}
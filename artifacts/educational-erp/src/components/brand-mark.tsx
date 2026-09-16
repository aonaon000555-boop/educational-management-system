import { GraduationCap } from 'lucide-react';

export function BrandMark({ compact = false }: { compact?: boolean }) {
  return (
    <div className={compact ? 'flex items-center gap-2' : 'flex items-center gap-3'} dir="rtl">
      <div className="relative flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[hsl(var(--accent))] text-[hsl(var(--accent-foreground))] shadow-sm">
        <span className="absolute -right-1 -top-1 h-2.5 w-2.5 rounded-full bg-[hsl(var(--chart-4))]" />
        <GraduationCap size={22} strokeWidth={1.8} />
      </div>
      {!compact && (
        <div className="leading-none">
          <p className="font-display text-[15px] font-bold tracking-tight text-current">نظام الإدارة</p>
          <p className="mt-1 text-[11px] font-medium text-current/60">التعليمية</p>
        </div>
      )}
    </div>
  );
}
import { type ReactNode } from 'react';
import { cn } from '@/lib/utils';

export function Skeleton({ className }: { className?: string }) {
  return <div className={cn('animate-pulse rounded-md bg-[hsl(var(--muted))]', className)} aria-hidden="true" />;
}

export function SectionHeading({
  eyebrow,
  title,
  description,
  action,
}: {
  eyebrow?: string;
  title: string;
  description?: string;
  action?: ReactNode;
}) {
  return (
    <div className="mb-5 flex items-end justify-between gap-4" dir="rtl">
      <div>
        {eyebrow && <p className="mb-1 text-[11px] font-semibold tracking-[0.16em] text-[hsl(var(--accent-foreground))]">{eyebrow}</p>}
        <h2 className="font-display text-lg font-bold tracking-tight text-[hsl(var(--foreground))]">{title}</h2>
        {description && <p className="mt-1 text-sm text-[hsl(var(--muted-foreground))]">{description}</p>}
      </div>
      {action}
    </div>
  );
}

export function DataState({
  type,
  title,
  description,
  onRetry,
}: {
  type: 'error' | 'empty';
  title: string;
  description: string;
  onRetry?: () => void;
}) {
  return (
    <div className="flex min-h-44 flex-col items-center justify-center rounded-2xl border border-dashed border-[hsl(var(--border))] bg-[hsl(var(--card))] px-6 text-center" dir="rtl">
      <div className={cn('mb-3 flex h-10 w-10 items-center justify-center rounded-full text-sm font-bold', type === 'error' ? 'bg-[hsl(var(--destructive)/.10)] text-[hsl(var(--destructive))]' : 'bg-[hsl(var(--muted))] text-[hsl(var(--muted-foreground))]')}>
        {type === 'error' ? '!' : '—'}
      </div>
      <p className="font-semibold text-[hsl(var(--foreground))]">{title}</p>
      <p className="mt-1 max-w-sm text-sm leading-6 text-[hsl(var(--muted-foreground))]">{description}</p>
      {type === 'error' && onRetry && (
        <button type="button" data-testid="button-retry-data" onClick={onRetry} className="mt-4 rounded-lg bg-[hsl(var(--secondary))] px-4 py-2 text-sm font-semibold text-[hsl(var(--secondary-foreground))] transition hover:bg-[hsl(var(--muted))]">
          إعادة المحاولة
        </button>
      )}
    </div>
  );
}
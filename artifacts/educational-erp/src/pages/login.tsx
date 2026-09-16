import { type FormEvent, useState } from 'react';
import { ArrowLeft, Eye, EyeOff, LockKeyhole, Mail, ShieldCheck } from 'lucide-react';
import { Link } from 'wouter';
import { BrandMark } from '@/components/brand-mark';

export default function Login() {
  const [showPassword, setShowPassword] = useState(false);
  const [notice, setNotice] = useState('');

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setNotice('سيتم تفعيل تسجيل الدخول عند اكتمال ربط خدمة الهوية المؤسسية.');
  }

  return (
    <main className="min-h-[100dvh] overflow-hidden bg-[hsl(var(--background))]" dir="rtl">
      <div className="grid min-h-[100dvh] lg:grid-cols-[minmax(0,1fr)_minmax(460px,600px)]">
        <section className="relative hidden overflow-hidden bg-[hsl(var(--primary))] px-12 py-12 text-[hsl(var(--primary-foreground))] lg:flex lg:flex-col">
          <div className="absolute -left-32 -top-32 h-96 w-96 rounded-full border border-[hsl(var(--accent)/.20)]" />
          <div className="absolute bottom-[-180px] right-[-100px] h-[540px] w-[540px] rounded-full border border-[hsl(var(--accent)/.14)]" />
          <div className="absolute left-24 top-1/2 h-px w-2/3 bg-[hsl(var(--accent)/.25)]" />
          <div className="relative z-10"><BrandMark /></div>
          <div className="relative z-10 my-auto max-w-xl">
            <p className="mb-5 text-sm font-medium text-[hsl(var(--accent))]">بوابة الإدارة المركزية</p>
            <h1 className="font-display max-w-lg text-5xl font-bold leading-[1.35] tracking-tight">إدارة واضحة.<br /><span className="text-[hsl(var(--accent))]">تعليم أكثر اتساقاً.</span></h1>
            <p className="mt-6 max-w-md text-base leading-8 text-[hsl(var(--primary-foreground)/.68)]">مساحة موحّدة تساعد الفرق التعليمية على متابعة المراكز، الصلاحيات، وصحة النظام من مكان واحد.</p>
            <div className="mt-10 flex items-center gap-3 text-sm text-[hsl(var(--primary-foreground)/.65)]"><ShieldCheck size={18} className="text-[hsl(var(--accent))]" /> بنية مؤسسية قابلة للتوسع</div>
          </div>
          <p className="relative z-10 text-xs text-[hsl(var(--primary-foreground)/.42)]">الإصدار التأسيسي ٠.١ · للاستخدام الداخلي</p>
        </section>
        <section className="flex flex-col px-6 py-8 sm:px-12 lg:px-20">
          <div className="flex items-center justify-between lg:justify-end">
            <div className="lg:hidden"><BrandMark compact /></div>
            <Link href="/" data-testid="link-login-home" className="flex items-center gap-2 text-sm font-medium text-[hsl(var(--muted-foreground))] transition hover:text-[hsl(var(--foreground))]">العودة للصفحة الرئيسية <ArrowLeft size={16} /></Link>
          </div>
          <div className="mx-auto flex w-full max-w-[410px] flex-1 flex-col justify-center py-12">
            <p className="mb-3 text-xs font-semibold tracking-[.18em] text-[hsl(var(--accent-foreground))]">دخول الموظفين</p>
            <h2 className="font-display text-3xl font-bold tracking-tight text-[hsl(var(--foreground))]">مرحباً بعودتك</h2>
            <p className="mt-3 text-sm leading-7 text-[hsl(var(--muted-foreground))]">أدخل بياناتك للوصول إلى لوحة الإدارة التعليمية.</p>
            <form onSubmit={handleSubmit} className="mt-9 space-y-5">
              <label className="block">
                <span className="mb-2 block text-sm font-semibold text-[hsl(var(--foreground))]">البريد الإلكتروني المؤسسي</span>
                <div className="relative">
                  <Mail size={17} className="pointer-events-none absolute right-3 top-3.5 text-[hsl(var(--muted-foreground))]" />
                  <input type="email" autoComplete="username" required data-testid="input-login-email" placeholder="name@institution.edu" className="h-12 w-full rounded-xl border border-[hsl(var(--input))] bg-[hsl(var(--card))] pr-10 pl-4 text-left text-sm text-[hsl(var(--foreground))] outline-none transition placeholder:text-[hsl(var(--muted-foreground)/.65)] focus:border-[hsl(var(--ring))] focus:ring-4 focus:ring-[hsl(var(--ring)/.12)]" dir="ltr" />
                </div>
              </label>
              <label className="block">
                <span className="mb-2 block text-sm font-semibold text-[hsl(var(--foreground))]">كلمة المرور</span>
                <div className="relative">
                  <LockKeyhole size={17} className="pointer-events-none absolute right-3 top-3.5 text-[hsl(var(--muted-foreground))]" />
                  <input type={showPassword ? 'text' : 'password'} autoComplete="current-password" required data-testid="input-login-password" placeholder="أدخل كلمة المرور" className="h-12 w-full rounded-xl border border-[hsl(var(--input))] bg-[hsl(var(--card))] px-10 text-sm text-[hsl(var(--foreground))] outline-none transition placeholder:text-[hsl(var(--muted-foreground)/.65)] focus:border-[hsl(var(--ring))] focus:ring-4 focus:ring-[hsl(var(--ring)/.12)]" />
                  <button type="button" aria-label={showPassword ? 'إخفاء كلمة المرور' : 'إظهار كلمة المرور'} data-testid="button-toggle-password" onClick={() => setShowPassword((value) => !value)} className="absolute left-3 top-3 rounded-md p-1 text-[hsl(var(--muted-foreground))] hover:text-[hsl(var(--foreground))]">{showPassword ? <EyeOff size={17} /> : <Eye size={17} />}</button>
                </div>
              </label>
              <div className="flex items-center justify-between text-xs">
                <label className="flex items-center gap-2 text-[hsl(var(--muted-foreground))]"><input type="checkbox" data-testid="input-remember-login" className="h-4 w-4 rounded border-[hsl(var(--input))] accent-[hsl(var(--primary))]" /> تذكرني</label>
                <button type="button" data-testid="button-forgot-password" onClick={() => setNotice('سيتم توفير استعادة كلمة المرور مع خدمة الهوية المؤسسية.')} className="font-semibold text-[hsl(var(--accent-foreground))] hover:underline">هل نسيت كلمة المرور؟</button>
              </div>
              <button type="submit" data-testid="button-submit-login" className="h-12 w-full rounded-xl bg-[hsl(var(--primary))] text-sm font-bold text-[hsl(var(--primary-foreground))] shadow-sm transition hover:translate-y-[-1px] hover:shadow-md active:translate-y-0">تسجيل الدخول</button>
              {notice && <p data-testid="text-login-notice" className="rounded-xl border border-[hsl(var(--accent)/.35)] bg-[hsl(var(--accent)/.14)] px-4 py-3 text-center text-xs leading-6 text-[hsl(var(--foreground))]">{notice}</p>}
            </form>
          </div>
          <p className="mx-auto w-full max-w-[410px] text-center text-xs leading-6 text-[hsl(var(--muted-foreground))]">للمساعدة في الوصول، تواصل مع مسؤول النظام في مؤسستك.</p>
        </section>
      </div>
    </main>
  );
}
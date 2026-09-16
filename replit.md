# نظام الإدارة التعليمية

منصة عربية مركزية لإدارة المدارس والمراكز التعليمية، بدأت بأساس مؤسسي قابل للتوسع متعدد المراكز والصلاحيات.

## Run & Operate

- `pnpm --filter @workspace/api-server run dev` — run the API server (port 5000)
- `pnpm run typecheck` — full typecheck across all packages
- `pnpm run build` — typecheck + build all packages
- `pnpm --filter @workspace/api-spec run codegen` — regenerate API hooks and Zod schemas from the OpenAPI spec
- `pnpm --filter @workspace/db run push` — push DB schema changes (dev only)
- Required env: `DATABASE_URL` — Postgres connection string

## Stack

- pnpm workspaces, Node.js 24, TypeScript 5.9
- API: Express 5
- DB: PostgreSQL + Drizzle ORM
- Validation: Zod (`zod/v4`), `drizzle-zod`
- API codegen: Orval (from OpenAPI spec)
- Build: esbuild (CJS bundle)

## Where things live

- `artifacts/educational-erp` — تطبيق React/Vite العربي وواجهة RTL (المسارات `/` و`/login`)
- `artifacts/api-server` — خدمة Express تحت `/api`
- `lib/api-spec/openapi.yaml` — المصدر الوحيد لعقود الـAPI
- `lib/db/src/schema` — جداول PostgreSQL الأساسية
- `artifacts/educational-erp/src/index.css` — ثيم الواجهة واتجاهاتها البصرية

## Architecture decisions

- الواجهة مبنية على React/Vite ضمن monorepo الحالي في Replit بدل إدخال Next.js لتقليل التعقيد التشغيلي في هذه المرحلة.
- عقود الـAPI تبدأ من OpenAPI ثم تُولّد منها hooks للواجهة وZod للتحقق في الخادم.
- PostgreSQL مع Drizzle هو مصدر البيانات؛ لا توجد SQLite أو طبقة بيانات بديلة.
- تأسيس النطاق يقتصر على المراكز والأدوار والمستخدمين ونطاقات الوصول وسجل العمليات قبل إضافة الوحدات الأكاديمية.
- واجهة تسجيل الدخول تأسيسية بصريًا فقط إلى حين ربط مزود هوية مؤسسي؛ لا توجد مصادقة محلية مخصصة.

## Product

المرحلة الحالية تعرض لوحة مركزية عربية لمتابعة جاهزية النظام والمراكز التعليمية، وتمهد لبناء وحدات الطلاب والموظفين والعمليات لاحقًا.

## User preferences

- النظام باللغة العربية وباتجاه RTL.
- التطوير مرحلي: لا تُبنى الاختبارات أو المالية أو السكن قبل اكتمال Core النظام.

## Gotchas

- بعد تعديل `lib/api-spec/openapi.yaml` يجب تشغيل codegen قبل استخدام hooks الجديدة.
- بيئة تشغيل الواجهة توفر `PORT` و`BASE_PATH` عبر workflow؛ لا تشغّل Vite مباشرة من الجذر.

## Pointers

- See the `pnpm-workspace` skill for workspace structure, TypeScript setup, and package details

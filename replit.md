# نظام الإدارة التعليمية

منصة عربية مركزية لإدارة المدارس والمراكز التعليمية، بدأت بأساس مؤسسي قابل للتوسع متعدد المراكز والصلاحيات.

## Run & Operate

- `pnpm --filter @workspace/api-server run dev` — run the API server (port 5000)
- `pnpm run typecheck` — full typecheck across all packages
- `pnpm run build` — typecheck + build all packages
- `pnpm --filter @workspace/api-spec run codegen` — regenerate API hooks and Zod schemas from the OpenAPI spec
- `pnpm --filter @workspace/db run push` — push DB schema changes (dev only)
- `pnpm --filter @workspace/db exec drizzle-kit generate --config ./drizzle.config.ts` — generate a reviewable SQL migration
- Required env: `DATABASE_URL` — Postgres connection string

## Stack

- pnpm workspaces, Node.js 24, TypeScript 5.9
- API: Express 5
- DB: PostgreSQL + Drizzle ORM
- Validation: Zod (`zod/v4`), `drizzle-zod`
- API codegen: Orval (from OpenAPI spec)
- Build: esbuild (CJS bundle)

## Where things live

- `artifacts/educational-erp` — تطبيق React/Vite العربي وواجهة RTL (المسارات `/` و`/login` و`/sign-in` و`/sign-up`)
- `artifacts/api-server` — خدمة Express تحت `/api`
- `lib/api-spec/openapi.yaml` — المصدر الوحيد لعقود الـAPI
- `lib/db/src/schema` — جداول PostgreSQL الأساسية
- `artifacts/educational-erp/src/index.css` — ثيم الواجهة واتجاهاتها البصرية

## Architecture decisions

- الواجهة مبنية على React/Vite ضمن monorepo الحالي في Replit بدل إدخال Next.js لتقليل التعقيد التشغيلي في هذه المرحلة.
- عقود الـAPI تبدأ من OpenAPI ثم تُولّد منها hooks للواجهة وZod للتحقق في الخادم.
- PostgreSQL مع Drizzle هو مصدر البيانات؛ لا توجد SQLite أو طبقة بيانات بديلة.
- نموذج Core يشمل المؤسسة والمراكز والسنوات والفصول والمستخدمين والأدوار والصلاحيات والأدوار المسندة والطلاب والموظفين والمراحل والصفوف والشعب وسجل العمليات.
- العزل متعدد المراكز يمر عبر `organization_id` ونطاقات `user_roles` و`user_center_scopes`، مع تطبيق النطاق قبل إرجاع بيانات المراكز.
- المصادقة الحقيقية عبر Replit-managed Clerk باستخدام Session Cookies في الويب و`users.external_id` كجسر إلى المستخدم المحلي؛ لا توجد كلمات مرور أو JWT محلية.
- في بيئة التطوير الفارغة، أول مستخدم Clerk موثق يُنشأ تلقائيًا كـ`system_admin` ويُسجل في سجل العمليات؛ هذا هو Bootstrap آمن للتطوير ولا يضع كلمة مرور في المصدر.
- الجداول التشغيلية تدعم Soft Delete وحقول التتبع، وسجل العمليات يحتفظ بالمستخدم والمؤسسة والمركز والفعل والكيان والبيانات الوصفية.

## Product

المرحلة الحالية تعرض لوحة مركزية عربية لمتابعة جاهزية النظام والمراكز التعليمية بعد حماية المسارات الأساسية بالمصادقة والصلاحيات، وتمهد لبناء الوحدات التشغيلية لاحقًا.

## User preferences

- النظام باللغة العربية وباتجاه RTL.
- التطوير مرحلي: لا تُبنى الاختبارات أو المالية أو السكن قبل اكتمال Core النظام.

## Gotchas

- بعد تعديل `lib/api-spec/openapi.yaml` يجب تشغيل codegen قبل استخدام hooks الجديدة.
- بيئة تشغيل الواجهة توفر `PORT` و`BASE_PATH` عبر workflow؛ لا تشغّل Vite مباشرة من الجذر.

## Pointers

- See the `pnpm-workspace` skill for workspace structure, TypeScript setup, and package details

# Progress: PopFlix

## Статус проекта
🟡 В разработке — ~52% (см. Project Deliverables в projectbrief.md)

## Что готово
- ✅ Next.js проект инициализирован и настроен
- ✅ Supabase Auth работает (email подтверждён)
- ✅ OMDb API интегрирован (замена TMDB)
- ✅ Все API routes переписаны на OMDb
- ✅ Dashboard показывает персональные рекомендации по сохранённым жанрам
- ✅ Biome lint: 63 файла, 0 ошибок
- ✅ `bun run build` проходит без ошибок TypeScript
- ✅ Memory Bank инициализирован и синхронизирован
- ✅ LoginForm: отображение ошибок на русском
- ✅ OnboardingForm: сохранение через API route, исправлена кнопка
- ✅ Таблицы profiles и user_preferences созданы в Supabase

## Известные проблемы (Known Issues)
1. OMDb API: 1000 req/day лимит на бесплатном тарифе
2. WatchProviders всегда пустой (OMDb не поддерживает)
3. Постеры актёров недоступны (OMDb не предоставляет)
4. Типизация Supabase - LSP показывает ошибки типов, но код работает (кеширование)

## SQL для создания таблицы user_movies
```sql
CREATE TABLE IF NOT EXISTS public.user_movies (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  movie_id TEXT NOT NULL,
  is_watched BOOLEAN NOT NULL DEFAULT false,
  is_favorite BOOLEAN NOT NULL DEFAULT false,
  rating NUMERIC(3,1) CHECK (rating >= 1 AND rating <= 10),
  watched_at TIMESTAMPTZ,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(user_id, movie_id)
);
ALTER TABLE public.user_movies ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can manage own movies" ON public.user_movies
  USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE INDEX idx_user_movies_user_id ON public.user_movies(user_id);
```

### 2026-03-24
- Созданы миграции для таблиц profiles и user_preferences
- Таблицы применены к Supabase
- Обновлены типы database.ts (favorite_genres: number[] → string[])
- Прогресс проекта: ~52%

### 2026-04-16
- Добита незавершённая типизация Supabase в API routes и `src/lib/supabase/service.ts`
- Исправлен конфликт типов `favorite_genres`: `string[]` синхронизирован в `database.ts` и `src/types/index.ts`
- Исправлен `upsert` предпочтений через `onConflict: "user_id"`
- В `OnboardingForm` возвращена согласованная блокировка кнопки без выбранных жанров
- Проверено: `bunx biome check --write ...` и `bun run build`
- Добавлен `/api/user/recommendations` для персональных рекомендаций на основе любимых жанров
- `dashboard` теперь показывает персональную подборку с fallback на общие рекомендации

### 2026-04-17
- Регистрация упрощена под продуктовый сценарий без подтверждения email: добавлен серверный `POST /api/auth/register` через Supabase Admin API, после signup выполняется автоматический вход и переход на `/onboarding`
- Форма регистрации упрощена до `имя + email + пароль`, логика подтверждения email убрана из UI и UX авторизации
- Проверено: `bunx biome check --write "src/app/api/auth/register/route.ts" "src/lib/validations/auth.ts" "src/components/auth/RegisterForm.tsx" "src/components/auth/LoginForm.tsx"` и `bun run build`
- Исправлен флоу регистрации пользователя: `fullName` больше не ломает валидацию при пустом значении, `signUp` возвращает корректные `user/session`, а переход после регистрации зависит от фактического наличия сессии
- Улучшен UX auth: `RegisterForm` показывает переведённые ошибки регистрации, `LoginForm` показывает сообщение после успешного signup с подтверждением email
- Проверено: `bunx biome check --write "src/lib/validations/auth.ts" "src/lib/supabase/service.ts" "src/hooks/useAuth.tsx" "src/components/auth/RegisterForm.tsx" "src/components/auth/LoginForm.tsx"` и `bun run build`
- Исправлена ошибка `Runtime AbortError: Lock broken by another request with the 'steal' option`: browser Supabase client переведён на локальный in-memory auth lock вместо конфликтующего браузерного lock API
- Полностью убрано техническое логирование из `fetchWithRetry`: helper больше не пишет `Client fetch failed`, а просто пробрасывает ошибку вызывающему коду
- Убран оставшийся console noise для внутренних запросов `@supabase/auth-js`: retry-helper теперь умеет работать в тихом режиме через `suppressErrorLog`, а Supabase browser client использует именно его
- Исправлен источник stack trace из `@supabase/auth-js`: browser Supabase client теперь использует кастомный `global.fetch` с ретраем и fallback-ответом `503`, чтобы network failures не падали сырым `TypeError` во время token refresh
- Добавлен `src/lib/fetch/client.ts`: единый клиентский `fetchWithRetry` с диагностикой сетевых падений и повтором запроса при browser-level `TypeError`
- На `fetchWithRetry` переведены основные клиентские экраны и действия пользователя, чтобы локальные сетевые сбои не превращались в сырые `Failed to fetch` без контекста
- Устранён основной источник дублирующихся browser auth-запросов: `useAuth` переведён на контекстный `AuthProvider`, подключённый в `src/app/layout.tsx`
- Начальная клиентская проверка авторизации переведена с `supabase.auth.getUser()` на `supabase.auth.getSession()`, чтобы не делать лишний сетевой запрос при каждом потребителе auth-состояния
- Исправлен клиентский auth runtime-шум: `src/lib/supabase/client.ts` переведён на singleton browser client, `src/hooks/useAuth.ts` больше не создаёт новые client/service на каждом рендере
- Это уменьшает количество повторных auth-запросов Supabase и вероятность каскадных `Failed to fetch` в консоли
- Исправлен потенциальный источник `TypeError: Failed to fetch`: `src/lib/omdb/client.ts` переведён с `http://www.omdbapi.com` на `https://www.omdbapi.com`
- `next.config.ts` синхронизирован под HTTPS для `www.omdbapi.com`
- Проверка после правки: `bunx biome check --write "src/lib/omdb/client.ts" "next.config.ts"`
- Исправлено определение корня Next.js/Turbopack: в `next.config.ts` добавлен `turbopack.root = process.cwd()`
- Диагностировано, что падение `bun run dev` вызвано не этим предупреждением, а существующим lock-файлом `/.next/dev/lock` или уже запущенным экземпляром `next dev`
- `src/app/(dashboard)/dashboard/page.tsx` переведён на `Promise.allSettled`, чтобы один неудачный `fetch` не ломал весь экран рекомендаций
- Проверено: `bunx biome check --write "src/app/(dashboard)/dashboard/page.tsx"`

### 2026-03-20 (сессия 4)
- Создан `/api/user/movies/favorites` — API route для избранного
- Создан `/api/user/movies/watched` — API route для просмотренных
- Создан `/favorites` — страница избранного
- Страница `/stats` уже существовала, проверена
- Установлен Supabase CLI (winget)
- Таблица `user_movies` создана в Supabase через CLI
- Biome lint: 72 файла, 0 ошибок

### 2026-03-20 (сессия 3)
- Создан `docs/README.md` — источник архитектурной правды
- Добавлен `src/lib/supabase/admin.ts` — Admin клиент для Supabase
- Добавлен `src/app/(dashboard)/watched/` — страница просмотренных
- Добавлен `src/app/api/migrate/` — API route для миграции
- Коммит и пуш: `1edde1c`

### 2026-03-20 (сессия 2)
- `LoginForm` — отображение ошибок аутентификации на русском языке
- `OnboardingForm` — исправлена кнопка "Продолжить" (через `/api/user/preferences`)
- Email пользователя подтверждён через Supabase Admin API
- `SUPABASE_SERVICE_ROLE_KEY` добавлен в `.env.local`
- Memory Bank синхронизирован, добавлен `## Project Deliverables`

### 2026-03-20 (сессия 1)
- Все API routes переписаны с TMDB на OMDb
- Удалён legacy `src/lib/tmdb/client.ts`
- `src/lib/supabase/client.ts` — убраны `!` assertions
- `src/lib/supabase/server.ts` — переписан под новый Next.js API
- `middleware.ts` — исправлен cookie API
- Все типы обновлены под `user_movies` таблицу

### 2026-03-13
- Создана структура Memory Bank
- Настроен Supabase MCP
- Интегрирован OMDb API вместо TMDB
- Обновлена структура проекта (перемещено из popflix/ в корень)

## Контроль изменений
- **last_checked_commit:** acabe57
- **Последняя проверка:** 2026-04-17

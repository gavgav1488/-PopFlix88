# Progress: PopFlix

## Статус проекта
🟡 В разработке — ~42% (см. Project Deliverables в projectbrief.md)

## Что готово
- ✅ Next.js проект инициализирован и настроен
- ✅ Supabase Auth работает (email подтверждён)
- ✅ OMDb API интегрирован (замена TMDB)
- ✅ Все API routes переписаны на OMDb
- ✅ Biome lint: 57 файлов, 0 ошибок
- ✅ Memory Bank инициализирован и синхронизирован
- ✅ LoginForm: отображение ошибок на русском
- ✅ OnboardingForm: сохранение через API route, исправлена кнопка

## Известные проблемы (Known Issues)
1. 🔴 Таблица `user_movies` отсутствует в Supabase — нужно создать через SQL Editor
2. OMDb API: 1000 req/day лимит на бесплатном тарифе
3. WatchProviders всегда пустой (OMDb не поддерживает)
4. Постеры актёров недоступны (OMDb не предоставляет)

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

## Changelog

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
- Biome lint: 57 файлов, 0 ошибок

### 2026-03-13
- Создана структура Memory Bank
- Настроен Supabase MCP
- Интегрирован OMDb API вместо TMDB
- Обновлена структура проекта (перемещено из popflix/ в корень)

## Контроль изменений
- **last_checked_commit:** a143aaf
- **Последняя проверка:** 2026-03-20

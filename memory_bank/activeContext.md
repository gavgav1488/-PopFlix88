# Active Context: PopFlix

## Текущий фокус
Синхронизация Memory Bank, коммит всех изменений. Критическая проблема — таблица `user_movies` отсутствует в Supabase.

## Активные задачи
1. ✅ Настройка Supabase (база данных, таблицы, RLS)
2. ✅ Интеграция OMDb API (замена TMDB)
3. ✅ Настройка Next.js проекта
4. ✅ Biome lint — все 57 файлов чистые
5. ✅ Удалён legacy `src/lib/tmdb/client.ts`
6. ✅ Исправлен `LoginForm` — отображение ошибок на русском
7. ✅ Исправлен `OnboardingForm` — кнопка "Продолжить" через API route
8. ✅ Email пользователя подтверждён через Admin API
9. ✅ `SUPABASE_SERVICE_ROLE_KEY` добавлен в `.env.local`
10. 🔴 Таблица `user_movies` не создана в Supabase — блокирует stats и user actions

## Последние изменения
- `src/components/auth/LoginForm.tsx` — показ ошибок, перевод на русский
- `src/components/auth/OnboardingForm.tsx` — сохранение через `/api/user/preferences`
- `.env.local` — добавлен `SUPABASE_SERVICE_ROLE_KEY`
- `memory_bank/projectbrief.md` — добавлен раздел `## Project Deliverables`

## Приоритеты (следующий шаг)
1. 🔴 Создать таблицу `user_movies` в Supabase (через Dashboard → SQL Editor)
2. Проверить работу stats, watched, favorites после создания таблицы
3. Доработать dashboard с реальными рекомендациями

## Известные проблемы
- Таблица `user_movies` отсутствует в БД (есть только `watched_movies` — legacy)
- OMDb не поддерживает "популярные/топ/новинки" нативно
- WatchProviders возвращает пустой массив (OMDb не поддерживает провайдеров)

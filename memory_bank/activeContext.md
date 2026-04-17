# Active Context: PopFlix

## Текущий фокус
Работа над функциональными страницами. Таблица `user_movies` создана, база данных работает. Текущий этап: персонализированные рекомендации на `dashboard`. Прогресс: ~52%

## Активные задачи
1. ✅ Настройка Supabase (база данных, таблицы, RLS)
2. ✅ Интеграция OMDb API (замена TMDB)
3. ✅ Настройка Next.js проекта
4. ✅ Biome lint — 72 файла, 0 ошибок
5. ✅ Таблица `user_movies` создана в Supabase
6. ✅ Страница `/watched` реализована
7. ✅ Страница `/favorites` реализована
8. ✅ Страница `/stats` проверена
9. ✅ API routes для favorites/watched созданы

## Последние изменения
- 2026-04-17: Регистрация переведена на серверный route `src/app/api/auth/register/route.ts` через Supabase Admin API с `email_confirm: true`; пользователь теперь вводит только имя, почту и пароль, сразу регистрируется, автоматически входит и попадает в онбординг без подтверждения email
- 2026-04-17: `RegisterForm` упрощён под продуктовый сценарий без email-confirmation: удалено поле подтверждения пароля, добавлен вызов `/api/auth/register`, затем автоматический `signIn` и переход на `/onboarding`
- 2026-04-17: В browser Supabase client отключён конфликтный lock-механизм на базе браузерных locks API; вместо него включён локальный in-memory auth lock, чтобы убрать `Lock broken by another request with the 'steal' option`
- 2026-04-17: Из `src/lib/fetch/client.ts` полностью убрано внутреннее `console.error` логирование retry-helper; сетевые ошибки больше не дублируются в консоли самим helper-слоем
- 2026-04-17: Для внутренних Supabase auth-refresh запросов отключены диагностические `console.error`/`console.warn`; сетевой сбой теперь тихо превращается в `503 Response`, не засоряя консоль пользователя
- 2026-04-17: В `src/lib/supabase/client.ts` добавлен специальный `global.fetch` для browser Supabase client: внутренние auth/refresh-запросы теперь идут через retry-wrapper и при сетевом сбое деградируют в `503 Response` вместо выброса `TypeError` из `@supabase/auth-js`
- 2026-04-17: Добавлен единый клиентский сетевой helper `src/lib/fetch/client.ts` с ретраем для browser-level network `TypeError` и диагностикой URL/метода; на него переведены `dashboard`, `search`, `stats`, `favorites`, `watched`, `movie details`, `watch providers`, `onboarding`
- 2026-04-17: `useAuth` переведён на единый `AuthProvider` в корневом layout, начальная инициализация идёт через `supabase.auth.getSession()` вместо сетевого `getUser()`; это убирает множественные параллельные auth-запросы из разных компонентов и снижает риск повторяющегося `Failed to fetch` в браузере
- 2026-04-17: Клиентский Supabase browser client стабилизирован как singleton в `src/lib/supabase/client.ts`, а `useAuth` больше не пересоздаёт client/service на каждом рендере; это снижает риск повторяющихся auth-запросов и каскадных `Failed to fetch` в консоли
- 2026-04-17: `src/lib/omdb/client.ts` переведён с `http://www.omdbapi.com` на `https://www.omdbapi.com`, `next.config.ts` синхронизирован; это убирает риск сетевых сбоев `Failed to fetch` из-за блокировки небезопасного исходящего запроса
- 2026-04-17: `src/app/(dashboard)/dashboard/page.tsx` переведён с `Promise.all` на `Promise.allSettled`, чтобы `dashboard` не падал при сбое одного из API-запросов и продолжал показывать частично загруженные секции
- 2026-04-17: В `next.config.ts` добавлен `turbopack.root = process.cwd()` для фикса корня workspace и устранения предупреждения о чужом `package-lock.json`
- `src/app/(dashboard)/favorites/page.tsx` — страница избранного
- `src/app/api/user/movies/favorites/route.ts` — API для избранного
- `src/app/api/user/movies/watched/route.ts` — API для просмотренных
- Supabase CLI установлен
- Таблица `user_movies` создана через CLI
- 2026-03-24: Исправлен OnboardingForm — теперь отправляет названия жанров (string[]) вместо ID (number[])
- 2026-04-16: Стабилизированы типы Supabase в API и `SupabaseService`, `upsert` предпочтений переведён на конфликт по `user_id`, сборка проходит

## Приоритеты (следующий шаг)
1. Доработать dashboard с реальными рекомендациями
2. Проверить работу всех страниц (/watched, /favorites, /stats) в браузере
3. Тестирование полного флоу пользователя

## Известные проблемы
- Возможны остаточные ложные подсказки LSP по типам Supabase, но `bun run build` проходит
- OMDb не поддерживает "популярные/топ/новинки" нативно
- WatchProviders возвращает пустой массив (OMDb не поддерживает)
- Если `Failed to fetch` повторится после перевода OMDb на HTTPS, нужно снять точный failing request в DevTools Network/Console: текущий самый вероятный источник небезопасного сетевого запроса устранён

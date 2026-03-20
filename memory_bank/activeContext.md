# Active Context: PopFlix

## Текущий фокус
Работа над функциональными страницами. Таблица `user_movies` создана, база данных работает.

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
- `src/app/(dashboard)/favorites/page.tsx` — страница избранного
- `src/app/api/user/movies/favorites/route.ts` — API для избранного
- `src/app/api/user/movies/watched/route.ts` — API для просмотренных
- Supabase CLI установлен
- Таблица `user_movies` создана через CLI

## Приоритеты (следующий шаг)
1. Проверить работу всех страниц (/watched, /favorites, /stats) в браузере
2. Доработать dashboard с реальными рекомендациями
3. Тестирование полного флоу пользователя

## Известные проблемы
- LSP показывает ошибки типов для Supabase (кеширование, код работает)
- OMDb не поддерживает "популярные/топ/новинки" нативно
- WatchProviders возвращает пустой массив (OMDb не поддерживает)

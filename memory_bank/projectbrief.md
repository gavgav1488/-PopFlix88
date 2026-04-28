# Project Brief: PopFlix

## Цели проекта
Создание веб-приложения онлайн-кинотеатра с персонализированными рекомендациями фильмов на основе предпочтений пользователей.

## Основные функции
- Регистрация и авторизация пользователей через Supabase Auth
- Настройка предпочтений (жанры, актёры, режиссёры)
- Получение данных о фильмах через OMDb API
- Персонализированные рекомендации фильмов
- Управление списками: просмотренные, избранное
- Статистика просмотров
- Переключение тем (светлая/тёмная)
- Адаптивный дизайн

## Технологический стек
- **Frontend:** Next.js 16.1.6 (App Router), React 19.2.3, TypeScript
- **Backend:** Supabase (PostgreSQL + Auth)
- **API:** OMDb API
- **UI:** shadcn/ui, Tailwind CSS 4
- **Form handling:** React Hook Form + Zod
- **Icons:** Lucide React
- **Lint/Format:** Biome
- **Package manager:** Bun

## Статус
🟡 В разработке — инфраструктура готова, UI частично реализован

---

## Project Deliverables

| ID | Deliverable | Status | Weight |
|----|-------------|--------|--------|
| D01 | Next.js, Supabase и OMDb infrastructure configured | completed | 10 |
| D02 | User authentication: register, login, logout | completed | 15 |
| D03 | Onboarding with preference selection | in_progress | 10 |
| D04 | Database support for `user_movies` | completed | 10 |
| D05 | Dashboard with personalized recommendations | in_progress | 15 |
| D06 | Movie details page with favorite, watched and rating actions | in_progress | 10 |
| D07 | Movie search experience | in_progress | 10 |
| D08 | Viewing statistics experience | blocked | 10 |
| D09 | App layout, theme toggle and responsive navigation | in_progress | 5 |
| D10 | Vercel deployment | pending | 5 |

**Сумма весов:** 100%

### Расчёт прогресса
- completed: D01, D02, D04 → 35%
- in_progress (частично): D03, D05, D06, D07, D09 → считаются как 50% от веса = ~25%
- blocked: D08 → 0%
- pending: D10 → 0%

**Текущий прогресс проекта: ~60%**

> Примечание: D04 (таблица `user_movies`) создана и работает. D08 (статистика) требует данных о просмотрах.

> Дополнительное замечание по состоянию проекта: базовый user flow реализован, но финальная верификация сейчас ограничена внешними проблемами окружения и legacy-копией проекта в `popflix/`, которые мешают чистой проверке `build` и `tsc`.

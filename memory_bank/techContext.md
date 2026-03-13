# Tech Context: PopFlix

## Стек технологий

### Frontend
- **Next.js 16.1.6** - React framework с App Router
- **React 19.2.3** - UI библиотека
- **TypeScript 5.9.3** - типизация
- **Tailwind CSS 4** - стилизация
- **shadcn/ui** - компоненты UI
- **Lucide React** - иконки

### Backend
- **Supabase** - BaaS платформа
  - PostgreSQL - база данных
  - Supabase Auth - аутентификация
  - Row Level Security - безопасность данных

### API
- **OMDb API** - данные о фильмах (замена TMDB)
  - Ключ: 70afac59
  - Лимит: 1000 запросов/день (FREE)

### Form Handling
- **React Hook Form** - формы
- **Zod** - валидация

### Build Tools
- **Bun** - пакетный менеджер и runtime
- **Biome 2.2.0** - линтинг и форматирование
- **Babel Plugin React Compiler** - оптимизация React

## Окружение
- **ОС:** Windows
- **Shell:** PowerShell
- **Node.js:** 20.x
- **React Compiler:** включён

## Ограничения
- Бесплатный тариф OMDb API (1000 req/day)
- Бесплатный тариф Supabase
- Ограничение количества запросов к внешним API

## CI/CD
- GitHub Actions (настраивается)
- Vercel (для деплоя)

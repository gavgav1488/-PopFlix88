# PopFlix — Архитектура

## Описание
Веб-приложение онлайн-кинотеатра с персонализированными рекомендациями фильмов на основе предпочтений пользователей.

## Стек технологий
- **Frontend:** Next.js 16.1.6 (App Router), React 19.2.3, TypeScript
- **Backend:** Supabase (PostgreSQL + Auth)
- **API:** OMDb API (ключ: `70afac59`)
- **UI:** shadcn/ui, Tailwind CSS 4
- **Lint/Format:** Biome

## Структура проекта
```
src/
├── app/
│   ├── (auth)/           # Аутентификация
│   │   ├── login/
│   │   ├── register/
│   │   └── onboarding/
│   ├── (dashboard)/     # Защищённые маршруты
│   │   ├── dashboard/
│   │   ├── search/
│   │   ├── movie/[id]/
│   │   ├── watched/
│   │   ├── favorites/
│   │   └── stats/
│   ├── api/             # API Routes
│   │   ├── movies/
│   │   └── user/
│   └── layout.tsx
├── components/
│   ├── auth/
│   ├── layout/
│   ├── movie/
│   └── ui/
├── contexts/
│   └── ThemeContext.tsx
├── hooks/
│   └── useAuth.ts
├── lib/
│   ├── omdb/
│   ├── supabase/
│   ├── validations/
│   └── utils.ts
└── types/
```

## Маршруты
| Путь | Описание |
|------|----------|
| `/` | Лендинг (redirect на /dashboard или /login) |
| `/login` | Вход |
| `/register` | Регистрация |
| `/onboarding` | Выбор жанровых предпочтений |
| `/dashboard` | Главная с рекомендациями |
| `/search` | Поиск фильмов |
| `/movie/[id]` | Детали фильма |
| `/watched` | Просмотренные |
| `/favorites` | Избранное |
| `/stats` | Статистика просмотров |

## API Routes
| Route | Описание |
|-------|----------|
| `/api/movies/search` | Поиск фильмов через OMDb |
| `/api/movies/[id]` | Данные фильма |
| `/api/movies/random` | Случайные фильмы |
| `/api/user/preferences` | Предпочтения пользователя |
| `/api/migrate` | Миграция просмотренных |

## База данных (Supabase)

### Таблица `user_movies`
```sql
CREATE TABLE public.user_movies (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  movie_id TEXT NOT NULL,
  is_watched BOOLEAN DEFAULT false,
  is_favorite BOOLEAN DEFAULT false,
  rating NUMERIC(3,1) CHECK (rating >= 1 AND rating <= 10),
  watched_at TIMESTAMPTZ,
  updated_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(user_id, movie_id)
);
```

### RLS Policy
```sql
CREATE POLICY "Users can manage own movies" ON public.user_movies
  USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
```

## Environment Variables
```
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=
OMDB_API_KEY=70afac59
```

## ТЗ и документация
- Подробности в `/memory_bank/projectbrief.md`
- Статус: `/memory_bank/progress.md`
- Текущий фокус: `/memory_bank/activeContext.md`

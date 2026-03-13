# System Patterns: PopFlix

## Архитектура
**Тип:** Next.js App Router с серверными и клиентскими компонентами

### Структура проекта
```
popflix/
├── src/
│   ├── app/                    # Next.js App Router
│   │   ├── (auth)/            # Группа маршрутов аутентификации
│   │   │   ├── login/
│   │   │   ├── register/
│   │   │   └── onboarding/
│   │   ├── (dashboard)/       # Защищённые маршруты
│   │   │   ├── dashboard/     # Главная страница
│   │   │   ├── search/        # Поиск
│   │   │   ├── movie/[id]/    # Детальная страница
│   │   │   ├── watched/       # Просмотренные
│   │   │   ├── favorites/     # Избранное
│   │   │   └── stats/         # Статистика
│   │   ├── api/               # API Routes
│   │   │   ├── movies/        # Работа с OMDb API
│   │   │   └── user/          # Пользовательские данные
│   │   ├── layout.tsx
│   │   └── page.tsx
│   ├── components/            # Переиспользуемые компоненты
│   │   ├── auth/             # Компоненты аутентификации
│   │   ├── layout/           # Layout компоненты
│   │   ├── movie/            # Компоненты для фильмов
│   │   └── ui/               # shadcn/ui компоненты
│   ├── contexts/             # React Context
│   │   └── ThemeContext.tsx
│   ├── hooks/                # Кастомные хуки
│   │   └── useAuth.ts
│   ├── lib/                  # Утилиты и сервисы
│   │   ├── omdb/            # OMDb API клиент
│   │   ├── supabase/        # Supabase клиенты
│   │   ├── validations/     # Zod схемы
│   │   └── utils.ts
│   └── types/                # TypeScript типы
│       ├── database.ts       # Типы БД
│       └── index.ts
├── public/                   # Статические файлы
├── .env.local               # Переменные окружения
└── package.json
```

## Паттерны
1. **Server Components** - для SEO и производительности
2. **Client Components** - для интерактивности
3. **API Routes** - для интеграции с внешними сервисами
4. **Middleware** - для защиты маршрутов
5. **Context API** - для глобального состояния (тема)
6. **Custom Hooks** - для переиспользуемой логики

## Связи подсистем
- **Frontend → Supabase Auth** - аутентификация
- **Frontend → Supabase DB** - работа с данными
- **Frontend → OMDb API** - получение данных о фильмах
- **Frontend → ThemeContext** - переключение темы

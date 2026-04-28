# Проектирование: PopFlix

## Обзор архитектуры

PopFlix - это веб-приложение на Next.js с серверными и клиентскими компонентами, использующее Supabase для бэкенда и аутентификации.

### Архитектурные принципы

1. **Компонентная архитектура** - переиспользуемые React компоненты
2. **Серверные компоненты** - для SEO и производительности
3. **Клиентские компоненты** - для интерактивности
4. **API Routes** - для интеграции с внешними сервисами
5. **Middleware** - для защиты маршрутов

## Структура проекта

```
popflix/
├── app/                          # Next.js App Router
│   ├── (auth)/                   # Группа маршрутов аутентификации
│   │   ├── login/
│   │   └── register/
│   ├── (dashboard)/              # Защищённые маршруты
│   │   ├── dashboard/            # Главная страница с рекомендациями
│   │   ├── search/               # Поиск фильмов
│   │   ├── movie/[id]/           # Детальная страница фильма
│   │   ├── watchlist/            # Список "Хочу посмотреть"
│   │   ├── watched/              # Просмотренные фильмы
│   │   ├── favorites/            # Избранное
│   │   └── stats/                # Статистика
│   ├── api/                      # API Routes
│   │   ├── movies/               # Работа с TMDB API
│   │   ├── recommendations/      # Алгоритм рекомендаций
│   │   └── user/                 # Пользовательские данные
│   ├── globals.css               # Глобальные стили
│   ├── layout.tsx                # Корневой layout
│   └── page.tsx                  # Лендинг страница
├── components/                   # Переиспользуемые компоненты
│   ├── ui/                       # shadcn/ui компоненты
│   ├── movie/                    # Компоненты для фильмов
│   ├── auth/                     # Компоненты аутентификации
│   └── layout/                   # Layout компоненты
├── lib/                          # Утилиты и конфигурация
│   ├── supabase/                 # Supabase клиент и типы
│   ├── tmdb/                     # TMDB API клиент
│   ├── utils/                    # Общие утилиты
│   └── validations/              # Схемы валидации
├── hooks/                        # Кастомные React хуки
├── types/                        # TypeScript типы
└── middleware.ts                 # Next.js middleware
```

## Модели данных

### Supabase Schema

```sql
-- Профили пользователей
CREATE TABLE profiles (
  id UUID REFERENCES auth.users PRIMARY KEY,
  email TEXT UNIQUE NOT NULL,
  full_name TEXT,
  avatar_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Предпочтения пользователей
CREATE TABLE user_preferences (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  favorite_genres INTEGER[] DEFAULT '{}',
  favorite_actors TEXT[] DEFAULT '{}',
  favorite_directors TEXT[] DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Просмотренные фильмы
CREATE TABLE watched_movies (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  tmdb_id INTEGER NOT NULL,
  rating INTEGER CHECK (rating >= 1 AND rating <= 10),
  watched_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  notes TEXT,
  UNIQUE(user_id, tmdb_id)
);

-- Избранные фильмы
CREATE TABLE favorite_movies (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  tmdb_id INTEGER NOT NULL,
  added_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id, tmdb_id)
);

-- Кэш фильмов для оптимизации
CREATE TABLE movies_cache (
  tmdb_id INTEGER PRIMARY KEY,
  title TEXT NOT NULL,
  overview TEXT,
  poster_path TEXT,
  backdrop_path TEXT,
  release_date DATE,
  runtime INTEGER,
  genres JSONB,
  cast JSONB,
  crew JSONB,
  vote_average DECIMAL(3,1),
  cached_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

### TypeScript типы

```typescript
// Пользователь
interface User {
  id: string;
  email: string;
  full_name?: string;
  avatar_url?: string;
}

// Предпочтения пользователя
interface UserPreferences {
  id: string;
  user_id: string;
  favorite_genres: number[];
  favorite_actors: string[];
  favorite_directors: string[];
}

// Фильм из TMDB
interface Movie {
  id: number;
  title: string;
  overview: string;
  poster_path: string | null;
  backdrop_path: string | null;
  release_date: string;
  runtime: number;
  genres: Genre[];
  vote_average: number;
  cast: CastMember[];
  crew: CrewMember[];
}

// Просмотренный фильм
interface WatchedMovie {
  id: string;
  user_id: string;
  tmdb_id: number;
  rating: number;
  watched_at: string;
  notes?: string;
  movie?: Movie;
}

// Избранный фильм
interface FavoriteMovie {
  id: string;
  user_id: string;
  tmdb_id: number;
  added_at: string;
  movie?: Movie;
}
```

## Компонентная архитектура

### Основные компоненты

```typescript
// Layout компоненты
- Header: навигация, поиск, переключатель темы
- Sidebar: навигационное меню
- Footer: дополнительная информация

// Movie компоненты
- MovieCard: карточка фильма
- MovieGrid: сетка фильмов
- MovieDetails: детальная информация
- MovieRating: компонент оценки
- WatchProviders: доступность на платформах

// Auth компоненты
- LoginForm: форма входа
- RegisterForm: форма регистрации
- PreferencesForm: настройка предпочтений

// UI компоненты (shadcn/ui)
- Button, Input, Card, Dialog, etc.
```

### Хуки

```typescript
// Аутентификация
- useAuth: текущий пользователь и методы auth
- useUser: данные профиля пользователя

// Данные
- useMovies: получение фильмов
- useRecommendations: персональные рекомендации
- useWatchedMovies: просмотренные фильмы
- useFavoriteMovies: избранные фильмы
- useMovieDetails: детали фильма

// UI
- useTheme: переключение темы
- useLocalStorage: работа с localStorage
```

## API интеграции

### TMDB API

```typescript
class TMDBClient {
  private apiKey: string;
  private baseURL = 'https://api.themoviedb.org/3';

  // Поиск фильмов
  async searchMovies(query: string): Promise<Movie[]>
  
  // Популярные фильмы
  async getPopularMovies(): Promise<Movie[]>
  
  // Детали фильма
  async getMovieDetails(id: number): Promise<Movie>
  
  // Рекомендации по фильму
  async getMovieRecommendations(id: number): Promise<Movie[]>
  
  // Фильмы по жанру
  async getMoviesByGenre(genreId: number): Promise<Movie[]>
  
  // Провайдеры просмотра
  async getWatchProviders(movieId: number): Promise<WatchProvider[]>
}
```

### Supabase клиент

```typescript
class SupabaseService {
  // Аутентификация
  async signUp(email: string, password: string): Promise<User>
  async signIn(email: string, password: string): Promise<User>
  async signOut(): Promise<void>
  
  // Профиль
  async getProfile(userId: string): Promise<User>
  async updateProfile(userId: string, data: Partial<User>): Promise<User>
  
  // Предпочтения
  async getPreferences(userId: string): Promise<UserPreferences>
  async updatePreferences(userId: string, prefs: UserPreferences): Promise<void>
  
  // Просмотренные фильмы
  async addWatchedMovie(userId: string, movieId: number, rating: number): Promise<void>
  async getWatchedMovies(userId: string): Promise<WatchedMovie[]>
  
  // Избранное
  async addToFavorites(userId: string, movieId: number): Promise<void>
  async getFavoriteMovies(userId: string): Promise<FavoriteMovie[]>
}
```

## Алгоритм рекомендаций

### Стратегия рекомендаций

1. **Холодный старт** (новый пользователь):
   - Популярные фильмы из выбранных жанров
   - Высокорейтинговые фильмы с участием любимых актёров

2. **Тёплые рекомендации** (есть история):
   - Фильмы похожие на высоко оценённые (TMDB recommendations)
   - Фильмы с участием актёров из любимых фильмов
   - Фильмы режиссёров высоко оценённых фильмов

3. **Горячие рекомендации** (много данных):
   - Машинное обучение на основе оценок
   - Коллаборативная фильтрация
   - Анализ паттернов просмотра

```typescript
class RecommendationEngine {
  async getRecommendations(userId: string): Promise<Movie[]> {
    const user = await this.getUser(userId);
    const watchedMovies = await this.getWatchedMovies(userId);
    const preferences = await this.getPreferences(userId);
    
    if (watchedMovies.length === 0) {
      return this.getColdStartRecommendations(preferences);
    }
    
    if (watchedMovies.length < 10) {
      return this.getWarmRecommendations(watchedMovies, preferences);
    }
    
    return this.getHotRecommendations(watchedMovies, preferences);
  }
}
```

## Система тем

### CSS переменные

```css
:root {
  /* Светлая тема */
  --background: 0 0% 100%;
  --foreground: 222.2 84% 4.9%;
  --primary: 222.2 47.4% 11.2%;
  --primary-foreground: 210 40% 98%;
}

[data-theme="dark"] {
  /* Тёмная тема */
  --background: 222.2 84% 4.9%;
  --foreground: 210 40% 98%;
  --primary: 210 40% 98%;
  --primary-foreground: 222.2 47.4% 11.2%;
}
```

### Переключение темы

```typescript
const useTheme = () => {
  const [theme, setTheme] = useState<'light' | 'dark'>('light');
  
  const toggleTheme = () => {
    const newTheme = theme === 'light' ? 'dark' : 'light';
    setTheme(newTheme);
    document.documentElement.setAttribute('data-theme', newTheme);
    localStorage.setItem('theme', newTheme);
  };
  
  return { theme, toggleTheme };
};
```

## Производительность

### Оптимизации

1. **Кэширование**:
   - React Query для кэширования API запросов
   - Supabase кэш для часто запрашиваемых фильмов
   - Next.js ISR для статических страниц

2. **Ленивая загрузка**:
   - Компоненты с React.lazy()
   - Изображения с next/image
   - Бесконечная прокрутка для списков

3. **Оптимизация изображений**:
   - WebP формат через next/image
   - Responsive изображения
   - Placeholder blur

## Безопасность

### Меры безопасности

1. **Аутентификация**: Supabase Auth с JWT токенами
2. **Авторизация**: RLS (Row Level Security) в Supabase
3. **Валидация**: Zod схемы для всех форм
4. **Санитизация**: DOMPurify для пользовательского контента
5. **HTTPS**: Принудительное использование HTTPS
6. **CSP**: Content Security Policy заголовки

## Тестирование

### Стратегия тестирования

1. **Unit тесты**: Jest + React Testing Library
2. **Integration тесты**: API routes тестирование
3. **E2E тесты**: Playwright для критических путей
4. **Компонентные тесты**: Storybook для UI компонентов

### Критические тесты

- Регистрация и вход пользователя
- Добавление фильма в просмотренные
- Система рекомендаций
- Поиск фильмов
- Переключение темы

## Развёртывание

### Vercel конфигурация

```json
{
  "buildCommand": "pnpm build",
  "outputDirectory": ".next",
  "installCommand": "pnpm install",
  "framework": "nextjs",
  "env": {
    "NEXT_PUBLIC_SUPABASE_URL": "@supabase_url",
    "NEXT_PUBLIC_SUPABASE_ANON_KEY": "@supabase_anon_key",
    "TMDB_API_KEY": "@tmdb_api_key"
  }
}
```

### Переменные окружения

```env
# Supabase
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key

# TMDB
TMDB_API_KEY=your_tmdb_api_key

# Next.js
NEXTAUTH_SECRET=your_nextauth_secret
NEXTAUTH_URL=http://localhost:3000
```

## Мониторинг

### Аналитика

1. **Vercel Analytics**: производительность и Core Web Vitals
2. **Supabase Analytics**: использование базы данных
3. **Custom события**: взаимодействие с фильмами
4. **Error tracking**: Sentry для отслеживания ошибок

Этот документ проектирования обеспечивает чёткую архитектуру для разработки PopFlix с учётом всех требований из ТЗ.
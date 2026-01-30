-- Создание схемы базы данных для PopFlix

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
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id)
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

-- Индексы для оптимизации
CREATE INDEX idx_watched_movies_user_id ON watched_movies(user_id);
CREATE INDEX idx_favorite_movies_user_id ON favorite_movies(user_id);
CREATE INDEX idx_movies_cache_cached_at ON movies_cache(cached_at);
CREATE INDEX idx_user_preferences_user_id ON user_preferences(user_id);

-- Row Level Security (RLS) политики

-- Включаем RLS для всех таблиц
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_preferences ENABLE ROW LEVEL SECURITY;
ALTER TABLE watched_movies ENABLE ROW LEVEL SECURITY;
ALTER TABLE favorite_movies ENABLE ROW LEVEL SECURITY;
ALTER TABLE movies_cache ENABLE ROW LEVEL SECURITY;

-- Политики для profiles
CREATE POLICY "Users can view own profile"
  ON profiles FOR SELECT
  USING (auth.uid() = id);

CREATE POLICY "Users can insert own profile"
  ON profiles FOR INSERT
  WITH CHECK (auth.uid() = id);

CREATE POLICY "Users can update own profile"
  ON profiles FOR UPDATE
  USING (auth.uid() = id);

-- Политики для user_preferences
CREATE POLICY "Users can view own preferences"
  ON user_preferences FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own preferences"
  ON user_preferences FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own preferences"
  ON user_preferences FOR UPDATE
  USING (auth.uid() = user_id);

-- Политики для watched_movies
CREATE POLICY "Users can view own watched movies"
  ON watched_movies FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own watched movies"
  ON watched_movies FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own watched movies"
  ON watched_movies FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own watched movies"
  ON watched_movies FOR DELETE
  USING (auth.uid() = user_id);

-- Политики для favorite_movies
CREATE POLICY "Users can view own favorite movies"
  ON favorite_movies FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own favorite movies"
  ON favorite_movies FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own favorite movies"
  ON favorite_movies FOR DELETE
  USING (auth.uid() = user_id);

-- Политики для movies_cache (публичное чтение)
CREATE POLICY "Anyone can read movies cache"
  ON movies_cache FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Service role can manage movies cache"
  ON movies_cache FOR ALL
  TO service_role
  USING (true);

-- Функция для автоматического создания профиля при регистрации
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger AS $$
BEGIN
  INSERT INTO public.profiles (id, email, full_name)
  VALUES (new.id, new.email, new.raw_user_meta_data->>'full_name');
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Триггер для создания профиля
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();
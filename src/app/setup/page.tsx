import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { AlertCircle, Database, Film, Key } from 'lucide-react'

export default function SetupPage() {
  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <div className="mb-8 text-center">
        <h1 className="text-4xl font-bold mb-4">🚀 Настройка PopFlix</h1>
        <p className="text-muted-foreground text-lg">
          Для работы приложения необходимо настроить Supabase и TMDB API
        </p>
      </div>

      <div className="space-y-6">
        {/* Alert */}
        <Card className="border-yellow-500 bg-yellow-50 dark:bg-yellow-950">
          <CardContent className="pt-6">
            <div className="flex items-start gap-3">
              <AlertCircle className="h-5 w-5 text-yellow-600 mt-0.5" />
              <div>
                <h3 className="font-semibold text-yellow-900 dark:text-yellow-100 mb-1">
                  Требуется настройка
                </h3>
                <p className="text-sm text-yellow-800 dark:text-yellow-200">
                  Приложение не может запуститься без настроенных переменных окружения.
                  Следуйте инструкциям ниже.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Step 1: Supabase */}
        <Card>
          <CardHeader>
            <div className="flex items-center gap-3">
              <Database className="h-6 w-6" />
              <div>
                <CardTitle>Шаг 1: Настройка Supabase</CardTitle>
                <Badge variant="secondary" className="mt-1">Обязательно</Badge>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <h4 className="font-semibold mb-2">1.1. Создайте проект</h4>
              <ol className="list-decimal list-inside space-y-1 text-sm text-muted-foreground ml-4">
                <li>Перейдите на <a href="https://supabase.com" target="_blank" className="text-primary hover:underline">supabase.com</a></li>
                <li>Создайте новый проект</li>
                <li>Скопируйте Project URL и anon public key</li>
              </ol>
            </div>

            <div>
              <h4 className="font-semibold mb-2">1.2. Настройте базу данных</h4>
              <ol className="list-decimal list-inside space-y-1 text-sm text-muted-foreground ml-4">
                <li>Откройте SQL Editor в Supabase Dashboard</li>
                <li>Скопируйте содержимое файла <code className="bg-muted px-1 py-0.5 rounded">supabase-schema.sql</code></li>
                <li>Вставьте и выполните (Run)</li>
              </ol>
            </div>

            <div>
              <h4 className="font-semibold mb-2">1.3. Обновите .env.local</h4>
              <pre className="bg-muted p-3 rounded text-xs overflow-x-auto">
{`NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key-here`}
              </pre>
            </div>
          </CardContent>
        </Card>

        {/* Step 2: TMDB */}
        <Card>
          <CardHeader>
            <div className="flex items-center gap-3">
              <Film className="h-6 w-6" />
              <div>
                <CardTitle>Шаг 2: Настройка TMDB API</CardTitle>
                <Badge variant="secondary" className="mt-1">Обязательно</Badge>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <h4 className="font-semibold mb-2">2.1. Получите API ключ</h4>
              <ol className="list-decimal list-inside space-y-1 text-sm text-muted-foreground ml-4">
                <li>Перейдите на <a href="https://www.themoviedb.org" target="_blank" className="text-primary hover:underline">themoviedb.org</a></li>
                <li>Зарегистрируйтесь или войдите</li>
                <li>Перейдите в Settings → API</li>
                <li>Запросите API ключ (Developer)</li>
                <li>Скопируйте API Key (v3 auth)</li>
              </ol>
            </div>

            <div>
              <h4 className="font-semibold mb-2">2.2. Обновите .env.local</h4>
              <pre className="bg-muted p-3 rounded text-xs overflow-x-auto">
{`TMDB_API_KEY=your-tmdb-api-key-here
TMDB_API_READ_ACCESS_TOKEN=your-token-here`}
              </pre>
            </div>
          </CardContent>
        </Card>

        {/* Step 3: Auth Secret */}
        <Card>
          <CardHeader>
            <div className="flex items-center gap-3">
              <Key className="h-6 w-6" />
              <div>
                <CardTitle>Шаг 3: Сгенерируйте секретный ключ</CardTitle>
                <Badge variant="outline" className="mt-1">Опционально</Badge>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <p className="text-sm text-muted-foreground mb-2">
                Выполните команду в терминале:
              </p>
              <pre className="bg-muted p-3 rounded text-xs overflow-x-auto">
{`node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"`}
              </pre>
            </div>

            <div>
              <p className="text-sm text-muted-foreground mb-2">
                Добавьте в .env.local:
              </p>
              <pre className="bg-muted p-3 rounded text-xs overflow-x-auto">
{`NEXTAUTH_SECRET=generated-secret-here
NEXTAUTH_URL=http://localhost:3000`}
              </pre>
            </div>
          </CardContent>
        </Card>

        {/* Final Step */}
        <Card className="border-green-500 bg-green-50 dark:bg-green-950">
          <CardContent className="pt-6">
            <div className="space-y-3">
              <h3 className="font-semibold text-green-900 dark:text-green-100">
                ✅ Финальный шаг
              </h3>
              <p className="text-sm text-green-800 dark:text-green-200">
                После настройки всех переменных окружения:
              </p>
              <ol className="list-decimal list-inside space-y-1 text-sm text-green-800 dark:text-green-200 ml-4">
                <li>Сохраните файл .env.local</li>
                <li>Перезапустите dev сервер (Ctrl+C, затем npm run dev)</li>
                <li>Обновите страницу в браузере</li>
              </ol>
            </div>
          </CardContent>
        </Card>

        {/* Documentation Link */}
        <div className="text-center pt-4">
          <p className="text-sm text-muted-foreground">
            Подробная инструкция доступна в файле{' '}
            <code className="bg-muted px-2 py-1 rounded">SETUP.md</code>
          </p>
        </div>
      </div>
    </div>
  )
}
